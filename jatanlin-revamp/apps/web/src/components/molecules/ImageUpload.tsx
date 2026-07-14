"use client";

import React, { useState, useRef } from "react";
import { Avatar, Button, Spinner } from "@fluentui/react-components";
import {
  ArrowUpload24Regular,
  Delete24Regular,
  Checkmark24Regular,
} from "@fluentui/react-icons";

interface ImageUploadProps {
  value: string | null;
  onChange: (filePath: string | null) => void;
  label?: string;
  placeholder?: string;
  apiEndpoint?: string;
  className?: string;
  disabled?: boolean;
  userName?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = "Foto Profil",
  placeholder = "Pilih gambar (JPG, PNG, max 5MB)",
  apiEndpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/attachment/upload`,
  className = "",
  disabled = false,
  userName = "Pengguna",
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Harap pilih file gambar");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Ukuran file harus kurang dari 5MB");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success && result.file_path) {
        onChange(result.file_path);
      } else {
        setError(result.message || "Upload gagal");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Gagal mengunggah gambar. Silakan coba lagi.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const getImageUrl = (path: string | null) => {
    if (!path) return "/polantas.png";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL || "";
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    return `${MINIO_URL}/${cleanPath}`;
  };

  const imageUrl = getImageUrl(value);

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}

      <div className="flex items-start gap-4">
        {/* Preview Area */}
        <div className="relative">
          <Avatar
            image={{ src: imageUrl }}
            name={userName}
            size={96}
            className="border-2 border-gray-200"
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
              <Spinner size="small" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <Button
              appearance="primary"
              icon={<ArrowUpload24Regular />}
              onClick={handleClick}
              disabled={disabled || uploading}
              size="small"
            >
              {uploading ? "Mengunggah..." : value ? "Ubah Foto" : "Unggah Foto"}
            </Button>

            {value && !uploading && (
              <Button
                appearance="subtle"
                icon={<Delete24Regular />}
                onClick={handleRemove}
                disabled={disabled}
                size="small"
              >
                Hapus
              </Button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={disabled}
          />

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1">
              {error}
            </div>
          )}

          {!error && !uploading && (
            <p className="text-xs text-gray-500">{placeholder}</p>
          )}

          {value && !uploading && !error && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Checkmark24Regular />
              <span>Foto berhasil diunggah</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
