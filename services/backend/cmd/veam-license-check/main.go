package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"

	"wim-service/internal/license"
)

func main() {
	_ = godotenv.Load()

	svc, err := license.NewService(
		os.Getenv("VEAM_LICENSE_PATH"),
		os.Getenv("VEAM_PUBLIC_KEY_B64"),
		os.Getenv("SITE_ID"),
		os.Getenv("VEAM_HARDWARE_ID"),
	)
	if err != nil {
		log.Fatal(err)
	}

	result := svc.Status()
	payload, err := json.MarshalIndent(result, "", "  ")
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(string(payload))

	if !result.Valid {
		os.Exit(1)
	}
}
