# 프로젝트 현황

## 목적과 역할

[CONFIRMED] 이 repository는 AI 그림책 서비스의 React Frontend다. browser UI, client routing, Spring REST API 호출, OAuth callback 처리, presigned upload를 담당한다. Spring Backend는 `C:\workspc\codex\spring-server`에 있다.

## 기술과 로컬 개발

[CONFIRMED] React 19, TypeScript 5.8, Vite 6, React Router DOM 7, Tailwind CSS 4, Zod를 사용한다. package manager는 pnpm이며 선언 버전은 `10.12.1`이다.

- Frontend: `http://localhost:3000`
- Spring Backend: `http://localhost:8080`
- API: `VITE_API_URL`이 비어 있으면 상대 경로, 개발 시 Vite proxy가 `VITE_PROXY_TARGET` 또는 `http://localhost:8080`으로 전달

`VITE_*` 값은 browser bundle에 노출될 수 있으므로 secret 저장소가 아니다.

## 현재 기능

[CONFIRMED] 로그인/OAuth callback, 프로필, 도서 탐색·상세·리뷰·좋아요·신고, 작가/독자 대시보드, 독서 진행/목표, ranking/category/banner, presigned upload UI가 있다.

## AI 그림책 생성

[CONFIRMED] `WizardPage`에 title/style/page-count/prompt 입력과 SpeechRecognition이 있다. 실제 AI 생성 API, polling, persisted result, retry, 결과 저장 호출은 찾지 못했다. step 2/3은 demo UI다.

[CONFIRMED] `@google/genai` dependency는 `package.json`에 남아 있지만 Frontend source import/consumer는 없고 `.env.example`에도 Gemini/provider key가 없습니다. Gemini는 현재 browser runtime requirement가 아닙니다.

## 배포·테스트

[CONFIRMED] CI, deployment configuration, automated test framework/source는 repository에 없다. 현재 검증 명령은 `pnpm lint`, `pnpm build`다. Production API/DNS는 `[UNKNOWN]`이다.
