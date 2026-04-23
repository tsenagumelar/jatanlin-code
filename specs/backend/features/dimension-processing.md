# Backend Feature: Dimension Processing

## Source Area

- `internal/handler/dimension_handler.go`
- `internal/vision/*`
- `cmd/dimension-sample/main.go`

## Current Behavior dari Code

- `DimensionHandler` menggunakan `vision.DimensionService`.
- Camera calibration dari env: focal length, image size, camera height, tilt angle, reference pixel/real length, reference distance.
- Dapat process image standalone atau ANPR image.
- Hasil dimension berisi length, width, height, distance, confidence, center point, class info.
- Untuk ANPR image, handler mencari `transact_anpr_capture` dari `external_id` dan insert ke `transact_dimension`.
- Jalur session-aware sekarang juga dapat menulis `session_id` ke `transact_dimension`.
- Ada fallback table `vehicle_dimensions` untuk save result generic.
- Detector saat ini masih perlu validasi production sesuai catatan code/README.
- Current gap: dimension session masih ter-couple ke ANPR capture, sehingga ANPR missing dapat membuat dimension tidak terbentuk.

## Target Behavior Paralel

- Dimension processor harus bisa menyimpan hasil dengan `session_id` saat source image/dimension tersedia.
- Pada target saat ini, dimension memakai ANPR full image sebagai source utama untuk `width` dan `height`.
- `length` bukan target perhitungan dari image ANPR; source utama `length` adalah AXLE service.
- Dependency itu harus eksplisit sebagai source dependency, bukan gate untuk weighing/AXLE/CCTV.
- Trigger target dimension adalah listen data ANPR baru yang memiliki `session_id` sama, lalu proses full image ANPR tersebut.
- Jika nanti ada source image non-ANPR, dimension dapat diperluas, tetapi itu bukan requirement utama saat ini.
- Dimension missing/invalid harus masuk verifikasi sebagai status source, bukan menggagalkan session.
- Jika dimension missing, tetap buat placeholder `transact_dimension` dengan `id` dan `session_id`; `anpr_id`, `filepath`, length, width, dan height boleh `NULL`.
- Schema/GraphQL perlu mendukung query dimension by `session_id` untuk flow paralel.

## Measurement Contract

- Scope pengukuran dimension untuk fase ini adalah:
  - `width` dari full image ANPR
  - `height` dari full image ANPR
  - `length` dari AXLE / source panjang kendaraan lain yang lebih sesuai
- Dimension service tidak boleh lagi menjadi source utama `length` pada flow final vehicle actual bila data AXLE tersedia.
- Jika `length` image masih dihitung untuk compatibility internal, nilainya hanya dianggap helper/debug value dan tidak menjadi nilai final utama.
- Full image ANPR harus diambil saat kendaraan melewati titik/garis trigger yang sama.
- Frame/crop image harus dijaga konsisten pada resolusi dan area observasi yang sama antar capture.
- Validitas hasil width/height bergantung pada kontrak instalasi kamera. Jika kontrak instalasi tidak dipenuhi, hasil dianggap out-of-spec dan masalah diklasifikasikan sebagai installation issue.
- Resolusi image operasional yang dipakai untuk profile saat ini adalah `2432x2080`.

## Installation Contract

- Sistem dimension hanya dinyatakan valid jika kamera ANPR dipasang mengikuti baseline instalasi yang disepakati.
- Kondisi operasional kamera ANPR saat ini:
  - kamera dipasang pada tiang yang dipasang di mobil polisi
  - arah kamera diagonal sekitar `45°` ke kiri atau ke kanan terhadap kendaraan
  - jarak nominal kamera ke kendaraan target saat capture sekitar `25 m`
  - tinggi kamera dari tanah sekitar `5 m`
  - lane operasional saat ini `1`
  - full image dibuat saat bagian depan kendaraan menyentuh trigger line
  - resolusi image operasional adalah `2432x2080`
  - frame area / crop / zoom kamera harus tetap selama operasi
  - image ANPR pada scope ini dipakai untuk mengukur `width` dan `height`
  - `length` final kendaraan tetap berasal dari AXLE
  - limitasi utama kamera adalah hanya dapat menangkap kendaraan yang melewati garis trigger yang ditentukan
- Baseline instalasi minimal harus mendefinisikan:
  - tinggi kamera nominal
  - sudut kemiringan kamera nominal
  - jarak nominal kamera ke titik trigger/object reference
  - resolusi image
  - focal/zoom setting
  - lane atau posisi kendaraan saat capture
  - posisi trigger line / capture line
- Masing-masing baseline harus punya toleransi yang disepakati, misalnya:
  - tinggi kamera `nominal +- tolerance`
  - tilt `nominal +- tolerance`
  - jarak `nominal +- tolerance`
  - resolusi wajib exact match
  - zoom/focal wajib fixed
- Toleransi sementara yang disepakati untuk setup saat ini:
  - jarak kamera: maksimum perubahan `5%` dari baseline
  - tilt angle: maksimum perubahan `2%` dari baseline
  - tinggi kamera: maksimum perubahan `10%` dari baseline
  - resolusi image harus tetap `2432x2080`
  - frame area / crop / zoom tidak boleh berubah selama operasi
- Jika pemasangan nyata berada di luar toleransi baseline, hasil dimension width/height tidak boleh dianggap valid secara operasional.
- Untuk scope sekarang, out-of-tolerance installation dikategorikan sebagai kesalahan pemasangan/commissioning, bukan kesalahan rumus sistem.

## Measurement Definition

- Formula implementasi tidak boleh ambigu soal pixel span yang dipakai.
- Definisi operasional yang dipakai untuk implementasi fase ini:
  - `measured_width_px` adalah bentang horizontal `main vehicle body` pada full image ANPR
  - `measured_height_px` adalah bentang vertikal dari ground reference sampai titik tertinggi `main vehicle body` atau muatan utama yang relevan
- Catatan penting:
  - definisi `width` harus berfokus pada body kendaraan yang relevan untuk screening dimensi
  - mirror, antena, lampu kecil, ornamen kecil, dan bagian non-struktural lain tidak dihitung ke `width` final
  - definisi `height` harus memakai titik tertinggi badan/muatan yang relevan secara operasional, bukan noise visual di luar siluet utama
  - jika ada muatan yang secara visual jelas menjadi bagian profil kendaraan saat melintas, muatan tersebut dihitung sebagai bagian `height`
- Default business interpretation untuk scope sekarang:
  - `width` = body width screening, bukan mirror-to-mirror width
  - `height` = ground-to-top-of-body-or-load screening
- Jika detector/segmenter yang dipakai belum dapat membedakan body utama vs elemen minor, hasil harus ditandai sebagai estimation/screening, bukan measurement legal.

## Ground Reference

- Perhitungan `height` harus memakai ground reference yang konsisten pada frame capture.
- Ground reference untuk scope saat ini didefinisikan sebagai lane plane tempat roda kendaraan berada saat bagian depan kendaraan menyentuh trigger line.
- Karena kamera bersifat frontal-oblique dan mounted di kendaraan operasional, ground reference tidak boleh diasumsikan berubah-ubah per frame tanpa profile kalibrasi yang sesuai.
- Jika ground reference pada image tidak dapat diidentifikasi secara cukup konsisten, hasil `height` harus diturunkan confidence-nya atau ditandai invalid.

## Pose Acceptance

- Formula width/height hanya valid untuk kendaraan yang memenuhi pose operasional minimum berikut:
  - kendaraan berada pada `lane 1`
  - bagian depan kendaraan menyentuh trigger line saat full image diambil
  - orientasi kendaraan relatif lurus terhadap lane dan tidak menyilang ekstrem
  - posisi lateral kendaraan masih berada dalam area observasi yang telah dikalibrasi
- Kriteria awal pose acceptance untuk implementasi:
  - seluruh body utama kendaraan harus terlihat di dalam frame
  - deviasi yaw visual masih kecil dan tidak menyebabkan salah tafsir lebar body utama
  - titik ground contact area kendaraan masih terlihat cukup untuk menentukan ground reference
- Hasil harus dianggap degraded atau invalid jika:
  - kendaraan terlalu serong terhadap lane
  - kendaraan keluar dari area observasi utama
  - hanya sebagian body utama yang tertangkap
  - kualitas image membuat tepi body / titik tertinggi tidak dapat dikenali secara memadai
  - mirror atau ornamen justru mendominasi batas horizontal yang terbaca detector

## Operational Goal

- Untuk scope fase ini, dimension ANPR adalah `screening measurement`, bukan legal metrology.
- Tujuan utama dimension adalah:
  - menyediakan `actual_width`
  - menyediakan `actual_height`
  - mendukung deteksi awal overdimension
- `actual_length` final tetap diambil dari AXLE.
- Jika detector, calibration profile, atau installation contract belum memenuhi syarat, output dimension tetap boleh disimpan untuk review/verifikasi, tetapi tidak boleh diposisikan sebagai hasil ukur legal final.

## Calibration Strategy

- Strategi yang direkomendasikan untuk scope sekarang adalah calibration-by-installation-profile, bukan geometri absolut yang diasumsikan selalu benar pada semua posisi kamera.
- Tiap site atau setup kamera harus punya satu profile kalibrasi aktif.
- Profile kalibrasi minimal harus menyimpan:
  - baseline instalasi
  - tolerance instalasi
  - faktor konversi pixel ke meter untuk `width`
  - faktor konversi pixel ke meter untuk `height`
  - optional correction/bias per lane atau per profile
- Bentuk awal profile yang direkomendasikan untuk implementasi:
  - `width_scale_m_per_px`
  - `height_scale_m_per_px`
  - optional `width_offset_m`
  - optional `height_offset_m`
  - identifier profile aktif per site/setup
- Jika setup kamera berpindah secara material, profile kalibrasi harus diperbarui atau dipilih ulang.
- Parameter seperti tinggi kamera, tilt, dan jarak boleh tetap disimpan sebagai config, tetapi untuk scope sekarang perannya adalah baseline instalasi dan tuning profile, bukan satu-satunya sumber kebenaran geometri.

## Configuration Design

- Implementasi berikutnya sebaiknya memisahkan config dimension menjadi dua kelompok:
  - `installation profile`
  - `measurement tuning`
- Field minimal `installation profile`:
  - `DIMENSION_IMAGE_WIDTH=2432`
  - `DIMENSION_IMAGE_HEIGHT=2080`
  - `DIMENSION_CAMERA_HEIGHT_M`
  - `DIMENSION_CAMERA_TILT_DEG`
  - `DIMENSION_TRIGGER_DISTANCE_M`
  - `DIMENSION_INSTALL_TOLERANCE_DISTANCE_PCT=5`
  - `DIMENSION_INSTALL_TOLERANCE_TILT_PCT=2`
  - `DIMENSION_INSTALL_TOLERANCE_HEIGHT_PCT=10`
  - `DIMENSION_PROFILE_NAME`
- Field minimal `measurement tuning`:
  - `DIMENSION_WIDTH_SCALE_M_PER_PX`
  - `DIMENSION_HEIGHT_SCALE_M_PER_PX`
  - `DIMENSION_WIDTH_OFFSET_M`
  - `DIMENSION_HEIGHT_OFFSET_M`
  - optional `DIMENSION_MIN_CONFIDENCE`
  - optional `DIMENSION_ENABLE_POSE_FILTER`
- Untuk fase ini, config yang terkait geometri absolut lama seperti focal length dan reference distance boleh tetap ada demi backward compatibility, tetapi tidak boleh lagi menjadi formula final utama bila mode empirical profile aktif.

## Formula Direction

- Formula target untuk scope saat ini harus mengikuti arah berikut:
  - `width = f(measured_width_px, calibration profile aktif)`
  - `height = f(measured_height_px, calibration profile aktif, ground reference yang konsisten)`
  - `length = AXLE`
- Bentuk implementasi awal yang direkomendasikan:
  - `width_m = measured_width_px * width_scale_m_per_px + width_offset_m`
  - `height_m = measured_height_px * height_scale_m_per_px + height_offset_m`
  - `length_m = axle_length_m`
- Confidence direction untuk implementasi awal:
  - confidence harus turun jika pose vehicle degraded
  - confidence harus turun jika ground reference tidak stabil
  - confidence harus turun jika body edge / top edge tidak jelas
  - confidence harus turun jika setup terdeteksi mendekati batas toleransi installation contract
- Service tidak boleh lagi memakai asumsi generik seperti `height = length * constant` sebagai nilai final operasional.
- Service tidak boleh lagi menganggap `bbox.Width -> vehicle length` sebagai kontrak final bisnis untuk dimension pada kamera ANPR frontal/rear.
- Jika dibutuhkan nilai confidence, confidence tersebut harus merepresentasikan kualitas observasi dan kesesuaian terhadap calibration profile, bukan sekadar hasil perkalian heuristic.

## Implementation Notes

- Refactor code berikutnya harus menghapus arah formula lama yang saat ini masih ada di code:
  - `bbox.Width -> vehicle length`
  - `bbox.Height -> vehicle width`
  - `height = length * constant`
- Implementasi fase ini harus diarahkan menjadi:
  - hitung `measured_width_px`
  - hitung `measured_height_px`
  - konversi dengan empirical calibration profile
  - tetap simpan `length` final dari AXLE di layer processing/vehicle actual
- Jika detector saat ini belum mampu membedakan main body vs mirror/noise, hasil real dimension harus tetap dianggap screening result dan wajib mudah dioverride pada proses verifikasi.

## Dummy Mode

- Dummy mode dimension boleh diaktifkan untuk development/testing melalui config/env khusus.
- Jika dummy mode aktif, dimension tetap harus menunggu session aktif dan event/data ANPR pada session yang sama, kecuali ada desain khusus untuk dimension-only dummy.
- Target default dummy dimension adalah membuat hasil dimensi dummy yang tetap terkait ke `session_id` dan, bila tersedia, ke ANPR dummy/real pada session yang sama.
- Dummy dimension harus ditulis ke `transact_dimension` dengan schema yang sama seperti mode real.
- Jika image source tidak dipakai di dummy mode, field seperti `filepath` atau `anpr_id` boleh `NULL` sesuai kontrak nullable table.
- Dummy insert dimension harus idempotent per session/source atau per ANPR source yang dipakai.
- Config/env utama:
  - `DIMENSION_ENABLED=true|false`
  - `DIMENSION_DUMMY_ENABLED=true|false`

## Rules

- Calibration harus dikunci per site/camera sebelum dipakai production.
- Width/height dari dimension hanya valid bila installation contract terpenuhi.
- `length` final vehicle actual harus mengambil prioritas dari AXLE, bukan dari image dimension.
- Detector mock/placeholder tidak boleh dianggap hasil legal.
- Insert dimension harus terhubung ke `session_id` pada flow session aktif.
- Link ke ANPR capture boleh nullable jika nanti ada source dimension non-ANPR, tetapi target saat ini tetap menghubungkan dimension ke data ANPR session yang sama.
- Dummy mode dimension tidak boleh mengubah dimension menjadi gate untuk source lain.
- Jika `DIMENSION_DUMMY_ENABLED=true`, dimension harus membuat/update satu row dummy per `session_id` tanpa membutuhkan image ANPR nyata.
- Jika `DIMENSION_DUMMY_ENABLED=false`, dimension tetap harus menghitung dari gambar ANPR yang tersedia.
