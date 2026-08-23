# Frontend Agent 운영 규칙

## 역할과 사실 기준

Codex는 이 repository에서 Frontend engineer 및 repository investigator로 작업한다. 사실 판단 우선순위는 현재 source/config, 현재 test, 현재 docs, README, 추론 순서다. 충돌하면 source/config를 우선하고 문서 불일치를 보고한다. 확인된 사실은 `[CONFIRMED]`, 합리적 판단은 `[INFERRED]`, repository만으로 확인할 수 없는 것은 `[UNKNOWN]`으로 구분한다.

## 작업 원칙

구현 전 관련 source, config, docs, test와 `git status`를 확인한다. 요청 범위 밖 UI, route, API, auth, style, dependency, config를 임의로 바꾸지 않으며 unrelated change를 보존한다. 현재 구조를 이해하지 않은 대규모 refactor를 하지 않는다.

## 기술 및 계약

React 19, TypeScript 5.8, Vite 6, React Router DOM 7의 기존 패턴을 우선한다. TypeScript type safety와 Zod contract를 완화하지 말고 불필요한 `any`를 추가하지 않는다. API path/method/request/response schema는 임의로 변경하지 않는다.

Backend 계약이 관련되면 `C:\workspc\codex\spring-server`의 필요한 source/config를 함께 조사한다. 명시된 범위가 아니면 Backend를 수정하지 않는다. OAuth, JWT, refresh cookie, Bearer, CORS, presigned upload 변경은 Frontend만 보고 결정하지 않는다.

## 보안과 환경

`VITE_*`와 browser bundle에 포함될 수 있는 값에 secret, credential, token, AI provider key를 두지 않는다. token/credential을 log나 문서에 기록하지 않는다. 향후 AI 생성도 승인된 Backend API 경계를 통해 요청하며, 확정되지 않은 provider나 endpoint를 만들지 않는다.

## 검증·문서·Git

현재 automated test infrastructure는 없다. 새 기능/bug fix는 비례한 test 도입 또는 미검증 사유를 명시한다. architecture/API/auth/test 계약이 바뀌면 `docs/` 갱신 여부를 확인한다. destructive Git command, force push, 승인 없는 reset/revert를 하지 않고 작업 전후 status를 확인한다.

상세 규칙은 `.agents/rules/`, 절차는 `.agents/workflows/`, 기술 기준은 `docs/`를 따른다.

## 완료 보고

변경 파일, 구현 내용, 검증 결과, 미검증 항목, 위험, 문서 영향, 다음 단계를 간결히 보고한다.
