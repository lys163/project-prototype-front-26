# Authentication and OAuth

## 현재 흐름

[CONFIRMED] `LoginPage.tsx`는 `redirectToKakaoLogin`/`redirectToNaverLogin`을 호출한다. `auth.ts`는 `/oauth2/authorization/kakao` 또는 `/oauth2/authorization/naver`로 browser redirect한다.

[CONFIRMED] Spring `OAuth2SuccessHandler`는 access token과 refresh token을 만들고 refresh token을 HttpOnly cookie로 설정한 뒤 `${app.frontend-url}/oauth/callback?accessToken=...&isNewUser=...`로 redirect한다. Frontend `OAuthCallbackPage`는 두 query parameter를 읽고 access token을 localStorage에 저장한다.

## API와 refresh

[CONFIRMED] `fetchWithAuth`는 localStorage token으로 Bearer header를 만들고 `credentials: include`를 사용한다. 401과 기존 token이 있으면 `refreshAccessToken`이 `POST /api/auth/refresh`를 호출하고 성공한 access token으로 원 요청을 한 번 재시도한다.

[CONFIRMED] logout은 `POST /api/auth/logout`을 시도한 뒤 local token과 user cache를 지운다. user cache의 TTL은 5분이다. 403과 refresh 실패의 중앙 redirect/cleanup 정책은 없다.

## CORS와 local 계약

[CONFIRMED] Spring 설정은 `app.frontend-url=http://localhost:3000`, port `8080`, allow-credentials CORS를 사용한다. Vite는 `/api`, `/oauth2`를 local Spring으로 proxy한다.

## 현재 확인된 보안 개선 후보

[INFERRED] query access token의 URL/history 노출, callback URL cleanup, refresh 기반 초기 token 획득, localStorage token 장기 정책은 개선 검토 대상이다. 이는 현재 구현 완료나 승인된 OAuth 설계가 아니다. OAuth/cookie/CORS 변경은 Spring과 provider 설정을 함께 검증해야 한다.
