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
7. Admin gerekli oldugunda event veya medya kayitlarini manuel olarak siler

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
- Admin panelinden manuel silme

## Data Model Concept

### Event

Bir etkinlik veya albumu temsil eder.

### Upload

Bir etkinlige bagli medya kaydini temsil eder.

Kayit iki farkli seyi baglar:

- Storage icindeki fiziksel dosya
- Database icindeki metadata

## Deletion Strategy

Sistemin kritik urun kurali:

- Eventler ve yuklemeler otomatik olarak expire olmaz
- Silme islemleri admin panelinden manuel yapilir

Manuel event silme icin onerilen yaklasim:

1. Event'e bagli upload kayitlari okunur
2. Ilgili storage dosyalari guvenli path bilgisi ile silinir
3. Ardindan `uploads` tablosundaki metadata silinir
4. Son olarak event kaydi silinir

## Recommended Deployment Shape

### Option 1: Recommended MVP

- Frontend: Vercel
- Database + Storage: Supabase

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
- Silme islemlerinde storage path bilgisi legacy kayitlar icin eksik olabilir
- Video dosyalari icin boyut, tip ve onizleme stratejisi eksik
