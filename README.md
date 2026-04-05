# EventDrop

EventDrop, bir etkinliğe katılan insanların kendi telefonlarıyla cektikleri fotograf ve videolari, QR kod ile ayni ortak albume yukleyebildigi hafif bir web uygulamasidir.

## Proje Nedir?

Uygulamanin temel amaci, dugun, dogum gunu, sirket etkinligi gibi gunubirlik organizasyonlarda katilimcilarin medya iceriklerini tek bir ortak noktada toplamasidir. Kullanici QR kodu okutur, ilgili etkinlik albumune gider, fotograflarini veya videolarini yukler ve ortak galeride diger icerikleri goruntuleyebilir.

## Kim Kullanir?

- Dugun davetlileri
- Dogum gunu katilimcilari
- Sirket etkinligi ziyaretcileri
- Kisa sureli topluluk bulusmalarina gelen misafirler

## Temel Akis

1. Etkinlik icin ozel bir QR kod uretilir.
2. Katilimci QR kodu telefonuyla okutur.
3. Acilan sayfada ortak albume fotograf ve/veya video yukler.
4. Yuklenen icerikler ortak galeride goruntulenir.
5. Katilimcilar istedikleri icerikleri indirebilir ve kendi aralarinda paylasabilir.

## Urun Kurallari

- Her etkinlik tek bir ortak album mantigiyla calisir.
- Yuklenen medya dosyalari 48 saat sonra otomatik olarak silinmelidir.
- Album klasorleri tarih bazli isimlendirilmelidir.
- Dosya isimleri tarih bilgisini tasimalidir.
- Sistem mobil kullanim icin hizli ve sade olmalidir.

## Isimlendirme Kurali

Album klasorleri icin temel format:

`DD-MM-YYYY`

Dosyalar icin yalnizca `DD-MM-YYYY` kullanmak tek basina yeterli olmayacagi icin cakisma riski olusur. Bu nedenle uygulama icin onerilen pratik format:

`DD-MM-YYYY-HH-mm-ss-random`

Bu sayede tarih kurali korunur ve ayni gun yuklenen birden fazla dosya benzersiz kalir.

## Teknik Yon

Bu proje icin sade ve makul teknoloji yaklasimi:

- Next.js arayuzu
- Supabase Storage ile medya saklama
- Supabase Database ile etkinlik ve yukleme kayitlari
- Supabase Cron veya zamanlanmis bir cleanup gorevi ile 48 saat sonra otomatik silme
- Vercel veya benzeri basit bir hosting ortami

## Deploy Yaklasimi

MVP icin en sade secenek:

- Uygulama: Vercel
- Veri ve dosyalar: Supabase

Bunun nedeni, mevcut projenin zaten Next.js tabanli olmasi ve Supabase ile dosya/veri mantigina uygun olmasidir.

Daha dusuk maliyetli alternatif olarak Cloudflare da dusunulebilir; ancak bu urunde dosya yukleme, veritabani, galeri, zamanlanmis silme ve basit yonetim akisinin bir arada kolay kurulmasi acisindan Vercel + Supabase kombinasyonu daha dogrudan bir ilk kurulum saglar.

Kaynaklar:

- [Vercel plan docs](https://vercel.com/docs/plans)
- [Cloudflare Pages pricing docs](https://developers.cloudflare.com/pages/functions/pricing/)
- [Cloudflare Pages limits docs](https://developers.cloudflare.com/pages/platform/limits/)
- [Supabase Cron docs](https://supabase.com/docs/guides/cron)
- [Supabase scheduled Edge Functions docs](https://supabase.com/docs/guides/functions/schedule-functions)
- [Supabase Storage docs](https://supabase.com/docs/guides/storage)

## Development Workflow

- Her zaman yapilan degisiklik once `develop` branch'ine pushlanmalidir.
- `develop`, preview veya staging ortami olarak kullanilmalidir.
- `develop` branch'ine giden her degisiklik preview ortaminda deploy edilmelidir.
- `develop` uzerindeki testler ve kontroller basarili olduktan sonra degisiklik `main` icin merge edilmelidir.
- `main` icin pull request acilmali ve code review yapilmalidir.
- `main` branch'ine deploy olan her degisiklik production'a anlik olarak gitmelidir.

## Bu Repoda Beklenen Ana Sayfalar

- `/` : son olusturulan ortak albumu gosteren public giris ve upload baslangic sayfasi
- `/admin` : gizli admin girisi ve etkinlik/album olusturma sayfasi
- `/event/[id]` : etkinlige medya yukleme sayfasi
- `/event/[id]/gallery` : ortak galeri ve indirme sayfasi

## Sonraki Dokumanlar

README sonrasi proje icin tutulan dokumanlar:

- `docs/PRODUCT.md`
- `docs/SETUP.md`
- `docs/ARCHITECTURE.md`
- `docs/DB_SCHEMA.md`
- `docs/DEPLOYMENT.md`
- `docs/OPERATIONS.md`

## Not

Bu README, mevcut proje yapisi ve urun hedefi baz alinarak hazirlanmistir. Dosya isimlendirme konusunda benzersizlik ihtiyaci nedeniyle uygulama seviyesinde `DD-MM-YYYY` formatinin zaman ve kisa rastgele ek ile genisletilecegi varsayilmistir.
