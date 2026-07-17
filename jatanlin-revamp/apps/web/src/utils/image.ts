/**
 * Get full image URL from MinIO path
 * @param bucket - MinIO bucket name
 * @param objectPath - Object path in MinIO
 * @returns Full URL to the image
 */
export const getMinioImageUrl = (
  bucket: string | null | undefined,
  objectPath: string | null | undefined,
): string => {
  if (!bucket || !objectPath) return '';

  const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL || '';

  // Remove leading slash if present
  const cleanBucket = bucket.startsWith('/') ? bucket.slice(1) : bucket;
  const cleanPath = objectPath.startsWith('/') ? objectPath.slice(1) : objectPath;
  const objectPathWithBucket = `${cleanBucket}/`;

  if (cleanPath === cleanBucket || cleanPath.startsWith(objectPathWithBucket)) {
    return `${MINIO_URL}/${cleanPath}`;
  }

  return `${MINIO_URL}/${cleanBucket}/${cleanPath}`;
};

/**
 * Get image URL from path (supports both MinIO and absolute URLs)
 * @param path - Image path (can be MinIO path or absolute URL)
 * @returns Full URL to the image
 */
export const getImageUrl = (path: string | null): string => {
  if (!path) return '';

  // If already absolute URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL || '';
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  return `${MINIO_URL}/${cleanPath}`;
};
