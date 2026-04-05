# Deployment Guide

## Recommendation

MVP icin en makul kurulum:

- Frontend: Vercel
- Database: Supabase
- Storage: Supabase Storage
- Cleanup: Supabase Cron veya scheduled function

Bu secenek, mevcut Next.js kod tabanina en az surtunmeyle uyar.

## Branch And Environment Strategy

- `develop` branch'i preview veya staging branch'i olarak kullanilmalidir.
- Gelistirme sirasinda yapilan her degisiklik once `develop` branch'ine pushlanmalidir.
- `develop` branch'ine gelen her commit preview ortaminda otomatik deploy edilmelidir.
- `develop` uzerindeki testler ve kontroller basarili olduktan sonra `main` icin merge akisi baslatilmalidir.
- `main` branch'ine gecis pull request ile yapilmali ve code review tamamlanmalidir.
- `main` branch'ine merge edilen her degisiklik production'a anlik deploy edilmelidir.

## Why This Stack

- Kurulum hizli
- Tek kisilik ekip icin kolay yonetilir
- Ayrica custom backend zorunlulugu yaratmaz
- QR kod, yukleme ve galeri gibi akislari basitce destekler

## Required Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
```

Production ornegi:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Vercel Deployment Steps

1. Repo'yu GitHub'a gonder
2. Vercel'de yeni proje olustur
3. Repo'yu bagla
4. Preview deploy'larin `develop` branch'i icin calistigini dogrula
5. Production deploy'un `main` branch'i icin calistigini dogrula
6. Environment Variables alanina gerekli degiskenleri ekle
7. Deploy ayarlarini tamamla
8. Uygulama domain'ini `NEXT_PUBLIC_APP_URL` ile ayni olacak sekilde guncelle

## Supabase Setup Steps

1. Yeni bir Supabase projesi olustur
2. `events` ve `uploads` tablolarini olustur
3. `event-uploads` bucket'ini olustur
4. Bucket erisim kurallarini ayarla
5. Cleanup icin zamanlanmis gorev tanimla

## Lower-Cost Alternative

Cloudflare Pages dusunulebilir. Ancak bu proje icin ilk cikista su sebeplerle ikinci secenek olarak degerlendirilmelidir:

- Next.js uyumluluk ayrintilari daha fazla dikkat ister
- Operasyonel akis ilk asamada Vercel kadar dogrudan olmayabilir
- Tek kisilik ekip icin ilk MVP hedefinde gelistirme hizi daha onemlidir

## Production Checklist

- Tum env degiskenleri dogru mu
- `NEXT_PUBLIC_APP_URL` production domain ile ayni mi
- `develop` preview deploy'u calisiyor mu
- `main` production deploy'u calisiyor mu
- Storage bucket olustu mu
- RLS ve bucket policy test edildi mi
- 48 saat cleanup gorevi aktif mi
- En az bir test etkinligi ile yukleme yapildi mi
