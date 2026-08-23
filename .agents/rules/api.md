# Frontend ↔ Spring API 규칙

로컬 기본 흐름은 `fetchWithAuth` → `/api/...` → Vite proxy → Spring `http://localhost:8080`이다. API 또는 OAuth 시작 요청을 바꾸기 전 `src/lib/auth.ts`, `src/lib/api.ts`, `vite.config.ts`와 필요한 Spring controller/security config를 확인한다.

- endpoint, HTTP method, request/response envelope를 추측해 만들지 않는다.
- Zod schema와 Spring DTO의 경계 계약을 함께 확인한다.
- token이 있으면 `Authorization: Bearer`를 붙이고 authenticated request의 `credentials: include`를 보존한다.
- 현재 401은 refresh 후 한 번 재시도한다. 403과 refresh 실패의 중앙 정책은 현재 없으므로 새 정책은 명시적으로 설계한다.
- public/authenticated API를 구분하고 Backend authorization을 client guard로 대체하지 않는다.
- error response와 compatibility 영향은 호출 화면까지 검토한다.
