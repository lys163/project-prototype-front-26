# Frontend 보안 규칙

현재 구조는 access token을 `localStorage`에 보관하고 OAuth callback query에서 수신한다. refresh token은 Spring이 설정하는 HttpOnly cookie이며 authenticated request는 Bearer와 `credentials: include`를 사용한다. 이는 현재 사실이며 권장 구조의 승인 상태를 뜻하지 않는다.

- secret, credential, refresh/access token, AI provider key를 Frontend source·`VITE_*`·문서·log에 기록하지 않는다.
- callback URL token, browser history, localStorage XSS 위험을 auth 변경 시 검토한다.
- HttpOnly cookie 값을 JavaScript로 읽거나 관리하려 하지 않는다.
- OAuth/CORS/cookie/redirect 변경은 Spring 설정·provider 영향까지 교차 검증한다.
- `dangerouslySetInnerHTML`, 외부 URL, presigned URL 사용은 security review 대상으로 다룬다.
- presigned URL은 필요한 요청에만 사용하고 credential으로 취급되는 query를 log하지 않는다.
- OAuth 개선안은 승인·구현 전까지 후보로만 기록한다.
