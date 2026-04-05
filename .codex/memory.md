# Project Memory

## Repository

- Project name: EventDrop
- Repository path: `/Users/3worksmedia/event-capture`
- Primary integration branch: `develop`
- Production branch: `main`
- Current pushed commit on `develop`: `4b6bb60`

## Product Direction

- EventDrop is a lightweight event media sharing app
- Guests join via QR code
- Guests upload photos and eventually videos to a shared album
- Guests can browse and download from the shared gallery
- Uploaded media should be automatically deleted after 48 hours

## Naming Rules

- Album folder format should use `DD-MM-YYYY`
- File names should remain date-based but also unique in practice
- Preferred file naming pattern: `DD-MM-YYYY-HH-mm-ss-random.ext`

## Technical Direction

- Keep the stack simple
- Current preferred MVP deployment: Vercel + Supabase
- Supabase is expected to handle database, storage, and scheduled cleanup
- Avoid overly complex infrastructure choices unless needed

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
- Every code change should be pushed to `develop` first
- `develop` is the preview or staging deployment branch
- After `develop` checks pass, changes should move to `main` through PR and code review
- Every `main` deployment should go directly to production
