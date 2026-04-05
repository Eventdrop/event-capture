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
```

## Create Local Env File

Kok dizinde `.env.local` olustur:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CRON_SECRET=replace-with-a-long-random-secret
```

## Run Development Server

```bash
npm run dev
```

Uygulama varsayilan olarak:

`http://localhost:3000`

## Current Routes

- `/`
- `/admin`
- `/event/[id]`
- `/event/[id]/gallery`

## Supabase Requirements

Supabase tarafinda en az su iki yapi gerekir:

- `events` tablosu
- `uploads` tablosu

Ayrica medya dosyalari icin bir storage bucket gerekir:

- `event-uploads`

Admin girisi icin Supabase Auth aktif olmali ve en az bir admin kullanicisi tanimli olmalidir.

Detayli alanlar icin [DB_SCHEMA.md](/Users/3worksmedia/event-capture/docs/DB_SCHEMA.md) dosyasina bak.

## Recommended Local Test Flow

1. Supabase ortam degiskenlerini ayarla
2. En az bir `events` kaydi ekle
3. Bu kaydin `id` degeriyle `/event/[id]` sayfasina git
4. Birkac fotograf yukle
5. `/event/[id]/gallery` sayfasinda sonuc kontrol et

## Known Gaps In Current Code

- Video yukleme akisi henuz netlestirilmemis
- Dosya isimleri henuz tarih tabanli standarda gore uretilmiyor
- 48 saatlik otomatik silme mekanizmasi henuz kodlanmamis
- Host tarafi yonetim paneli henuz yok
