# 몽글 (Mongle) - 프로젝트 구조 가이드

> AI 그림책 만들기 플랫폼 프론트엔드

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript 5.8 |
| 빌드 도구 | Vite 6.2 |
| 스타일링 | Tailwind CSS 4.1 |
| 라우팅 | React Router DOM 7.13 |
| 애니메이션 | Motion 12 (Framer Motion fork) |
| 아이콘 | Lucide React |
| AI | Google Generative AI (@google/genai) |
| 배포 | GitHub Actions → 홈서버 (Nginx) |

---

## 디렉토리 구조

```
bookai/
├── src/
│   ├── pages/              # 페이지 컴포넌트 (17개)
│   ├── components/         # 공통 컴포넌트 (3개)
│   ├── lib/                # API 호출, 인증, 유틸리티
│   ├── App.tsx             # 라우터 정의
│   ├── main.tsx            # React 진입점
│   ├── types.ts            # 타입 정의
│   ├── constants.ts        # 상수 (카테고리, 스타일, 템플릿)
│   └── index.css           # 글로벌 스타일 + Tailwind 테마
│
├── public/                 # 정적 파일 (robots.txt, sitemap.xml)
├── .github/workflows/      # CI/CD 파이프라인
├── .env                    # 환경변수
├── index.html              # HTML 엔트리 + SEO 메타태그
├── vite.config.ts          # Vite 설정
├── tsconfig.json           # TypeScript 설정
└── package.json            # 의존성 & 스크립트
```

---

## 페이지 구성 (`src/pages/`)

### 메인 플로우

| 경로 | 파일 | 설명 |
|------|------|------|
| `/` | `LandingPage.tsx` | 랜딩 페이지 (히어로, 기능 소개, 책 캐러셀) |
| `/start` | `StartPage.tsx` | 역할 선택 (작가/독자) |
| `/explore`, `/search` | `GalleryPage.tsx` | 책 갤러리 (무한스크롤, 검색, 정렬) |
| `/book/:id` | `BookDetailPage.tsx` | 책 상세 (리뷰, 캐릭터, 페이지 목록) |
| `/read/:id` | `ReadingPage.tsx` | 읽기 인터페이스 (페이지별 탐색) |
| `/about` | `AboutPage.tsx` | 소개 페이지 |

### 책 만들기

| 경로 | 파일 | 설명 |
|------|------|------|
| `/create` | `WizardPage.tsx` | AI 스토리 생성 마법사 (4단계) |

**마법사 단계:**
1. 템플릿 선택 또는 직접 입력 (음성입력 지원)
2. 일러스트 스타일 선택 (수채화/유화/스케치/3D/애니메)
3. 페이지 수 설정
4. 제목 입력

### 인증

| 경로 | 파일 | 설명 |
|------|------|------|
| `/login` | `LoginPage.tsx` | 소셜 로그인 (카카오, 네이버) |
| `/oauth/callback` | `OAuthCallbackPage.tsx` | OAuth 리다이렉트 처리 + 신규 유저 컨페티 |
| `/signup` | `SignUpPage.tsx` | 회원가입 폼 |

### 사용자 관련

| 경로 | 파일 | 설명 |
|------|------|------|
| `/profile` | `ProfilePage.tsx` | 프로필 조회 |
| `/profile/edit` | `ProfileEditPage.tsx` | 프로필 수정 + 이미지 업로드 |
| `/library` | `LibraryPage.tsx` | 내 서재 |
| `/dashboard/author` | `AuthorDashboardPage.tsx` | 작가 대시보드 (수익, 조회수, 평점) |
| `/dashboard/reader` | `ReaderDashboardPage.tsx` | 독자 대시보드 (읽기 진행률, 목표) |
| `/dashboard/reader/liked` | `ReaderLikedBooksPage.tsx` | 좋아요한 책 목록 |

---

## 공통 컴포넌트 (`src/components/`)

| 파일 | 설명 |
|------|------|
| `Navbar.tsx` | 반응형 네비게이션 (인증 상태 반영, 읽기 모드 시 숨김) |
| `Footer.tsx` | 푸터 (데스크톱 전용) |
| `ScrollToTop.tsx` | 라우트 변경 시 자동 스크롤 |

---

## 라이브러리 모듈 (`src/lib/`)

### `auth.ts` — 인증 & 토큰 관리

```
getAccessToken()          # localStorage에서 토큰 조회
setAccessToken(token)     # 토큰 저장
removeAccessToken()       # 로그아웃
isLoggedIn()              # 로그인 여부 확인
refreshAccessToken()      # 토큰 갱신 (HttpOnly 쿠키 사용)
fetchUserMe(force?)       # 유저 정보 조회 (5분 캐시)
updateUserProfile(req)    # 프로필 수정 (PATCH)
redirectToKakaoLogin()    # 카카오 OAuth 리다이렉트
redirectToNaverLogin()    # 네이버 OAuth 리다이렉트
```

**토큰 플로우:**
- 로그인 → OAuth 콜백 → accessToken을 localStorage에 저장
- API 요청 시 `Authorization: Bearer {token}` 헤더
- 401 응답 시 자동으로 `/api/auth/refresh` 호출 후 재시도

### `api.ts` — 책 API

```
fetchBooks(page, size)    # 책 목록 조회 (페이지네이션)
fetchBookDetail(bookId)   # 책 상세 조회
```

### `storage.ts` — 파일 업로드 (MinIO)

```
requestPresignedUploadUrl(filename, contentType)  # 프리사인드 URL 발급
uploadFileToPresignedUrl(url, file)               # MinIO에 직접 업로드
uploadUserFile(file)                              # 위 두 단계를 합친 함수
```

**업로드 플로우:**
1. 백엔드에 프리사인드 URL 요청 (`POST /api/storage/presigned-upload`)
2. 받은 URL로 MinIO에 직접 PUT 업로드
3. `publicUrl`을 프론트에서 저장/표시

### `demoData.ts` — 데모 데이터

- `demoBooks`: 샘플 책 12권
- `demoPaidBooks` / `demoFreeBooks` / `demoPopularBooks`: 필터된 서브셋

### `utils.ts` — 유틸리티

- `cn()`: clsx + tailwind-merge 조합 (클래스명 병합)

---

## 백엔드 API 엔드포인트

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/api/books?page=X&size=Y` | 책 목록 (페이지네이션) | X |
| GET | `/api/books/{bookId}` | 책 상세 | X |
| POST | `/oauth2/authorization/kakao` | 카카오 로그인 | X |
| POST | `/oauth2/authorization/naver` | 네이버 로그인 | X |
| POST | `/api/auth/logout` | 로그아웃 | O |
| POST | `/api/auth/refresh` | 토큰 갱신 | X (쿠키) |
| GET | `/api/user/me` | 내 정보 조회 | O |
| PATCH | `/api/user/profile` | 프로필 수정 | O |
| POST | `/api/storage/presigned-upload` | 업로드 URL 발급 | O |

**응답 형식:**
```typescript
{ success: boolean; data?: T }
```

---

## 핵심 타입 (`src/types.ts`)

```typescript
// 갤러리 목록용
interface BookItem {
  bookId: string;
  title: string;
  coverImageUrl: string;
  authorName: string;
}

// 상세 페이지용
interface BookDetail {
  bookId: string;
  title: string;
  description: string;
  authorName: string;
  coverImageUrl: string;
  pages: BookDetailPage[];
  characters: BookDetailCharacter[];
}

// 유저 정보
interface UserInfo {
  userId: string;
  email: string;
  nickname: string;
  profileImage: string;
  isNewUser: boolean;
}

// 스토리 생성
type IllustrationStyle = 'watercolor' | 'oil' | 'sketch' | '3d' | 'anime';
```

---

## 디자인 시스템 (`src/index.css`)

### 컬러 팔레트

| 용도 | 색상 | 코드 |
|------|------|------|
| Primary | 인디고 블루 | `#3f57bb` |
| Secondary | 틸 | `#3b675d` |
| Tertiary | 다크 틸 | `#006c57` |
| Background | 연보라 | `#fbf8ff` |
| Text | 다크 블루그레이 | `#273057` |
| Error | 레드 | `#ac3149` |

### 폰트

| 용도 | 폰트 |
|------|------|
| 디스플레이 | Playfair Display (serif) |
| 헤드라인 | Plus Jakarta Sans (sans-serif) |
| 본문/레이블 | Manrope (sans-serif) |
| 모노 | Space Grotesk (monospace) |

### 커스텀 클래스

- `.glass` — 프로스트 글래스 효과 (backdrop-blur)
- `.glass-card` — 글래스 카드 (rgba 배경)
- `.magical-gradient` — 방사형 그라디언트
- `.book-shadow` — 3D 그림자 효과

---

## 배포 (CI/CD)

**파이프라인:** `.github/workflows/deploy.yml`

```
main 브랜치 push → GitHub Actions → SSH로 홈서버 접속 →
  git pull → pnpm install → pnpm build → nginx reload
```

**서버 경로:** `/home/jang/bookai`
**도메인:** `mongle.cloud` (이미지: `img.mongle.cloud`)

---

## 개발 명령어

```bash
pnpm dev          # 개발 서버 (http://localhost:3000)
pnpm build        # 프로덕션 빌드 → dist/
pnpm preview      # 빌드 결과 미리보기
pnpm lint         # TypeScript 타입 체크
pnpm clean        # dist/ 제거
```

---

## 외부 연동

| 서비스 | 용도 |
|--------|------|
| 카카오 OAuth | 소셜 로그인 |
| 네이버 OAuth | 소셜 로그인 |
| MinIO (S3 호환) | 이미지 저장 (프리사인드 URL 업로드) |
| Google Generative AI | AI 스토리/일러스트 생성 |
| Nginx | 리버스 프록시 |
| Spring Boot (백엔드) | REST API 서버 |

---

## 주요 기능 요약

1. **책 갤러리** — 무한스크롤, 검색, 정렬
2. **소셜 로그인** — 카카오 & 네이버 OAuth2
3. **AI 그림책 생성** — 4단계 마법사 (음성입력 지원)
4. **읽기 인터페이스** — 페이지별 탐색
5. **프로필 관리** — 이미지 업로드 (MinIO 프리사인드 URL)
6. **작가 대시보드** — 수익, 조회수, 평점 통계
7. **독자 대시보드** — 읽기 진행률, 목표 설정
8. **반응형 디자인** — 모바일 퍼스트 + 데스크톱 최적화
