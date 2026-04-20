package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/nats-io/nats.go"
)

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

func (q *AxleInsertQueue) Enqueue(meta *AxleMetadata, bucket, dateFolder, xmlObj, imgObj string) error {
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
		meta.ID,
		meta.Plate,
		capturedAt,
		meta.CameraID,
		meta.Length,
		meta.NWheels,
		meta.NAxles,
		meta.Category,
		meta.BodyType,
		bucket,
		dateFolder,
		xmlObj,
		imgObj,
	)
	if err != nil {
		return fmt.Errorf("exec insert: %w", err)
	}
	return nil
}
