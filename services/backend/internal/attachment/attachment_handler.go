package attachment

import (
	"context"
	"fmt"
	"log"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type AttachmentHandler struct {
	MinioClient *minio.Client
	Bucket      string
}

// NewAttachmentHandler creates a new attachment handler
func NewAttachmentHandler(endpoint, accessKey, secretKey, bucket string, useSSL bool) (*AttachmentHandler, error) {
	mc, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create minio client: %w", err)
	}

	return &AttachmentHandler{
		MinioClient: mc,
		Bucket:      bucket,
	}, nil
}

type UploadResponse struct {
	Success    bool   `json:"success"`
	FilePath   string `json:"file_path"`
	Bucket     string `json:"bucket,omitempty"`
	DateFolder string `json:"date_folder,omitempty"`
	ObjectName string `json:"object_name,omitempty"`
	Message    string `json:"message,omitempty"`
}

// UploadImage handles image and video upload to MinIO.
func (h *AttachmentHandler) UploadImage(c *fiber.Ctx) error {
	log.Println("[ATTACHMENT] Upload request received")

	// Get uploaded file
	file, err := c.FormFile("image")
	if err != nil {
		log.Printf("[ATTACHMENT] No file in request: %v", err)
		return c.Status(fiber.StatusBadRequest).JSON(UploadResponse{
			Success: false,
			Message: "No image file provided",
		})
	}

	log.Printf("[ATTACHMENT] File received: %s, Size: %d bytes", file.Filename, file.Size)

	ext := strings.ToLower(filepath.Ext(file.Filename))
	contentTypes := map[string]string{
		".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
		".gif": "image/gif", ".webp": "image/webp",
		".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime",
		".m4v": "video/x-m4v", ".ogg": "video/ogg",
	}
	contentType, allowed := contentTypes[ext]
	if !allowed {
		log.Printf("[ATTACHMENT] Invalid file type: %s", ext)
		return c.Status(fiber.StatusBadRequest).JSON(UploadResponse{
			Success: false,
			Message: fmt.Sprintf("Invalid file type '%s'. Allowed: jpg, jpeg, png, gif, webp, mp4, webm, mov, m4v, ogg", ext),
		})
	}
	maxSize := int64(5 * 1024 * 1024)
	if strings.HasPrefix(contentType, "video/") {
		maxSize = 50 * 1024 * 1024
	}
	if file.Size > maxSize {
		return c.Status(fiber.StatusRequestEntityTooLarge).JSON(UploadResponse{
			Success: false,
			Message: fmt.Sprintf("File is too large. Maximum size is %d MB", maxSize/(1024*1024)),
		})
	}

	// Open uploaded file
	fileReader, err := file.Open()
	if err != nil {
		log.Printf("[ATTACHMENT] Failed to open uploaded file: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(UploadResponse{
			Success: false,
			Message: "Failed to process uploaded file",
		})
	}
	defer fileReader.Close()

	// Generate unique filename without folder structure
	// Format: uuid-originalname.ext
	uniqueID := uuid.New().String()
	objectName := fmt.Sprintf("%s-%s", uniqueID, file.Filename)

	// Upload to MinIO
	ctx := context.Background()
	_, err = h.MinioClient.PutObject(ctx, h.Bucket, objectName, fileReader, file.Size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	if err != nil {
		log.Printf("[ATTACHMENT] Failed to upload to MinIO: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(UploadResponse{
			Success: false,
			Message: "Failed to upload file to storage",
		})
	}

	// Construct file path
	filePath := fmt.Sprintf("%s/%s", h.Bucket, objectName)

	log.Printf("[ATTACHMENT] Successfully uploaded: %s", filePath)

	return c.JSON(UploadResponse{
		Success:    true,
		FilePath:   filePath,
		Bucket:     h.Bucket,
		DateFolder: "",
		ObjectName: objectName,
		Message:    "File uploaded successfully",
	})
}
