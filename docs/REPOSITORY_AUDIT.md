# Repository Audit Baseline

## 범위와 상태

[CONFIRMED] 이 baseline은 현재 React/Vite source, config 및 필요한 Spring contract를 읽기 전용으로 조사한 결과다. 이전 production domain 참조는 현재 Frontend 전체에서 0건이다. local 기본 계약은 Frontend `http://localhost:3000`, Spring `http://localhost:8080`이다.

## 핵심 사실

- [CONFIRMED] BrowserRouter와 lazy page, local state 중심 구조다.
- [CONFIRMED] `fetchWithAuth`, Bearer header, credentials include, 401 refresh retry가 존재한다.
- [CONFIRMED] OAuth callback query에는 `isNewUser`만 포함된다. Callback은 `POST /api/auth/refresh`를 호출하고 응답의 access token을 localStorage에 보관한다.
- [CONFIRMED] logout은 local access token 유무와 관계없이 refresh-token cookie를 포함해 Backend logout을 직접 호출하며 refresh/retry를 사용하지 않는다. 요청 결과와 무관하게 local token과 user cache를 정리한다.
- [CONFIRMED] presigned upload는 Spring이 발급한 signed form fields로 MinIO에 multipart/form-data POST하며 JPEG/PNG/WebP와 최대 5 MiB를 Storage policy로 제한한다.
- [CONFIRMED] test, CI, deployment config와 실제 AI generation API workflow는 없다.
- [CONFIRMED] Wizard는 입력/SpeechRecognition/demo UI만 제공한다.

## 기술 부채와 위험도 판단

다음 priority는 구현 사실이 아니라 audit 기반 위험도 판단이다.

- 완료: callback query access-token 전달 제거, UserInfo email nullable 계약 정합화, access token 없는 logout 호출 지원
- P1 후보: localStorage token XSS 노출, automated test/CI 부재, refresh 실패·403 중앙 정책 부재, route-level guard 부재, AI generation workflow 미구현
- AUTH_SECURITY 후속: Refresh Token Rotation/replay detection, multi-device/session 정책, access token memory 전환 검토, JSESSIONID lifecycle, CSRF 및 refresh/logout Origin/Referer 정책
- P2 후보: 문서 drift, 사용 근거 없는 dependency, Node version 미고정

## Unknown

- [UNKNOWN] production API/DNS, deployed CORS origin, OAuth provider console 설정, production secret 관리
- [UNKNOWN] production OAuth/refresh/logout runtime, production cookie/CORS/Origin 정책과 provider-console 설정

상세 계약은 `API.md`, `AUTH.md`, 구조는 `ARCHITECTURE.md`, 작업 규칙은 `../AGENTS.md`와 `.agents/`를 참조한다.
