package ftpwatcher

import (
	"context"
	"errors"
	"log"
	"sort"
	"time"

	"github.com/jlaffaye/ftp"
)

// NewFileHandler dipanggil untuk setiap file yang ada di FTP.
// Handler bertanggung jawab menghapus file setelah selesai diproses.
type NewFileHandler func(ctx context.Context, c *ftp.ServerConn, name string) bool

type Watcher struct {
	Addr      string
	User      string
	Pass      string
	RemoteDir string
	Interval  time.Duration
	OnNewFile NewFileHandler
	conn      *ftp.ServerConn
}

func New(addr, user, pass, dir string, interval time.Duration, fn NewFileHandler) *Watcher {
	return &Watcher{
		Addr:      addr,
		User:      user,
		Pass:      pass,
		RemoteDir: dir,
		Interval:  interval,
		OnNewFile: fn,
	}
}

func (w *Watcher) connect() error {
	c, err := ftp.Dial(
		w.Addr,
		ftp.DialWithTimeout(10*time.Second),
		ftp.DialWithDisabledEPSV(true),
	)
	if err != nil {
		return err
	}
	if err := c.Login(w.User, w.Pass); err != nil {
		return err
	}
	w.conn = c
	log.Println("[FTP] connected")
	return nil
}

func (w *Watcher) Start(ctx context.Context) error {
	if err := w.connect(); err != nil {
		return err
	}
	// Run one poll immediately to avoid waiting for first ticker window.
	w.poll(ctx)

	ticker := time.NewTicker(w.Interval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			log.Println("[FTP] stopped")
			return nil
		case <-ticker.C:
			log.Printf("[FTP] polling dir=%s", w.RemoteDir)
			w.poll(ctx)
		}
	}
}

// PollOnce performs a single polling cycle.
// It lazily connects/reconnects when needed.
func (w *Watcher) PollOnce(ctx context.Context) error {
	if w.conn == nil {
		if err := w.connect(); err != nil {
			return err
		}
	}
	log.Printf("[FTP] polling dir=%s", w.RemoteDir)
	w.poll(ctx)
	return nil
}

// ListFileNames returns file names in the current remote directory.
// It connects lazily when needed and only returns file entries.
func (w *Watcher) ListFileNames() ([]string, error) {
	if w.conn == nil {
		if err := w.connect(); err != nil {
			return nil, err
		}
	}

	entries, err := w.listWithTimeout(15 * time.Second)
	if err != nil {
		return nil, err
	}

	names := make([]string, 0, len(entries))
	for _, e := range entries {
		if e.Type != ftp.EntryTypeFile {
			continue
		}
		names = append(names, e.Name)
	}
	sort.Strings(names)
	return names, nil
}

func (w *Watcher) poll(ctx context.Context) {
	entries, err := w.listWithTimeout(15 * time.Second)
	if err != nil {
		log.Println("[FTP] list error:", err)
		w.reconnect()
		return
	}

	for _, e := range entries {
		if e.Type != ftp.EntryTypeFile {
			continue
		}

		log.Println("[FTP] file seen:", e.Name)

		if w.OnNewFile == nil {
			continue
		}

		// Handler yang akan memutuskan sukses/gagal.
		// Begitu sukses, handler akan menghapus file dari FTP,
		// sehingga di polling berikutnya file itu sudah tidak ada.
		w.OnNewFile(ctx, w.conn, e.Name)
	}
}

func (w *Watcher) listWithTimeout(timeout time.Duration) ([]*ftp.Entry, error) {
	if w.conn == nil {
		return nil, errors.New("ftp connection is nil")
	}

	type listResult struct {
		entries []*ftp.Entry
		err     error
	}

	resultCh := make(chan listResult, 1)
	go func() {
		entries, err := w.conn.List(w.RemoteDir)
		resultCh <- listResult{entries: entries, err: err}
	}()

	select {
	case res := <-resultCh:
		return res.entries, res.err
	case <-time.After(timeout):
		return nil, errors.New("list timeout")
	}
}

func (w *Watcher) reconnect() {
	if w.conn != nil {
		_ = w.conn.Quit()
		w.conn = nil
	}

	if err := w.connect(); err != nil {
		log.Println("[FTP] reconnect failed:", err)
		return
	}
	log.Println("[FTP] reconnected")
}
