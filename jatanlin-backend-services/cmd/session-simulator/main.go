package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	_ "github.com/jackc/pgx/v5/stdlib"

	"wim-service/internal/config"
	"wim-service/internal/handler"
	"wim-service/internal/license"
)

func main() {
	source := flag.String("source", "", "simulation source: anpr or axle")
	sessionID := flag.String("session-id", "", "target session UUID")
	externalID := flag.String("external-id", "", "source external ID")
	plate := flag.String("plate", "", "plate number")
	frameTime := flag.String("frame-time", time.Now().In(jakarta()).Format("2006.01.02 15:04:05.000"), "frame time in Asia/Jakarta layout yyyy.MM.dd HH:mm:ss.SSS")
	cameraID := flag.String("camera-id", "", "camera ID")
	wait := flag.Duration("wait", 2*time.Second, "wait time for queue consumer")

	confidence := flag.String("confidence", "", "anpr confidence")
	location := flag.String("location", "", "anpr location code")

	length := flag.Int("length", 0, "axle length in mm")
	nwheels := flag.Int("nwheels", 0, "axle total wheels")
	naxles := flag.Int("naxles", 0, "axle total axles")
	category := flag.String("category", "", "axle vehicle category")
	bodyType := flag.String("body-type", "", "axle vehicle body type")

	flag.Parse()

	if *source == "" || *sessionID == "" {
		log.Fatal("source and session-id are required")
	}

	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	db, err := sql.Open("pgx", cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("open db: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("ping db: %v", err)
	}

	switch *source {
	case "anpr":
		if err := simulateANPR(cfg, db, *sessionID, *externalID, *plate, *confidence, *frameTime, *location, *cameraID, *wait); err != nil {
			log.Fatal(err)
		}
	case "axle":
		if err := simulateAxle(cfg, db, *sessionID, *externalID, *plate, *frameTime, *cameraID, *length, *nwheels, *naxles, *category, *bodyType, *wait); err != nil {
			log.Fatal(err)
		}
	default:
		log.Fatalf("unsupported source %q", *source)
	}
}

func simulateANPR(cfg *config.Config, db *sql.DB, sessionID, externalID, plate, confidence, frameTime, location, cameraID string, wait time.Duration) error {
	licenseSvc := license.NewService(cfg.LicenseEnabled, cfg.LicenseStatus)
	queue, err := handler.NewANPRInsertQueue(cfg.NATSURL, db, cfg.SiteUUID, licenseSvc)
	if err != nil {
		return fmt.Errorf("create anpr queue: %w", err)
	}
	defer queue.Close()

	meta := &handler.ANPRMetadata{
		Plate:      plate,
		FrameTime:  frameTime,
		Location:   location,
		CameraID:   cameraID,
		Confidence: confidence,
		ID:         externalID,
	}

	sessionUUID, err := parseUUID(sessionID)
	if err != nil {
		return err
	}

	if err := queue.Enqueue(meta, "sim-anpr", &sessionUUID, time.Now().Format("02012006"), "", "", ""); err != nil {
		return fmt.Errorf("enqueue anpr: %w", err)
	}

	time.Sleep(wait)
	log.Printf("ANPR payload published for session %s", sessionID)
	return nil
}

func simulateAxle(cfg *config.Config, db *sql.DB, sessionID, externalID, plate, frameTime, cameraID string, length, nwheels, naxles int, category, bodyType string, wait time.Duration) error {
	licenseSvc := license.NewService(cfg.LicenseEnabled, cfg.LicenseStatus)
	queue, err := handler.NewAxleInsertQueue(cfg.NATSURL, db, cfg.SiteUUID, licenseSvc)
	if err != nil {
		return fmt.Errorf("create axle queue: %w", err)
	}
	defer queue.Close()

	meta := &handler.AxleMetadata{
		Plate:     plate,
		FrameTime: frameTime,
		CameraID:  cameraID,
		ID:        externalID,
		Length:    length,
		NWheels:   nwheels,
		NAxles:    naxles,
		Category:  category,
		BodyType:  bodyType,
	}

	sessionUUID, err := parseUUID(sessionID)
	if err != nil {
		return err
	}

	if err := queue.Enqueue(meta, "sim-axle", &sessionUUID, time.Now().Format("02012006"), "", ""); err != nil {
		return fmt.Errorf("enqueue axle: %w", err)
	}

	time.Sleep(wait)
	log.Printf("AXLE payload published for session %s", sessionID)
	return nil
}

func parseUUID(raw string) (uuid.UUID, error) {
	parsed, err := uuid.Parse(raw)
	if err != nil {
		return uuid.Nil, fmt.Errorf("invalid session-id: %w", err)
	}
	return parsed, nil
}

func jakarta() *time.Location {
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		return time.Local
	}
	return loc
}
