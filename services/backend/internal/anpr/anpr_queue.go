package anpr

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"time"
	"wim-service/internal/ingest"
	"wim-service/internal/source"

	"github.com/google/uuid"
	"github.com/nats-io/nats.go"
)

type anprSessionRecord struct {
	ID               uuid.UUID
	ExternalID       sql.NullString
	PlateNo          sql.NullString
	Confidence       sql.NullFloat64
	CapturedAt       sql.NullTime
	LocationCode     sql.NullString
	CameraID         sql.NullString
	MinioBucket      sql.NullString
	MinioDateFolder  sql.NullString
	MinioXMLObject   sql.NullString
	MinioFullObject  sql.NullString
	MinioPlateObject sql.NullString
}

const (
	anprStreamName  = "ANPR_INSERT"
	anprSubjectName = "anpr.insert"
	anprConsumer    = "anpr-insert-worker"
)

type anprInsertPayload struct {
	ExternalID  string `json:"external_id"`
	Plate       string `json:"plate"`
	Confidence  string `json:"confidence"`
	FrameTime   string `json:"frame_time"`
	Location    string `json:"location"`
	CameraID    string `json:"camera_id"`
	Bucket      string `json:"bucket"`
	DateFolder  string `json:"date_folder"`
	XMLObject   string `json:"xml_object"`
	FullObject  string `json:"full_object"`
	PlateObject string `json:"plate_object"`
	SessionID   string `json:"session_id,omitempty"`
}

type ANPRInsertQueue struct {
	js       nats.JetStreamContext
	nc       *nats.Conn
	db       *sql.DB
	siteUUID string
}

func NewANPRInsertQueue(natsURL string, db *sql.DB, siteUUID string) (*ANPRInsertQueue, error) {
	nc, err := nats.Connect(natsURL)
	if err != nil {
		return nil, err
	}
	js, err := nc.JetStream()
	if err != nil {
		return nil, err
	}

	_, err = js.StreamInfo(anprStreamName)
	if err == nats.ErrStreamNotFound {
		_, err = js.AddStream(&nats.StreamConfig{
			Name:     anprStreamName,
			Subjects: []string{anprSubjectName},
			Storage:  nats.FileStorage,
		})
	}
	if err != nil {
		return nil, err
	}

	q := &ANPRInsertQueue{
		js:       js,
		nc:       nc,
		db:       db,
		siteUUID: siteUUID,
	}
	go q.consumeLoop()
	return q, nil
}

func (q *ANPRInsertQueue) Close() {
	if q == nil || q.nc == nil {
		return
	}
	q.nc.Close()
}

func (q *ANPRInsertQueue) Enqueue(meta *ANPRMetadata, bucket string, sessionID *uuid.UUID, dateFolder, xmlObj, fullObj, plateObj string) error {
	if meta == nil {
		return fmt.Errorf("meta is nil")
	}
	payload := anprInsertPayload{
		ExternalID:  meta.ID,
		Plate:       meta.Plate,
		Confidence:  meta.Confidence,
		FrameTime:   meta.FrameTime,
		Location:    meta.Location,
		CameraID:    meta.CameraID,
		Bucket:      bucket,
		DateFolder:  dateFolder,
		XMLObject:   xmlObj,
		FullObject:  fullObj,
		PlateObject: plateObj,
	}
	if sessionID != nil && *sessionID != uuid.Nil {
		payload.SessionID = sessionID.String()
	}

	b, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	msg := nats.NewMsg(anprSubjectName)
	msg.Data = b
	msg.Header.Set(nats.MsgIdHdr, payload.ExternalID)
	_, err = q.js.PublishMsg(msg)
	return err
}

func (q *ANPRInsertQueue) consumeLoop() {
	sub, err := q.js.PullSubscribe(anprSubjectName, anprConsumer, nats.ManualAck(), nats.AckWait(15*time.Second), nats.MaxDeliver(5))
	if err != nil {
		log.Printf("[ANPR_QUEUE] Consumer startup failed: %v", err)
		return
	}

	for {
		msgs, err := sub.Fetch(1, nats.MaxWait(2*time.Second))
		if err != nil {
			if err == nats.ErrTimeout {
				continue
			}
			log.Printf("[ANPR_QUEUE] Fetch failed, retrying: %v", err)
			time.Sleep(2 * time.Second)
			continue
		}

		for _, msg := range msgs {
			if err := q.handleMsg(msg); err != nil {
				q.handleFailure(msg, err)
				continue
			}
			_ = msg.Ack()
		}
	}
}

func (q *ANPRInsertQueue) handleFailure(msg *nats.Msg, processingErr error) {
	metadata, metadataErr := msg.Metadata()
	if metadataErr == nil && metadata.NumDelivered < 5 {
		delay := time.Duration(metadata.NumDelivered*metadata.NumDelivered) * time.Second
		log.Printf("[ANPR_QUEUE] Processing failed attempt=%d retry_in=%s: %v", metadata.NumDelivered, delay, processingErr)
		_ = msg.NakWithDelay(delay)
		return
	}

	var payload anprInsertPayload
	if json.Unmarshal(msg.Data, &payload) == nil && payload.SessionID != "" {
		if sessionID, err := uuid.Parse(payload.SessionID); err == nil {
			if siteID, err := uuid.Parse(q.siteUUID); err == nil {
				ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
				defer cancel()
				_ = source.MarkFailed(ctx, q.db, siteID, sessionID, "ANPR", "QUEUE_RETRY_EXHAUSTED", processingErr.Error())
			}
		}
	}
	log.Printf("[ANPR_QUEUE] Message terminated after retries: %v", processingErr)
	_ = msg.Term()
}

func (q *ANPRInsertQueue) handleMsg(msg *nats.Msg) error {
	var p anprInsertPayload
	if err := json.Unmarshal(msg.Data, &p); err != nil {
		return err
	}

	meta := &ANPRMetadata{
		Plate:      p.Plate,
		FrameTime:  p.FrameTime,
		Location:   p.Location,
		CameraID:   p.CameraID,
		Confidence: p.Confidence,
		ID:         p.ExternalID,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if p.SessionID != "" {
		sessionUUID, err := uuid.Parse(p.SessionID)
		if err != nil {
			return err
		}
		if err := insertANPRRecordWithSession(ctx, q.db, q.siteUUID, meta, p.Bucket, sessionUUID, p.DateFolder, p.XMLObject, p.FullObject, p.PlateObject); err != nil {
			return err
		}
		record, err := getANPRRecordBySession(ctx, q.db, sessionUUID)
		if err != nil {
			return fmt.Errorf("resolve ANPR source record after insert: %w", err)
		}
		if record == nil {
			return fmt.Errorf("ANPR source record missing after insert")
		}
		siteID, err := uuid.Parse(q.siteUUID)
		if err != nil {
			return fmt.Errorf("invalid queue site UUID: %w", err)
		}
		if err := source.MarkReceived(ctx, q.db, siteID, sessionUUID, "ANPR", record.ID); err != nil {
			return err
		}
		log.Printf("[ANPR_QUEUE] Insert success: external_id=%s session_id=%s", p.ExternalID, p.SessionID)
		return nil
	}

	if err := insertANPRRecord(ctx, q.db, q.siteUUID, meta, p.Bucket, p.DateFolder, p.XMLObject, p.FullObject, p.PlateObject); err != nil {
		return err
	}
	log.Printf("[ANPR_QUEUE] Insert success: external_id=%s", p.ExternalID)
	return nil
}

func insertANPRRecord(ctx context.Context, db *sql.DB, siteUUID string, meta *ANPRMetadata, bucket, dateFolder, xmlObj, fullObj, plateObj string) error {
	var conf sql.NullFloat64
	if meta.Confidence != "" {
		if f, err := strconv.ParseFloat(meta.Confidence, 64); err == nil {
			conf.Valid = true
			conf.Float64 = f
		}
	}

	var capturedAt sql.NullTime
	if meta.FrameTime != "" {
		if t, err := ingest.ParseFrameTime(meta.FrameTime); err == nil {
			capturedAt.Valid = true
			capturedAt.Time = t
		}
	}

	query := `
	INSERT INTO public.transact_anpr_capture
		(site_id, external_id, plate_no, confidence, captured_at,
		 location_code, camera_id,
		 minio_bucket, minio_date_folder,
		 minio_xml_object, minio_full_image_object, minio_plate_image_object)
	VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
	ON CONFLICT (external_id) DO NOTHING
	`

	_, err := db.ExecContext(
		ctx,
		query,
		siteUUID,
		ingest.NullableTrimmedString(meta.ID),
		ingest.NullableTrimmedString(meta.Plate),
		conf,
		capturedAt,
		ingest.NullableTrimmedString(meta.Location),
		ingest.NullableTrimmedString(meta.CameraID),
		ingest.NullableTrimmedString(bucket),
		ingest.NullableTrimmedString(dateFolder),
		ingest.NullableTrimmedString(xmlObj),
		ingest.NullableTrimmedString(fullObj),
		ingest.NullableTrimmedString(plateObj),
	)
	if err != nil {
		return fmt.Errorf("exec insert: %w", err)
	}
	return nil
}

func insertANPRRecordWithSession(ctx context.Context, db *sql.DB, siteUUID string, meta *ANPRMetadata, bucket string, sessionID uuid.UUID, dateFolder, xmlObj, fullObj, plateObj string) error {
	var conf sql.NullFloat64
	if meta.Confidence != "" {
		if f, err := strconv.ParseFloat(meta.Confidence, 64); err == nil {
			conf.Valid = true
			conf.Float64 = f
		}
	}

	var capturedAt sql.NullTime
	if meta.FrameTime != "" {
		if t, err := ingest.ParseFrameTime(meta.FrameTime); err == nil {
			capturedAt.Valid = true
			capturedAt.Time = t
		}
	}

	candidate := anprSessionRecord{
		ExternalID:       ingest.NullableTrimmedString(meta.ID),
		PlateNo:          ingest.NullableTrimmedString(meta.Plate),
		Confidence:       conf,
		CapturedAt:       capturedAt,
		LocationCode:     ingest.NullableTrimmedString(meta.Location),
		CameraID:         ingest.NullableTrimmedString(meta.CameraID),
		MinioBucket:      ingest.NullableTrimmedString(bucket),
		MinioDateFolder:  ingest.NullableTrimmedString(dateFolder),
		MinioXMLObject:   ingest.NullableTrimmedString(xmlObj),
		MinioFullObject:  ingest.NullableTrimmedString(fullObj),
		MinioPlateObject: ingest.NullableTrimmedString(plateObj),
	}

	existing, err := getANPRRecordBySession(ctx, db, sessionID)
	if err != nil {
		return err
	}
	if existing == nil {
		return insertANPRSessionRecord(ctx, db, siteUUID, sessionID, candidate)
	}

	merged := mergeANPRSessionRecord(*existing, candidate)
	if !anprSessionRecordChanged(*existing, merged) {
		return nil
	}

	if err := updateANPRSessionRecord(ctx, db, existing.ID, siteUUID, sessionID, merged); err != nil {
		return err
	}
	return nil
}

func getANPRRecordBySession(ctx context.Context, db *sql.DB, sessionID uuid.UUID) (*anprSessionRecord, error) {
	query := `
	SELECT id, external_id, plate_no, confidence, captured_at, location_code, camera_id,
	       minio_bucket, minio_date_folder, minio_xml_object, minio_full_image_object, minio_plate_image_object
	FROM public.transact_anpr_capture
	WHERE session_id = $1
	ORDER BY created_date ASC
	LIMIT 1
	`

	var rec anprSessionRecord
	if err := db.QueryRowContext(ctx, query, sessionID).Scan(
		&rec.ID,
		&rec.ExternalID,
		&rec.PlateNo,
		&rec.Confidence,
		&rec.CapturedAt,
		&rec.LocationCode,
		&rec.CameraID,
		&rec.MinioBucket,
		&rec.MinioDateFolder,
		&rec.MinioXMLObject,
		&rec.MinioFullObject,
		&rec.MinioPlateObject,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("query anpr by session: %w", err)
	}

	return &rec, nil
}

func insertANPRSessionRecord(ctx context.Context, db *sql.DB, siteUUID string, sessionID uuid.UUID, record anprSessionRecord) error {
	query := `
	INSERT INTO public.transact_anpr_capture
		(site_id, session_id, external_id, plate_no, confidence, captured_at,
		 location_code, camera_id,
		 minio_bucket, minio_date_folder,
		 minio_xml_object, minio_full_image_object, minio_plate_image_object)
	VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
	`

	if _, err := db.ExecContext(
		ctx,
		query,
		siteUUID,
		sessionID,
		record.ExternalID,
		record.PlateNo,
		record.Confidence,
		record.CapturedAt,
		record.LocationCode,
		record.CameraID,
		record.MinioBucket,
		record.MinioDateFolder,
		record.MinioXMLObject,
		record.MinioFullObject,
		record.MinioPlateObject,
	); err != nil {
		return fmt.Errorf("insert anpr session record: %w", err)
	}
	return nil
}

func updateANPRSessionRecord(ctx context.Context, db *sql.DB, recordID uuid.UUID, siteUUID string, sessionID uuid.UUID, record anprSessionRecord) error {
	query := `
	UPDATE public.transact_anpr_capture
	SET site_id = $2,
	    session_id = $3,
	    external_id = $4,
	    plate_no = $5,
	    confidence = $6,
	    captured_at = $7,
	    location_code = $8,
	    camera_id = $9,
	    minio_bucket = $10,
	    minio_date_folder = $11,
	    minio_xml_object = $12,
	    minio_full_image_object = $13,
	    minio_plate_image_object = $14,
	    updated_date = now()
	WHERE id = $1
	`

	if _, err := db.ExecContext(
		ctx,
		query,
		recordID,
		siteUUID,
		sessionID,
		record.ExternalID,
		record.PlateNo,
		record.Confidence,
		record.CapturedAt,
		record.LocationCode,
		record.CameraID,
		record.MinioBucket,
		record.MinioDateFolder,
		record.MinioXMLObject,
		record.MinioFullObject,
		record.MinioPlateObject,
	); err != nil {
		return fmt.Errorf("update anpr session record: %w", err)
	}
	return nil
}

func mergeANPRSessionRecord(existing, candidate anprSessionRecord) anprSessionRecord {
	if shouldReplaceANPR(existing, candidate) {
		return mergeANPRPreferCandidate(existing, candidate)
	}
	return mergeANPRPreferExisting(existing, candidate)
}

func shouldReplaceANPR(existing, candidate anprSessionRecord) bool {
	if isANPRPlaceholder(existing) {
		return true
	}
	if candidate.Confidence.Valid && (!existing.Confidence.Valid || candidate.Confidence.Float64 > existing.Confidence.Float64) {
		return true
	}
	if candidate.Confidence.Valid && existing.Confidence.Valid && candidate.Confidence.Float64 < existing.Confidence.Float64 {
		return false
	}
	candidateScore := anprCompletenessScore(candidate)
	existingScore := anprCompletenessScore(existing)
	if candidateScore != existingScore {
		return candidateScore > existingScore
	}
	if candidate.CapturedAt.Valid && existing.CapturedAt.Valid {
		return candidate.CapturedAt.Time.After(existing.CapturedAt.Time)
	}
	return false
}

func mergeANPRPreferCandidate(existing, candidate anprSessionRecord) anprSessionRecord {
	return anprSessionRecord{
		ID:               existing.ID,
		ExternalID:       pickPreferredString(candidate.ExternalID, existing.ExternalID),
		PlateNo:          pickPreferredString(candidate.PlateNo, existing.PlateNo),
		Confidence:       pickPreferredFloat(candidate.Confidence, existing.Confidence),
		CapturedAt:       pickPreferredTime(candidate.CapturedAt, existing.CapturedAt),
		LocationCode:     pickPreferredString(candidate.LocationCode, existing.LocationCode),
		CameraID:         pickPreferredString(candidate.CameraID, existing.CameraID),
		MinioBucket:      pickPreferredString(candidate.MinioBucket, existing.MinioBucket),
		MinioDateFolder:  pickPreferredString(candidate.MinioDateFolder, existing.MinioDateFolder),
		MinioXMLObject:   pickPreferredString(candidate.MinioXMLObject, existing.MinioXMLObject),
		MinioFullObject:  pickPreferredString(candidate.MinioFullObject, existing.MinioFullObject),
		MinioPlateObject: pickPreferredString(candidate.MinioPlateObject, existing.MinioPlateObject),
	}
}

func mergeANPRPreferExisting(existing, candidate anprSessionRecord) anprSessionRecord {
	return anprSessionRecord{
		ID:               existing.ID,
		ExternalID:       pickPreferredString(existing.ExternalID, candidate.ExternalID),
		PlateNo:          pickPreferredString(existing.PlateNo, candidate.PlateNo),
		Confidence:       pickPreferredFloat(existing.Confidence, candidate.Confidence),
		CapturedAt:       pickPreferredTime(existing.CapturedAt, candidate.CapturedAt),
		LocationCode:     pickPreferredString(existing.LocationCode, candidate.LocationCode),
		CameraID:         pickPreferredString(existing.CameraID, candidate.CameraID),
		MinioBucket:      pickPreferredString(existing.MinioBucket, candidate.MinioBucket),
		MinioDateFolder:  pickPreferredString(existing.MinioDateFolder, candidate.MinioDateFolder),
		MinioXMLObject:   pickPreferredString(existing.MinioXMLObject, candidate.MinioXMLObject),
		MinioFullObject:  pickPreferredString(existing.MinioFullObject, candidate.MinioFullObject),
		MinioPlateObject: pickPreferredString(existing.MinioPlateObject, candidate.MinioPlateObject),
	}
}

func isANPRPlaceholder(record anprSessionRecord) bool {
	return !record.ExternalID.Valid &&
		!record.PlateNo.Valid &&
		!record.Confidence.Valid &&
		!record.CapturedAt.Valid &&
		!record.LocationCode.Valid &&
		!record.CameraID.Valid &&
		!record.MinioXMLObject.Valid &&
		!record.MinioFullObject.Valid &&
		!record.MinioPlateObject.Valid
}

func anprCompletenessScore(record anprSessionRecord) int {
	score := 0
	if record.ExternalID.Valid {
		score++
	}
	if record.PlateNo.Valid {
		score++
	}
	if record.Confidence.Valid {
		score++
	}
	if record.CapturedAt.Valid {
		score++
	}
	if record.LocationCode.Valid {
		score++
	}
	if record.CameraID.Valid {
		score++
	}
	if record.MinioXMLObject.Valid {
		score++
	}
	if record.MinioFullObject.Valid {
		score++
	}
	if record.MinioPlateObject.Valid {
		score++
	}
	return score
}

func anprSessionRecordChanged(existing, next anprSessionRecord) bool {
	return existing.ExternalID != next.ExternalID ||
		existing.PlateNo != next.PlateNo ||
		existing.Confidence != next.Confidence ||
		existing.CapturedAt != next.CapturedAt ||
		existing.LocationCode != next.LocationCode ||
		existing.CameraID != next.CameraID ||
		existing.MinioBucket != next.MinioBucket ||
		existing.MinioDateFolder != next.MinioDateFolder ||
		existing.MinioXMLObject != next.MinioXMLObject ||
		existing.MinioFullObject != next.MinioFullObject ||
		existing.MinioPlateObject != next.MinioPlateObject
}

func pickPreferredString(primary, fallback sql.NullString) sql.NullString {
	if primary.Valid {
		return primary
	}
	return fallback
}

func pickPreferredFloat(primary, fallback sql.NullFloat64) sql.NullFloat64 {
	if primary.Valid {
		return primary
	}
	return fallback
}

func pickPreferredTime(primary, fallback sql.NullTime) sql.NullTime {
	if primary.Valid {
		return primary
	}
	return fallback
}
