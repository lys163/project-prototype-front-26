# Authentication and OAuth

## 현재 흐름

[CONFIRMED] `LoginPage.tsx`는 `redirectToKakaoLogin`/`redirectToNaverLogin`을 호출한다. `auth.ts`는 `/oauth2/authorization/kakao` 또는 `/oauth2/authorization/naver`로 browser redirect한다.

[CONFIRMED] Spring `OAuth2SuccessHandler`는 refresh token을 만들고 HttpOnly cookie로 설정한 뒤 `${app.frontend-url}/oauth/callback?isNewUser=...`로 redirect한다. Frontend `OAuthCallbackPage`는 `refreshAccessToken`을 호출하고, refresh 응답의 access token이 localStorage에 저장된 뒤 신규/기존 사용자 흐름으로 분기한다.

## API와 refresh

[CONFIRMED] `fetchWithAuth`는 localStorage token으로 Bearer header를 만들고 `credentials: include`를 사용한다. 401과 기존 token이 있으면 `refreshAccessToken`이 `POST /api/auth/refresh`를 호출하고 성공한 access token으로 원 요청을 한 번 재시도한다.

[CONFIRMED] logout은 local access token 유무와 관계없이 `credentials: include`로 `POST /api/auth/logout`을 직접 호출하며 refresh/retry를 수행하지 않는다. Backend는 refresh-token cookie와 Redis value가 exact match일 때 server-side token을 삭제하고 모든 idempotent logout 결과에서 cookie를 만료시킨다. Frontend는 요청 결과와 관계없이 local token과 user cache를 지운다. user cache의 TTL은 5분이다. 403과 refresh 실패의 중앙 redirect/cleanup 정책은 없다.

## CORS와 local 계약

[CONFIRMED] Spring 설정은 `app.frontend-url=http://localhost:3000`, port `8080`, allow-credentials CORS를 사용한다. Vite는 `/api`, `/oauth2`를 local Spring으로 proxy한다.

## 현재 확인된 보안 개선 후보

[CONFIRMED] callback query에는 access token이 없고 `isNewUser`만 남아 있습니다. Access token은 여전히 localStorage에 저장됩니다. Frontend `.env.example`에는 API/proxy URL만 있으며 browser-side Gemini/provider secret injection은 없습니다.

[FUTURE] Access token memory 전환을 포함한 localStorage 개선, Refresh Token Rotation/replay detection, multi-device/session 정책, JSESSIONID lifecycle, CSRF 보강과 refresh/logout Origin/Referer 검토는 구현 완료 상태가 아닙니다. OAuth/cookie/CORS 변경은 Spring과 provider 설정을 함께 검증해야 합니다.

[UNKNOWN] Production domain, Cookie Domain/SameSite, TLS, CORS, CSRF/Origin 정책은 아직 결정되지 않았습니다.
