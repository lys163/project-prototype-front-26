# 조사 workflow

1. 요청 범위와 변경 권한을 정한다.
2. `git status`로 기존 변경을 보존한다.
3. 관련 docs, source, config, test를 읽는다.
4. API/auth/storage/environment 의존성이 있으면 필요한 Spring 부분만 확인한다.
5. `[CONFIRMED]`, `[INFERRED]`, `[UNKNOWN]`을 구분한다.
6. 예상 변경 파일, 위험, 사람의 결정 사항, 구현 가능 여부를 정리한다.

Cross-repository 작업에서도 Backend 전체 audit을 반복하지 않고 관련 contract만 조사한다.
