import { fetchWithAuth } from './auth';

// ── 타입 ──

export interface PresignedUploadResponse {
  objectKey: string;
  url: string;
  publicUrl: string;
  expiresInSeconds: number;
}

// ── 프리사인드 URL 발급 ──

/**
 * 백엔드로부터 MinIO 업로드용 프리사인드 URL을 발급받는다.
 * filename / contentType은 백엔드가 서명에 포함하므로 이후 PUT 요청에서 반드시 동일한 Content-Type을 사용해야 한다.
 */
export async function requestPresignedUploadUrl(
  filename: string,
  contentType: string
): Promise<PresignedUploadResponse> {
  const res = await fetchWithAuth('/api/storage/presigned-upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, contentType }),
  });

  if (!res.ok) {
    throw new Error('프리사인드 URL 발급에 실패했습니다.');
  }

  const json = await res.json();
  if (!json.success || !json.data) {
    throw new Error('프리사인드 URL 응답이 올바르지 않습니다.');
  }
  return json.data as PresignedUploadResponse;
}

// ── 프리사인드 URL에 직접 업로드 ──

/**
 * 프리사인드 URL에 파일을 PUT으로 직접 업로드한다. 백엔드는 경유하지 않음.
 * 주의: Content-Type은 presigned 발급 때 넘긴 값과 완전히 동일해야 한다(서명 검증).
 */
export async function uploadFileToPresignedUrl(url: string, file: File): Promise<void> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
    // credentials를 붙이면 CORS preflight 깨지므로 명시적으로 생략
  });

  if (!res.ok) {
    throw new Error('파일 업로드에 실패했습니다.');
  }
}

// ── 업로드 전체 플로우 ──

/**
 * 사용자 파일 업로드 2단계 플로우를 한 함수로:
 * 1) 백엔드에서 presigned URL + publicUrl 발급
 * 2) presigned URL에 파일 PUT
 * 3) 쿼리 파라미터 제거된 publicUrl 반환 (DB 저장 + <img src> 바로 사용 가능)
 */
export async function uploadUserFile(file: File): Promise<string> {
  const { url, publicUrl } = await requestPresignedUploadUrl(file.name, file.type);
  await uploadFileToPresignedUrl(url, file);
  return publicUrl;
}
