# Operations And Retention

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

- Her 1 saat

Bu, 48 saat kuralini yeterince iyi uygular ve gereksiz operasyon sikligini azaltir.

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
