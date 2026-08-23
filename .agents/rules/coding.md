# React / TypeScript / Vite 규칙

현재 stack은 React `19`, TypeScript `~5.8.2`, Vite `^6.2.0`, React Router DOM `^7.13.2`, Tailwind CSS `^4.1.14`이다.

- 기존 page/component/lib 패턴과 lazy route 구조를 우선한다.
- `tsconfig.json`의 strict/noUnused 설정을 존중하고 type/schema를 임의로 완화하지 않는다.
- local state가 현재 기본이다. Redux, Zustand, Context는 새 기능마다 자동 도입하지 않는다.
- effect의 subscription, timer, request 취소와 StrictMode의 재실행 영향을 검토한다.
- route 변경은 `src/App.tsx`, navigation과 page-level 인증 영향을 함께 검토한다.
- API는 `fetchWithAuth`와 `lib/api.ts`의 Zod parsing을 우선 사용한다.
- 오류 상태와 접근성(semantic element, label, keyboard/focus)을 기능 변경 범위에서 확인한다.
- UI 요구가 없는 대규모 디자인 변경은 하지 않는다.
