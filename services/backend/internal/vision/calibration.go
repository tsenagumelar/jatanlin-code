package vision

import (
	"fmt"
	"math"
)

// CameraCalibration holds camera calibration parameters
type CameraCalibration struct {
	ProfileName string

	// Intrinsic parameters
	FocalLengthPixels float64 // Focal length in pixels
	ImageWidth        int     // Image width in pixels
	ImageHeight       int     // Image height in pixels
	PrincipalPointX   float64 // Principal point X (usually image_width/2)
	PrincipalPointY   float64 // Principal point Y (usually image_height/2)

	// Extrinsic parameters
	CameraHeightMeters float64 // Camera height from ground in meters
	TiltAngleDegrees   float64 // Camera tilt angle in degrees (0 = horizontal, 90 = looking down)

	// Reference calibration
	ReferencePixelLength int     // Length in pixels of reference object
	ReferenceRealLength  float64 // Real length in meters of reference object
	ReferenceDistanceM   float64 // Distance from camera to reference object in meters

	// Computed values
	PixelToMeterRatio float64 // Conversion ratio at reference distance

	// Empirical profile for operational measurement
	LengthScaleMetersPerPixel float64
	WidthScaleMetersPerPixel  float64
	HeightScaleMetersPerPixel float64
	LengthOffsetMeters        float64
	WidthOffsetMeters         float64
	HeightOffsetMeters        float64
	MinConfidence             float64
	EnablePoseFilter          bool
}

// NewCameraCalibration creates a new camera calibration with default values
func NewCameraCalibration() *CameraCalibration {
	return &CameraCalibration{
		// Default values - should be configured
		ProfileName:               "default-empirical",
		FocalLengthPixels:         1000.0,
		ImageWidth:                2432,
		ImageHeight:               2080,
		PrincipalPointX:           1216.0,
		PrincipalPointY:           1040.0,
		CameraHeightMeters:        5.0,
		TiltAngleDegrees:          25.0,
		ReferencePixelLength:      200,
		ReferenceRealLength:       5.0,
		ReferenceDistanceM:        25.0,
		LengthScaleMetersPerPixel: 0.009535,
		WidthScaleMetersPerPixel:  0.003522,
		HeightScaleMetersPerPixel: 0.003603,
		LengthOffsetMeters:        0.0,
		WidthOffsetMeters:         0.0,
		HeightOffsetMeters:        0.0,
		MinConfidence:             0.45,
		EnablePoseFilter:          true,
	}
}

// LoadFromConfig loads calibration parameters from configuration
func (cc *CameraCalibration) LoadFromConfig(
	focalLength float64,
	imageWidth, imageHeight int,
	cameraHeight, tiltAngle float64,
	refPixelLen int,
	refRealLen, refDistance float64,
) {
	cc.FocalLengthPixels = focalLength
	cc.ImageWidth = imageWidth
	cc.ImageHeight = imageHeight
	cc.PrincipalPointX = float64(imageWidth) / 2.0
	cc.PrincipalPointY = float64(imageHeight) / 2.0
	cc.CameraHeightMeters = cameraHeight
	cc.TiltAngleDegrees = tiltAngle
	cc.ReferencePixelLength = refPixelLen
	cc.ReferenceRealLength = refRealLen
	cc.ReferenceDistanceM = refDistance

	cc.ComputePixelToMeterRatio()
}

// ComputePixelToMeterRatio calculates the pixel to meter conversion ratio
func (cc *CameraCalibration) ComputePixelToMeterRatio() {
	if cc.ReferencePixelLength > 0 {
		cc.PixelToMeterRatio = cc.ReferenceRealLength / float64(cc.ReferencePixelLength)
	}
}

// ConfigureEmpiricalProfile sets empirical length/width/height conversion parameters.
func (cc *CameraCalibration) ConfigureEmpiricalProfile(profileName string, lengthScale, widthScale, heightScale, lengthOffset, widthOffset, heightOffset, minConfidence float64, enablePoseFilter bool) {
	if profileName != "" {
		cc.ProfileName = profileName
	}
	if lengthScale > 0 {
		cc.LengthScaleMetersPerPixel = lengthScale
	}
	if widthScale > 0 {
		cc.WidthScaleMetersPerPixel = widthScale
	}
	if heightScale > 0 {
		cc.HeightScaleMetersPerPixel = heightScale
	}
	if cc.LengthScaleMetersPerPixel <= 0 {
		cc.LengthScaleMetersPerPixel = cc.HeightScaleMetersPerPixel
	}
	cc.LengthOffsetMeters = lengthOffset
	cc.WidthOffsetMeters = widthOffset
	cc.HeightOffsetMeters = heightOffset
	if minConfidence > 0 {
		cc.MinConfidence = minConfidence
	}
	cc.EnablePoseFilter = enablePoseFilter
}

// PixelsToMeters converts pixel measurements to meters at a given distance
func (cc *CameraCalibration) PixelsToMeters(pixels int, distanceMeters float64) float64 {
	// Simple linear approximation using reference calibration
	// For more accuracy, use perspective transformation
	if cc.ReferenceDistanceM > 0 {
		// Adjust ratio based on distance (objects farther appear smaller)
		distanceRatio := distanceMeters / cc.ReferenceDistanceM
		adjustedRatio := cc.PixelToMeterRatio * distanceRatio
		return float64(pixels) * adjustedRatio
	}

	// Fallback to direct ratio
	return float64(pixels) * cc.PixelToMeterRatio
}

// EstimateDistance estimates distance from camera to object based on its position in image
func (cc *CameraCalibration) EstimateDistance(pixelY int) float64 {
	// Calculate distance using camera height and tilt angle
	// This is a simplified model assuming flat ground

	tiltRad := cc.TiltAngleDegrees * math.Pi / 180.0

	// Calculate the angle from camera to pixel
	pixelOffsetY := float64(pixelY) - cc.PrincipalPointY
	angleToPixel := math.Atan(pixelOffsetY / cc.FocalLengthPixels)

	// Calculate ground distance
	totalAngle := tiltRad - angleToPixel
	if math.Abs(math.Tan(totalAngle)) < 0.001 {
		return cc.ReferenceDistanceM // Avoid division by near-zero
	}

	distance := cc.CameraHeightMeters / math.Tan(totalAngle)

	// Clamp to reasonable values
	if distance < 1.0 {
		distance = 1.0
	}
	if distance > 100.0 {
		distance = 100.0
	}

	return distance
}

func (cc *CameraCalibration) calculateMeasurementConfidence(bbox BoundingBox) float64 {
	confidence := 0.9

	if bbox.Score > 0 {
		confidence *= bbox.Score
	}

	leftMargin := bbox.X
	rightMargin := cc.ImageWidth - (bbox.X + bbox.Width)
	topMargin := bbox.Y
	bottomMargin := cc.ImageHeight - (bbox.Y + bbox.Height)

	if leftMargin < 0 || rightMargin < 0 || topMargin < 0 || bottomMargin < 0 {
		confidence *= 0.4
	}

	if cc.EnablePoseFilter {
		if bbox.Width <= 0 || bbox.Height <= 0 {
			confidence *= 0.3
		} else {
			ratio := float64(bbox.Width) / float64(bbox.Height)
			if ratio < 0.35 || ratio > 3.0 {
				confidence *= 0.7
			}
		}

		edgePenalty := 1.0
		if leftMargin < 40 || rightMargin < 40 {
			edgePenalty *= 0.8
		}
		if topMargin < 40 || bottomMargin < 40 {
			edgePenalty *= 0.8
		}
		confidence *= edgePenalty
	}

	if confidence < 0 {
		return 0
	}
	if confidence > 0.99 {
		return 0.99
	}
	return confidence
}

// CalculateGroundDimensions calculates length/width/height screening measurements from a bounding box.
func (cc *CameraCalibration) CalculateGroundDimensions(bbox BoundingBox) (*VehicleDimensions, error) {
	if bbox.Width <= 0 || bbox.Height <= 0 {
		return nil, fmt.Errorf("invalid bounding box size")
	}

	bottomY := bbox.Y + bbox.Height
	centerX := bbox.X + bbox.Width/2
	centerY := bbox.Y + bbox.Height/2

	distance := cc.EstimateDistance(bottomY)
	distanceScale := 1.0
	if cc.ReferenceDistanceM > 0 {
		distanceScale = distance / cc.ReferenceDistanceM
		// A value outside this range indicates that the vehicle is too far from
		// the calibrated measurement zone. Keep the screening estimate bounded.
		distanceScale = math.Max(0.5, math.Min(2.0, distanceScale))
	}

	length := float64(bbox.Height)*cc.LengthScaleMetersPerPixel*distanceScale + cc.LengthOffsetMeters
	width := float64(bbox.Width)*cc.WidthScaleMetersPerPixel*distanceScale + cc.WidthOffsetMeters
	height := float64(bbox.Height)*cc.HeightScaleMetersPerPixel*distanceScale + cc.HeightOffsetMeters
	confidence := cc.calculateMeasurementConfidence(bbox)
	// Confidence decreases as the object moves away from the reference plane.
	confidence *= 1 / (1 + math.Abs(math.Log(distanceScale)))

	if length < 0 {
		length = 0
	}
	if width < 0 {
		width = 0
	}
	if height < 0 {
		height = 0
	}

	return &VehicleDimensions{
		LengthMeters:   length,
		WidthMeters:    width,
		HeightMeters:   height,
		DistanceMeters: distance,
		CenterX:        centerX,
		CenterY:        centerY,
		Confidence:     confidence,
		WidthPixels:    bbox.Width,
		HeightPixels:   bbox.Height,
		ProfileName:    cc.ProfileName,
	}, nil
}

// Validate checks if calibration parameters are reasonable
func (cc *CameraCalibration) Validate() error {
	if cc.FocalLengthPixels <= 0 {
		return fmt.Errorf("focal length must be positive")
	}
	if cc.ImageWidth <= 0 || cc.ImageHeight <= 0 {
		return fmt.Errorf("image dimensions must be positive")
	}
	if cc.CameraHeightMeters <= 0 {
		return fmt.Errorf("camera height must be positive")
	}
	if cc.TiltAngleDegrees < 0 || cc.TiltAngleDegrees > 90 {
		return fmt.Errorf("tilt angle must be between 0 and 90 degrees")
	}
	if cc.ReferenceRealLength <= 0 {
		return fmt.Errorf("reference length must be positive")
	}
	if cc.ReferenceDistanceM <= 0 {
		return fmt.Errorf("reference distance must be positive")
	}
	if cc.WidthScaleMetersPerPixel <= 0 {
		return fmt.Errorf("width scale must be positive")
	}
	if cc.HeightScaleMetersPerPixel <= 0 {
		return fmt.Errorf("height scale must be positive")
	}
	if cc.LengthScaleMetersPerPixel <= 0 {
		return fmt.Errorf("length scale must be positive")
	}

	return nil
}

// GetCalibrationInfo returns a string with calibration information
func (cc *CameraCalibration) GetCalibrationInfo() string {
	return fmt.Sprintf(
		"Camera Calibration:\n"+
			"  Resolution: %dx%d\n"+
			"  Focal Length: %.2f pixels\n"+
			"  Height: %.2f m\n"+
			"  Tilt Angle: %.2f°\n"+
			"  Profile: %s\n"+
			"  Reference: %d pixels = %.2f m at %.2f m distance\n"+
			"  Pixel-to-Meter Ratio: %.6f m/pixel\n"+
			"  Length Scale: %.6f m/pixel\n"+
			"  Width Scale: %.6f m/pixel\n"+
			"  Height Scale: %.6f m/pixel",
		cc.ImageWidth, cc.ImageHeight,
		cc.FocalLengthPixels,
		cc.CameraHeightMeters,
		cc.TiltAngleDegrees,
		cc.ProfileName,
		cc.ReferencePixelLength, cc.ReferenceRealLength, cc.ReferenceDistanceM,
		cc.PixelToMeterRatio,
		cc.LengthScaleMetersPerPixel,
		cc.WidthScaleMetersPerPixel,
		cc.HeightScaleMetersPerPixel,
	)
}
