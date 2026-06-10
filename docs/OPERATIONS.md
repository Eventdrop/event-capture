# Operations And Retention

## Owner Workflow

Bu proje icin amac, teknik bilgi az olsa bile sorunlari erken fark etmek ve
panik olmadan dogru yere bakmaktir. Uygulama su servislerle calisir:

- GitHub: Kod ve pull request akisi
- Vercel: Canli site, deploy ve runtime loglari
- Supabase: Database, storage ve API key'leri
- Codex: Duzenli kontrol, sade rapor ve sorun oldugunda yonlendirme

Production domain:

`https://upload.photoboothholland.com`

Admin route:

`https://upload.photoboothholland.com/control-room-7x`

Manual health check:

```bash
npm run health
```

Bu komut ana sayfayi, admin giris sayfasini ve cleanup endpoint'inin disariya
kapali oldugunu, ayrica `/api/health` uzerinden env ve Supabase baglantisini
kontrol eder.

## Monitoring Setup

### Vercel

Vercel Pro kullanimi onerilir. Vercel'de su ayarlar acik tutulmalidir:

- Deployment failure emails
- Runtime error alerts
- Usage ve spending alerts
- Environment Variables uyarilari

Environment Variables ekraninda turuncu `Needs Attention` gorunmemelidir.
Bu uyarilar gorunurse ilgili secret yeniden girilmeli ve production redeploy
yapilmalidir.

Zorunlu production environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=https://upload.photoboothholland.com
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
ADMIN_USERNAME=
ADMIN_PASSWORD=
ADMIN_SESSION_SECRET=
```

Vercel uyarisi alindiginda ilk bakilacak yerler:

- Project > Deployments: son deploy `Ready` mi?
- Project > Logs: runtime hata var mi?
- Project > Environment Variables: `Needs Attention` var mi?

### Supabase

Supabase tarafinda izlenecek noktalar:

- Project status `Healthy` olmali
- Database ve Storage limitleri dolmaya yaklasmamali
- `event-uploads` bucket mevcut olmali
- `events`, `uploads`, `admin_credentials`, `guest_access_logs` tablolari
  beklenen sekilde durmali
- `service_role` key yalnizca server-side secret olarak tutulmali

Supabase key degisirse ayni key Vercel'deki `SUPABASE_SERVICE_ROLE_KEY`
degiskenine de yeniden girilmeli ve redeploy yapilmalidir.

### GitHub

GitHub tarafinda acik tutulmasi gerekenler:

- Dependabot alerts
- Pull request review akisi
- Branch protection for `main`
- Failed workflow/deployment notifications

Production kodu `main` branch'inden yayinlanir. Kritik degisiklikler once pull
request ile kontrol edilmelidir.

### Codex Automations

Codex tarafinda iki katmanli takip onerilir:

- Saatlik production health check
- Gunluk operasyon raporu
- Haftalik bakim kontrolu

Saatlik kontrol, site tamamen ayakta mi ve admin route server error veriyor mu
diye bakar. Gunluk/haftalik kontrollerde Vercel, Supabase ve GitHub panellerinde
elle bakilmasi gereken konular sade bir liste olarak raporlanir.

## Incident Playbook

### Site Acilmiyor

1. Vercel > Deployments ekraninda son deploy `Ready` mi kontrol et.
2. `npm run health` ile production endpoint'lerini kontrol et.
3. Vercel > Logs ekraninda son hatayi oku.
4. Supabase dashboard'da proje `Healthy` mi kontrol et.
5. Son deploy sorunluysa Vercel'de onceki `Ready` deployment'a rollback yap.

### Admin Panel Calismiyor

1. Vercel Environment Variables icinde `ADMIN_USERNAME`, `ADMIN_PASSWORD`,
   `ADMIN_SESSION_SECRET` var mi kontrol et.
2. `Needs Attention` varsa degeri yeniden gir ve redeploy yap.
3. Vercel Logs icinde auth veya Supabase hatasi var mi kontrol et.

### Upload Calismiyor

1. Supabase `event-uploads` bucket mevcut mu kontrol et.
2. Vercel Environment Variables icinde Supabase URL, anon key ve service role
   key var mi kontrol et.
3. Supabase Storage limitleri dolmus mu kontrol et.
4. Vercel Logs icinde storage veya permission hatasi var mi kontrol et.

### Cleanup Calismiyor

1. Vercel `vercel.json` icinde cron tanimi duruyor mu kontrol et.
2. `CRON_SECRET` Vercel'de set mi ve `Needs Attention` yok mu kontrol et.
3. Vercel Logs icinde `/api/cleanup` hatasi var mi kontrol et.
4. Supabase uploads tablosunda `expires_at` gecmis kayitlar birikiyor mu kontrol et.

## Main Operational Rule

Sistemde yuklenen tum fotograf ve videolar 48 saat sonra otomatik olarak silinmelidir.

Bu kural iki farkli yerde uygulanir:

- Storage dosyasi silinir
- Database metadata kaydi silinir

## Recommended Cleanup Strategy

En sade ve guvenli yol:

1. `uploads` tablosunda `expires_at` alanini tut
2. Belirli araliklarla calisan bir cleanup gorevi tanimla
3. `expires_at <= now()` olan kayitlari sec
4. Ilgili `storage_path` kayitlarini bucket'tan sil
5. Basarili silinen kayitlari tablodan kaldir

## Recommended Frequency

Pratik MVP icin:

- Her gun en az 1 kez

Not:

- Vercel cron kullaniminda ucretsiz veya dusuk maliyetli planlarda daha sinirli zamanlama secenekleri olabilir.
- Daha sik cleanup ihtiyaci olursa Supabase Cron veya ucretli plan tarafina gecilebilir.

Bu, 48 saat kuralini operasyonel olarak yakin bir sekilde uygular ve ilk MVP icin yeterli olur.

## Failure Handling

Cleanup gorevi su durumlari loglamalidir:

- Storage silme hatasi
- Veritabani silme hatasi
- Eksik `storage_path`
- Yetki veya bucket policy problemi

## Host Communication

48 saat sonunda album dogrudan bos gorunebilir. Daha iyi deneyim icin ileride su metin eklenebilir:

- "Bu albumun gecerlilik suresi doldu."

## Future Operational Enhancements

- Host icin retention suresini etkinlik bazinda ayarlama
- Manuel album kapatma
- Toplu indirme linki
- Video boyut limiti ve transcoding stratejisi
- Abuse ve spam korumasi
