package api

import "strings"

func minIOPublicObjectURL(endpoint, bucket, objectKey string) string {
	endpoint = strings.TrimRight(strings.TrimSpace(endpoint), "/")
	if endpoint == "" {
		return ""
	}
	if !strings.HasPrefix(endpoint, "http://") && !strings.HasPrefix(endpoint, "https://") {
		endpoint = "http://" + endpoint
	}

	return endpoint + "/" + strings.TrimLeft(bucket, "/") + "/" + strings.TrimLeft(objectKey, "/")
}
