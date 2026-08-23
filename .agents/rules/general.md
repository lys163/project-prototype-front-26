# 일반 작업 규칙

- 조사와 Git 상태 확인을 구현보다 먼저 한다.
- 현재 source/config를 사실 기준으로 삼고 문서가 다르면 보고한다.
- 요청에 직접 관계없는 파일, UX, style, route, dependency를 변경하지 않는다.
- 기존 구조를 파악하지 않은 refactor를 하지 않는다.
- dependency 변경은 필요성·호환성·lockfile 영향을 확인한 뒤 승인 범위에서만 한다.
- generated output(`dist/`, coverage, cache)은 commit하지 않는다.
- 문서·운영·계약 변경 시 관련 `docs/`를 갱신한다.
- Frontend는 화면·browser client 책임, Spring은 API·인증·persistence 책임이라는 경계를 혼동하지 않는다.
- destructive Git command와 force push는 명시적 승인 없이는 금지한다.
