# Architecture

## Overview

EventDrop hafif bir istemci tarafi Next.js uygulamasi olarak calisir. Temel is mantigi su uc parcaya ayrilir:

- Arayuz ve rota yapisi
- Supabase veritabani
- Supabase storage

## High-Level Flow

1. Kullanici etkinlik linkine gider
2. Uygulama etkinlik bilgisini Supabase uzerinden okur
3. Kullanici medya dosyasi secer
4. Dosya storage bucket icine yuklenir
5. Yuklemeye ait metadata `uploads` tablosuna yazilir
6. Galeri sayfasi `uploads` tablosunu okuyarak liste olusturur
7. Cleanup gorevi 48 saati gecen kayitlari ve dosyalari siler

## Current App Structure

- [app/page.tsx](/Users/3worksmedia/event-capture/app/page.tsx)
  Uygulama giris sayfasi
- [app/event/[id]/page.tsx](/Users/3worksmedia/event-capture/app/event/[id]/page.tsx)
  Etkinlik yukleme sayfasi ve QR kod ekrani
- [app/event/[id]/gallery/page.tsx](/Users/3worksmedia/event-capture/app/event/[id]/gallery/page.tsx)
  Galeri ve indirme sayfasi
- [lib/supabase.ts](/Users/3worksmedia/event-capture/lib/supabase.ts)
  Supabase client olusturma katmani

## Frontend Responsibilities

- Etkinlik adini gostermek
- Dosya secmek
- Yuklemeyi baslatmak
- Galeri listelemek
- QR kod gostermek
- Kullaniciya basit geri bildirim sunmak

## Backend Responsibilities

MVP icin ayrica klasik bir custom backend zorunlu degildir. Bu sorumluluklar Supabase ile cozulur:

- Storage dosya saklama
- Database metadata kaydi
- Scheduled job ile cleanup

## Data Model Concept

### Event

Bir etkinlik veya albumu temsil eder.

### Upload

Bir etkinlige bagli medya kaydini temsil eder.

Kayit iki farkli seyi baglar:

- Storage icindeki fiziksel dosya
- Database icindeki metadata

## Retention Strategy

Sistemin kritik urun kurali:

- Her yukleme en fazla 48 saat saklanir

Bunun icin onerilen yaklasim:

1. `uploads` tablosunda `created_at` tutulur
2. Zamanlanmis bir job periyodik olarak 48 saati asan kayitlari bulur
3. Ilgili storage dosyalari silinir
4. Ardindan `uploads` tablosundaki metadata silinir

## Recommended Deployment Shape

### Option 1: Recommended MVP

- Frontend: Vercel
- Database + Storage + Scheduler: Supabase

Bu secenek en dusuk kurulum karmasikligina sahiptir.

### Option 2: Lower-Cost Alternative

- Frontend: Cloudflare Pages
- Database + Storage: Supabase

Bu secenek dusunulebilir ancak ilk asama icin operasyonel olarak daha fazla uyarlama gerekebilir.

## Security Notes

- Anon key istemci tarafinda kullanildigi icin RLS kurallari dikkatli yazilmalidir
- Storage bucket izinleri net tanimlanmalidir
- Etkinlik bazli veri erisimi kontrol edilmelidir
- Ileride album bazli paylasim token modeli dusunulebilir

## Current Technical Debt

- Storage yolu urun kuralindaki tarih tabanli klasor standardina uymuyor
- Dosya adlari deterministik naming standardina gecmemis
- `uploads` kaydinda storage path ayrica tutulmuyor
- Cleanup islemi icin gerekli operasyon katmani henuz yok
- Video dosyalari icin boyut, tip ve onizleme stratejisi eksik
