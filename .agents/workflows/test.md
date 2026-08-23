# 검증 workflow

현재는 test framework가 없으므로 `pnpm lint`, `pnpm build`, 필요한 manual smoke test를 사용한다. 자동화 도입 후에는 focused test → 전체 test → lint → build → smoke test 순서로 확장한다.

OAuth/auth 변경의 검증 후보는 기존/신규 사용자, refresh 성공·실패, Bearer header, callback, logout이다. 존재하지 않는 test 명령을 현재 명령처럼 보고하지 않는다.
