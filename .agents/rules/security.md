# Frontend 보안 규칙

현재 구조는 OAuth callback에서 refresh API를 호출해 발급받은 access token을 `localStorage`에 보관한다. callback query에는 `isNewUser`만 있고 access token은 없다. refresh token은 Spring이 설정하는 HttpOnly cookie이며 authenticated request는 Bearer와 `credentials: include`를 사용한다. 이는 현재 사실이며 장기 저장 정책의 승인 상태를 뜻하지 않는다.

- secret, credential, refresh/access token, AI provider key를 Frontend source·`VITE_*`·문서·log에 기록하지 않는다.
- callback URL parameter, browser history, localStorage XSS 위험을 auth 변경 시 검토한다.
- HttpOnly cookie 값을 JavaScript로 읽거나 관리하려 하지 않는다.
- OAuth/CORS/cookie/redirect 변경은 Spring 설정·provider 영향까지 교차 검증한다.
- `dangerouslySetInnerHTML`, 외부 URL, presigned URL 사용은 security review 대상으로 다룬다.
- presigned URL은 필요한 요청에만 사용하고 credential으로 취급되는 query를 log하지 않는다.
- Refresh Token Rotation, replay detection, multi-device/session, JSESSIONID lifecycle, CSRF 및 refresh/logout Origin/Referer 정책은 구현된 것으로 가정하지 않고 별도 backlog로 관리한다.
