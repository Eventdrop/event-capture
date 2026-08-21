# Project Memory

## Repository

- Project name: EventDrop
- Repository path: `/Users/3worksmedia/event-capture`
- Source of truth branch: `main`
- Production branch: `main`
- Stabilization and feature work should branch from current `main`
- `develop` is no longer the primary integration branch

## Product Direction

- EventDrop is a lightweight event media sharing app
- Guests join via QR code
- Guests upload photos and eventually videos to a shared album
- Guests can browse and download from the shared gallery
- Events do not expire automatically
- Uploaded media is not deleted automatically
- Event and photo deletion is manual from the hidden admin panel

## Naming Rules

- Album folder format should use `DD-MM-YYYY`
- File names should remain date-based but also unique in practice
- Preferred file naming pattern: `DD-MM-YYYY-HH-mm-ss-random.ext`

## Technical Direction

- Keep the stack simple
- Current preferred MVP deployment: Vercel + Supabase
- Supabase handles database and storage
- Automatic cleanup, cron-based deletion, and 48-hour deletion are not part of the current product rules
- Supabase MCP server is configured in Codex config and should be preferred for Supabase-related operations when credentials are set
- Avoid overly complex infrastructure choices unless needed
- Public homepage should surface the latest created album as the main upload entry point
- Admin should stay hidden from the public homepage and be protected by username and password
- The current hidden admin route is `/control-room-7x`

## Documentation State

- Old root markdown files were cleaned up
- New docs created:
  - `README.md`
  - `docs/PRODUCT.md`
  - `docs/SETUP.md`
  - `docs/ARCHITECTURE.md`
  - `docs/DB_SCHEMA.md`
  - `docs/DEPLOYMENT.md`
  - `docs/OPERATIONS.md`

## Collaboration Preferences

- User prefers direct execution without repeated confirmation during a task
- User wants work pushed cleanly to git for review
- User wants stepwise progress, but does not want to be blocked by unnecessary questions
- New work should branch from `main`
- Preview/stabilization work should happen on dedicated branches from `main`
- Changes should move back to `main` through PR and code review
- Every `main` deployment should go directly to production
- Supabase-related actions should use the MCP server when available instead of ad hoc manual workflows
