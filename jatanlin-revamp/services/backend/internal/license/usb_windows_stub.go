//go:build !windows

package license

func windowsUSBScanRoots() []string {
	return nil
}
