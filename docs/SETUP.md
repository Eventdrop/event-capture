# Setup Guide

## Goal

Bu belge, projeyi local ortamda calistirmak ve temel baglantilari hazirlamak icin gereken minimum adimlari tanimlar.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase

## Requirements

- Node.js 20 veya guncel LTS
- npm
- Supabase projesi

## Install

```bash
npm install
```

## Environment Variables

Asagidaki degiskenler gerekir:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

## Create Local Env File

Kok dizinde `.env.local` olustur:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=replace-with-a-long-random-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace-with-a-strong-password
ADMIN_SESSION_SECRET=replace-with-a-long-random-secret
```

## Run Development Server

```bash
npm run dev
```

Uygulama varsayilan olarak:

`http://localhost:3000`

## Current Routes

- `/`
- `/join/[id]`
- `/control-room-7x`
- `/event/[id]`
- `/event/[id]/gallery`

## Supabase Requirements

Supabase tarafinda en az su iki yapi gerekir:

- `events` tablosu
- `uploads` tablosu

Ayrica medya dosyalari icin bir storage bucket gerekir:

- `event-uploads`

Admin girisi artik uygulama ici gizli bir panel olarak calisir ve `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` degiskenleri ile korunur. Varsayilan gizli rota bu repoda `/control-room-7x` olarak tutulur.

Detayli alanlar icin [DB_SCHEMA.md](/Users/3worksmedia/event-capture/docs/DB_SCHEMA.md) dosyasina bak.

## Recommended Local Test Flow

1. Supabase ortam degiskenlerini ayarla
2. Gizli admin panelinden yeni bir etkinlik olustur
3. Uretilen `event code` bilgisini not al
4. `/join/[slug]` veya `/` uzerinden e-posta ve `event code` ile giris yap
5. `/event/[id]` sayfasinda medya yukle
6. `/event/[id]/gallery` sayfasinda sonuc kontrol et

## Notes

- Public kullanici dogrudan etkinlik sayfalarini listeleyemez; giris `event code` ile yapilir.
- Admin panel her etkinlik icin otomatik bir `event code` uretir.
- Eski veritabanlarinda `access_code` kolonu yoksa uygulama gecici olarak etkinlik `id` bilgisinden turetilen legacy bir kod kullanabilir.
