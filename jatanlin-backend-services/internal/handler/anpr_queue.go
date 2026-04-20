package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/google/uuid"
	"github.com/nats-io/nats.go"
)

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
	sub, err := q.js.PullSubscribe(anprSubjectName, anprConsumer, nats.ManualAck())
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
		if t, err := parseFrameTime(meta.FrameTime); err == nil {
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
		meta.ID,
		meta.Plate,
		conf,
		capturedAt,
		meta.Location,
		meta.CameraID,
		bucket,
		dateFolder,
		xmlObj,
		fullObj,
		plateObj,
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
		if t, err := parseFrameTime(meta.FrameTime); err == nil {
			capturedAt.Valid = true
			capturedAt.Time = t
		}
	}

	query := `
	INSERT INTO public.transact_anpr_capture
		(site_id, session_id, external_id, plate_no, confidence, captured_at,
		 location_code, camera_id,
		 minio_bucket, minio_date_folder,
		 minio_xml_object, minio_full_image_object, minio_plate_image_object)
	VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
	ON CONFLICT (external_id) DO NOTHING
	`

	_, err := db.ExecContext(
		ctx,
		query,
		siteUUID,
		sessionID,
		meta.ID,
		meta.Plate,
		conf,
		capturedAt,
		meta.Location,
		meta.CameraID,
		bucket,
		dateFolder,
		xmlObj,
		fullObj,
		plateObj,
	)
	if err != nil {
		return fmt.Errorf("exec insert with session: %w", err)
	}
	return nil
}
