# KanVibe

AI 에이전트 작업 관리 Kanban 보드.

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS v4 (CSS Variables + @theme inline)
- next-intl (i18n)
- TypeORM + PostgreSQL
- @hello-pangea/dnd (drag & drop)

## Design System

디자인 토큰은 `prd/design-system.json`에 정의되고 `src/app/globals.css`에 CSS 변수로 선언된다.

### 토큰 사용법

Tailwind 클래스에서 CSS 변수 토큰을 직접 사용한다:

- 배경: `bg-bg-page`, `bg-bg-surface`, `bg-brand-primary`
- 텍스트: `text-text-primary`, `text-text-secondary`, `text-text-muted`
- 보더: `border-border-default`, `border-border-strong`
- 상태: `bg-status-todo`, `bg-status-progress`, `bg-status-review`, `bg-status-done`
- 태그: `bg-tag-claude-bg text-tag-claude-text`, `bg-tag-branch-bg text-tag-branch-text`
- 그림자: `shadow-sm`, `shadow-md`, `shadow-lg`

### 색상 기조

Google 브랜드 컬러 (#4285F4, #EA4335, #FBBC05, #34A853) 기반 + 블랙&화이트 라이트 테마.

### 새 토큰 추가 시

1. `prd/design-system.json`에 토큰 정의
2. `src/app/globals.css`의 `:root`에 CSS 변수 추가
3. `@theme inline` 블록에 Tailwind 등록

## 국제화 (i18n)

next-intl 기반. 지원 언어: 한국어(ko), 영어(en), 중국어(zh). 기본 언어: ko.

### 파일 구조

- `messages/{locale}.json` — 번역 파일
- `src/i18n/routing.ts` — locale 목록, 기본 locale 정의
- `src/i18n/request.ts` — 서버 요청별 locale/메시지 로딩
- `src/i18n/navigation.ts` — locale-aware Link, redirect, usePathname, useRouter

### 번역 사용법

- 클라이언트 컴포넌트: `const t = useTranslations("namespace")`
- 서버 컴포넌트: `const t = await getTranslations("namespace")`
- 네비게이션: `import { Link } from "@/i18n/navigation"` (next/link 대신)

### 번역 키 추가 시

1. `messages/ko.json`에 한국어 키/값 추가
2. `messages/en.json`, `messages/zh.json`에 동일 키로 번역 추가
3. 컴포넌트에서 `t("key")` 또는 `t("namespace.key")`로 사용
