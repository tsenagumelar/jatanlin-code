//go:build windows

package license

import (
	"syscall"
	"unsafe"
)

const (
	driveTypeRemovable = 2
	maxDriveLetters     = 26
)

var (
	kernel32            = syscall.NewLazyDLL("kernel32.dll")
	procGetLogicalDrives = kernel32.NewProc("GetLogicalDrives")
	procGetDriveTypeW    = kernel32.NewProc("GetDriveTypeW")
)

func windowsUSBScanRoots() []string {
	mask, _, _ := procGetLogicalDrives.Call()
	if mask == 0 {
		return nil
	}

	var removable []string
	var others []string
	for i := 0; i < maxDriveLetters; i++ {
		if mask&(1<<i) == 0 {
			continue
		}

		root := string(rune('A'+i)) + ":\\"
		if !isExistingDir(root) {
			continue
		}

		switch getWindowsDriveType(root) {
		case driveTypeRemovable:
			removable = append(removable, root)
		default:
			others = append(others, root)
		}
	}

	return append(removable, others...)
}

func getWindowsDriveType(root string) uint32 {
	ptr, err := syscall.UTF16PtrFromString(root)
	if err != nil {
		return 0
	}
	ret, _, _ := procGetDriveTypeW.Call(uintptr(unsafe.Pointer(ptr)))
	return uint32(ret)
}
