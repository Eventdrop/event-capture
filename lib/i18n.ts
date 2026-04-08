export type Locale = 'tr' | 'nl' | 'en'

export const locales: Locale[] = ['tr', 'nl', 'en']

export const localeLabels: Record<Locale, string> = {
  tr: 'TR',
  nl: 'NL',
  en: 'EN',
}

type TranslationTree = {
  common: {
    contact: string
    eventId: string
    eventDate: string
    guestEntryPage: string
    terms: string
    privacy: string
    back: string
    uploadPage: string
    gallery: string
    copyUploadLink: string
    copyGalleryLink: string
    deleteEvent: string
    signOut: string
    latestPublicAlbum: string
    restrictedAdmin: string
    hiddenAdminAccess: string
    hiddenAdminDescription: string
    language: string
  }
  home: {
    badge: string
    title: string
    intro: string
    entryLabel: string
    formTitle: string
    formIntro: string
    emailLabel: string
    codeLabel: string
    accessButton: string
    accessHint: string
    accessGranted: string
    accessError: string
    emailRequired: string
    codeRequired: string
    checkingAccess: string
    manualAccessHelp: string
    prefilledEvent: string
    prefilledEventEmailOnly: string
    latestAlbumLabel: string
    latestAlbumReady: string
    noAlbum: string
    uploadCta: string
    galleryCta: string
    contactLabel: string
    bestFor: string
    bestForText: string
    flowTitle: string
    flowText: string
    howItWorks: string
    shareSite: string
    shareReady: string
    shareCopied: string
    points: string[]
    sections: { title: string; body: string[] }[]
    loading: string
  }
  admin: {
    title: string
    loginPrompt: string
    username: string
    password: string
    unlock: string
    checking: string
    configuredHint: string
    notConfigured: string
    unlocked: string
    signedOut: string
    passwordSection: string
    passwordSectionHelp: string
    passwordSectionUnavailable: string
    currentPassword: string
    newPassword: string
    confirmNewPassword: string
    changePassword: string
    savingPassword: string
    passwordFieldsRequired: string
    passwordMismatch: string
    passwordTooShort: string
    passwordChangeSuccess: string
    passwordChangeError: string
    createTitle: string
    eventName: string
    albumName: string
    accessCodeField: string
    accessCodeHelp: string
    eventCodeToggle: string
    eventCodeEnabledHelp: string
    eventCodeDisabledHelp: string
    toggleOn: string
    toggleOff: string
    regenerateCode: string
    coverImage: string
    backgroundImage: string
    uploadCover: string
    uploadBackground: string
    mediaUploading: string
    mediaUploadError: string
    createButton: string
    saving: string
    noEvents: string
    unlockToManage: string
    qrLabel: string
    uploadCopied: string
    galleryCopied: string
    deleteConfirm: string
    deleteSuccess: string
    missingCredentials: string
    invalidCredentials: string
    loadError: string
    createSuccess: string
    createError: string
    deleteError: string
    adminAccess: string
    enabled: string
    checkingSession: string
    recentAlbums: string
    hiddenRouteNote: string
    accessCodeLabel: string
    copyCodeButton: string
    codeCopied: string
    emailOnlyEntry: string
    guestEmails: string
    noGuestEmails: string
    guestEmailTimeUnknown: string
  }
  upload: {
    badge: string
    intro: string
    guidanceBadge: string
    guidanceTitle: string
    guidanceIntro: string
    guidancePoints: string[]
    consentLabel: string
    consentHelp: string
    consentRequired: string
    consentLinks: string
    consentButton: string
    uploadLabel: string
    namingLabel: string
    namingText: string
    retentionLabel: string
    retentionText: string
    selectLabel: string
    selectButton: string
    noFilesChosen: string
    readyPrefix: string
    photos: string
    videos: string
    filesSelected: string
    unsupportedIgnored: string
    photoTooLarge: string
    videoTooLarge: string
    videoTooLong: string
    selectionLimit: string
    chooseSupported: string
    chooseStart: string
    eventNotFound: string
    eventNotReady: string
    uploadInProgress: string
    uploadComplete: string
    uploadButton: string
    uploadingButton: string
    clearSelection: string
    viewGallery: string
    qrTitle: string
    qrText: string
    albumLink: string
    selectionCleared: string
  }
  gallery: {
    badge: string
    intro: string
    loading: string
    noUploads: string
    showing: string
    loadError: string
    notFound: string
    downloadAll: string
    downloadingAll: string
    allDownloaded: string
    downloadSelected: string
    backToUpload: string
    selected: string
    select: string
    delete: string
    deleting: string
    deleteConfirm: string
    deleteSuccess: string
    deleteError: string
    share: string
    shareSuccess: string
    shareCopied: string
    shareError: string
    download: string
    downloaded: string
    chooseBeforeDownload: string
    uploadTimeUnavailable: string
    photo: string
    video: string
  }
  legal: {
    termsTitle: string
    termsIntro: string
    termsSections: { title: string; points: string[] }[]
    privacyTitle: string
    privacyIntro: string
    privacySections: { title: string; points: string[] }[]
    acknowledge: string
  }
}

export const translations: Record<Locale, TranslationTree> = {
  tr: {
    common: {
      contact: 'Iletisim',
      eventId: 'Etkinlik ID',
      eventDate: 'Etkinlik tarihi',
      guestEntryPage: 'Misafir girisi',
      terms: 'Kullanim sartlari',
      privacy: 'Gizlilik',
      back: 'Geri don',
      uploadPage: 'Yukleme sayfasi',
      gallery: 'Galeri',
      copyUploadLink: 'Misafir giris linkini kopyala',
      copyGalleryLink: 'Galeri linkini kopyala',
      deleteEvent: 'Etkinligi sil',
      signOut: 'Cikis yap',
      latestPublicAlbum: 'Son misafir girisini ac',
      restrictedAdmin: 'Kisitli Yonetim',
      hiddenAdminAccess: 'Gizli yonetim erisimi',
      hiddenAdminDescription:
        'Bu sayfa public anasayfada baglanmaz. Buradan etkinlikleri, kodlari ve misafir girislerini yonetebilirsin.',
      language: 'Dil',
    },
    home: {
      badge: 'QR ile etkinlik albumu',
      title: 'QR ile gelen misafirleri kendi etkinlik kodlariyla dogru albume yonlendir.',
      intro:
        'EventDrop, ayni anda birden fazla etkinligi ayri tutar ve misafirleri e-posta ile event code kullanarak kendi albumlerine alir.',
      entryLabel: 'Guvenli misafir girisi',
      formTitle: 'E-posta ve event code ile devam et',
      formIntro:
        'QR kodu okuttuktan sonra e-postani ve organizatorden aldigin event code bilgisini gir.',
      emailLabel: 'E-posta adresi',
      codeLabel: 'Event code',
      accessButton: 'Albume gir',
      accessHint: 'Devam etmek icin e-posta ve event code gir.',
      accessGranted: 'Erisim onaylandi. Album aciliyor...',
      accessError: 'Bu event code ile album bulunamadi.',
      emailRequired: 'Lutfen gecerli bir e-posta adresi gir.',
      codeRequired: 'Event code gerekli.',
      checkingAccess: 'Kod kontrol ediliyor...',
      manualAccessHelp:
        'QR kodun yoksa e-posta ve event code ile yine kendi albumune girebilirsin.',
      prefilledEvent:
        'Bu baglanti belirli bir etkinlige ait. Devam etmek icin sadece e-posta ve event code girmen yeterli.',
      prefilledEventEmailOnly:
        'Bu baglanti belirli bir etkinlige ait. Devam etmek icin sadece e-posta girmen yeterli.',
      latestAlbumLabel: 'Misafir girisi',
      latestAlbumReady: 'Misafir girisi etkinlik kodu ile dogrulanir.',
      noAlbum:
        'Etkinlikler public olarak listelenmez. Devam etmek icin event code kullan.',
      uploadCta: 'Albume git',
      galleryCta: 'Galeriyi ac',
      contactLabel: 'Iletisim',
      bestFor: 'En uygun kullanim',
      bestForText:
        'Dugunler, dogum gunleri, sirket etkinlikleri ve tek gunluk bulusmalar icin tasarlandi.',
      flowTitle: 'Public giris akisi',
      flowText:
        'Misafir QR ile gelir, e-posta ve event code girer, sadece kendi etkinlik albumune yonlenir.',
      howItWorks: 'Nasil calisir',
      shareSite: 'Sayfayi paylas',
      shareReady: 'Paylasim ekrani acildi.',
      shareCopied: 'Site linki panoya kopyalandi.',
      points: [
        'Her etkinligin kendi ozel event code bilgisi vardir',
        'Misafirler QR veya link ile girer, kodla dogrulanir',
        'Fotograflar ve videolar sadece ilgili albumde toplanir',
        'Icerikler 48 saat sonra temizlenir',
      ],
      sections: [
        {
          title: 'Anlarin paylasildigi her turlu etkinlik icin mukemmel',
          body: [
            'Dugunler, dogum gunleri, kurumsal etkinlikler, festivaller ve ozel partiler.',
            'Herkes fotograf ceker. EventDrop tum bu icerikleri tek bir ortak albumde bir araya getirir.',
            'Konuklar etkinlik boyunca cektikleri fotograflari kolayca yukler. Boylece herkes etkinligin farkli anlarina tek bir yerden erisebilir ve diledigi icerikleri indirebilir.',
          ],
        },
        {
          title: 'EventDrop nasil calisir',
          body: [
            'Her etkinligin kendine ait bir albumu ve benzersiz bir etkinlik kodu vardir.',
            'QR ile giris yapan kullanicilar sadece e-posta adreslerini girerek aninda devam eder.',
            'Manuel giris yapan kullanicilar ise e-posta ve etkinlik kodu ile erisim saglar.',
            'Tum fotograflar, etkinlige ozel olusturulmus tek bir duzenli albumde otomatik olarak toplanir.',
          ],
        },
        {
          title: 'Neden EventDrop',
          body: [
            'Etkinlikte cekilen fotograflar cogu zaman telefonlarda kaybolur. EventDrop ile tum icerikler tek bir yerde toplanir, herkes kolayca erisebilir ve paylasabilir.',
            'Tum fotograflar etkinlik sonrasinda ertesi gun etkinlik sahibine e-posta yolu ile iletilir.',
            'Konuklarinizin tum goruntuleri tek bir yerde, aninda erisilebilir.',
            'Etkinlige katilan herkesle paylasmak son derece kolaydir.',
          ],
        },
        {
          title: 'Hizli, basit ve sorunsuz',
          body: [
            'Yukleme sadece birkac saniye surer.',
            'Herhangi bir uygulama veya hesap gerektirmez.',
            'Tum cihazlarda sorunsuz calisir.',
          ],
        },
        {
          title: 'Guvenli ve ozel',
          body: [
            'Her etkinligin kendine ozel guvenli erisimi vardir.',
            'Tum dosyalar yalnizca ilgili albumde saklanir.',
            'Sadece etkinlige katilan kisiler erisim saglayabilir.',
          ],
        },
      ],
      loading: 'Misafir girisi hazirlaniyor...',
    },
    admin: {
      title: 'Gizli yonetim paneli',
      loginPrompt: 'Admin kullanici adini ve sifreni gir.',
      username: 'Kullanici adi',
      password: 'Sifre',
      unlock: 'Paneli ac',
      checking: 'Kontrol ediliyor...',
      configuredHint:
        'Bu ortam icin tanimlanan gizli kullanici adi ve sifre ile giris yap.',
      notConfigured: 'Sunucuda admin girisi henuz ayarlanmamis.',
      unlocked: 'Yonetim paneli acildi.',
      signedOut: 'Gizli yonetim panelinden cikis yapildi.',
      passwordSection: 'Giris dogrulama ve sifre',
      passwordSectionHelp:
        'Admin girisini daha guvenli hale getirmek icin mevcut sifreyi dogrulayip yeni sifre belirleyebilirsin.',
      passwordSectionUnavailable:
        'Kalici sifre degisikligi icin Supabase uzerinde public.admin_credentials tablosu gerekli. Tablo varsa ilk sifre degisikligi mevcut env sifresi ile yapilabilir.',
      currentPassword: 'Mevcut sifre',
      newPassword: 'Yeni sifre',
      confirmNewPassword: 'Yeni sifre tekrar',
      changePassword: 'Sifreyi guncelle',
      savingPassword: 'Sifre kaydediliyor...',
      passwordFieldsRequired: 'Sifre degisikligi icin tum alanlari doldur.',
      passwordMismatch: 'Yeni sifreler birbiriyle ayni olmali.',
      passwordTooShort: 'Yeni sifre en az 8 karakter olmali.',
      passwordChangeSuccess: 'Admin sifresi basariyla guncellendi.',
      passwordChangeError: 'Admin sifresi guncellenemedi.',
      createTitle: 'Son public album burada yonetilir.',
      eventName: 'Etkinlik adi',
      albumName: 'Album adi',
      accessCodeField: 'Olusacak event code',
      accessCodeHelp:
        'Kod otomatik uretilir. Istersen olusturmadan once degistirebilir veya yenileyebilirsin.',
      eventCodeToggle: 'Event code kullan',
      eventCodeEnabledHelp:
        'Aciksa ana sayfa girisinde ve bu etkinlikte event code kullanilir.',
      eventCodeDisabledHelp:
        'Kapaliysa QR veya ozel link ile gelen misafirler sadece e-posta ile girer.',
      toggleOn: 'Acik',
      toggleOff: 'Kapali',
      regenerateCode: 'Yeni kod uret',
      coverImage: 'Etkinlik gorseli',
      backgroundImage: 'Arka plan gorseli',
      uploadCover: 'Etkinlik gorseli yukle',
      uploadBackground: 'Arka plan yukle',
      mediaUploading: 'Gorsel yukleniyor...',
      mediaUploadError: 'Gorsel yuklenemedi.',
      createButton: 'Etkinlik albumu olustur',
      saving: 'Kaydediliyor...',
      noEvents:
        'Henuz etkinlik kaydi yok. Burada ilk albumu olustur ve anasayfada yayinla.',
      unlockToManage:
        'Etkinlikleri listelemek, olusturmak veya silmek icin once paneli ac.',
      qrLabel: 'Misafir yukleme QR',
      uploadCopied: 'Yukleme linki kopyalandi.',
      galleryCopied: 'Galeri linki kopyalandi.',
      deleteConfirm:
        'Bu etkinligi silmek istiyor musun? Veritabani kurallarina gore ilgili yuklemeler de silinebilir.',
      deleteSuccess: 'Etkinlik basariyla silindi.',
      missingCredentials: 'Hem kullanici adi hem sifre gerekli.',
      invalidCredentials: 'Kullanici adi veya sifre hatali.',
      loadError: 'Etkinlikler yuklenemedi.',
      createSuccess: 'Etkinlik albumu basariyla olusturuldu.',
      createError: 'Etkinlik olusturulamadi.',
      deleteError: 'Etkinlik silinemedi.',
      adminAccess: 'Yonetim erisimi',
      enabled: 'Kisitli mod aktif',
      checkingSession: 'Yonetim oturumu kontrol ediliyor...',
      recentAlbums: 'Son albumler',
      hiddenRouteNote:
        'Bu rota public olarak paylasilmaz; sadece ic erisim icin kullanilir.',
      accessCodeLabel: 'Event code',
      copyCodeButton: 'Kodu kopyala',
      codeCopied: 'Event code panoya kopyalandi.',
      emailOnlyEntry: 'Yalnizca e-posta ile giris',
      guestEmails: 'Girilen e-posta adresleri',
      noGuestEmails: 'Bu etkinlik icin henuz e-posta kaydi yok.',
      guestEmailTimeUnknown: 'Giris zamani bilinmiyor',
    },
    upload: {
      badge: 'Misafir yukleme sayfasi',
      intro:
        'Misafirler bu ortak albume fotograf ekleyebilir. Icerikler 48 saat sonra temizlenmek uzere tasarlanmistir.',
      guidanceBadge: 'Yukleme kurallari',
      guidanceTitle: 'Lutfen sadece paylasilmasi uygun icerik yukleyin',
      guidanceIntro:
        'Yukleme yaparak bu icerikleri kendi isteginle paylastigini ve etkinlikte yer alan kisilerin mahremiyetine saygi gosterecegini onaylarsin.',
      guidancePoints: [
        'Sadece paylasma hakkin olan fotograflari yukle.',
        'Kucuk dusurucu, ayipli, nefret iceren, yasa disi veya baskasinin gizliligini ihlal eden icerik yukleme.',
        'Bu ilk surumde yalnizca fotograf kabul edilir; medya 48 saat saklanir ve kaldirma talebi icin iletisim bilgilerini kullanabilirsin.',
      ],
      consentLabel:
        'Yukledigin fotograflar uzerinde paylasim hakkina sahip oldugunu beyan edersin. Ayni etkinlikte yer alan diger katilimcilarin da seni iceren fotograflari yukleyebilecegini ve paylasabilecegini kabul edersin.',
      consentHelp:
        'Onay vermeden dosya secimi ve yukleme acilmaz.',
      consentRequired:
        'Devam etmek icin once yukleme kurallarini onayla.',
      consentLinks:
        'Devam ederek kullanim sartlarini ve gizlilik bilgisini de kabul ettigini beyan edersin.',
      consentButton: 'Devam et',
      uploadLabel: 'Yukleme',
      namingLabel: 'Isimlendirme',
      namingText: 'Dosyalar tarih bazli klasorler altinda tutulur.',
      retentionLabel: 'Saklama',
      retentionText: 'Suresi dolan medya otomatik olarak temizlenir.',
      selectLabel: 'Medya sec',
      selectButton: 'Dosyalari sec',
      noFilesChosen: 'Henuz dosya secilmedi',
      readyPrefix: 'Hazir',
      photos: 'fotograf',
      videos: 'video',
      filesSelected: 'dosya secildi',
      unsupportedIgnored: 'desteklenmeyen veya video olan dosya yok sayildi',
      photoTooLarge: 'fotograf 10 MB sinirini asti',
      videoTooLarge: 'video 50 MB sinirini asti',
      videoTooLong: 'video 20 saniyeyi asti',
      selectionLimit: 'en fazla 10 dosya secilebilir',
      chooseSupported: 'JPG, PNG, WEBP veya HEIC fotograf sec.',
      chooseStart: 'Baslamak icin fotograf sec.',
      eventNotFound: 'Bu etkinlik bulunamadi. Linki veya QR kodu kontrol et.',
      eventNotReady: 'Bu etkinlik henuz yuklemeye hazir degil.',
      uploadInProgress: 'Yukleniyor...',
      uploadComplete: 'Yukleme tamamlandi. Galeri aciliyor...',
      uploadButton: 'Ortak albume yukle',
      uploadingButton: 'Yukleniyor...',
      clearSelection: 'Secimi temizle',
      viewGallery: 'Galeriyi gor',
      qrTitle: 'QR kod ile paylas',
      qrText: 'Misafirler bu kodu okutarak ayni yukleme sayfasina ulasabilir.',
      albumLink: 'Album linki',
      selectionCleared: 'Secim temizlendi.',
    },
    gallery: {
      badge: 'Ortak galeri',
      intro:
        'Misafir yuklemelerini incele, sec ve 48 saatlik sure dolmadan istediklerini indir.',
      loading: 'Bu etkinlik galerisi yukleniyor...',
      noUploads: 'Bu galeride henuz aktif yukleme yok.',
      showing: 'yukleme gosteriliyor',
      loadError: 'Galeri su anda yuklenemedi.',
      notFound: 'Bu etkinlik galerisi bulunamadi.',
      downloadAll: 'Tum albumu indir',
      downloadingAll: 'Tum album indiriliyor...',
      allDownloaded: 'Albumdeki tum medya indirildi.',
      downloadSelected: 'Secilenleri indir',
      backToUpload: 'Yuklemeye don',
      selected: 'Secildi',
      select: 'Sec',
      delete: 'Sil',
      deleting: 'Siliniyor...',
      deleteConfirm: 'Bu yuklemeyi silmek istiyor musun?',
      deleteSuccess: 'Yukleme silindi.',
      deleteError: 'Yukleme silinemedi.',
      share: 'Paylas',
      shareSuccess: 'Paylasim linki hazirlandi.',
      shareCopied: 'Paylasim linki panoya kopyalandi.',
      shareError: 'Paylasim su anda acilamadi.',
      download: 'Indir',
      downloaded: 'dosya indirildi',
      chooseBeforeDownload: 'Indirmeden once en az bir oge sec.',
      uploadTimeUnavailable: 'Yukleme zamani yok',
      photo: 'Fotograf',
      video: 'Video',
    },
      legal: {
      termsTitle: 'Kullanim Sartlari',
      termsIntro:
        'Bu etkinlik albumunu kullanarak asagidaki kurallari kabul etmis olursun.',
      termsSections: [
        {
          title: 'Icerik sorumlulugu',
          points: [
            'Yukledigin fotograf ve videolar uzerinde paylasim hakkina sahip oldugunu beyan edersin.',
            'Ayni etkinlikte yer alan diger katilimcilarin da seni iceren fotograf ve videolari yukleyebilecegini ve paylasabilecegini kabul edersin.',
            'Kucuk dusurucu, iftira niteliginde, nefret iceren, siddeti tesvik eden veya yasa disi icerik yukleyemezsin.',
            'Baska kisilerin mahremiyetini ihlal eden veya acikca rahatsizlik verecek icerikler kaldirilabilir.',
            'Gerekli gorulen durumlarda uygunsuz icerikler onceden bildirim yapilmadan kaldirilabilir.',
          ],
        },
        {
          title: 'Kullanim ve sistem kurallari',
          points: [
            'EventDrop, etkinlik katilimcilarinin iceriklerini tek bir albumde toplamak amaciyla sunulur.',
            'Sistem kotuye kullanim, spam veya zararli icerik tespit ettiginde erisimi sinirlama hakkini sakli tutar.',
            'Gerekli durumlarda album gecici veya kalici olarak kapatilabilir.',
          ],
        },
        {
          title: 'Saklama suresi',
          points: [
            'Yuklenen icerikler varsayilan olarak etkinlikten sonra 48 saat boyunca saklanir.',
            'Bu surenin ardindan icerikler otomatik olarak silinebilir.',
            'Organizator farkli bir sure belirlemis olabilir.',
          ],
        },
        {
          title: 'Sorumluluk reddi',
          points: [
            'EventDrop, kullanicilar tarafindan yuklenen iceriklerden dogrudan sorumlu degildir.',
            'Teknik aksakliklar veya veri kaybi durumlarinda garanti verilmez.',
          ],
        },
      ],
      privacyTitle: 'Gizlilik Bilgisi',
      privacyIntro:
        'Bu sayfa, EventDrop uzerinden toplanan kisisel verilerin nasil islendigini aciklar.',
      privacySections: [
        {
          title: 'Toplanan veriler',
          points: [
            'E-posta adresi, etkinlige erisim saglamak ve gerekli durumlarda iletisim kurmak icin islenir.',
            'Yuklenen fotograf ve videolar ilgili etkinlik albumunde saklanir.',
            'Teknik veriler (IP adresi, cihaz bilgisi, log kayitlari) guvenlik ve hata takibi icin gecici olarak tutulabilir.',
          ],
        },
        {
          title: 'Kullanim amaci',
          points: [
            'Toplanan veriler yalnizca etkinlik albumunu saglamak, icerik paylasimini mumkun kilmak ve sistemi korumak amaciyla kullanilir.',
            'Veriler ucuncu taraflarla pazarlama amaciyla paylasilmaz.',
          ],
        },
        {
          title: 'Saklama ve silme',
          points: [
            'Yuklenen medya varsayilan olarak 48 saat sonunda silinir.',
            'Teknik loglar sinirli sure boyunca saklanir ve ardindan otomatik olarak kaldirilir.',
          ],
        },
        {
          title: 'Kullanici haklari',
          points: [
            'Kullanicilar, yukledikleri iceriklerin kaldirilmasini talep edebilir.',
            'Talep uzerine veri erisimi, duzeltme veya silme islemleri yapilabilir.',
          ],
        },
        {
          title: 'Guvenlik',
          points: [
            'EventDrop, verilerin korunmasi icin gerekli teknik ve organizasyonel onlemleri uygular.',
            'Ancak internet uzerinden yapilan veri aktariminin tamamen risksiz oldugu garanti edilemez.',
          ],
        },
      ],
      acknowledge: 'Okudum, anladim',
    },
  },
  nl: {
    common: {
      contact: 'Contact',
      eventId: 'Evenement-ID',
      eventDate: 'Evenementdatum',
      guestEntryPage: 'Gasttoegang',
      terms: 'Gebruiksvoorwaarden',
      privacy: 'Privacy',
      back: 'Terug',
      uploadPage: 'Uploadpagina',
      gallery: 'Galerij',
      copyUploadLink: 'Toegangslink kopieren',
      copyGalleryLink: 'Galerijlink kopieren',
      deleteEvent: 'Evenement verwijderen',
      signOut: 'Uitloggen',
      latestPublicAlbum: 'Open laatste gasttoegang',
      restrictedAdmin: 'Beheerderszone',
      hiddenAdminAccess: 'Verborgen beheer',
      hiddenAdminDescription:
        'Deze pagina staat niet op de openbare homepage. Hier beheer je evenementen, codes en gasttoegang.',
      language: 'Taal',
    },
    home: {
      badge: 'QR-eventalbum',
      title: 'Leid QR-gasten met hun eigen eventcode naar het juiste album.',
      intro:
        'EventDrop houdt meerdere evenementen tegelijk gescheiden en laat gasten met e-mail en eventcode alleen hun eigen album openen.',
      entryLabel: 'Beveiligde gasttoegang',
      formTitle: 'Ga verder met e-mail en eventcode',
      formIntro:
        'Na het scannen van de QR-code vul je je e-mailadres en de eventcode van de organisator in.',
      emailLabel: 'E-mailadres',
      codeLabel: 'Eventcode',
      accessButton: 'Open album',
      accessHint: 'Vul je e-mail en eventcode in om verder te gaan.',
      accessGranted: 'Toegang bevestigd. Album wordt geopend...',
      accessError: 'Er is geen album gevonden voor deze eventcode.',
      emailRequired: 'Vul een geldig e-mailadres in.',
      codeRequired: 'Een eventcode is verplicht.',
      checkingAccess: 'Code wordt gecontroleerd...',
      manualAccessHelp:
        'Heb je geen QR-code? Dan kun je nog steeds met e-mail en eventcode naar je eigen album.',
      prefilledEvent:
        'Deze link hoort al bij een specifiek evenement. Vul alleen je e-mail en eventcode in om verder te gaan.',
      prefilledEventEmailOnly:
        'Deze link hoort al bij een specifiek evenement. Vul alleen je e-mailadres in om verder te gaan.',
      latestAlbumLabel: 'Gasttoegang',
      latestAlbumReady: 'Gasttoegang wordt met een eventcode bevestigd.',
      noAlbum:
        'Evenementen worden niet openbaar getoond. Gebruik een eventcode om door te gaan.',
      uploadCta: 'Naar album',
      galleryCta: 'Galerij openen',
      contactLabel: 'Contact',
      bestFor: 'Ideaal voor',
      bestForText:
        'Bruiloften, verjaardagen, bedrijfsevents en eendaagse bijeenkomsten.',
      flowTitle: 'Publieke instroom',
      flowText:
        'Gasten komen binnen via QR, vullen e-mail en eventcode in en landen alleen in hun eigen evenementalbum.',
      howItWorks: 'Zo werkt het',
      shareSite: 'Deel deze pagina',
      shareReady: 'Deelscherm is geopend.',
      shareCopied: 'Sitelink is naar het klembord gekopieerd.',
      points: [
        'Elk evenement krijgt een eigen eventcode',
        'Gasten worden via QR of link gecontroleerd',
        'Foto’s blijven binnen het juiste album',
        'Inhoud wordt na 48 uur opgeruimd',
      ],
      sections: [
        {
          title: 'Perfect voor elk evenement waar herinneringen worden gedeeld',
          body: [
            'Bruiloften, verjaardagen, zakelijke evenementen, festivals en privéfeesten.',
            'Iedereen maakt foto’s. EventDrop brengt al die content samen in één gedeeld album.',
            'Gasten uploaden hun foto’s eenvoudig tijdens het evenement. Zo heeft iedereen op één plek toegang tot verschillende momenten en kan men favoriete media downloaden.',
          ],
        },
        {
          title: 'Hoe EventDrop werkt',
          body: [
            'Elk evenement heeft een eigen album en een unieke eventcode.',
            'Gebruikers die via QR binnenkomen gaan direct verder met alleen hun e-mailadres.',
            'Gebruikers die handmatig binnenkomen gebruiken e-mail en eventcode.',
            'Alle foto’s worden automatisch verzameld in één overzichtelijk album dat speciaal voor dat evenement is aangemaakt.',
          ],
        },
        {
          title: 'Waarom EventDrop',
          body: [
            'Foto’s die tijdens een evenement worden gemaakt raken vaak verspreid over telefoons. Met EventDrop komt alles op één plek samen, zodat iedereen er makkelijk bij kan.',
            'Alle foto’s worden de dag na het evenement per e-mail naar de eigenaar van het evenement gestuurd.',
            'Alle beelden van je gasten staan direct op één toegankelijke plek.',
            'Delen met iedereen die aanwezig was is daardoor heel eenvoudig.',
          ],
        },
        {
          title: 'Snel, simpel en zonder gedoe',
          body: [
            'Uploaden duurt maar een paar seconden.',
            'Er is geen app of account nodig.',
            'Het werkt soepel op alle apparaten.',
          ],
        },
        {
          title: 'Veilig en privé',
          body: [
            'Elk evenement heeft zijn eigen beveiligde toegang.',
            'Alle bestanden blijven alleen binnen het juiste album.',
            'Alleen mensen die bij het evenement horen kunnen erbij.',
          ],
        },
      ],
      loading: 'Gasttoegang wordt voorbereid...',
    },
    admin: {
      title: 'Verborgen beheerpaneel',
      loginPrompt: 'Voer de beheerdersnaam en het wachtwoord in.',
      username: 'Gebruikersnaam',
      password: 'Wachtwoord',
      unlock: 'Paneel openen',
      checking: 'Controleren...',
      configuredHint:
        'Gebruik de geheime gebruikersnaam en het wachtwoord die voor deze omgeving zijn ingesteld.',
      notConfigured: 'De admin-login is nog niet geconfigureerd op de server.',
      unlocked: 'Beheerpaneel is geopend.',
      signedOut: 'Je bent uitgelogd uit het verborgen beheerpaneel.',
      passwordSection: 'Logincontrole en wachtwoord',
      passwordSectionHelp:
        'Je kunt eerst je huidige wachtwoord bevestigen en daarna een nieuw wachtwoord instellen.',
      passwordSectionUnavailable:
        'Voor een blijvende wachtwoordwijziging is de tabel public.admin_credentials in Supabase nodig. Als die tabel bestaat, kun je de eerste wijziging doen met het huidige omgevingswachtwoord.',
      currentPassword: 'Huidig wachtwoord',
      newPassword: 'Nieuw wachtwoord',
      confirmNewPassword: 'Herhaal nieuw wachtwoord',
      changePassword: 'Wachtwoord opslaan',
      savingPassword: 'Wachtwoord wordt opgeslagen...',
      passwordFieldsRequired: 'Vul alle wachtwoordvelden in.',
      passwordMismatch: 'Nieuwe wachtwoorden moeten overeenkomen.',
      passwordTooShort: 'Het nieuwe wachtwoord moet minimaal 8 tekens hebben.',
      passwordChangeSuccess: 'Adminwachtwoord is bijgewerkt.',
      passwordChangeError: 'Adminwachtwoord kon niet worden bijgewerkt.',
      createTitle: 'Hier beheer je het nieuwste publieke album.',
      eventName: 'Naam van het evenement',
      albumName: 'Naam van het album',
      accessCodeField: 'Eventcode',
      accessCodeHelp:
        'De code wordt automatisch gemaakt. Je kunt hem voor het opslaan aanpassen of vernieuwen.',
      eventCodeToggle: 'Eventcode gebruiken',
      eventCodeEnabledHelp:
        'Als dit aan staat, gebruiken gasten op de homepage en handmatige toegang een eventcode.',
      eventCodeDisabledHelp:
        'Als dit uit staat, komen gasten via QR of privelink binnen met alleen hun e-mailadres.',
      toggleOn: 'Aan',
      toggleOff: 'Uit',
      regenerateCode: 'Nieuwe code',
      coverImage: 'Evenementfoto',
      backgroundImage: 'Achtergrondfoto',
      uploadCover: 'Evenementfoto uploaden',
      uploadBackground: 'Achtergrond uploaden',
      mediaUploading: 'Afbeelding wordt geüpload...',
      mediaUploadError: 'Afbeelding kon niet worden geüpload.',
      createButton: 'Evenementalbum aanmaken',
      saving: 'Opslaan...',
      noEvents:
        'Er zijn nog geen evenementen. Maak hier het eerste album aan en zet het op de homepage.',
      unlockToManage:
        'Open eerst het paneel om evenementen te bekijken, maken of verwijderen.',
      qrLabel: 'QR voor gastenupload',
      uploadCopied: 'Uploadlink gekopieerd.',
      galleryCopied: 'Galerijlink gekopieerd.',
      deleteConfirm:
        'Weet je zeker dat je dit evenement wilt verwijderen? Afhankelijk van je database-regels kunnen uploads ook verdwijnen.',
      deleteSuccess: 'Evenement is verwijderd.',
      missingCredentials: 'Zowel gebruikersnaam als wachtwoord zijn verplicht.',
      invalidCredentials: 'Gebruikersnaam of wachtwoord is onjuist.',
      loadError: 'Evenementen konden niet worden geladen.',
      createSuccess: 'Evenementalbum is aangemaakt.',
      createError: 'Evenement kon niet worden aangemaakt.',
      deleteError: 'Evenement kon niet worden verwijderd.',
      adminAccess: 'Beheertoegang',
      enabled: 'Beperkte modus actief',
      checkingSession: 'Beheersessie wordt gecontroleerd...',
      recentAlbums: 'Recente albums',
      hiddenRouteNote:
        'Deze route wordt niet publiek gedeeld en is alleen voor intern gebruik.',
      accessCodeLabel: 'Eventcode',
      copyCodeButton: 'Code kopieren',
      codeCopied: 'Eventcode is naar het klembord gekopieerd.',
      emailOnlyEntry: 'Alleen toegang via e-mail',
      guestEmails: 'Ingevoerde e-mailadressen',
      noGuestEmails: 'Er zijn nog geen e-mailregistraties voor dit evenement.',
      guestEmailTimeUnknown: 'Tijdstip onbekend',
    },
    upload: {
      badge: 'Upload door gasten',
      intro:
        'Gasten kunnen foto’s toevoegen aan dit gedeelde album. Media is bedoeld om na 48 uur op te schonen.',
      guidanceBadge: 'Uploadregels',
      guidanceTitle: 'Upload alleen media die gedeeld mag worden',
      guidanceIntro:
        'Door te uploaden bevestig je dat je dit vrijwillig doet en dat je de privacy van de aanwezigen respecteert.',
      guidancePoints: [
        'Upload alleen foto’s die je mag delen.',
        'Upload geen vernederende, beledigende, haatdragende, onwettige of privacy-schendende inhoud.',
        'In deze eerste versie worden alleen foto’s geaccepteerd; media wordt 48 uur bewaard en kan eerder worden verwijderd via de contactgegevens.',
      ],
      consentLabel:
        'Ik bevestig dat ik deze foto’s vrijwillig upload en mij aan de uploadregels houd.',
      consentHelp:
        'Zonder akkoord blijven bestandsselectie en upload uitgeschakeld.',
      consentRequired:
        'Bevestig eerst de uploadregels om verder te gaan.',
      consentLinks:
        'Door verder te gaan bevestig je ook dat je de gebruiksvoorwaarden en privacyinformatie hebt gelezen.',
      consentButton: 'Verdergaan',
      uploadLabel: 'Upload',
      namingLabel: 'Naamstructuur',
      namingText: 'Bestanden worden in mappen met datumindeling opgeslagen.',
      retentionLabel: 'Bewaartermijn',
      retentionText: 'Verlopen media wordt automatisch opgeruimd.',
      selectLabel: 'Kies media',
      selectButton: 'Bestanden kiezen',
      noFilesChosen: 'Nog geen bestand gekozen',
      readyPrefix: 'Klaar',
      photos: 'foto',
      videos: 'video',
      filesSelected: 'bestanden geselecteerd',
      unsupportedIgnored: 'niet-ondersteunde of video-bestanden genegeerd',
      photoTooLarge: 'foto boven limiet van 10 MB',
      videoTooLarge: 'video boven limiet van 50 MB',
      videoTooLong: 'video langer dan 20 seconden',
      selectionLimit: 'maximaal 10 bestanden per keer',
      chooseSupported: 'Kies een JPG-, PNG-, WEBP- of HEIC-foto.',
      chooseStart: 'Kies een foto om te beginnen.',
      eventNotFound: 'Dit evenement is niet gevonden. Controleer de link of QR-code.',
      eventNotReady: 'Dit evenement is nog niet klaar voor uploads.',
      uploadInProgress: 'Uploaden...',
      uploadComplete: 'Upload voltooid. Galerij wordt geopend...',
      uploadButton: 'Upload naar gedeeld album',
      uploadingButton: 'Uploaden...',
      clearSelection: 'Selectie wissen',
      viewGallery: 'Galerij bekijken',
      qrTitle: 'Delen via QR-code',
      qrText: 'Gasten kunnen via deze code dezelfde uploadpagina openen.',
      albumLink: 'Albumlink',
      selectionCleared: 'Selectie gewist.',
    },
    gallery: {
      badge: 'Gedeelde galerij',
      intro:
        'Bekijk uploads van gasten, maak een selectie en download wat je wilt bewaren voordat de termijn afloopt.',
      loading: 'Deze galerij wordt geladen...',
      noUploads: 'Er zijn nog geen actieve uploads zichtbaar in deze galerij.',
      showing: 'uploads zichtbaar',
      loadError: 'De galerij kon nu niet worden geladen.',
      notFound: 'Deze galerij is niet gevonden.',
      downloadAll: 'Download hele album',
      downloadingAll: 'Het hele album wordt gedownload...',
      allDownloaded: 'Alle media uit het album zijn gedownload.',
      downloadSelected: 'Selectie downloaden',
      backToUpload: 'Terug naar upload',
      selected: 'Geselecteerd',
      select: 'Selecteren',
      delete: 'Verwijderen',
      deleting: 'Bezig met verwijderen...',
      deleteConfirm: 'Weet je zeker dat je deze upload wilt verwijderen?',
      deleteSuccess: 'Upload verwijderd.',
      deleteError: 'Upload kon niet worden verwijderd.',
      share: 'Delen',
      shareSuccess: 'Deel-link is klaargezet.',
      shareCopied: 'Deel-link is naar het klembord gekopieerd.',
      shareError: 'Delen kon nu niet worden geopend.',
      download: 'Downloaden',
      downloaded: 'bestanden gedownload',
      chooseBeforeDownload: 'Selecteer eerst minstens één item.',
      uploadTimeUnavailable: 'Uploadtijd onbekend',
      photo: 'Foto',
      video: 'Video',
    },
    legal: {
      termsTitle: 'Gebruiksvoorwaarden',
      termsIntro:
        'Door dit evenementalbum te gebruiken ga je akkoord met de onderstaande regels.',
      termsSections: [
        {
          title: 'Verantwoordelijkheid voor inhoud',
          points: [
            'Je bevestigt dat je de foto’s en video’s die je upload mag delen.',
            'Je mag geen privacy-schendende, schokkende, haatdragende of onwettige inhoud uploaden.',
            'Ongeschikte inhoud kan zonder voorafgaande melding worden verwijderd.',
          ],
        },
        {
          title: 'Gebruik en systeemregels',
          points: [
            'EventDrop is bedoeld om bijdragen van deelnemers in één gedeeld evenementalbum te verzamelen.',
            'Bij misbruik, spam of schadelijke inhoud mag het systeem de toegang beperken.',
            'Een album kan tijdelijk of permanent worden gesloten als dat nodig is.',
          ],
        },
        {
          title: 'Bewaartermijn',
          points: [
            'Geüploade inhoud wordt standaard 48 uur na het evenement bewaard.',
            'Daarna kan de inhoud automatisch worden verwijderd.',
            'De organisator kan een andere bewaartermijn hebben ingesteld.',
          ],
        },
        {
          title: 'Aansprakelijkheidsuitsluiting',
          points: [
            'EventDrop is niet rechtstreeks verantwoordelijk voor inhoud die door gebruikers wordt geüpload.',
            'Bij technische storingen of gegevensverlies wordt geen garantie gegeven.',
          ],
        },
      ],
      privacyTitle: 'Privacyinformatie',
      privacyIntro:
        'Deze pagina legt uit hoe persoonsgegevens via EventDrop worden verwerkt.',
      privacySections: [
        {
          title: 'Verwerkte gegevens',
          points: [
            'Je e-mailadres wordt gebruikt om toegang tot het evenement te beheren en je indien nodig te kunnen bereiken.',
            'Geüploade foto’s en video’s worden opgeslagen in het album van het betreffende evenement.',
            'Technische gegevens zoals IP-adres, apparaatinformatie en logs kunnen tijdelijk worden bewaard voor beveiliging en foutopsporing.',
          ],
        },
        {
          title: 'Doel van gebruik',
          points: [
            'Gegevens worden alleen gebruikt om het evenementalbum beschikbaar te maken, delen mogelijk te maken en het systeem te beschermen.',
            'Gegevens worden niet voor marketingdoeleinden met derden gedeeld.',
          ],
        },
        {
          title: 'Bewaren en verwijderen',
          points: [
            'Media wordt standaard na 48 uur verwijderd.',
            'Technische logs worden beperkt bewaard en daarna automatisch verwijderd.',
          ],
        },
        {
          title: 'Rechten van gebruikers',
          points: [
            'Gebruikers kunnen verzoeken om verwijdering van geüploade inhoud.',
            'Op verzoek kunnen inzage, correctie of verwijdering van gegevens worden uitgevoerd.',
          ],
        },
        {
          title: 'Beveiliging',
          points: [
            'EventDrop neemt passende technische en organisatorische maatregelen om gegevens te beschermen.',
            'Volledige risicoloosheid van gegevensoverdracht via internet kan niet worden gegarandeerd.',
          ],
        },
      ],
      acknowledge: 'Ik heb dit gelezen en begrepen',
    },
  },
  en: {
    common: {
      contact: 'Contact',
      eventId: 'Event ID',
      eventDate: 'Event date',
      guestEntryPage: 'Guest entry',
      terms: 'Terms',
      privacy: 'Privacy',
      back: 'Back',
      uploadPage: 'Upload page',
      gallery: 'Gallery',
      copyUploadLink: 'Copy guest entry link',
      copyGalleryLink: 'Copy gallery link',
      deleteEvent: 'Delete event',
      signOut: 'Sign out',
      latestPublicAlbum: 'Open latest guest entry',
      restrictedAdmin: 'Restricted Admin',
      hiddenAdminAccess: 'Hidden admin access',
      hiddenAdminDescription:
        'This page is not linked from the public homepage. Use it to manage events, codes, and guest entry.',
      language: 'Language',
    },
    home: {
      badge: 'QR event album',
      title: 'Route QR guests into the right album with their own event code.',
      intro:
        'EventDrop keeps simultaneous events isolated and lets guests open only their own album with email and event code.',
      entryLabel: 'Secure guest entry',
      formTitle: 'Continue with email and event code',
      formIntro:
        'After scanning the QR code, enter your email address and the event code provided by the organizer.',
      emailLabel: 'Email address',
      codeLabel: 'Event code',
      accessButton: 'Enter album',
      accessHint: 'Enter your email and event code to continue.',
      accessGranted: 'Access confirmed. Opening the album...',
      accessError: 'No album was found for this event code.',
      emailRequired: 'Please enter a valid email address.',
      codeRequired: 'An event code is required.',
      checkingAccess: 'Checking code...',
      manualAccessHelp:
        'No QR code available? You can still enter your own album with email and event code.',
      prefilledEvent:
        'This link already belongs to a specific event. Enter your email and event code to continue.',
      prefilledEventEmailOnly:
        'This link already belongs to a specific event. Enter only your email to continue.',
      latestAlbumLabel: 'Guest entry',
      latestAlbumReady: 'Guest access is confirmed with an event code.',
      noAlbum:
        'Events are not publicly listed. Use an event code to continue.',
      uploadCta: 'Go to album',
      galleryCta: 'Open gallery',
      contactLabel: 'Contact',
      bestFor: 'Best for',
      bestForText:
        'Weddings, birthdays, company events, and one-day gatherings.',
      flowTitle: 'Public entry flow',
      flowText:
        'Guests arrive via QR, enter email and event code, and land only inside their own event album.',
      howItWorks: 'How it works',
      shareSite: 'Share this page',
      shareReady: 'Share sheet opened.',
      shareCopied: 'Site link copied to clipboard.',
      points: [
        'Every event gets its own event code',
        'Guests are checked through QR or a private link',
        'Photos stay inside the correct album',
        'Media is cleaned up after 48 hours',
      ],
      sections: [
        {
          title: 'Perfect for every event where moments are shared',
          body: [
            'Weddings, birthdays, corporate events, festivals, and private parties.',
            'Everyone takes photos. EventDrop brings all that content together in one shared album.',
            'Guests can upload their photos easily during the event, so everyone can reach different moments from one place and download the ones they want.',
          ],
        },
        {
          title: 'How EventDrop works',
          body: [
            'Every event has its own album and a unique event code.',
            'Users entering through QR continue instantly with only their email address.',
            'Users entering manually use both email and the event code.',
            'All photos are automatically collected in one tidy album created specifically for that event.',
          ],
        },
        {
          title: 'Why EventDrop',
          body: [
            'Photos taken during an event often get lost across different phones. With EventDrop, everything is gathered in one place so everyone can access and share it easily.',
            'All photos are delivered by email to the event owner on the day after the event.',
            'All guest media stays in one accessible place.',
            'Sharing with everyone who attended becomes simple.',
          ],
        },
        {
          title: 'Fast, simple, and frictionless',
          body: [
            'Uploading only takes a few seconds.',
            'No app or account is required.',
            'It works smoothly on all devices.',
          ],
        },
        {
          title: 'Secure and private',
          body: [
            'Every event has its own secure access.',
            'All files stay inside the correct album only.',
            'Only people connected to the event can get in.',
          ],
        },
      ],
      loading: 'Preparing guest entry...',
    },
    admin: {
      title: 'Hidden admin panel',
      loginPrompt: 'Enter the admin username and password.',
      username: 'Username',
      password: 'Password',
      unlock: 'Unlock panel',
      checking: 'Checking...',
      configuredHint:
        'Use the private username and password configured for this environment.',
      notConfigured: 'Admin login is not configured on the server yet.',
      unlocked: 'Admin panel unlocked.',
      signedOut: 'Signed out from the hidden admin panel.',
      passwordSection: 'Login verification and password',
      passwordSectionHelp:
        'Confirm the current password first, then set a new one for the hidden admin panel.',
      passwordSectionUnavailable:
        'Persistent password changes require the public.admin_credentials table in Supabase. If that table exists, the first change can use the current environment password.',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmNewPassword: 'Confirm new password',
      changePassword: 'Update password',
      savingPassword: 'Saving password...',
      passwordFieldsRequired: 'Fill in every password field first.',
      passwordMismatch: 'The new passwords must match.',
      passwordTooShort: 'The new password must be at least 8 characters.',
      passwordChangeSuccess: 'Admin password updated successfully.',
      passwordChangeError: 'Admin password could not be updated.',
      createTitle: 'Manage the latest public album from here.',
      eventName: 'Event name',
      albumName: 'Album name',
      accessCodeField: 'Generated event code',
      accessCodeHelp:
        'The code is generated automatically. You can edit or refresh it before creating the event.',
      eventCodeToggle: 'Use event code',
      eventCodeEnabledHelp:
        'When enabled, guests on the homepage and manual access use an event code.',
      eventCodeDisabledHelp:
        'When disabled, guests entering via QR or private link continue with email only.',
      toggleOn: 'On',
      toggleOff: 'Off',
      regenerateCode: 'Generate new code',
      coverImage: 'Event cover image',
      backgroundImage: 'Background image',
      uploadCover: 'Upload cover image',
      uploadBackground: 'Upload background image',
      mediaUploading: 'Uploading image...',
      mediaUploadError: 'Image upload failed.',
      createButton: 'Create event album',
      saving: 'Saving...',
      noEvents:
        'No events exist yet. Create the first album here and publish it on the homepage.',
      unlockToManage:
        'Unlock the panel first to list, create, or delete events.',
      qrLabel: 'Guest upload QR',
      uploadCopied: 'Upload link copied.',
      galleryCopied: 'Gallery link copied.',
      deleteConfirm:
        'Delete this event? Related uploads may also disappear depending on your database rules.',
      deleteSuccess: 'Event deleted successfully.',
      missingCredentials: 'Both username and password are required.',
      invalidCredentials: 'The username or password is incorrect.',
      loadError: 'Events could not be loaded.',
      createSuccess: 'Event album created successfully.',
      createError: 'Event could not be created.',
      deleteError: 'Event could not be deleted.',
      adminAccess: 'Admin access',
      enabled: 'Restricted mode enabled',
      checkingSession: 'Checking admin session...',
      recentAlbums: 'Recent albums',
      hiddenRouteNote:
        'This route is not publicly shared and is meant for internal access only.',
      accessCodeLabel: 'Event code',
      copyCodeButton: 'Copy code',
      codeCopied: 'Event code copied to clipboard.',
      emailOnlyEntry: 'Email-only access',
      guestEmails: 'Entered email addresses',
      noGuestEmails: 'No email entries have been recorded for this event yet.',
      guestEmailTimeUnknown: 'Entry time unavailable',
    },
    upload: {
      badge: 'Guest upload page',
      intro:
        'Guests can add photos to this shared album. Media is designed to be cleaned up after 48 hours.',
      guidanceBadge: 'Upload rules',
      guidanceTitle: 'Please upload only media that can be shared',
      guidanceIntro:
        'By uploading, you confirm that you are sharing this media voluntarily and that you will respect the privacy of everyone at the event.',
      guidancePoints: [
        'Only upload photos that you are allowed to share.',
        'Do not upload humiliating, abusive, hateful, illegal, or privacy-violating content.',
        'In this first version, only photos are accepted; media is kept for 48 hours and can be removed sooner via the contact details.',
      ],
      consentLabel:
        'I confirm that I am uploading these photos voluntarily and will follow the upload rules.',
      consentHelp:
        'File selection and upload stay disabled until you agree.',
      consentRequired:
        'Please confirm the upload rules before continuing.',
      consentLinks:
        'By continuing, you also confirm that you have read the terms and privacy notice.',
      consentButton: 'Continue',
      uploadLabel: 'Upload',
      namingLabel: 'Naming',
      namingText: 'Files are stored inside date-based folders.',
      retentionLabel: 'Retention',
      retentionText: 'Expired media is cleaned up automatically.',
      selectLabel: 'Select media',
      selectButton: 'Choose files',
      noFilesChosen: 'No files selected yet',
      readyPrefix: 'Ready',
      photos: 'photos',
      videos: 'videos',
      filesSelected: 'files selected',
      unsupportedIgnored: 'unsupported files or videos ignored',
      photoTooLarge: 'photo exceeds the 10 MB limit',
      videoTooLarge: 'video exceeds the 50 MB limit',
      videoTooLong: 'video exceeds 20 seconds',
      selectionLimit: 'you can choose up to 10 files at a time',
      chooseSupported: 'Choose a JPG, PNG, WEBP, or HEIC photo.',
      chooseStart: 'Choose a photo to get started.',
      eventNotFound: 'This event could not be found. Check the link or QR code.',
      eventNotReady: 'This event is not ready for uploads yet.',
      uploadInProgress: 'Uploading...',
      uploadComplete: 'Upload complete. Opening the gallery...',
      uploadButton: 'Upload to shared album',
      uploadingButton: 'Uploading...',
      clearSelection: 'Clear selection',
      viewGallery: 'View gallery',
      qrTitle: 'Share with QR code',
      qrText: 'Guests can scan this code to reach the same upload page.',
      albumLink: 'Album link',
      selectionCleared: 'Selection cleared.',
    },
    gallery: {
      badge: 'Shared gallery',
      intro:
        'Browse guest uploads, make a selection, and download what you want to keep before the retention window ends.',
      loading: 'Loading this event gallery...',
      noUploads: 'No active uploads are visible in this gallery yet.',
      showing: 'uploads visible',
      loadError: 'The gallery could not be loaded right now.',
      notFound: 'This event gallery could not be found.',
      downloadAll: 'Download full album',
      downloadingAll: 'Downloading the full album...',
      allDownloaded: 'All media in the album has been downloaded.',
      downloadSelected: 'Download selected',
      backToUpload: 'Back to upload',
      selected: 'Selected',
      select: 'Select',
      delete: 'Delete',
      deleting: 'Deleting...',
      deleteConfirm: 'Are you sure you want to delete this upload?',
      deleteSuccess: 'Upload deleted.',
      deleteError: 'Upload could not be deleted.',
      share: 'Share',
      shareSuccess: 'Share link is ready.',
      shareCopied: 'Share link copied to clipboard.',
      shareError: 'Sharing could not be opened right now.',
      download: 'Download',
      downloaded: 'files downloaded',
      chooseBeforeDownload: 'Choose at least one item before downloading.',
      uploadTimeUnavailable: 'Upload time unavailable',
      photo: 'Photo',
      video: 'Video',
    },
    legal: {
      termsTitle: 'Terms',
      termsIntro:
        'By using this event album, you agree to the rules below.',
      termsSections: [
        {
          title: 'Content responsibility',
          points: [
            'You confirm that you have the right to share the photos and videos you upload.',
            'You must not upload privacy-violating, abusive, hateful, or illegal content.',
            'Inappropriate content may be removed without prior notice.',
          ],
        },
        {
          title: 'Use and system rules',
          points: [
            'EventDrop is provided to collect participant contributions inside a single shared album.',
            'The system may restrict access when misuse, spam, or harmful content is detected.',
            'An album may be closed temporarily or permanently when necessary.',
          ],
        },
        {
          title: 'Retention period',
          points: [
            'Uploaded content is normally stored for 48 hours after the event.',
            'After that, content may be removed automatically.',
            'The organizer may have configured a different retention period.',
          ],
        },
        {
          title: 'Disclaimer',
          points: [
            'EventDrop is not directly responsible for content uploaded by users.',
            'No guarantee is provided in case of technical issues or data loss.',
          ],
        },
      ],
      privacyTitle: 'Privacy Notice',
      privacyIntro:
        'This page explains how personal data collected through EventDrop is handled.',
      privacySections: [
        {
          title: 'Collected data',
          points: [
            'Your email address is used to manage event access and contact you if needed.',
            'Uploaded photos and videos are stored inside the relevant event album.',
            'Technical data such as IP address, device information, and logs may be retained temporarily for security and troubleshooting.',
          ],
        },
        {
          title: 'Purpose of use',
          points: [
            'Collected data is only used to provide the event album, enable sharing, and protect the system.',
            'Data is not shared with third parties for marketing purposes.',
          ],
        },
        {
          title: 'Storage and deletion',
          points: [
            'Uploaded media is normally deleted after 48 hours.',
            'Technical logs are kept for a limited period and then removed automatically.',
          ],
        },
        {
          title: 'User rights',
          points: [
            'Users may request the removal of content they uploaded.',
            'Access, correction, or deletion requests can be handled upon request.',
          ],
        },
        {
          title: 'Security',
          points: [
            'EventDrop applies appropriate technical and organizational safeguards to protect data.',
            'However, completely risk-free transmission over the internet cannot be guaranteed.',
          ],
        },
      ],
      acknowledge: 'I have read and understood this',
    },
  },
}
