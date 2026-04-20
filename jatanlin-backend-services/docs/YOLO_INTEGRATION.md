# YOLO Integration Guide

## 📋 Overview

Sistem dimension detection saat ini menggunakan **mock detector** untuk testing. Untuk production, perlu mengintegrasikan YOLO (You Only Look Once) model yang sesungguhnya.

## 🎯 Implementasi Saat Ini

### Mock Detection (Default)
- Lokasi: `internal/vision/detector.go`
- Method: `detectWithMock()`
- Digunakan untuk: Testing dan development
- Kelebihan: Tidak perlu model, hasil konsisten untuk testing
- Kekurangan: Tidak mendeteksi vehicle yang sebenarnya

### Real YOLO Detection (Commented Out)
- Lokasi: `internal/vision/detector.go`
- Method: `detectWithYOLO()`
- Status: **Commented out, siap digunakan saat model tersedia**
- Framework: gocv (OpenCV Go wrapper)

## 🚀 Cara Mengaktifkan YOLO Real Detection

### Step 1: Install Dependencies

#### Install OpenCV dan gocv
```bash
# macOS
brew install opencv

# Ubuntu/Debian
sudo apt-get install libopencv-dev

# Install gocv
go get -u -d gocv.io/x/gocv
cd $GOPATH/src/gocv.io/x/gocv
make install
```

### Step 2: Download YOLO Model

Download salah satu model berikut:

#### YOLOv4 (Recommended)
```bash
# Download model files
cd /path/to/models
wget https://github.com/AlexeyAB/darknet/releases/download/darknet_yolo_v3_optimal/yolov4.weights
wget https://raw.githubusercontent.com/AlexeyAB/darknet/master/cfg/yolov4.cfg
wget https://raw.githubusercontent.com/AlexeyAB/darknet/master/data/coco.names
```

#### YOLOv8 (Latest)
```bash
# Export YOLOv8 to ONNX format
pip install ultralytics
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt').export(format='onnx')"
```

### Step 3: Update Environment Variables

Edit `.env` file:
```bash
DIMENSION_ENABLED=true
DIMENSION_MODEL_PATH=/path/to/models/yolov4.weights
DIMENSION_THRESHOLD=0.5
```

### Step 4: Uncomment YOLO Code

Dalam file `internal/vision/detector.go`, uncomment:

1. Import gocv (line 16):
```go
import (
    "log"
    "gocv.io/x/gocv"
)
```

2. Struct fields (line 25-26):
```go
net       *gocv.Net
classes   []string
```

3. Model loading di `NewVehicleDetector` (line 38-46):
```go
if modelPath != "" && fileExists(modelPath) {
    if err := detector.loadYOLOModel(); err != nil {
        log.Printf("[DETECTOR] Failed to load YOLO model: %v", err)
        detector.UseRealYOLO = false
    } else {
        log.Printf("[DETECTOR] YOLO model loaded successfully")
        detector.UseRealYOLO = true
    }
}
```

4. Method `loadYOLOModel()` (line 242-283)
5. Method `detectWithYOLO()` body (line 159-236)
6. Helper functions: `applyNMS()`, `calculateIoU()`, etc (line 285-349)

### Step 5: Build dan Test

```bash
# Build
go build ./cmd/anpr-watcher

# Test dengan sample image
go run test_dimension.go

# Jika berhasil, log akan menampilkan:
# [DETECTOR] YOLO model loaded successfully from: /path/to/models/yolov4.weights
# [DETECTOR] YOLO model loaded: 80 classes
```

## 📊 Vehicle Classes yang Dideteksi

YOLO dengan COCO dataset mendeteksi class berikut:
- **Class 2**: Car
- **Class 3**: Motorcycle
- **Class 5**: Bus
- **Class 7**: Truck

Hanya vehicle classes ini yang akan diproses untuk dimension calculation.

## ⚙️ Konfigurasi & Tuning

### Detection Threshold
```bash
DIMENSION_THRESHOLD=0.5  # Default: 50% confidence
```
- **0.3-0.4**: Detect lebih banyak (risk: false positives)
- **0.5**: Recommended balance
- **0.6-0.7**: Detect lebih sedikit tapi lebih akurat

### NMS (Non-Maximum Suppression) Threshold
Di code `detectWithYOLO()` line 233:
```go
boxes = applyNMS(boxes, 0.4)  // 0.4 = NMS threshold
```
- **0.3**: Lebih aggressive, hapus banyak overlapping boxes
- **0.4**: Recommended
- **0.5**: Less aggressive, keep more boxes

### GPU Acceleration (Optional)
Untuk performa lebih cepat, gunakan GPU:

1. Install CUDA dan cuDNN
2. Build OpenCV with CUDA support
3. Update code (line 275-276):
```go
net.SetPreferableBackend(gocv.NetBackendCUDA)
net.SetPreferableTarget(gocv.NetTargetCUDA)
```

## 🔄 Alternative: Python YOLO Service

Jika tidak ingin menggunakan gocv, bisa gunakan Python service:

### 1. Buat Python YOLO Service

```python
# yolo_service.py
from flask import Flask, request, jsonify
from ultralytics import YOLO
import cv2

app = Flask(__name__)
model = YOLO('yolov8n.pt')

@app.route('/detect', methods=['POST'])
def detect():
    file = request.files['image']
    img = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)

    results = model(img)
    boxes = []

    for r in results:
        for box in r.boxes:
            if int(box.cls) in [2, 3, 5, 7]:  # Vehicle classes
                boxes.append({
                    'x': int(box.xyxy[0][0]),
                    'y': int(box.xyxy[0][1]),
                    'width': int(box.xyxy[0][2] - box.xyxy[0][0]),
                    'height': int(box.xyxy[0][3] - box.xyxy[0][1]),
                    'confidence': float(box.conf),
                    'class': int(box.cls)
                })

    return jsonify({'boxes': boxes})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### 2. Update Go Detector

```go
func (vd *VehicleDetector) detectWithYOLO(imagePath string) ([]BoundingBox, error) {
    // Read image file
    imageData, err := os.ReadFile(imagePath)
    if err != nil {
        return nil, err
    }

    // Create multipart form
    body := &bytes.Buffer{}
    writer := multipart.NewWriter(body)
    part, _ := writer.CreateFormFile("image", filepath.Base(imagePath))
    part.Write(imageData)
    writer.Close()

    // Call Python service
    resp, err := http.Post(
        "http://localhost:5000/detect",
        writer.FormDataContentType(),
        body,
    )
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    // Parse response
    var result struct {
        Boxes []BoundingBox `json:"boxes"`
    }
    json.NewDecoder(resp.Body).Decode(&result)

    return result.Boxes, nil
}
```

## 📈 Performance Comparison

| Method | Speed (FPS) | Accuracy | GPU Required | Setup Complexity |
|--------|------------|----------|--------------|------------------|
| Mock | ∞ | N/A | No | ⭐ Easy |
| YOLOv4 (gocv) | 15-30 | High | Optional | ⭐⭐⭐ Medium |
| YOLOv8 (gocv) | 20-40 | Highest | Optional | ⭐⭐⭐ Medium |
| Python Service | 10-20 | High | Optional | ⭐⭐ Easy |

## 🐛 Troubleshooting

### Error: "failed to load YOLO model"
- Check file paths in `.env`
- Verify model files exist and are not corrupted
- Check file permissions

### Error: "gocv: package not found"
- Make sure OpenCV installed: `pkg-config --modversion opencv4`
- Rebuild gocv: `cd $GOPATH/src/gocv.io/x/gocv && make install`

### Low FPS / Slow Detection
- Enable GPU acceleration
- Use smaller YOLO model (YOLOv8n instead of YOLOv8x)
- Reduce input image size
- Process every Nth frame instead of all frames

## 📚 References

- [gocv Documentation](https://gocv.io/)
- [YOLOv4 Paper](https://arxiv.org/abs/2004.10934)
- [Ultralytics YOLOv8](https://github.com/ultralytics/ultralytics)
- [OpenCV DNN Module](https://docs.opencv.org/4.x/d2/d58/tutorial_table_of_content_dnn.html)

## ✅ Checklist untuk Production

- [ ] Install OpenCV dan gocv
- [ ] Download YOLO model (yolov4.weights, .cfg, coco.names)
- [ ] Update DIMENSION_MODEL_PATH di `.env`
- [ ] Uncomment YOLO code di detector.go
- [ ] Test dengan sample images
- [ ] Tune threshold untuk akurasi optimal
- [ ] Setup GPU acceleration (optional)
- [ ] Monitor performance dan memory usage
- [ ] Implement error handling dan fallback ke mock
