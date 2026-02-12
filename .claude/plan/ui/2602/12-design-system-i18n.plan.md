# Design System 적용 + 국제화(i18n) 구현

## Business Goal
KanVibe 칸반 보드 애플리케이션에 체계적인 디자인 시스템을 적용하여 일관된 UI를 제공하고, 한국어/영어/중국어 국제화를 통해 다국어 사용자를 지원한다. Google 브랜드 컬러 기반의 블랙&화이트 라이트 테마로 전환하여 깔끔하고 모던한 UI를 구현한다.

## Scope
- **In Scope**:
  - design-system.json을 Google 브랜드 컬러 + 블랙&화이트 기조로 업데이트
  - CSS 변수 기반 디자인 토큰 시스템 구축 (Tailwind v4 @theme 연동)
  - Dark → Light 테마 전환
  - 전체 컴포넌트 디자인 토큰 적용 (10개 컴포넌트 + 3개 페이지)
  - next-intl 기반 i18n 구현 (ko, en, zh)
  - CLAUDE.md에 Design System 및 i18n 가이드 참조 작성
- **Out of Scope**:
  - 새로운 UI 컴포넌트 추가 (기존 컴포넌트만 리스타일링)
  - 다크 모드 토글 (라이트 테마 단일)
  - RTL 지원
  - 번역 관리 시스템 (CMS)

## Codebase Analysis Summary
Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript 프로젝트. 현재 Dark 테마에 인라인 Tailwind 클래스 사용. 디자인 토큰 시스템 없음. i18n 미설정. 모든 UI 텍스트 한국어 하드코딩.

### Relevant Files
| File | Role | Action |
|------|------|--------|
| `prd/design-system.json` | 디자인 토큰 정의 | Modify (Google 컬러로 업데이트) |
| `src/app/globals.css` | 글로벌 CSS 변수 | Modify (디자인 토큰 CSS 변수 선언) |
| `src/app/layout.tsx` | Root 레이아웃 | Modify (Light 테마, next-intl Provider) |
| `src/components/Board.tsx` | 칸반 보드 메인 | Modify (토큰 적용 + 번역) |
| `src/components/Column.tsx` | 칸반 컬럼 | Modify (토큰 적용 + 번역) |
| `src/components/TaskCard.tsx` | 작업 카드 | Modify (토큰 적용) |
| `src/components/CreateTaskModal.tsx` | 작업 생성 모달 | Modify (토큰 적용 + 번역) |
| `src/components/BranchTaskModal.tsx` | 브랜치 분기 모달 | Modify (토큰 적용 + 번역) |
| `src/components/ProjectSettings.tsx` | 프로젝트 설정 | Modify (토큰 적용 + 번역) |
| `src/components/TaskContextMenu.tsx` | 컨텍스트 메뉴 | Modify (토큰 적용 + 번역) |
| `src/components/TaskStatusBadge.tsx` | 상태 뱃지 | Modify (토큰 적용 + 번역) |
| `src/app/login/page.tsx` | 로그인 페이지 | Modify (토큰 적용 + 번역) |
| `src/app/task/[id]/page.tsx` | 작업 상세 페이지 | Modify (토큰 적용 + 번역) |
| `src/app/page.tsx` | 홈 페이지 | Modify (next-intl 적용) |
| `next.config.ts` | Next.js 설정 | Modify (next-intl 플러그인) |
| `src/middleware.ts` | 미들웨어 | Modify (locale 라우팅) |
| `src/i18n/` | i18n 설정 디렉토리 | Create |
| `messages/ko.json` | 한국어 번역 파일 | Create |
| `messages/en.json` | 영어 번역 파일 | Create |
| `messages/zh.json` | 중국어 번역 파일 | Create |
| `CLAUDE.md` | 프로젝트 가이드 | Create |

### Conventions to Follow
| Convention | Source | Rule |
|-----------|--------|------|
| Tailwind v4 CSS 변수 | postcss.config.mjs | `@theme inline` 블록으로 커스텀 토큰 등록 |
| 컴포넌트 패턴 | 기존 코드 | `"use client"` + export default function 패턴 유지 |
| 경로 별칭 | tsconfig.json | `@/*` → `./src/*` 사용 |
| 한국어 주석 | CODE_PRINCIPLES.md | 주석은 한국어, JSDoc 스타일 |
| UTF-8 heredoc | FILE_WRITE_PRINCIPLES.md | 한글 포함 파일은 heredoc으로 작성 |

## Architecture Decisions
| Decision | Choice | Rationale | Alternatives |
|----------|--------|-----------|--------------|
| 디자인 토큰 방식 | CSS Variables + @theme inline | Tailwind v4 네이티브 방식, 런타임 변경 가능 | Tailwind config extend |
| i18n 라이브러리 | next-intl | Next.js App Router 공식 지원, 서버/클라이언트 컴포넌트 모두 지원 | 직접 구현 (Context) |
| i18n 라우팅 | /[locale]/... 경로 기반 | SEO 친화적, next-intl 표준 패턴 | Cookie 기반 (URL 변경 없음) |
| 브랜드 컬러 | Google 4색 (#4285F4, #EA4335, #FBBC05, #34A853) | 사용자 요청, 인지도 높은 컬러 시스템 | Violet (기존 design-system.json) |
| 기조 색상 | 블랙 & 화이트 | 사용자 요청, 클린/미니멀 디자인 | Gray 기반 |

## Implementation Todos

### Todo 1: design-system.json 업데이트
- **Priority**: 1
- **Dependencies**: none
- **Goal**: Google 브랜드 컬러 + 블랙&화이트 기조로 디자인 토큰 갱신
- **Work**:
  - `prd/design-system.json`의 `colors.primitive.violet` → Google Blue 계열로 교체
  - `colors.semantic.brand.primary` → Google Blue (#4285F4)
  - 상태 컬러: todo=gray, progress=yellow(#FBBC05), review=blue(#4285F4), done=green(#34A853)
  - 에러/경고: red=#EA4335, warning=#FBBC05
  - background.page → #FAFAFA, surface → #FFFFFF
  - text.primary → #202124 (Google dark gray), text.secondary → #5F6368
  - border 컬러를 연한 gray 톤으로 조정
- **Convention Notes**: JSON 구조 유지, 시맨틱 토큰 참조 방식 유지
- **Verification**: JSON 유효성 검사
- **Exit Criteria**: design-system.json이 Google 컬러 + B&W 기조로 완전히 업데이트됨
- **Status**: pending

### Todo 2: CSS 변수 기반 디자인 토큰 시스템 구축
- **Priority**: 1
- **Dependencies**: none (design-system.json과 병렬 가능 — 최종 값은 Todo 1 완료 후 조정)
- **Goal**: globals.css에 CSS 변수로 디자인 토큰 선언, Tailwind v4 @theme 연동
- **Work**:
  - `src/app/globals.css`에 `:root` 블록에 전체 디자인 토큰 CSS 변수 선언
    - `--color-brand-primary`, `--color-bg-page`, `--color-bg-surface`, `--color-text-primary` 등
    - `--radius-card`, `--radius-button`, `--radius-input` 등
    - `--shadow-card`, `--shadow-dropdown` 등
    - `--font-sans`, `--font-mono`
  - `@theme inline` 블록에 Tailwind 유틸리티 클래스 등록
    - `--color-brand-*`, `--color-bg-*`, `--color-text-*`, `--color-border-*`
    - `--color-status-*` (todo, progress, review, done)
  - 다크 모드 미디어쿼리 제거
  - body 기본 스타일을 Light 테마로 설정
- **Convention Notes**: Tailwind v4의 `@theme inline` 문법 사용, CSS 변수 네이밍은 `--color-{category}-{name}` 패턴
- **Verification**: `npm run build` 성공, CSS 변수가 올바르게 선언됨
- **Exit Criteria**: globals.css에 디자인 토큰이 CSS 변수로 선언되고 Tailwind에서 사용 가능
- **Status**: pending

### Todo 3: next-intl 설치 및 기본 설정
- **Priority**: 1
- **Dependencies**: none
- **Goal**: next-intl 라이브러리 설치 및 Next.js App Router 연동 설정
- **Work**:
  - `npm install next-intl` 실행
  - `src/i18n/config.ts` 생성 — locales, defaultLocale 정의
  - `src/i18n/request.ts` 생성 — getRequestConfig로 서버 컴포넌트용 메시지 로딩
  - `next.config.ts` 수정 — createNextIntlPlugin 래핑
  - `src/middleware.ts` 수정 — next-intl 미들웨어 통합 (기존 auth 미들웨어와 결합)
  - `src/app/[locale]/layout.tsx` 생성 — NextIntlClientProvider + 기존 layout 이전
  - `src/app/[locale]/page.tsx` 생성 — 기존 page.tsx를 locale 경로로 이동
  - `src/app/[locale]/login/page.tsx` 생성
  - `src/app/[locale]/task/[id]/page.tsx` 생성
- **Convention Notes**: `@/*` 경로 별칭 사용, App Router 패턴 유지
- **Verification**: `npm run build` 성공, /ko, /en, /zh 라우팅 동작
- **Exit Criteria**: next-intl이 설치되고 locale 기반 라우팅이 동작
- **Status**: pending

### Todo 4: 번역 파일 생성
- **Priority**: 2
- **Dependencies**: Todo 3
- **Goal**: 한국어/영어/중국어 번역 JSON 파일 작성
- **Work**:
  - `messages/ko.json` 생성 — 모든 UI 텍스트 한국어
  - `messages/en.json` 생성 — 영어 번역
  - `messages/zh.json` 생성 — 중국어 번역
  - 번역 키 구조: `{ "board": {...}, "task": {...}, "login": {...}, "settings": {...}, "common": {...} }`
  - 기존 하드코딩된 한국어 텍스트를 모두 추출하여 번역 키로 매핑
- **Convention Notes**: 번역 키는 dot notation으로 계층 구조, 네임스페이스별 분리
- **Verification**: JSON 유효성, 모든 하드코딩 텍스트가 번역 키로 매핑됨
- **Exit Criteria**: 3개 언어 번역 파일이 완성되고 모든 UI 텍스트를 커버
- **Status**: pending

### Todo 5: Root Layout 리팩토링 (Light 테마 + next-intl)
- **Priority**: 2
- **Dependencies**: Todo 2, Todo 3
- **Goal**: Root 레이아웃을 Light 테마 + 국제화 기반으로 전환
- **Work**:
  - `src/app/[locale]/layout.tsx`에 NextIntlClientProvider 적용
  - html lang 속성을 동적 locale로 변경
  - `className="dark"` 제거
  - body 클래스를 Light 테마 토큰으로 변경: `bg-bg-page text-text-primary`
  - Google Fonts의 Inter 폰트 추가 (Geist 대체)
- **Convention Notes**: 서버 컴포넌트에서 getMessages() 사용
- **Verification**: `npm run build` 성공, 페이지가 Light 테마로 렌더링
- **Exit Criteria**: Light 테마가 적용되고 locale이 동적으로 반영됨
- **Status**: pending

### Todo 6: 컴포넌트 디자인 토큰 적용 + 번역 적용
- **Priority**: 3
- **Dependencies**: Todo 2, Todo 4, Todo 5
- **Goal**: 전체 컴포넌트에 디자인 토큰 클래스 + useTranslations 적용
- **Work**:
  - **Board.tsx**: 
    - 헤더 배경/보더를 토큰으로 (`bg-bg-surface border-border-default`)
    - 버튼을 `bg-brand-primary hover:bg-brand-hover` 패턴으로
    - COLUMNS 배열의 label → `t('board.columns.todo')` 등 번역 키
    - `+ 새 작업`, `로그아웃` 등 텍스트 번역
  - **Column.tsx**: 
    - 상태 색상 dot를 `bg-status-todo`, `bg-status-progress` 등 토큰 사용
    - 컬럼 헤더 텍스트 스타일 토큰 적용
  - **TaskCard.tsx**: 
    - 카드 배경 `bg-bg-surface border-border-default hover:border-border-strong`
    - 드래그 중 `border-brand-primary`
    - 에이전트 뱃지 컬러를 시맨틱 토큰으로
  - **CreateTaskModal.tsx**: 
    - 모달 배경 `bg-bg-surface`, 인풋 `bg-bg-page border-border-default`
    - focus 링: `focus:border-brand-primary`
    - 모든 한국어 텍스트 → 번역 키
  - **BranchTaskModal.tsx**: 같은 패턴으로 토큰 + 번역 적용
  - **ProjectSettings.tsx**: 같은 패턴으로 토큰 + 번역 적용
  - **TaskContextMenu.tsx**: 메뉴 배경/보더 토큰, 텍스트 번역
  - **TaskStatusBadge.tsx**: 상태별 색상을 `bg-status-{status}` 토큰으로
  - **login/page.tsx**: 로그인 폼 토큰 + 번역 적용
  - **task/[id]/page.tsx**: 상세 페이지 토큰 + 번역 적용
- **Convention Notes**: `useTranslations('namespace')` 사용, 서버 컴포넌트는 `getTranslations()`
- **Verification**: `npm run build` 성공, 모든 컴포넌트가 새 디자인으로 렌더링
- **Exit Criteria**: 모든 컴포넌트가 디자인 토큰 + 번역을 사용하며 하드코딩 텍스트 없음
- **Status**: pending

### Todo 7: CLAUDE.md 작성
- **Priority**: 2
- **Dependencies**: Todo 1
- **Goal**: CLAUDE.md에 Design System 및 i18n 가이드 참조를 간결하게 작성
- **Work**:
  - 프로젝트 루트에 `CLAUDE.md` 생성
  - Design System 섹션: `prd/design-system.json` 참조, CSS 변수 네이밍 규칙, Tailwind 토큰 사용법 간략 안내
  - i18n 섹션: next-intl 사용, 번역 파일 위치(`messages/{locale}.json`), 번역 키 추가 방법 간략 안내
  - 상세 설명 대신 핵심 규칙과 파일 위치만 기술 (참조 가이드)
- **Convention Notes**: 한국어 작성, 간결하고 참조 위주
- **Verification**: 파일 존재 및 내용 검토
- **Exit Criteria**: CLAUDE.md에 Design System, i18n 가이드가 참조 형태로 작성됨
- **Status**: pending

## Verification Strategy
- `npm run build` — 전체 빌드 성공 확인
- 각 locale 경로 (/ko, /en, /zh) 접근 가능 확인
- 하드코딩된 한국어 텍스트가 남아있지 않은지 grep 검사
- CSS 변수가 올바르게 적용되어 Light 테마로 렌더링되는지 확인

## Progress Tracking
- Total Todos: 7
- Completed: 0
- Status: Planning complete

## Change Log
- 2026-02-12: Plan created
