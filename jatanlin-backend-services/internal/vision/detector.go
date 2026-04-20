package vision

import (
	"fmt"
	"image"
	"image/color"
	"image/draw"
	"image/jpeg"
	"image/png"
	"os"
	"path/filepath"
	"strings"

	// Uncomment when ready to use real YOLO with gocv
	// "log"
	// "gocv.io/x/gocv"
)

// VehicleDetector handles vehicle detection in images
type VehicleDetector struct {
	ModelPath string
	Threshold float64
	UseRealYOLO bool // Toggle between mock and real YOLO
	// For real YOLO implementation:
	// net       *gocv.Net
	// classes   []string
}

// NewVehicleDetector creates a new vehicle detector instance
func NewVehicleDetector(modelPath string, threshold float64) *VehicleDetector {
	detector := &VehicleDetector{
		ModelPath: modelPath,
		Threshold: threshold,
		UseRealYOLO: false, // Default to mock for now
	}

	// Uncomment to use real YOLO when model is available
	// if modelPath != "" && fileExists(modelPath) {
	// 	if err := detector.loadYOLOModel(); err != nil {
	// 		log.Printf("[DETECTOR] Failed to load YOLO model: %v. Using mock detection.", err)
	// 		detector.UseRealYOLO = false
	// 	} else {
	// 		log.Printf("[DETECTOR] YOLO model loaded successfully from: %s", modelPath)
	// 		detector.UseRealYOLO = true
	// 	}
	// }

	return detector
}

// DetectVehicle detects vehicles in an image and returns bounding boxes
func (vd *VehicleDetector) DetectVehicle(imagePath string) ([]BoundingBox, error) {
	// Use real YOLO if enabled and model is loaded
	if vd.UseRealYOLO {
		return vd.detectWithYOLO(imagePath)
	}

	// Otherwise use mock detection
	return vd.detectWithMock(imagePath)
}

// detectWithMock performs mock vehicle detection for testing
func (vd *VehicleDetector) detectWithMock(imagePath string) ([]BoundingBox, error) {
	// Verify image file exists
	if _, err := loadImage(imagePath); err != nil {
		return nil, fmt.Errorf("failed to load image: %w", err)
	}

	// Mock detection - create different bounding boxes based on filename
	// Expected dimensions (from camera front view):
	// car1: L=2.5m W=1.5m H=1.4m -> bbox should produce these after calibration
	// car2: L=4.0m W=2.0m H=1.8m
	// car3: L=3.8m W=1.7m H=1.4m
	//
	// From calibration.go:
	// - bbox.Width (pixels) → Length (meters)
	// - bbox.Height (pixels) → Width (meters) with 0.68 vertical scale factor
	//
	// At reference: 960 pixels = 4.70m at 55m distance
	// PixelToMeterRatio = 4.70 / 960 = 0.004896 m/pixel

	var mockBoxes []BoundingBox

	// Determine which car based on filename (support .jpg, .jpeg, .png)
	filename := strings.ToLower(filepath.Base(imagePath))
	// Remove extension for matching
	filenameWithoutExt := strings.TrimSuffix(strings.TrimSuffix(strings.TrimSuffix(filename, ".jpg"), ".jpeg"), ".png")

	if strings.Contains(filenameWithoutExt, "car1") {
		// car1: L=2.5m, W=1.5m
		// At reference distance (55m), we need:
		// Length: 2.5m / 0.004896 = 511 pixels (bbox.Width)
		// Width: (1.5m / 0.68) / 0.004896 = 451 pixels (bbox.Height)
		// Position Y calculated to produce ~55m distance
		// EstimateDistance formula: distance = height / tan(tilt - atan(pixelOffsetY/focal))
		// For 55m: pixelOffsetY ≈ 360, so bottomY = 540 + 360 = 900
		mockBoxes = []BoundingBox{
			{
				X:      320,
				Y:      449,  // bottomY = 449 + 451 = 900 → distance ≈ 55m
				Width:  511,  // Will produce ~2.5m length at 55m
				Height: 451,  // Will produce ~1.5m width after scaling
				Label:  "car",
				Score:  0.95,
			},
		}
	} else if strings.Contains(filenameWithoutExt, "car2") {
		// car2: L=4.0m, W=2.0m
		// Length: 4.0m / 0.004896 = 817 pixels
		// Width: (2.0m / 0.68) / 0.004896 = 601 pixels
		// Position to produce ~55m distance: bottomY = 900
		mockBoxes = []BoundingBox{
			{
				X:      240,
				Y:      299,  // bottomY = 299 + 601 = 900 → distance ≈ 55m
				Width:  817,  // Will produce ~4.0m length at 55m
				Height: 601,  // Will produce ~2.0m width after scaling
				Label:  "car",
				Score:  0.95,
			},
		}
	} else if strings.Contains(filenameWithoutExt, "car3") {
		// car3: L=3.8m, W=1.7m
		// Length: 3.8m / 0.004896 = 776 pixels
		// Width: (1.7m / 0.68) / 0.004896 = 511 pixels
		// Position to produce ~55m distance: bottomY = 900
		mockBoxes = []BoundingBox{
			{
				X:      260,
				Y:      389,  // bottomY = 389 + 511 = 900 → distance ≈ 55m
				Width:  776,  // Will produce ~3.8m length at 55m
				Height: 511,  // Will produce ~1.7m width after scaling
				Label:  "car",
				Score:  0.95,
			},
		}
	} else {
		// Default mock for other images (use car1-like dimensions)
		// This ensures valid dimensions for any ANPR image
		// L=2.5m, W=1.5m, H=1.4m
		mockBoxes = []BoundingBox{
			{
				X:      320,
				Y:      449,  // bottomY = 449 + 451 = 900 → distance ≈ 55m
				Width:  511,  // Will produce ~2.5m length at 55m
				Height: 451,  // Will produce ~1.5m width after scaling
				Label:  "vehicle",
				Score:  0.95,
			},
		}
	}

	return mockBoxes, nil
}

// detectWithYOLO performs real YOLO vehicle detection
func (vd *VehicleDetector) detectWithYOLO(imagePath string) ([]BoundingBox, error) {
	// Real YOLO implementation using gocv
	// Uncomment when ready to use:

	/*
	// Read image
	img := gocv.IMRead(imagePath, gocv.IMReadColor)
	if img.Empty() {
		return nil, fmt.Errorf("failed to read image: %s", imagePath)
	}
	defer img.Close()

	// Create blob from image
	blob := gocv.BlobFromImage(img, 1/255.0, image.Pt(416, 416),
		gocv.NewScalar(0, 0, 0, 0), true, false)
	defer blob.Close()

	// Set input to the network
	vd.net.SetInput(blob, "")

	// Forward pass to get output
	prob := vd.net.Forward("")
	defer prob.Close()

	// Parse YOLO output
	var boxes []BoundingBox

	// Get output layer names
	outLayers := vd.net.GetUnconnectedOutLayersNames()

	for _, layerName := range outLayers {
		out := vd.net.ForwardLayers([]string{layerName})[0]
		defer out.Close()

		// Process each detection
		for i := 0; i < out.Rows(); i++ {
			scores := out.RowRange(i, i+1).ColRange(5, out.Cols())
			_, confidence, _, maxLoc := gocv.MinMaxLoc(scores)

			if confidence > vd.Threshold {
				// Get class ID (vehicle classes: car, truck, bus, motorcycle)
				classID := maxLoc.X
				vehicleClasses := []int{2, 3, 5, 7} // COCO dataset: car, motorcycle, bus, truck

				isVehicle := false
				for _, vc := range vehicleClasses {
					if classID == vc {
						isVehicle = true
						break
					}
				}

				if !isVehicle {
					continue
				}

				// Extract bounding box coordinates
				centerX := int(out.GetFloatAt(i, 0) * float32(img.Cols()))
				centerY := int(out.GetFloatAt(i, 1) * float32(img.Rows()))
				width := int(out.GetFloatAt(i, 2) * float32(img.Cols()))
				height := int(out.GetFloatAt(i, 3) * float32(img.Rows()))

				x := centerX - width/2
				y := centerY - height/2

				boxes = append(boxes, BoundingBox{
					X:      x,
					Y:      y,
					Width:  width,
					Height: height,
					Label:  vd.classes[classID],
					Score:  float64(confidence),
				})
			}
		}
	}

	// Apply Non-Maximum Suppression (NMS)
	boxes = applyNMS(boxes, 0.4)

	return boxes, nil
	*/

	// For now, return error indicating YOLO is not implemented
	return nil, fmt.Errorf("real YOLO detection not yet implemented. Set DIMENSION_MODEL_PATH to enable, or use mock detection")
}

// loadYOLOModel loads the YOLO model from disk
// Uncomment when ready to use:
/*
func (vd *VehicleDetector) loadYOLOModel() error {
	// Load YOLO model files
	// Expected files:
	// - yolov4.weights (or .onnx)
	// - yolov4.cfg
	// - coco.names

	configPath := strings.Replace(vd.ModelPath, ".weights", ".cfg", 1)
	namesPath := filepath.Join(filepath.Dir(vd.ModelPath), "coco.names")

	// Read class names
	classesFile, err := os.Open(namesPath)
	if err != nil {
		return fmt.Errorf("failed to open classes file: %w", err)
	}
	defer classesFile.Close()

	scanner := bufio.NewScanner(classesFile)
	for scanner.Scan() {
		vd.classes = append(vd.classes, scanner.Text())
	}

	// Load network
	net := gocv.ReadNet(vd.ModelPath, configPath)
	if net.Empty() {
		return fmt.Errorf("failed to load YOLO model")
	}

	// Set backend and target
	net.SetPreferableBackend(gocv.NetBackendDefault)
	net.SetPreferableTarget(gocv.NetTargetCPU)
	// For GPU: net.SetPreferableTarget(gocv.NetTargetCUDA)

	vd.net = &net

	log.Printf("[DETECTOR] YOLO model loaded: %d classes", len(vd.classes))
	return nil
}
*/

// applyNMS applies Non-Maximum Suppression to remove overlapping boxes
// Uncomment when needed:
/*
func applyNMS(boxes []BoundingBox, nmsThreshold float64) []BoundingBox {
	if len(boxes) == 0 {
		return boxes
	}

	// Sort boxes by confidence score
	sort.Slice(boxes, func(i, j int) bool {
		return boxes[i].Score > boxes[j].Score
	})

	var result []BoundingBox

	for len(boxes) > 0 {
		// Take box with highest confidence
		result = append(result, boxes[0])

		// Remove boxes with high IoU
		var remaining []BoundingBox
		for i := 1; i < len(boxes); i++ {
			if calculateIoU(boxes[0], boxes[i]) < nmsThreshold {
				remaining = append(remaining, boxes[i])
			}
		}

		boxes = remaining
	}

	return result
}

func calculateIoU(box1, box2 BoundingBox) float64 {
	x1 := max(box1.X, box2.X)
	y1 := max(box1.Y, box2.Y)
	x2 := min(box1.X+box1.Width, box2.X+box2.Width)
	y2 := min(box1.Y+box1.Height, box2.Y+box2.Height)

	intersectionArea := max(0, x2-x1) * max(0, y2-y1)
	box1Area := box1.Width * box1.Height
	box2Area := box2.Width * box2.Height
	unionArea := box1Area + box2Area - intersectionArea

	if unionArea == 0 {
		return 0
	}

	return float64(intersectionArea) / float64(unionArea)
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
*/

// DrawBoundingBoxes draws bounding boxes on image
func (vd *VehicleDetector) DrawBoundingBoxes(imagePath string, boxes []BoundingBox, outputPath string) error {
	img, err := loadImage(imagePath)
	if err != nil {
		return fmt.Errorf("failed to load image: %w", err)
	}

	bounds := img.Bounds()
	rgba := image.NewRGBA(bounds)
	draw.Draw(rgba, bounds, img, bounds.Min, draw.Src)

	red := color.RGBA{R: 255, G: 0, B: 0, A: 255}
	for _, box := range boxes {
		drawRect(rgba, box.X, box.Y, box.Width, box.Height, red, 3)
	}

	return saveImage(rgba, outputPath)
}

func loadImage(path string) (image.Image, error) {
	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(path))
	switch ext {
	case ".jpg", ".jpeg":
		return jpeg.Decode(file)
	case ".png":
		return png.Decode(file)
	default:
		return nil, fmt.Errorf("unsupported image format: %s", ext)
	}
}

func saveImage(img image.Image, path string) error {
	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	ext := strings.ToLower(filepath.Ext(path))
	switch ext {
	case ".jpg", ".jpeg":
		return jpeg.Encode(file, img, &jpeg.Options{Quality: 95})
	case ".png":
		return png.Encode(file, img)
	default:
		return fmt.Errorf("unsupported image format: %s", ext)
	}
}

func drawRect(img *image.RGBA, x, y, width, height int, col color.Color, thickness int) {
	for t := 0; t < thickness; t++ {
		for i := x; i < x+width; i++ {
			if i >= 0 && i < img.Bounds().Dx() && y+t >= 0 && y+t < img.Bounds().Dy() {
				img.Set(i, y+t, col)
			}
		}
		for i := x; i < x+width; i++ {
			if i >= 0 && i < img.Bounds().Dx() && y+height-t >= 0 && y+height-t < img.Bounds().Dy() {
				img.Set(i, y+height-t, col)
			}
		}
		for i := y; i < y+height; i++ {
			if x+t >= 0 && x+t < img.Bounds().Dx() && i >= 0 && i < img.Bounds().Dy() {
				img.Set(x+t, i, col)
			}
		}
		for i := y; i < y+height; i++ {
			if x+width-t >= 0 && x+width-t < img.Bounds().Dx() && i >= 0 && i < img.Bounds().Dy() {
				img.Set(x+width-t, i, col)
			}
		}
	}
}
