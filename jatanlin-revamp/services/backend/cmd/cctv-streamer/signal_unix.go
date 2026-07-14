//go:build !windows

package main

import (
	"os"
	"syscall"
)

func signalSet() []os.Signal {
	return []os.Signal{os.Interrupt, syscall.SIGTERM, syscall.SIGUSR1}
}

func isManualRecordSignal(sig os.Signal) bool {
	return sig == syscall.SIGUSR1
}
