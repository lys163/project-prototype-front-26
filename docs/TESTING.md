# Testing and Verification

## 현재 상태

[CONFIRMED] automated test framework, test source, test script, coverage config는 없다. 현재 package script는 `pnpm lint`(`tsc --noEmit`)와 `pnpm build`(`vite build`)를 제공한다.

## 현재 변경 검증

변경 범위에 따라 `pnpm lint`, `pnpm build`, 필요한 manual smoke test, Git diff 검토를 사용한다. 실행하지 못한 명령은 verified로 표현하지 않고 이유를 기록한다.

## 도입 후보

[INFERRED] 최소 안전망은 `auth.ts`의 token/refresh/retry, `OAuthCallbackPage`, `fetchWithAuth`, API envelope/Zod parsing, Vite proxy/environment contract부터 시작하는 것이 적절하다. Vitest와 React Testing Library는 후보이며 현재 설치된 도구가 아니다.

auth/API 변경은 focused test를 요구하고, UI 변경은 component behavior와 accessibility 확인을 고려한다. mock 가능한 unit/component test 때문에 production behavior를 바꾸지 않는다.
