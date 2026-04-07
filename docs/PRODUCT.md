# Product Definition

## Product Summary

EventDrop, fiziksel bir etkinlikte bulunan insanlarin kendi telefonlariyla cektikleri fotograf ve videolari, bir QR kod uzerinden ortak bir dijital albume yukleyebildigi gecici bir medya paylasim uygulamasidir.

Urunun ana amaci, etkinlik organizatorunun profesyonel ekipman veya karmasik uygulamalar kullanmadan, katilimcilarin kendi cektikleri anlari tek bir yerde toplayabilmesini saglamaktir.

## Target Users

- Dugun davetlileri
- Dogum gunu katilimcilari
- Sirket etkinligi ziyaretcileri
- Workshop, meetup ve topluluk bulusmasi misafirleri
- Etkinlik organizatoru veya album sahibi

## Core Use Cases

- Misafir QR kodu okutup hizlica album sayfasina girebilir.
- Misafir fotograf ve video yukleyebilir.
- Ortak galeride diger yuklemeleri gorebilir.
- Istedigi medya dosyalarini indirebilir.
- Yuklemeler, etkinlikten kisa bir sure sonra otomatik temizlenir.

## User Roles

### Guest

- QR kod ile album sayfasina girer
- Fotograf veya video yukler
- Galeriyi goruntuler
- Medya indirir

### Host

- Etkinlik veya album olusturur
- Katilimcilarla QR kodu paylasir
- Ortak galeriyi takip eder
- Gerekirse album omrunu veya silme kurallarini degistirir

Not: Uygulamada gizli bir admin paneli bulunur. Admin kullanici adi ve sifre ile giris yapar; her etkinlik icin ayri album, ayri QR ve ayri `event code` uretilir. Public tarafta etkinlik listesi yayinlanmaz.

## Product Flow

1. Host bir etkinlik olusturur.
2. Sistem etkinlige ait bir QR kod veya baglanti uretir.
3. Misafir QR kodu okutur.
4. Misafir yukleme ekranina gider.
5. Fotograf ve/veya video secer.
6. Medya dosyalari ortak albume yuklenir.
7. Sistem galeride bu icerikleri listeler.
8. Katilimcilar isterse galeriden medya indirebilir.
9. Yuklemeler 48 saat sonunda otomatik silinir.

## Product Rules

- Her etkinlik icin tek bir album mantigi vardir.
- Albume erisim baglanti veya QR kod bilen herkes icin kolay olmalidir.
- Kullanici deneyimi mobil odakli ve cok basit olmalidir.
- Medya dosyalari en fazla 48 saat tutulmalidir.
- 48 saat sonunda hem storage dosyalari hem veritabani kayitlari silinmelidir.
- Album ve dosya isimlendirme kurali tarih tabanli olmalidir.

## Naming Rules

### Album Folder Name

Onerilen klasor formati:

`DD-MM-YYYY`

Bu format, albumun hangi gun acildigini okunabilir hale getirir.

### File Name

Yalnizca `DD-MM-YYYY` kullanmak dosya cakismasina neden olur. Bu nedenle urun kuralina sadik kalirken benzersizlik saglayan format onerilir:

`DD-MM-YYYY-HH-mm-ss-random`

Ornek:

`05-04-2026-18-42-11-a13f9c.jpg`

Bu yaklasim hem tarih bilgisini korur hem de ayni saniyede gelen yuklemelerde cakismayi azaltir.

## Supported Media

MVP asamasinda:

- JPEG
- PNG
- WEBP
- HEIC
- HEIF
- MP4
- MOV

Not: Mevcut kod tabani su an agirlikli olarak fotograf yuklemeye hazir. Video destegi urun taniminda vardir ancak uygulamada tam dogrulanmis akisa donusturulmelidir.

## Non-Goals For MVP

- Sosyal ag benzeri profil yapisi
- Yorum, begeni veya takip sistemi
- Kalici arsivleme
- Cok seviyeli yetkilendirme sistemi
- Agir medya isleme pipeline'i

## MVP Success Criteria

- Bir etkinlik linki veya QR kodu ile albume girilebilmeli
- Misafirler telefondan hizli yukleme yapabilmeli
- Galeri sayfasi dogru listeleme yapmali
- Medya indirilebilmeli
- 48 saat sonra medya otomatik temizlenmeli
- Kurulum ve deploy tek kisilik ekip tarafindan kolay yapilabilmeli
