package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/nats-io/nats.go"
)

type axleSessionRecord struct {
	ID              uuid.UUID
	ExternalID      sql.NullString
	PlateNo         sql.NullString
	CapturedAt      sql.NullTime
	CameraID        sql.NullString
	LengthMM        sql.NullInt32
	TotalWheels     sql.NullInt32
	TotalAxles      sql.NullInt32
	VehicleCategory sql.NullString
	VehicleBodyType sql.NullString
	MinioBucket     sql.NullString
	MinioDateFolder sql.NullString
	MinioXMLObject  sql.NullString
	MinioImageObj   sql.NullString
}

const (
	axleStreamName  = "AXLE_INSERT"
	axleSubjectName = "axle.insert"
	axleConsumer    = "axle-insert-worker"
)

type axleInsertPayload struct {
	ExternalID string `json:"external_id"`
	Plate      string `json:"plate"`
	FrameTime  string `json:"frame_time"`
	CameraID   string `json:"camera_id"`
	Length     int    `json:"length"`
	NWheels    int    `json:"nwheels"`
	NAxles     int    `json:"naxles"`
	Category   string `json:"category"`
	BodyType   string `json:"body_type"`
	Bucket     string `json:"bucket"`
	DateFolder string `json:"date_folder"`
	XMLObject  string `json:"xml_object"`
	ImgObject  string `json:"img_object"`
	SessionID  string `json:"session_id,omitempty"`
}

type AxleInsertQueue struct {
	js       nats.JetStreamContext
	nc       *nats.Conn
	db       *sql.DB
	siteUUID string
}

func NewAxleInsertQueue(natsURL string, db *sql.DB, siteUUID string) (*AxleInsertQueue, error) {
	nc, err := nats.Connect(natsURL)
	if err != nil {
		return nil, err
	}
	js, err := nc.JetStream()
	if err != nil {
		return nil, err
	}

	_, err = js.StreamInfo(axleStreamName)
	if err == nats.ErrStreamNotFound {
		_, err = js.AddStream(&nats.StreamConfig{
			Name:     axleStreamName,
			Subjects: []string{axleSubjectName},
			Storage:  nats.FileStorage,
		})
	}
	if err != nil {
		return nil, err
	}

	q := &AxleInsertQueue{
		js:       js,
		nc:       nc,
		db:       db,
		siteUUID: siteUUID,
	}
	go q.consumeLoop()
	return q, nil
}

func (q *AxleInsertQueue) Close() {
	if q == nil || q.nc == nil {
		return
	}
	q.nc.Close()
}

func (q *AxleInsertQueue) Enqueue(meta *AxleMetadata, bucket string, sessionID *uuid.UUID, dateFolder, xmlObj, imgObj string) error {
	if meta == nil {
		return fmt.Errorf("meta is nil")
	}
	payload := axleInsertPayload{
		ExternalID: meta.ID,
		Plate:      meta.Plate,
		FrameTime:  meta.FrameTime,
		CameraID:   meta.CameraID,
		Length:     meta.Length,
		NWheels:    meta.NWheels,
		NAxles:     meta.NAxles,
		Category:   meta.Category,
		BodyType:   meta.BodyType,
		Bucket:     bucket,
		DateFolder: dateFolder,
		XMLObject:  xmlObj,
		ImgObject:  imgObj,
	}
	if sessionID != nil && *sessionID != uuid.Nil {
		payload.SessionID = sessionID.String()
	}

	b, err := json.Marshal(payload)
	if err != nil {
		return err
	}
	msg := nats.NewMsg(axleSubjectName)
	msg.Data = b
	msg.Header.Set(nats.MsgIdHdr, payload.ExternalID)
	_, err = q.js.PublishMsg(msg)
	return err
}

func (q *AxleInsertQueue) consumeLoop() {
	sub, err := q.js.PullSubscribe(axleSubjectName, axleConsumer, nats.ManualAck())
	if err != nil {
		return
	}

	for {
		msgs, err := sub.Fetch(1, nats.MaxWait(2*time.Second))
		if err != nil {
			if err == nats.ErrTimeout {
				continue
			}
			time.Sleep(2 * time.Second)
			continue
		}

		for _, msg := range msgs {
			if err := q.handleMsg(msg); err != nil {
				_ = msg.Nak()
				continue
			}
			_ = msg.Ack()
		}
	}
}

func (q *AxleInsertQueue) handleMsg(msg *nats.Msg) error {
	var p axleInsertPayload
	if err := json.Unmarshal(msg.Data, &p); err != nil {
		return err
	}

	meta := &AxleMetadata{
		Plate:     p.Plate,
		FrameTime: p.FrameTime,
		CameraID:  p.CameraID,
		ID:        p.ExternalID,
		Length:    p.Length,
		NWheels:   p.NWheels,
		NAxles:    p.NAxles,
		Category:  p.Category,
		BodyType:  p.BodyType,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if p.SessionID != "" {
		sessionUUID, err := uuid.Parse(p.SessionID)
		if err != nil {
			return err
		}
		if err := insertAxleRecordWithSession(ctx, q.db, q.siteUUID, meta, sessionUUID, p.Bucket, p.DateFolder, p.XMLObject, p.ImgObject); err != nil {
			return err
		}
		log.Printf("[AXLE_QUEUE] Insert success: external_id=%s session_id=%s", p.ExternalID, p.SessionID)
		return nil
	}

	if err := insertAxleRecord(ctx, q.db, q.siteUUID, meta, p.Bucket, p.DateFolder, p.XMLObject, p.ImgObject); err != nil {
		return err
	}
	log.Printf("[AXLE_QUEUE] Insert success: external_id=%s", p.ExternalID)
	return nil
}

func insertAxleRecord(ctx context.Context, db *sql.DB, siteUUID string, meta *AxleMetadata, bucket, dateFolder, xmlObj, imgObj string) error {
	var capturedAt sql.NullTime
	if meta.FrameTime != "" {
		if t, err := parseFrameTime(meta.FrameTime); err == nil {
			capturedAt.Valid = true
			capturedAt.Time = t
		}
	}

	query := `
      INSERT INTO public.transact_axle_capture
      (site_id, external_id, plate_no, captured_at, camera_id,
       length_mm, total_wheels, total_axles, vehicle_category, vehicle_body_type,
       minio_bucket, minio_date_folder, minio_xml_object, minio_image_object)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT (external_id) DO UPDATE SET
       site_id = EXCLUDED.site_id,
       plate_no = EXCLUDED.plate_no,
       captured_at = EXCLUDED.captured_at,
       camera_id = EXCLUDED.camera_id,
       length_mm = EXCLUDED.length_mm,
       total_wheels = EXCLUDED.total_wheels,
       total_axles = EXCLUDED.total_axles,
       vehicle_category = EXCLUDED.vehicle_category,
       vehicle_body_type = EXCLUDED.vehicle_body_type,
       minio_bucket = EXCLUDED.minio_bucket,
       minio_date_folder = EXCLUDED.minio_date_folder,
       minio_xml_object = EXCLUDED.minio_xml_object,
       minio_image_object = EXCLUDED.minio_image_object,
       updated_date = now();
      `

	_, err := db.ExecContext(
		ctx,
		query,
		siteUUID,
		nullableTrimmedString(meta.ID),
		nullableTrimmedString(meta.Plate),
		capturedAt,
		nullableTrimmedString(meta.CameraID),
		meta.Length,
		meta.NWheels,
		meta.NAxles,
		nullableTrimmedString(meta.Category),
		nullableTrimmedString(meta.BodyType),
		nullableTrimmedString(bucket),
		nullableTrimmedString(dateFolder),
		nullableTrimmedString(xmlObj),
		nullableTrimmedString(imgObj),
	)
	if err != nil {
		return fmt.Errorf("exec insert: %w", err)
	}
	return nil
}

func insertAxleRecordWithSession(ctx context.Context, db *sql.DB, siteUUID string, meta *AxleMetadata, sessionID uuid.UUID, bucket, dateFolder, xmlObj, imgObj string) error {
	var capturedAt sql.NullTime
	if meta.FrameTime != "" {
		if t, err := parseFrameTime(meta.FrameTime); err == nil {
			capturedAt.Valid = true
			capturedAt.Time = t
		}
	}

	candidate := axleSessionRecord{
		ExternalID:      nullableTrimmedString(meta.ID),
		PlateNo:         nullableTrimmedString(meta.Plate),
		CapturedAt:      capturedAt,
		CameraID:        nullableTrimmedString(meta.CameraID),
		LengthMM:        nullableInt32(meta.Length),
		TotalWheels:     nullableInt32(meta.NWheels),
		TotalAxles:      nullableInt32(meta.NAxles),
		VehicleCategory: nullableTrimmedString(meta.Category),
		VehicleBodyType: nullableTrimmedString(meta.BodyType),
		MinioBucket:     nullableTrimmedString(bucket),
		MinioDateFolder: nullableTrimmedString(dateFolder),
		MinioXMLObject:  nullableTrimmedString(xmlObj),
		MinioImageObj:   nullableTrimmedString(imgObj),
	}

	existing, err := getAxleRecordBySession(ctx, db, sessionID)
	if err != nil {
		return err
	}
	if existing == nil {
		return insertAxleSessionRecord(ctx, db, siteUUID, sessionID, candidate)
	}

	merged := mergeAxleSessionRecord(*existing, candidate)
	if !axleSessionRecordChanged(*existing, merged) {
		return nil
	}

	if err := updateAxleSessionRecord(ctx, db, existing.ID, siteUUID, sessionID, merged); err != nil {
		return err
	}
	return nil
}

func getAxleRecordBySession(ctx context.Context, db *sql.DB, sessionID uuid.UUID) (*axleSessionRecord, error) {
	query := `
	SELECT id, external_id, plate_no, captured_at, camera_id, length_mm, total_wheels, total_axles,
	       vehicle_category, vehicle_body_type, minio_bucket, minio_date_folder, minio_xml_object, minio_image_object
	FROM public.transact_axle_capture
	WHERE session_id = $1
	ORDER BY created_date ASC
	LIMIT 1
	`

	var rec axleSessionRecord
	if err := db.QueryRowContext(ctx, query, sessionID).Scan(
		&rec.ID,
		&rec.ExternalID,
		&rec.PlateNo,
		&rec.CapturedAt,
		&rec.CameraID,
		&rec.LengthMM,
		&rec.TotalWheels,
		&rec.TotalAxles,
		&rec.VehicleCategory,
		&rec.VehicleBodyType,
		&rec.MinioBucket,
		&rec.MinioDateFolder,
		&rec.MinioXMLObject,
		&rec.MinioImageObj,
	); err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("query axle by session: %w", err)
	}

	return &rec, nil
}

func insertAxleSessionRecord(ctx context.Context, db *sql.DB, siteUUID string, sessionID uuid.UUID, record axleSessionRecord) error {
	query := `
	INSERT INTO public.transact_axle_capture
	(site_id, session_id, external_id, plate_no, captured_at, camera_id,
	 length_mm, total_wheels, total_axles, vehicle_category, vehicle_body_type,
	 minio_bucket, minio_date_folder, minio_xml_object, minio_image_object)
	VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
	`

	if _, err := db.ExecContext(
		ctx,
		query,
		siteUUID,
		sessionID,
		record.ExternalID,
		record.PlateNo,
		record.CapturedAt,
		record.CameraID,
		record.LengthMM,
		record.TotalWheels,
		record.TotalAxles,
		record.VehicleCategory,
		record.VehicleBodyType,
		record.MinioBucket,
		record.MinioDateFolder,
		record.MinioXMLObject,
		record.MinioImageObj,
	); err != nil {
		return fmt.Errorf("insert axle session record: %w", err)
	}
	return nil
}

func updateAxleSessionRecord(ctx context.Context, db *sql.DB, recordID uuid.UUID, siteUUID string, sessionID uuid.UUID, record axleSessionRecord) error {
	query := `
	UPDATE public.transact_axle_capture
	SET site_id = $2,
	    session_id = $3,
	    external_id = $4,
	    plate_no = $5,
	    captured_at = $6,
	    camera_id = $7,
	    length_mm = $8,
	    total_wheels = $9,
	    total_axles = $10,
	    vehicle_category = $11,
	    vehicle_body_type = $12,
	    minio_bucket = $13,
	    minio_date_folder = $14,
	    minio_xml_object = $15,
	    minio_image_object = $16,
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
		record.CapturedAt,
		record.CameraID,
		record.LengthMM,
		record.TotalWheels,
		record.TotalAxles,
		record.VehicleCategory,
		record.VehicleBodyType,
		record.MinioBucket,
		record.MinioDateFolder,
		record.MinioXMLObject,
		record.MinioImageObj,
	); err != nil {
		return fmt.Errorf("update axle session record: %w", err)
	}
	return nil
}

func mergeAxleSessionRecord(existing, candidate axleSessionRecord) axleSessionRecord {
	if shouldReplaceAxle(existing, candidate) {
		return axleMergePreferCandidate(existing, candidate)
	}
	return axleMergePreferExisting(existing, candidate)
}

func shouldReplaceAxle(existing, candidate axleSessionRecord) bool {
	if isAxlePlaceholder(existing) {
		return true
	}
	existingValid := existing.TotalAxles.Valid && existing.TotalAxles.Int32 > 0
	candidateValid := candidate.TotalAxles.Valid && candidate.TotalAxles.Int32 > 0
	if candidateValid != existingValid {
		return candidateValid
	}
	candidateScore := axleCompletenessScore(candidate)
	existingScore := axleCompletenessScore(existing)
	if candidateScore != existingScore {
		return candidateScore > existingScore
	}
	if candidate.CapturedAt.Valid && existing.CapturedAt.Valid {
		return candidate.CapturedAt.Time.After(existing.CapturedAt.Time)
	}
	return false
}

func axleMergePreferCandidate(existing, candidate axleSessionRecord) axleSessionRecord {
	return axleSessionRecord{
		ID:              existing.ID,
		ExternalID:      pickPreferredString(candidate.ExternalID, existing.ExternalID),
		PlateNo:         pickPreferredString(candidate.PlateNo, existing.PlateNo),
		CapturedAt:      pickPreferredTime(candidate.CapturedAt, existing.CapturedAt),
		CameraID:        pickPreferredString(candidate.CameraID, existing.CameraID),
		LengthMM:        pickPreferredInt32(candidate.LengthMM, existing.LengthMM),
		TotalWheels:     pickPreferredInt32(candidate.TotalWheels, existing.TotalWheels),
		TotalAxles:      pickPreferredInt32(candidate.TotalAxles, existing.TotalAxles),
		VehicleCategory: pickPreferredString(candidate.VehicleCategory, existing.VehicleCategory),
		VehicleBodyType: pickPreferredString(candidate.VehicleBodyType, existing.VehicleBodyType),
		MinioBucket:     pickPreferredString(candidate.MinioBucket, existing.MinioBucket),
		MinioDateFolder: pickPreferredString(candidate.MinioDateFolder, existing.MinioDateFolder),
		MinioXMLObject:  pickPreferredString(candidate.MinioXMLObject, existing.MinioXMLObject),
		MinioImageObj:   pickPreferredString(candidate.MinioImageObj, existing.MinioImageObj),
	}
}

func axleMergePreferExisting(existing, candidate axleSessionRecord) axleSessionRecord {
	return axleSessionRecord{
		ID:              existing.ID,
		ExternalID:      pickPreferredString(existing.ExternalID, candidate.ExternalID),
		PlateNo:         pickPreferredString(existing.PlateNo, candidate.PlateNo),
		CapturedAt:      pickPreferredTime(existing.CapturedAt, candidate.CapturedAt),
		CameraID:        pickPreferredString(existing.CameraID, candidate.CameraID),
		LengthMM:        pickPreferredInt32(existing.LengthMM, candidate.LengthMM),
		TotalWheels:     pickPreferredInt32(existing.TotalWheels, candidate.TotalWheels),
		TotalAxles:      pickPreferredInt32(existing.TotalAxles, candidate.TotalAxles),
		VehicleCategory: pickPreferredString(existing.VehicleCategory, candidate.VehicleCategory),
		VehicleBodyType: pickPreferredString(existing.VehicleBodyType, candidate.VehicleBodyType),
		MinioBucket:     pickPreferredString(existing.MinioBucket, candidate.MinioBucket),
		MinioDateFolder: pickPreferredString(existing.MinioDateFolder, candidate.MinioDateFolder),
		MinioXMLObject:  pickPreferredString(existing.MinioXMLObject, candidate.MinioXMLObject),
		MinioImageObj:   pickPreferredString(existing.MinioImageObj, candidate.MinioImageObj),
	}
}

func isAxlePlaceholder(record axleSessionRecord) bool {
	return !record.ExternalID.Valid &&
		!record.PlateNo.Valid &&
		!record.CapturedAt.Valid &&
		!record.CameraID.Valid &&
		!record.LengthMM.Valid &&
		!record.TotalWheels.Valid &&
		!record.TotalAxles.Valid &&
		!record.VehicleCategory.Valid &&
		!record.VehicleBodyType.Valid &&
		!record.MinioXMLObject.Valid &&
		!record.MinioImageObj.Valid
}

func axleCompletenessScore(record axleSessionRecord) int {
	score := 0
	if record.ExternalID.Valid {
		score++
	}
	if record.PlateNo.Valid {
		score++
	}
	if record.CapturedAt.Valid {
		score++
	}
	if record.CameraID.Valid {
		score++
	}
	if record.LengthMM.Valid && record.LengthMM.Int32 > 0 {
		score++
	}
	if record.TotalWheels.Valid && record.TotalWheels.Int32 > 0 {
		score++
	}
	if record.TotalAxles.Valid && record.TotalAxles.Int32 > 0 {
		score += 2
	}
	if record.VehicleCategory.Valid {
		score++
	}
	if record.VehicleBodyType.Valid {
		score++
	}
	if record.MinioXMLObject.Valid {
		score++
	}
	if record.MinioImageObj.Valid {
		score++
	}
	return score
}

func axleSessionRecordChanged(existing, next axleSessionRecord) bool {
	return existing.ExternalID != next.ExternalID ||
		existing.PlateNo != next.PlateNo ||
		existing.CapturedAt != next.CapturedAt ||
		existing.CameraID != next.CameraID ||
		existing.LengthMM != next.LengthMM ||
		existing.TotalWheels != next.TotalWheels ||
		existing.TotalAxles != next.TotalAxles ||
		existing.VehicleCategory != next.VehicleCategory ||
		existing.VehicleBodyType != next.VehicleBodyType ||
		existing.MinioBucket != next.MinioBucket ||
		existing.MinioDateFolder != next.MinioDateFolder ||
		existing.MinioXMLObject != next.MinioXMLObject ||
		existing.MinioImageObj != next.MinioImageObj
}

func nullableInt32(value int) sql.NullInt32 {
	if value == 0 {
		return sql.NullInt32{}
	}
	return sql.NullInt32{
		Int32: int32(value),
		Valid: true,
	}
}

func pickPreferredInt32(primary, fallback sql.NullInt32) sql.NullInt32 {
	if primary.Valid {
		return primary
	}
	return fallback
}
