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
    points: string[]
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
    createTitle: string
    eventName: string
    albumName: string
    accessCodeField: string
    accessCodeHelp: string
    regenerateCode: string
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
}

export const translations: Record<Locale, TranslationTree> = {
  tr: {
    common: {
      contact: 'Iletisim',
      eventId: 'Etkinlik ID',
      eventDate: 'Etkinlik tarihi',
      guestEntryPage: 'Misafir girisi',
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
      points: [
        'Her etkinligin kendi ozel event code bilgisi vardir',
        'Misafirler QR veya link ile girer, kodla dogrulanir',
        'Fotograflar ve videolar sadece ilgili albumde toplanir',
        'Icerikler 48 saat sonra temizlenir',
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
      createTitle: 'Son public album burada yonetilir.',
      eventName: 'Etkinlik adi',
      albumName: 'Album adi',
      accessCodeField: 'Olusacak event code',
      accessCodeHelp:
        'Kod otomatik uretilir. Istersen olusturmadan once degistirebilir veya yenileyebilirsin.',
      regenerateCode: 'Yeni kod uret',
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
    },
    upload: {
      badge: 'Misafir yukleme sayfasi',
      intro:
        'Misafirler bu ortak albume fotograf ve kisa video ekleyebilir. Icerikler 48 saat sonra temizlenmek uzere tasarlanmistir.',
      guidanceBadge: 'Yukleme kurallari',
      guidanceTitle: 'Lutfen sadece paylasilmasi uygun icerik yukleyin',
      guidanceIntro:
        'Yukleme yaparak bu icerikleri kendi isteginle paylastigini ve etkinlikte yer alan kisilerin mahremiyetine saygi gosterecegini onaylarsin.',
      guidancePoints: [
        'Sadece paylasma hakkin olan fotograf ve videolari yukle.',
        'Kucuk dusurucu, ayipli, nefret iceren, yasa disi veya baskasinin gizliligini ihlal eden icerik yukleme.',
        'Medya 48 saat saklanir; kaldirma talebi icin iletisim bilgilerini kullanabilirsin.',
      ],
      consentLabel:
        'Bu medyayi kendi istegimle yukledigimi ve yukleme kurallarina uyacagimi onayliyorum.',
      consentHelp:
        'Onay vermeden dosya secimi ve yukleme acilmaz.',
      consentRequired:
        'Devam etmek icin once yukleme kurallarini onayla.',
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
      unsupportedIgnored: 'desteklenmeyen dosya yok sayildi',
      chooseSupported: 'JPG, PNG, WEBP, HEIC, MP4, MOV veya WEBM sec.',
      chooseStart: 'Baslamak icin fotograf veya video sec.',
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
  },
  nl: {
    common: {
      contact: 'Contact',
      eventId: 'Evenement-ID',
      eventDate: 'Evenementdatum',
      guestEntryPage: 'Gasttoegang',
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
      points: [
        'Elk evenement krijgt een eigen eventcode',
        'Gasten worden via QR of link gecontroleerd',
        'Foto’s en video’s blijven binnen het juiste album',
        'Inhoud wordt na 48 uur opgeruimd',
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
      createTitle: 'Hier beheer je het nieuwste publieke album.',
      eventName: 'Naam van het evenement',
      albumName: 'Naam van het album',
      accessCodeField: 'Eventcode',
      accessCodeHelp:
        'De code wordt automatisch gemaakt. Je kunt hem voor het opslaan aanpassen of vernieuwen.',
      regenerateCode: 'Nieuwe code',
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
    },
    upload: {
      badge: 'Upload door gasten',
      intro:
        'Gasten kunnen foto’s en korte video’s toevoegen aan dit gedeelde album. Media is bedoeld om na 48 uur op te schonen.',
      guidanceBadge: 'Uploadregels',
      guidanceTitle: 'Upload alleen media die gedeeld mag worden',
      guidanceIntro:
        'Door te uploaden bevestig je dat je dit vrijwillig doet en dat je de privacy van de aanwezigen respecteert.',
      guidancePoints: [
        'Upload alleen foto’s en video’s die je mag delen.',
        'Upload geen vernederende, beledigende, haatdragende, onwettige of privacy-schendende inhoud.',
        'Media wordt 48 uur bewaard; gebruik de contactgegevens als iets eerder verwijderd moet worden.',
      ],
      consentLabel:
        'Ik bevestig dat ik deze media vrijwillig upload en mij aan de uploadregels houd.',
      consentHelp:
        'Zonder akkoord blijven bestandsselectie en upload uitgeschakeld.',
      consentRequired:
        'Bevestig eerst de uploadregels om verder te gaan.',
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
      unsupportedIgnored: 'niet-ondersteunde bestanden genegeerd',
      chooseSupported: 'Kies JPG, PNG, WEBP, HEIC, MP4, MOV of WEBM.',
      chooseStart: 'Kies een foto of video om te beginnen.',
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
  },
  en: {
    common: {
      contact: 'Contact',
      eventId: 'Event ID',
      eventDate: 'Event date',
      guestEntryPage: 'Guest entry',
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
      points: [
        'Every event gets its own event code',
        'Guests are checked through QR or a private link',
        'Photos and videos stay inside the correct album',
        'Media is cleaned up after 48 hours',
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
      createTitle: 'Manage the latest public album from here.',
      eventName: 'Event name',
      albumName: 'Album name',
      accessCodeField: 'Generated event code',
      accessCodeHelp:
        'The code is generated automatically. You can edit or refresh it before creating the event.',
      regenerateCode: 'Generate new code',
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
    },
    upload: {
      badge: 'Guest upload page',
      intro:
        'Guests can add photos and short videos to this shared album. Media is designed to be cleaned up after 48 hours.',
      guidanceBadge: 'Upload rules',
      guidanceTitle: 'Please upload only media that can be shared',
      guidanceIntro:
        'By uploading, you confirm that you are sharing this media voluntarily and that you will respect the privacy of everyone at the event.',
      guidancePoints: [
        'Only upload photos and videos that you are allowed to share.',
        'Do not upload humiliating, abusive, hateful, illegal, or privacy-violating content.',
        'Media is kept for 48 hours; use the contact details if something should be removed sooner.',
      ],
      consentLabel:
        'I confirm that I am uploading this media voluntarily and will follow the upload rules.',
      consentHelp:
        'File selection and upload stay disabled until you agree.',
      consentRequired:
        'Please confirm the upload rules before continuing.',
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
      unsupportedIgnored: 'unsupported files ignored',
      chooseSupported: 'Choose JPG, PNG, WEBP, HEIC, MP4, MOV, or WEBM files.',
      chooseStart: 'Choose a photo or video to get started.',
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
  },
}
