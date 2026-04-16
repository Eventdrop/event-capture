# Database And Storage Schema

## Goal

Bu belge, MVP icin gerekli minimum Supabase tablo ve storage taslagini tanimlar.

## Tables

### events

Etkinlik veya ortak album kayitlarini tutar.

Onerilen alanlar:

- `id` uuid primary key
- `name` text not null
- `event_date` date null
- `slug` text null
- `access_code` text null unique
- `allow_guest_share` boolean not null default true
- `allow_guest_download` boolean not null default true
- `allow_guest_delete` boolean not null default false
- `created_at` timestamptz not null default now()
- `expires_at` timestamptz null

Not:

- `expires_at`, etkinlik tarihi varsa o tarihi takip eden gece 00:00'dan 48 saat sonrasina set edilebilir.
- Mevcut kod sadece `id` ve `name` alanlarini fiilen kullaniyor.

### uploads

Yuklenen medya kayitlarini tutar.

Onerilen alanlar:

- `id` uuid primary key default gen_random_uuid()
- `event_id` uuid not null references events(id) on delete cascade
- `file_url` text not null
- `storage_path` text not null
- `file_name` text not null
- `share_code` text null unique
- `media_type` text not null
- `mime_type` text null
- `created_at` timestamptz not null default now()
- `expires_at` timestamptz not null

Not:

- Mevcut kod `type` adli bir alan kullaniyor. Daha acik oldugu icin `media_type` tercih edilmesi onerilir.
- `storage_path` alaninin bulunmasi, dosya silme islemini `file_url` parse etmeye gerek kalmadan yapmayi kolaylastirir.
- `share_code`, `/media/...` paylasim linklerinin kalici ve kisa kalmasi icin kullanilir.

### admin_credentials

Gizli admin paneli icin kalici giris bilgilerini tutar.

Onerilen alanlar:

- `id` text primary key
- `username` text not null
- `password_hash` text not null
- `updated_at` timestamptz not null default now()

Not:

- Tek satirlik bir tablo olarak dusunulur.
- Uygulama `id = 'primary'` kaydini kullanir.
- Tablo yoksa sistem env degiskenlerindeki `ADMIN_USERNAME` ve `ADMIN_PASSWORD` ile calismaya devam eder.
- Kalici sifre degisikligi icin bu tablonun olusturulmus olmasi gerekir.

### guest_access_logs

Misafirlerin hangi e-posta ile hangi etkinlige girdigini kaydeder.

Onerilen alanlar:

- `id` uuid primary key default gen_random_uuid()
- `event_id` uuid not null references events(id) on delete cascade
- `event_slug` text null
- `email` text not null
- `source` text null
- `created_at` timestamptz not null default now()

Not:

- Bu tablo, misafirlerin girdigi e-posta adreslerini daha sonra admin panelden gormek icin kullanilir.
- `source` alani girisin `manual`, `direct`, `qr` gibi hangi akistan geldigini not etmek icin kullanilabilir.
- Tablo yoksa uygulama erisimi kirmadan calismaya devam eder, ancak mail kaydi tutulmaz.

## Storage

### Bucket

Onerilen bucket:

- `event-uploads`

### Path Strategy

Album klasoru:

`DD-MM-YYYY`

Dosya adi:

`DD-MM-YYYY-HH-mm-ss-random.ext`

Tam path ornegi:

`05-04-2026/05-04-2026-18-42-11-a13f9c.jpg`

Bu yapi tarih bazli okunabilirlik ve dosya benzersizligini bir arada saglar.

## Retention Fields

Her upload icin:

- `created_at`
- `expires_at`

Onerilen kural:

- `expires_at = ((event_date + interval '1 day')::timestamp + interval '48 hours')`
- event_date yoksa fallback olarak `created_at + interval '48 hours'`

## Suggested SQL Draft

```sql
create extension if not exists pgcrypto;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  event_date date,
  slug text,
  access_code text unique,
  allow_guest_share boolean not null default true,
  allow_guest_download boolean not null default true,
  allow_guest_delete boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  file_url text not null,
  storage_path text not null,
  file_name text not null,
  share_code text unique,
  media_type text not null,
  mime_type text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '48 hours')
);

create table if not exists public.admin_credentials (
  id text primary key,
  username text not null,
  password_hash text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.guest_access_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  event_slug text,
  email text not null,
  source text,
  created_at timestamptz not null default now()
);
```

## Suggested Indexes

```sql
create index if not exists uploads_event_id_idx
  on public.uploads (event_id);

create index if not exists uploads_expires_at_idx
  on public.uploads (expires_at);

create unique index if not exists uploads_share_code_idx
  on public.uploads (share_code)
  where share_code is not null;

create unique index if not exists events_access_code_idx
  on public.events (access_code);

create index if not exists guest_access_logs_event_id_idx
  on public.guest_access_logs (event_id);

create index if not exists guest_access_logs_created_at_idx
  on public.guest_access_logs (created_at desc);
```

## Cleanup Query Draft

Bu sorgu, cleanup job tarafinda kullanilabilecek temel secim mantigini temsil eder:

```sql
select id, storage_path
from public.uploads
where expires_at <= now();
```

Ardindan ilgili storage dosyalari silinmeli ve metadata kayitlari temizlenmelidir.

## RLS Direction

MVP icin iki yol vardir:

### Simple

- Okuma ve yazma kontrollu ama link bilen kullanicilar icin kolay kurallar

### Safer

- Event bazli token veya signed URL mantigi

Mevcut urun hedefi sadelik oldugu icin MVP asamasinda basit ama dikkatli RLS kurallari yeterli olabilir. Uretime cikmadan once bucket politikasi ve tablo erisimi ayrica test edilmelidir.

## Security Hardening SQL

Supabase Security Advisor icin asagidaki ek sertlestirmeler gerekir:

- `public.admin_credentials` icin RLS acik olmali
- `public.guest_access_logs` icin RLS acik olmali
- `public.uploads` icindeki anon insert policy `with check (true)` yerine daha dar olmali
- `storage.objects` icindeki broad `SELECT` policy'leri kaldirilmali
- public bucket oldugu icin `event-uploads` dosya URL'leri yine calisir; listing policy'sine gerek yoktur

```sql
alter table public.admin_credentials enable row level security;
alter table public.guest_access_logs enable row level security;

drop policy if exists "No direct access to admin credentials" on public.admin_credentials;
create policy "No direct access to admin credentials"
on public.admin_credentials
for all
to public
using (false)
with check (false);

drop policy if exists "No direct access to guest access logs" on public.guest_access_logs;
create policy "No direct access to guest access logs"
on public.guest_access_logs
for all
to public
using (false)
with check (false);

drop policy if exists "Allow anon insert uploads" on public.uploads;
drop policy if exists "Allow insert uploads" on public.uploads;

create policy "Allow anon insert uploads"
on public.uploads
for insert
to anon
with check (
  event_id is not null
  and coalesce(file_url, '') <> ''
  and coalesce(type, '') in ('photo', 'video')
);

drop policy if exists "Allow public read" on storage.objects;
drop policy if exists "Allow public read for event-uploads" on storage.objects;
drop policy if exists "allow all reads" on storage.objects;

drop policy if exists "Allow public upload" on storage.objects;
drop policy if exists "allow all uploads" on storage.objects;
drop policy if exists "Allow anon uploads to event-uploads" on storage.objects;

create policy "Allow anon uploads to event-uploads"
on storage.objects
for insert
to anon
with check (bucket_id = 'event-uploads');
```
