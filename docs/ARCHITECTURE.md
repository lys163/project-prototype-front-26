# Frontend Architecture

## 시작과 route

`index.html` → `src/main.tsx` → `StrictMode` → `App` → `BrowserRouter` → lazy-loaded page 흐름이다. `App.tsx`는 Navbar, Footer, ScrollToTop, Suspense와 `ChunkErrorBoundary`를 조합한다. chunk error boundary는 sessionStorage의 cooldown으로 reload loop를 막는다.

`src/pages/`는 route 화면, `src/components/`는 공통 UI, `src/lib/`는 auth/API/storage/utility, `src/constants.ts`와 `src/types.ts`는 UI 입력 및 타입을 제공한다.

## API 흐름

Page → `src/lib/api.ts` 또는 `src/lib/storage.ts` → `fetchWithAuth` (`src/lib/auth.ts`) → `/api/...` → Vite proxy(local) → Spring 순서다. API response는 `api.ts`의 Zod schema로 검증한다.

## 인증 흐름

LoginPage → `/oauth2/authorization/{provider}` → Spring → refresh-token HttpOnly cookie와 `/oauth/callback?isNewUser=...` redirect → `OAuthCallbackPage` → `/api/auth/refresh` → localStorage access token → `fetchWithAuth` Bearer request 흐름이다.

## 상태와 route 보호

[CONFIRMED] 전역 state library/context는 없다. token은 localStorage, user 정보는 5분 module cache, chunk reload timestamp는 sessionStorage, 화면 입력은 local state다.

[CONFIRMED] `ProtectedRoute`는 없다. 일부 page가 `isLoggedIn()`으로 `/login` 이동하지만 `/create`는 direct route 접근 시 page-level 검사가 없다. client guard는 Backend authorization의 대체물이 아니다.

## Storage

Frontend → `POST /api/storage/presigned-upload` (`filename`, `contentType`, `fileSize`) → signed POST form 응답 → browser가 returned fields와 file을 `FormData`에 담아 MinIO로 direct `POST` → `publicUrl` 사용 흐름이다. Frontend는 MinIO client를 직접 사용하지 않으며 Backend용 Bearer/cookie를 MinIO 요청에 전달하지 않는다.
