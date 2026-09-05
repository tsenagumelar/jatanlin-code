package vision

import "testing"

func TestGroundDimensionsScaleWithEstimatedDistance(t *testing.T) {
	calibration := NewCameraCalibration()
	calibration.ReferenceDistanceM = 15

	near, err := calibration.CalculateGroundDimensions(BoundingBox{X: 800, Y: 750, Width: 400, Height: 300, Score: 0.9})
	if err != nil {
		t.Fatal(err)
	}
	far, err := calibration.CalculateGroundDimensions(BoundingBox{X: 800, Y: 1150, Width: 400, Height: 300, Score: 0.9})
	if err != nil {
		t.Fatal(err)
	}

	if far.DistanceMeters <= near.DistanceMeters {
		t.Fatalf("expected farther image position to have greater distance: near=%f far=%f", near.DistanceMeters, far.DistanceMeters)
	}
	if far.WidthMeters <= near.WidthMeters || far.HeightMeters <= near.HeightMeters {
		t.Fatalf("same pixel span farther away must represent a larger object: near=%+v far=%+v", near, far)
	}
}

func TestCalibrationRequiresReferenceDistance(t *testing.T) {
	calibration := NewCameraCalibration()
	calibration.ReferenceDistanceM = 0
	if err := calibration.Validate(); err == nil {
		t.Fatal("expected zero reference distance to be rejected")
	}
}
