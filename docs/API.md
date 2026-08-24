# Frontend API Contract

## 공통 규칙

[CONFIRMED] `fetchWithAuth`는 token이 있으면 `Authorization: Bearer <token>`을 붙이고 `credentials: include`를 사용한다. `api.ts`의 `parseApiResponse`는 `{ success, data, error }` 형태와 Zod schema를 검증한다. schema가 계약 경계이므로 Frontend만으로 완화하거나 새 endpoint를 만들지 않는다.

## 실제 호출 범주

| 범주 | method / path 예 | Frontend caller |
|---|---|---|
| 인증 | `POST /api/auth/logout`, `POST /api/auth/refresh` | `lib/auth.ts` |
| 사용자 | `GET /api/user/me`, `PATCH /api/user/profile` | `lib/auth.ts` |
| 도서 | `GET /api/books`, `GET /api/books/{bookId}`, `/me`, `/bestsellers` | `lib/api.ts` |
| 리뷰/좋아요/신고 | `/api/books/{bookId}/reviews`, `/likes`, `/api/report/{bookId}` | `lib/api.ts` |
| 작가/독서 | `/api/authors/...`, reading progress, `/api/reading-goals` | `lib/api.ts` |
| ranking/category/banner | `/api/ranking/...`, `/api/categories`, `/api/banners` | `lib/api.ts` |
| storage | `POST /api/storage/presigned-upload` | `lib/storage.ts` |

[CONFIRMED] Storage presign request는 `filename`, `contentType`, `fileSize`를 보내며 JPEG/PNG/WebP와 최대 5 MiB만 허용합니다. Response의 `uploadUrl`과 signed `fields`를 그대로 `FormData`에 추가하고 마지막에 `file` field를 넣어 MinIO로 POST합니다. 성공 후 `publicUrl`을 profile update에 사용합니다.

[CONFIRMED] Frontend가 호출하는 method/path는 Spring controller mapping과 확인한 범위에서 일치한다. 인증 요구는 Spring security config가 최종 기준이며 Frontend의 token 존재 여부는 UX 판단일 뿐이다.

## 변경 규칙

method, path, request body, response envelope, Zod schema, authorization이 바뀌면 `C:\workspc\codex\spring-server`의 해당 controller/DTO/security를 함께 확인하고 양쪽 compatibility를 검증한다.
