# KanVibe Project Architecture

## Tech Stack
- Next.js 16 (App Router) + React 19 + TypeScript 5
- Tailwind CSS v4 (CSS Variables + @theme inline in globals.css)
- next-intl for i18n (ko, en, zh) with locale-based routing (/[locale]/...)
- TypeORM + PostgreSQL
- @hello-pangea/dnd for drag & drop

## Design System
- Tokens defined in `prd/design-system.json`
- CSS variables in `src/app/globals.css` (:root + @theme inline)
- Google brand colors (#4285F4, #EA4335, #FBBC05, #34A853) + black & white base
- Light theme only
- Naming: `--color-{category}-{name}` (brand, bg, text, border, status, tag)
- Tailwind classes: `bg-bg-page`, `text-text-primary`, `border-border-default`, `bg-status-todo`, `bg-tag-claude-bg`

## i18n Structure
- `src/i18n/routing.ts` — locale config (ko default)
- `src/i18n/request.ts` — server message loading
- `src/i18n/navigation.ts` — locale-aware Link, redirect, usePathname, useRouter
- `messages/{locale}.json` — translation files
- Client: `useTranslations("namespace")`, Server: `getTranslations("namespace")`
- Middleware: combined locale routing + auth check in `src/middleware.ts`

## Key Files
- Root layout: `src/app/layout.tsx` (thin wrapper, passes children through)
- Locale layout: `src/app/[locale]/layout.tsx` (NextIntlClientProvider, Inter font, globals.css)
- Pages: `src/app/[locale]/page.tsx`, `src/app/[locale]/login/page.tsx`, `src/app/[locale]/task/[id]/page.tsx`
- Components: `src/components/Board.tsx` (main), Column, TaskCard, CreateTaskModal, BranchTaskModal, ProjectSettings, TaskContextMenu, TaskStatusBadge, Terminal, TerminalLoader

## Conventions
- Korean comments (CODE_PRINCIPLES.md)
- UTF-8 heredoc for Korean content files (FILE_WRITE_PRINCIPLES.md)
- `@/*` path alias → `./src/*`
- "use client" directive for client components
