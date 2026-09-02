package api

import "testing"

func TestMinIOPublicObjectURL(t *testing.T) {
	tests := []struct {
		name      string
		endpoint  string
		bucket    string
		objectKey string
		want      string
	}{
		{
			name:      "keeps localhost compatibility",
			endpoint:  "localhost:29000",
			bucket:    "attachments",
			objectKey: "site-a/photo.jpg",
			want:      "http://localhost:29000/attachments/site-a/photo.jpg",
		},
		{
			name:      "keeps https endpoint",
			endpoint:  "https://minio.jatanlinkorlantas.id",
			bucket:    "attachments",
			objectKey: "site-a/photo.jpg",
			want:      "https://minio.jatanlinkorlantas.id/attachments/site-a/photo.jpg",
		},
		{
			name:      "trims duplicate separators",
			endpoint:  "https://minio.jatanlinkorlantas.id/",
			bucket:    "/attachments",
			objectKey: "/site-a/photo.jpg",
			want:      "https://minio.jatanlinkorlantas.id/attachments/site-a/photo.jpg",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := minIOPublicObjectURL(tt.endpoint, tt.bucket, tt.objectKey)
			if got != tt.want {
				t.Fatalf("minIOPublicObjectURL() = %q, want %q", got, tt.want)
			}
		})
	}
}
