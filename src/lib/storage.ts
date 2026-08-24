import { fetchWithAuth } from './auth';
import { z } from 'zod';

// ── 타입 ──

export interface PresignedUploadResponse {
  objectKey: string;
  uploadUrl: string;
  fields: Record<string, string>;
  publicUrl: string;
  expiresInSeconds: number;
}

const presignedUploadResponseSchema: z.ZodType<PresignedUploadResponse> = z.object({
  objectKey: z.string(),
  uploadUrl: z.string(),
  fields: z.record(z.string(), z.string()),
  publicUrl: z.string(),
  expiresInSeconds: z.number().int().positive(),
});

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

// ── 프리사인드 URL 발급 ──

/**
 * 백엔드로부터 MinIO 업로드용 프리사인드 URL을 발급받는다.
 * filename, contentType, fileSize를 검증한 뒤 multipart/form-data POST에 필요한 서명된 fields를 받는다.
 */
export async function requestPresignedUploadUrl(
  filename: string,
  contentType: string,
  fileSize: number
): Promise<PresignedUploadResponse> {
  const res = await fetchWithAuth('/api/storage/presigned-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType, fileSize }),
  });

  if (!res.ok) {
    throw new Error('프리사인드 URL 발급에 실패했습니다.');
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error('프리사인드 URL 응답이 올바르지 않습니다.');
  }
  const parsed = presignedUploadResponseSchema.safeParse(json.data);
  if (!parsed.success) {
    throw new Error('프리사인드 URL 응답이 올바르지 않습니다.');
  }
  return parsed.data;
}

// ── 프리사인드 URL에 직접 업로드 ──

/**
 * 서명된 form fields와 파일을 MinIO에 직접 POST한다. 백엔드는 파일 body를 경유하지 않는다.
 */
export async function uploadFileToPresignedPost(
  uploadUrl: string,
  fields: Record<string, string>,
  file: File
): Promise<void> {
  const formData = new FormData();
  for (const [name, value] of Object.entries(fields)) {
    formData.append(name, value);
  }
  formData.append('file', file);

  const res = await fetch(uploadUrl, {
    method: 'POST',
    body: formData,
    // credentials를 붙이면 CORS preflight 깨지므로 명시적으로 생략
  });

  if (!res.ok) {
    throw new Error('파일 업로드에 실패했습니다.');
  }
}

// ── 업로드 전체 플로우 ──

/**
 * 사용자 파일 업로드 2단계 플로우를 한 함수로:
 * 1) 백엔드에서 signed POST form fields + publicUrl 발급
 * 2) MinIO에 multipart/form-data POST
 * 3) 쿼리 파라미터 제거된 publicUrl 반환 (DB 저장 + <img src> 바로 사용 가능)
 */
export async function uploadUserFile(file: File): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('JPEG, PNG, WebP 이미지만 업로드할 수 있습니다.');
  }
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('이미지 크기는 1 byte 이상 5MB 이하여야 합니다.');
  }

  const { uploadUrl, fields, publicUrl } = await requestPresignedUploadUrl(
    file.name,
    file.type,
    file.size
  );
  await uploadFileToPresignedPost(uploadUrl, fields, file);
  return publicUrl;
}
