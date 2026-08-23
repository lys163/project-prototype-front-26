# Mongle Frontend

AI 그림책 서비스의 React Frontend repository입니다.

## 로컬 시작

- Frontend: `http://localhost:3000`
- Spring Backend: `http://localhost:8080`
- package manager: `pnpm` (`package.json`의 선언 버전: `10.12.1`)

기본 개발 API 요청은 상대 경로를 사용하며 Vite proxy가 Spring Backend로 전달합니다. 환경 변수 예시는 `.env.example`을 참고하십시오. `VITE_*` 값은 browser bundle에 노출될 수 있으므로 secret을 넣지 마십시오.

```bash
pnpm dev
pnpm lint
pnpm build
```

상세 기술 문서는 [docs](docs/PROJECT.md)에, Codex 작업 규칙은 [AGENTS.md](AGENTS.md)에 있습니다.

현재 automated test, CI, 배포 configuration은 repository에서 확인되지 않았습니다. AI 생성 화면은 존재하지만 실제 생성 API workflow는 아직 확인되지 않았습니다.
