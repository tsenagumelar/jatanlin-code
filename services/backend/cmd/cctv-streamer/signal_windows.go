//go:build windows

package main

import "os"

func signalSet() []os.Signal {
	return []os.Signal{os.Interrupt}
}

func isManualRecordSignal(sig os.Signal) bool {
	return false
}
