# 구현 workflow

`investigate` → plan → 최소 변경 → focused verification → broader verification → docs 갱신 → Git diff review 순서로 진행한다.

요청 범위 밖 refactor, UI 변경, API contract 변경을 하지 않는다. package 추가 전 필요성을 확인한다. Front/Back 동시 변경이면 각 repository의 상태와 검증을 분리해 추적한다.
