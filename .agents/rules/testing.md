# 검증 규칙

현재 automated test framework와 test source는 없다. 현재 가능한 repository 명령은 `pnpm lint`(TypeScript typecheck)와 `pnpm build`다.

- 새 기능/bug fix에는 영향을 비례한 automated test 또는 명시적 미검증 사유가 필요하다.
- auth/API 변경은 OAuth callback, `refreshAccessToken`, `fetchWithAuth` retry, Zod parsing을 우선 검증 후보로 삼는다.
- UI 변경은 필요한 component behavior test와 manual smoke test를 고려한다.
- Backend가 불필요한 unit/component test에는 mock을 사용하고 test 때문에 production behavior를 바꾸지 않는다.
- Vitest/React Testing Library는 향후 후보일 뿐 현재 설치되어 있다고 가정하지 않는다.
