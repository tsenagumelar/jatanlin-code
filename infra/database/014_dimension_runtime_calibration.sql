BEGIN;

INSERT INTO public.system_runtime_config
  (config_group, config_key, config_value, value_type, label, description,
   is_secret, is_runtime_editable, sort_order, is_active, is_deleted)
VALUES
  ('DIMENSION','DIMENSION_LENGTH_SCALE_M_PER_PX','0.009535','number','Skala Panjang (m/pixel)','Kalibrasi empiris panjang. Gunakan hanya dari sampel kendaraan dengan ukuran referensi yang diketahui.',false,true,871,true,false),
  ('DIMENSION','DIMENSION_WIDTH_SCALE_M_PER_PX','0.003522','number','Skala Lebar (m/pixel)','Kalibrasi empiris lebar pada posisi pengukuran tetap.',false,true,872,true,false),
  ('DIMENSION','DIMENSION_HEIGHT_SCALE_M_PER_PX','0.003603','number','Skala Tinggi (m/pixel)','Kalibrasi empiris tinggi pada posisi pengukuran tetap.',false,true,873,true,false),
  ('DIMENSION','DIMENSION_LENGTH_OFFSET_M','0','number','Offset Panjang (m)','Koreksi bias konstan hasil estimasi panjang.',false,true,874,true,false),
  ('DIMENSION','DIMENSION_WIDTH_OFFSET_M','0','number','Offset Lebar (m)','Koreksi bias konstan hasil estimasi lebar.',false,true,875,true,false),
  ('DIMENSION','DIMENSION_HEIGHT_OFFSET_M','0','number','Offset Tinggi (m)','Koreksi bias konstan hasil estimasi tinggi.',false,true,876,true,false),
  ('DIMENSION','DIMENSION_INSTALL_TOLERANCE_DISTANCE_PCT','5','number','Toleransi Posisi Kendaraan (%)','Penurunan akurasi yang diizinkan akibat pergeseran posisi kendaraan dari titik kalibrasi.',false,true,877,true,false),
  ('DIMENSION','DIMENSION_INSTALL_TOLERANCE_TILT_PCT','2','number','Toleransi Sudut Kamera (%)','Penurunan akurasi yang diizinkan akibat perubahan sudut kamera.',false,true,878,true,false),
  ('DIMENSION','DIMENSION_INSTALL_TOLERANCE_HEIGHT_PCT','10','number','Toleransi Tinggi Kamera (%)','Penurunan akurasi yang diizinkan akibat perubahan tinggi pemasangan kamera.',false,true,879,true,false),
  ('CALIBRATION','CAMERA_REF_DISTANCE','25','number','Jarak Referensi Kamera (m)','Jarak kamera ke titik referensi pada saat kalibrasi.',false,true,941,true,false),
  ('OPERATION','SESSION_WINDOW_SECONDS','60','number','Jendela Sesi (detik)','Batas waktu penggabungan data dari perangkat ke transaksi yang sama.',false,true,1010,true,false),
  ('OPERATION','PROCESSING_WAIT_SECONDS','120','number','Waktu Tunggu Kelengkapan (detik)','Batas waktu halaman processing menunggu data perangkat lengkap sebelum transaksi difinalisasi otomatis.',false,true,1020,true,false)
ON CONFLICT (config_group, config_key) DO UPDATE SET
  label=EXCLUDED.label,
  description=EXCLUDED.description,
  value_type=EXCLUDED.value_type,
  is_runtime_editable=true,
  sort_order=EXCLUDED.sort_order,
  is_active=true,
  is_deleted=false,
  updated_date=now();

COMMIT;
