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
  }
  upload: {
    badge: string
    intro: string
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
      uploadPage: 'Yukleme sayfasi',
      gallery: 'Galeri',
      copyUploadLink: 'Yukleme linkini kopyala',
      copyGalleryLink: 'Galeri linkini kopyala',
      deleteEvent: 'Etkinligi sil',
      signOut: 'Cikis yap',
      latestPublicAlbum: 'Son public albume git',
      restrictedAdmin: 'Kisitli Yonetim',
      hiddenAdminAccess: 'Gizli yonetim erisimi',
      hiddenAdminDescription:
        'Bu sayfa public anasayfada baglanmaz. Buradan son public albumu yonetebilirsin.',
      language: 'Dil',
    },
    home: {
      badge: 'QR ile etkinlik albumu',
      title: 'Son olusturulan ortak album artik misafir yuklemelerine hazir.',
      intro:
        'EventDrop, misafirlerin tek bir ortak albumde fotograflarini ve videolarini kolayca toplar.',
      latestAlbumLabel: 'Canli album',
      latestAlbumReady: 'Son olusturulan album su anda misafir yuklemeleri icin acik.',
      noAlbum:
        'Henuz aktif bir album yok. Admin yeni bir album olusturdugunda yukleme butonu burada gorunecek.',
      uploadCta: 'Fotograf veya video yukle',
      galleryCta: 'Galeriyi ac',
      contactLabel: 'Iletisim',
      bestFor: 'En uygun kullanim',
      bestForText:
        'Dugunler, dogum gunleri, sirket etkinlikleri ve tek gunluk bulusmalar icin tasarlandi.',
      flowTitle: 'Public giris akisi',
      flowText:
        'Misafirler anasayfadan son albumu acar, dogrudan yukleme ekranina gider ve ayni galeride bulusur.',
      howItWorks: 'Nasil calisir',
      points: [
        'Misafirler tek bir QR kod ile katilir',
        'Fotograflar ve videolar tek ortak albumde toplanir',
        'Indirmek ve paylasmak kolay kalir',
        'Icerikler 48 saat sonra temizlenir',
      ],
      loading: 'Son ortak album aranıyor...',
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
    },
    upload: {
      badge: 'Misafir yukleme sayfasi',
      intro:
        'Misafirler bu ortak albume fotograf ve kisa video ekleyebilir. Icerikler 48 saat sonra temizlenmek uzere tasarlanmistir.',
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
      uploadPage: 'Uploadpagina',
      gallery: 'Galerij',
      copyUploadLink: 'Uploadlink kopieren',
      copyGalleryLink: 'Galerijlink kopieren',
      deleteEvent: 'Evenement verwijderen',
      signOut: 'Uitloggen',
      latestPublicAlbum: 'Open laatste publieke album',
      restrictedAdmin: 'Beheerderszone',
      hiddenAdminAccess: 'Verborgen beheer',
      hiddenAdminDescription:
        'Deze pagina staat niet op de openbare homepage. Hier beheer je het laatste publieke album.',
      language: 'Taal',
    },
    home: {
      badge: 'QR-eventalbum',
      title: 'Het nieuwste gedeelde album staat klaar voor gasten.',
      intro:
        'EventDrop verzamelt foto’s en video’s van gasten in een gedeeld album dat snel en helder aanvoelt.',
      latestAlbumLabel: 'Live album',
      latestAlbumReady: 'Het laatst aangemaakte album staat nu open voor uploads van gasten.',
      noAlbum:
        'Er is nog geen actief album. Zodra de beheerder er een maakt, verschijnt de uploadknop hier.',
      uploadCta: 'Foto’s of video’s uploaden',
      galleryCta: 'Galerij openen',
      contactLabel: 'Contact',
      bestFor: 'Ideaal voor',
      bestForText:
        'Bruiloften, verjaardagen, bedrijfsevents en eendaagse bijeenkomsten.',
      flowTitle: 'Publieke instroom',
      flowText:
        'Gasten starten op de homepage, openen het nieuwste album en uploaden direct naar dezelfde galerij.',
      howItWorks: 'Zo werkt het',
      points: [
        'Gasten doen mee via een enkele QR-scan',
        'Foto’s en video’s komen samen in één album',
        'Downloaden en delen blijft eenvoudig',
        'Inhoud wordt na 48 uur opgeruimd',
      ],
      loading: 'Nieuwste gedeelde album wordt geladen...',
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
    },
    upload: {
      badge: 'Upload door gasten',
      intro:
        'Gasten kunnen foto’s en korte video’s toevoegen aan dit gedeelde album. Media is bedoeld om na 48 uur op te schonen.',
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
      uploadPage: 'Upload page',
      gallery: 'Gallery',
      copyUploadLink: 'Copy upload link',
      copyGalleryLink: 'Copy gallery link',
      deleteEvent: 'Delete event',
      signOut: 'Sign out',
      latestPublicAlbum: 'Open latest public album',
      restrictedAdmin: 'Restricted Admin',
      hiddenAdminAccess: 'Hidden admin access',
      hiddenAdminDescription:
        'This page is not linked from the public homepage. Use it to manage the latest public album.',
      language: 'Language',
    },
    home: {
      badge: 'QR event album',
      title: 'The newest shared album is ready for guests.',
      intro:
        'EventDrop gathers guest photos and videos into one shared album with a clean, mobile-first flow.',
      latestAlbumLabel: 'Live album',
      latestAlbumReady: 'The latest created album is now open for guest uploads.',
      noAlbum:
        'There is no active album yet. As soon as the admin creates one, the upload button will appear here.',
      uploadCta: 'Upload photos or videos',
      galleryCta: 'Open gallery',
      contactLabel: 'Contact',
      bestFor: 'Best for',
      bestForText:
        'Weddings, birthdays, company events, and one-day gatherings.',
      flowTitle: 'Public entry flow',
      flowText:
        'Guests start from the homepage, open the latest album, and upload directly into the shared gallery.',
      howItWorks: 'How it works',
      points: [
        'Guests join with one QR scan',
        'Photos and videos land in one shared album',
        'Downloading and sharing stays simple',
        'Media is cleaned up after 48 hours',
      ],
      loading: 'Looking for the latest shared album...',
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
    },
    upload: {
      badge: 'Guest upload page',
      intro:
        'Guests can add photos and short videos to this shared album. Media is designed to be cleaned up after 48 hours.',
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
      download: 'Download',
      downloaded: 'files downloaded',
      chooseBeforeDownload: 'Choose at least one item before downloading.',
      uploadTimeUnavailable: 'Upload time unavailable',
      photo: 'Photo',
      video: 'Video',
    },
  },
}
