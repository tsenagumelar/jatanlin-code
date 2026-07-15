package main

import (
	"log"
	"net/http"

	"jatanlin-data-center-backend/internal/api"
	"jatanlin-data-center-backend/internal/config"
	"jatanlin-data-center-backend/internal/database"
)

func main() {
	cfg := config.Load()

	db, err := database.Open(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("open database: %v", err)
	}
	defer db.Close()

	server := api.NewServer(db, cfg)
	log.Printf("data center api listening on :%s", cfg.AppPort)
	if err := http.ListenAndServe(":"+cfg.AppPort, server.Routes()); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}
