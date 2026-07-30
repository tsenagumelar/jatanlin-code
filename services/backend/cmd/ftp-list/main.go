package main

import (
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/jlaffaye/ftp"
)

type ftpConfig struct {
	host string
	user string
	pass string
	dir  string
}

func main() {
	target := "anpr"
	if len(os.Args) > 1 {
		target = strings.ToLower(strings.TrimSpace(os.Args[1]))
	}

	cfg, err := configFor(target)
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(2)
	}

	conn, err := ftp.Dial(
		cfg.host,
		ftp.DialWithTimeout(10*time.Second),
		ftp.DialWithDisabledEPSV(true),
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "ftp dial: %v\n", err)
		os.Exit(1)
	}
	defer conn.Quit()

	if err := conn.Login(cfg.user, cfg.pass); err != nil {
		fmt.Fprintf(os.Stderr, "ftp login: %v\n", err)
		os.Exit(1)
	}

	entries, err := conn.List(strings.Trim(cfg.dir, "/"))
	if err != nil {
		fmt.Fprintf(os.Stderr, "ftp list: %v\n", err)
		os.Exit(1)
	}

	for _, entry := range entries {
		if entry.Type == ftp.EntryTypeFile {
			fmt.Println(entry.Name)
		}
	}
}

func configFor(target string) (ftpConfig, error) {
	switch target {
	case "anpr":
		return ftpConfig{
			host: env("ANPR_FTP_HOST", "ftp-local:21"),
			user: env("ANPR_FTP_USER", "ftpuser"),
			pass: env("ANPR_FTP_PASS", "ftppass"),
			dir:  env("ANPR_FTP_DIR", "anpr"),
		}, nil
	case "axle":
		return ftpConfig{
			host: env("AXLE_FTP_HOST", "ftp-local:21"),
			user: env("AXLE_FTP_USER", "ftpuser"),
			pass: env("AXLE_FTP_PASS", "ftppass"),
			dir:  env("AXLE_FTP_DIR", "axle"),
		}, nil
	default:
		return ftpConfig{}, fmt.Errorf("unsupported FTP_TARGET %q, use anpr or axle", target)
	}
}

func env(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}
