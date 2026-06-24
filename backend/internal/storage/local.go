package storage

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
)

const MaxUploadBytes = 5 << 20 // 5MB

var allowedExtensions = map[string]struct{}{
	".jpg":  {},
	".jpeg": {},
	".png":  {},
	".webp": {},
}

type LocalStorage struct {
	dir string
}

func NewLocalStorage(dir string) (*LocalStorage, error) {
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return nil, fmt.Errorf("create upload dir: %w", err)
	}

	return &LocalStorage{dir: dir}, nil
}

func (s *LocalStorage) SaveProductImage(fileHeader *multipart.FileHeader) (string, error) {
	if fileHeader == nil {
		return "", fmt.Errorf("image file is required")
	}

	if fileHeader.Size > MaxUploadBytes {
		return "", fmt.Errorf("image must be 5MB or smaller")
	}

	ext := strings.ToLower(filepath.Ext(fileHeader.Filename))
	if _, ok := allowedExtensions[ext]; !ok {
		return "", fmt.Errorf("image must be jpeg, png, or webp")
	}

	src, err := fileHeader.Open()
	if err != nil {
		return "", fmt.Errorf("open upload: %w", err)
	}
	defer src.Close()

	filename := uuid.NewString() + ext
	dstPath := filepath.Join(s.dir, filename)

	dst, err := os.Create(dstPath)
	if err != nil {
		return "", fmt.Errorf("create upload file: %w", err)
	}
	defer dst.Close()

	written, err := io.Copy(dst, io.LimitReader(src, MaxUploadBytes+1))
	if err != nil {
		_ = os.Remove(dstPath)
		return "", fmt.Errorf("save upload: %w", err)
	}
	if written > MaxUploadBytes {
		_ = os.Remove(dstPath)
		return "", fmt.Errorf("image must be 5MB or smaller")
	}

	return "/uploads/" + filename, nil
}
