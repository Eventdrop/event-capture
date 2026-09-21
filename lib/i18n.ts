export type Locale = 'tr' | 'nl' | 'en' | 'de' | 'fr'

export const locales: Locale[] = ['nl', 'en', 'de', 'fr', 'tr']

export const localeLabels: Record<Locale, string> = {
  tr: 'TR',
  nl: 'NL',
  en: 'EN',
  de: 'DE',
  fr: 'FR',
}

export const customerThemeTranslations = {
  nl: {
    guestbook: 'Gastenboek', title: 'Jullie gastenboek', language: 'Taal',
    instruction: 'Kies hieronder het ontwerp voor jullie gastenboek.',
    choose: 'Kies dit thema', confirmation: '✓ {theme} is gekozen',
    info: 'Namen en datum worden automatisch aangepast aan jullie evenement.',
    wedding: 'Bruiloft', party: 'Feest', selected: 'Gekozen', preview: 'Voorbeeld',
    loading: 'Even laden...', saving: 'Opslaan...',
    invalidLink: 'Deze link is ongeldig of verlopen. Vraag een nieuwe link aan.',
    invalidTheme: 'Kies een beschikbaar thema.', error: 'Het thema kon niet worden geladen of opgeslagen. Probeer het opnieuw.',
  },
  en: {
    guestbook: 'Guestbook', title: 'Your guestbook', language: 'Language',
    instruction: 'Choose the design for your guestbook below.',
    choose: 'Choose this theme', confirmation: '✓ {theme} has been chosen',
    info: 'Names and date are automatically adapted to your event.',
    wedding: 'Wedding', party: 'Party', selected: 'Chosen', preview: 'Preview',
    loading: 'Loading...', saving: 'Saving...',
    invalidLink: 'This link is invalid or has expired. Please request a new link.',
    invalidTheme: 'Choose an available theme.', error: 'The theme could not be loaded or saved. Please try again.',
  },
  de: {
    guestbook: 'Gästebuch', title: 'Euer Gästebuch', language: 'Sprache',
    instruction: 'Wählt unten das Design für euer Gästebuch.',
    choose: 'Dieses Design wählen', confirmation: '✓ {theme} wurde gewählt',
    info: 'Namen und Datum werden automatisch an eure Veranstaltung angepasst.',
    wedding: 'Hochzeit', party: 'Party', selected: 'Gewählt', preview: 'Vorschau',
    loading: 'Wird geladen...', saving: 'Wird gespeichert...',
    invalidLink: 'Dieser Link ist ungültig oder abgelaufen. Bitte fordert einen neuen Link an.',
    invalidTheme: 'Wählt ein verfügbares Design.', error: 'Das Design konnte nicht geladen oder gespeichert werden. Bitte versucht es erneut.',
  },
  fr: {
    guestbook: "Livre d’or", title: "Votre livre d’or", language: 'Langue',
    instruction: 'Choisissez ci-dessous le design de votre livre d’or.',
    choose: 'Choisir ce thème', confirmation: '✓ {theme} a été choisi',
    info: 'Les noms et la date sont automatiquement adaptés à votre événement.',
    wedding: 'Mariage', party: 'Fête', selected: 'Choisi', preview: 'Aperçu',
    loading: 'Chargement...', saving: 'Enregistrement...',
    invalidLink: 'Ce lien est invalide ou a expiré. Veuillez demander un nouveau lien.',
    invalidTheme: 'Choisissez un thème disponible.', error: 'Le thème n’a pas pu être chargé ou enregistré. Veuillez réessayer.',
  },
  tr: {
    guestbook: 'Anı defteri', title: 'Anı defteriniz', language: 'Dil',
    instruction: 'Anı defteriniz için aşağıdan bir tasarım seçin.',
    choose: 'Bu temayı seç', confirmation: '✓ {theme} seçildi',
    info: 'İsimler ve tarih etkinliğinize göre otomatik olarak uyarlanır.',
    wedding: 'Düğün', party: 'Parti', selected: 'Seçildi', preview: 'Önizleme',
    loading: 'Yükleniyor...', saving: 'Kaydediliyor...',
    invalidLink: 'Bu bağlantı geçersiz veya süresi dolmuş. Lütfen yeni bir bağlantı isteyin.',
    invalidTheme: 'Kullanılabilir bir tema seçin.', error: 'Tema yüklenemedi veya kaydedilemedi. Lütfen tekrar deneyin.',
  },
} satisfies Record<Locale, Record<string, string>>

export function resolveCustomerThemeLocale(saved: string | null, languages: readonly string[]): Locale {
  if (locales.includes(saved as Locale)) return saved as Locale
  for (const language of languages) {
    const code = language.toLowerCase().split(/[-_]/)[0] as Locale
    if (locales.includes(code)) return code
  }
  return 'nl'
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
    posterHeadline: string
    posterAccent: string
    posterEyebrow: string
    posterSubline: string
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
    marketingConsentLabel: string
    marketingConsentHelp: string
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
    openClose: string
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
    eventsTab: string
    demoTemplatesTab: string
    createTitle: string
    settingsGeneral: string
    settingsBrandingMedia: string
    settingsFeatures: string
    settingsAccessSharing: string
    settingsDownloadsExports: string
    settingsDangerZone: string
    selectedAlbumLabel: string
    publicSlugLabel: string
    photostripBackground: string
    photostripBackgroundHelp: string
    changeFile: string
    chooseFile: string
    openAction: string
    copyAction: string
    guestLinkLabel: string
    dangerAction: string
    eventName: string
    demoTemplateName: string
    demoTemplateNamePlaceholder: string
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
    posterTemplateImage: string
    storyTemplateImage: string
    uploadCover: string
    uploadBackground: string
    uploadPosterTemplate: string
    uploadStoryTemplate: string
    updateCover: string
    updateBackground: string
    updatePosterTemplate: string
    updateStoryTemplate: string
    visualsSection: string
    visualsHelp: string
    visualReady: string
    visualMissing: string
    visualSaved: string
    eventDetails: string
    saveEventDetails: string
    eventDetailsSaved: string
    eventDetailsSaveError: string
    mediaUploading: string
    mediaUploadError: string
    createButton: string
    createDemoTemplateButton: string
    saving: string
    noEvents: string
    noDemoTemplates: string
    unlockToManage: string
    qrLabel: string
    downloadQrPng: string
    downloadQrSvg: string
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
    guestEmailSummary: string
    copyGuestEmails: string
    guestEmailsCopied: string
    showGuestEmails: string
    noGuestEmails: string
    guestEmailTimeUnknown: string
    publicTools: string
    shareEnabled: string
    downloadEnabled: string
    albumDownloadEnabled: string
    deleteEnabled: string
    posterEnabled: string
    saveVisibility: string
    visibilitySaved: string
    visibilitySaveError: string
    editAction: string
    createDemoFromTemplate: string
    demoCloneAction: string
    demoCloneTitle: string
    demoCloneIntro: string
    demoCustomerName: string
    demoCustomerPlaceholder: string
    demoCreate: string
    demoCreated: string
    demoNameRequired: string
    demoOpenUpload: string
    demoOpenGallery: string
    demoCopyLink: string
    liveOpen: string
    liveCopyLink: string
    liveCopied: string
    liveEnable: string
    liveDisable: string
    comingSoon: string
    guestbookCoverPhoto: string
    guestbookCoverPhotoActive: string
    guestbookCoverPhotoEmpty: string
    guestbookCoverPhotoFallback: string
    guestbookCoverPhotoHelp: string
    guestbookCoverPhotoRemove: string
    guestbookCoverPhotoReplace: string
    guestbookCoverPhotoUpload: string
    guestbookLabel: string
    guestbookMessagesEmpty: string
    guestbookMessagesSummary: string
    guestbookMessagesTitle: string
    guestbookMessageCancel: string
    guestbookMessageDelete: string
    guestbookMessageDeleteConfirm: string
    guestbookMessageDeleted: string
    guestbookMessageDeleteError: string
    guestbookMessageEdit: string
    guestbookMessageNamePlaceholder: string
    guestbookMessageSave: string
    guestbookMessageSaved: string
    guestbookMessageSaveError: string
    guestbookPdfPreviewHelp: string
    guestbookPdfStyle: string
    guestbookPdfThemeComingSoon: string
    guestbookPdfThemeComingSoonButton: string
    guestbookPhotoSource: string
    downloadGuestbookPdf: string
    noGuestbookMessages: string
    refreshGuestbook: string
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
    uploadNeedsConsent: string
    consentLinks: string
    consentButton: string
    uploadLabel: string
    namingLabel: string
    namingText: string
    retentionLabel: string
    retentionText: string
    selectLabel: string
    selectButton: string
    defaultAlbumName: string
    guestbookPhotoLabel: string
    guestbookPhotoHelp: string
    guestbookPhotoSelected: string
    shareSectionTitle: string
    guestbookPostError: string
    uploadEnvironmentError: string
    uploadFailedFallback: string
    heicConversionFailed: string
    photoOnlyNotice: string
    guestbookHint: string
    guestbookCardTitle: string
    guestbookCardDescription: string
    guestNameLabel: string
    guestNamePlaceholder: string
    messageLabel: string
    messagePlaceholder: string
    messageHelp: string
    messageLimitReached: string
    noFilesChosen: string
    readyPrefix: string
    photos: string
    filesSelected: string
    unsupportedIgnored: string
    photoTooLarge: string
    photoBadRatio: string
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
    keepLinkButton: string
    keepLinkText: string
    keepLinkReady: string
    keepLinkCopied: string
    keepLinkError: string
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
    downloadAlbumPackage: string
    downloadingAll: string
    downloadingSelected: string
    downloadPreparing: string
    allDownloaded: string
    downloadSelected: string
    albumPackageReady: string
    albumPackageNotice: string
    albumPackageLabel: string
    backToUpload: string
    posterButton: string
    posterPreparing: string
    posterChoose: string
    designPreview: string
    memoryPosterTitle: string
    photostripCreating: string
    photostripReady: string
    designChooseFormat: string
    designChooseMode: string
    designChoosePosterMode: string
    designChooseStoryMode: string
    designPosterActive: string
    designStoryActive: string
    designSelected: string
    designLimitReached: string
    designPortraitLimitReached: string
    designLandscapeLimitReached: string
    designChangeFormat: string
    designSwitchConfirm: string
    designCreate: string
    designPortraitFitsBetter: string
    designLandscapeFitsBetter: string
    designOrientationPending: string
    designNeutralDisabled: string
    designMixedHint: string
    designMixedIncomplete: string
    designPortraitCount: string
    designLandscapeCount: string
    clearSelection: string
    posterPortraitMode: string
    posterLandscapeMode: string
    posterMixedMode: string
    posterLimitReached: string
    posterMoreNeeded: string
    posterLimitExceeded: string
    posterExtraIgnored: string
    posterBlackWhite: string
    posterStyleTitle: string
    posterStyleDescription: string
    posterColorOption: string
    posterBlackWhiteOption: string
    storyOption: string
    storyButton: string
    storyPortraitMode: string
    storyLandscapeMode: string
    storyPreparing: string
    storyReady: string
    photostripShortage: string
    cancel: string
    posterHorizontalTip: string
    posterLimitPopup: string
    posterRatioPopup: string
    posterNoUsablePhotos: string
    posterReady: string
    guestMessageLabel: string
    selected: string
    select: string
    openPreview: string
    closePreview: string
    previousPhoto: string
    nextPhoto: string
    delete: string
    deleting: string
    deleteSelected: string
    deleteSelectedConfirm: string
    deleteSelectedSuccess: string
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
    selectionLimitReached: string
    uploadTimeUnavailable: string
    photo: string
    videoMessagesTab: string
    videoEmpty: string
    videoLoading: string
    videoGalleryError: string
    videoPlaybackError: string
    videoRefresh: string
    videoPrevious: string
    videoNext: string
    photosTab: string
    guestbookTab: string
    designsTab: string
    downloadsTab: string
    guestbookTitle: string
    guestbookFormTitle: string
    guestbookNameLabel: string
    guestbookMessageLabel: string
    guestbookMessagePlaceholder: string
    guestbookSubmit: string
    guestbookSubmitting: string
    guestbookSubmitSuccess: string
    guestbookSubmitError: string
    guestbookMessageRequired: string
    guestbookMessageTooLong: string
    guestbookEmptyTitle: string
    guestbookEmptyText: string
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

const baseTranslations: Record<'tr' | 'nl' | 'en', TranslationTree> = {
  tr: {
    common: {
      contact: 'İletişim',
      eventId: 'Etkinlik ID',
      eventDate: 'Etkinlik tarihi',
      guestEntryPage: 'Misafir yükleme sayfası',
      terms: 'Kullanım şartları',
      privacy: 'Gizlilik',
      back: 'Geri dön',
      uploadPage: 'Yükleme sayfası',
      gallery: 'Galeri',
      copyUploadLink: 'Misafir giris linkini kopyala',
      copyGalleryLink: 'Galeri linkini kopyala',
      deleteEvent: 'Etkinligi sil',
      signOut: 'Çıkış yap',
      latestPublicAlbum: 'Son misafir girişini aç',
      restrictedAdmin: 'Kısıtlı Yönetim',
      hiddenAdminAccess: 'Gizli yönetim erişimi',
      hiddenAdminDescription:
        'Bu sayfa herkese açık anasayfada bağlanmaz. Buradan etkinlikleri, kodları ve misafir girişlerini yönetebilirsin.',
      language: 'Dil',
    },
    home: {
      badge: 'QR ile etkinlik albümü',
      title: 'QR ile gelen misafirleri kendi etkinlik kodlarıyla doğru albüme yönlendir.',
      intro:
        'EventDrop, aynı anda birden fazla etkinliği ayrı tutar ve misafirleri e-posta ile etkinlik kodu kullanarak kendi albümlerine alır.',
      entryLabel: 'Güvenli misafir girişi',
      posterHeadline: 'ANILARINI',
      posterAccent: 'paylaş',
      posterEyebrow: 'Tara. Yükle. Tamam.',
      posterSubline: 'Tüm etkinlik anıları tek yerde.',
      formTitle: 'E-posta ve etkinlik kodu ile devam et',
      formIntro:
        'QR kodu okuttuktan sonra e-postanı ve organizatörden aldığın etkinlik kodunu gir.',
      emailLabel: 'E-posta adresi',
      codeLabel: 'Etkinlik kodu',
      accessButton: 'Albüme gir',
      accessHint: 'Devam etmek için e-posta ve etkinlik kodu gir.',
      accessGranted: 'Erişim onaylandı. Albüm açılıyor...',
      accessError: 'Bu etkinlik kodu ile albüm bulunamadı.',
      emailRequired: 'Lütfen geçerli bir e-posta adresi gir.',
      codeRequired: 'Etkinlik kodu gerekli.',
      checkingAccess: 'Kod kontrol ediliyor...',
      manualAccessHelp:
        'QR kodun yoksa e-posta ve etkinlik kodu ile yine kendi albümüne girebilirsin.',
      prefilledEvent:
        'Bu bağlantı belirli bir etkinliğe ait. Devam etmek için sadece e-posta ve etkinlik kodu girmen yeterli.',
      prefilledEventEmailOnly:
        'Bu bağlantı belirli bir etkinliğe ait. Devam etmek için sadece e-posta girmen yeterli.',
      marketingConsentLabel:
        "Evet, EventDrop Sharing ve Photobooth Holland'dan zaman zaman e-posta ile haberler, ilham veren içerikler ve teklifler almak istiyorum.",
      marketingConsentHelp: 'İstediğiniz zaman abonelikten çıkabilirsiniz.',
      latestAlbumLabel: 'Misafir girişi',
      latestAlbumReady: 'Misafir girişi etkinlik kodu ile doğrulanır.',
      noAlbum:
        'Etkinlikler herkese açık olarak listelenmez. Devam etmek için etkinlik kodu kullan.',
      uploadCta: 'Albüme git',
      galleryCta: 'Galeriyi aç',
      contactLabel: 'İletişim',
      bestFor: 'En uygun kullanım',
      bestForText:
        'Düğünler, doğum günleri, şirket etkinlikleri ve tek günlük buluşmalar için tasarlandı.',
      flowTitle: 'Herkese açık giriş akışı',
      flowText:
        'Misafir QR ile gelir, e-posta ve etkinlik kodu girer, sadece kendi etkinlik albümüne yönlenir.',
      howItWorks: 'Nasıl çalışır',
      shareSite: 'Sayfayı paylaş',
      shareReady: 'Paylaşım ekranı açıldı.',
      shareCopied: 'Site linki panoya kopyalandı.',
      points: [
        'Her etkinliğin kendi özel etkinlik kodu vardır',
        'Misafirler QR veya link ile girer, kodla doğrulanır',
        'Fotoğraflar sadece ilgili albümde toplanır',
        'Albüm ve fotoğraf silme işlemleri admin tarafından manuel yapılır',
      ],
      sections: [
        {
          title: 'Anıların paylaşıldığı her türlü etkinlik için mükemmel',
          body: [
            'Düğünler, doğum günleri, kurumsal etkinlikler, festivaller ve özel partiler.',
            'Herkes fotoğraf çeker. EventDrop tüm bu içerikleri tek bir ortak albümde bir araya getirir.',
            'Konuklar etkinlik boyunca çektikleri fotoğrafları kolayca yükler. Böylece herkes etkinliğin farklı anlarına tek bir yerden erişebilir ve dilediği içerikleri indirebilir.',
          ],
        },
        {
          title: 'EventDrop nasıl çalışır',
          body: [
            'Her etkinliğin kendine ait bir albümü ve benzersiz bir etkinlik kodu vardır.',
            'QR ile giriş yapan kullanıcılar sadece e-posta adreslerini girerek anında devam eder.',
            'Manuel giriş yapan kullanıcılar ise e-posta ve etkinlik kodu ile erişim sağlar.',
            'Tüm fotoğraflar, etkinliğe özel oluşturulmuş tek bir düzenli albümde otomatik olarak toplanır.',
          ],
        },
        {
          title: 'Neden EventDrop',
          body: [
            'Etkinlikte çekilen fotoğraflar çoğu zaman telefonlarda kaybolur. EventDrop ile tüm içerikler tek bir yerde toplanır, herkes kolayca erişebilir ve paylaşabilir.',
            'Tüm fotoğraflar etkinlik sonrasında ertesi gün etkinlik sahibine e-posta yolu ile iletilir.',
            'Konuklarınızın tüm görüntüleri tek bir yerde, anında erişilebilir.',
            'Etkinliğe katılan herkesle paylaşmak son derece kolaydır.',
          ],
        },
        {
          title: 'Hizli, basit ve sorunsuz',
          body: [
            'Yükleme sadece birkaç saniye sürer.',
            'Herhangi bir uygulama veya hesap gerektirmez.',
            'Tüm cihazlarda sorunsuz çalışır.',
          ],
        },
        {
          title: 'Güvenli ve özel',
          body: [
            'Her etkinliğin kendine özel güvenli erişimi vardır.',
            'Tüm dosyalar yalnızca ilgili albümde saklanır.',
            'Sadece etkinliğe katılan kişiler erişim sağlayabilir.',
          ],
        },
      ],
      loading: 'Misafir girişi hazırlanıyor...',
    },
    admin: {
      title: 'Gizli yönetim paneli',
      loginPrompt: 'Admin kullanıcı adını ve şifreni gir.',
      openClose: 'Aç/kapat',
      username: 'Kullanıcı adı',
      password: 'Şifre',
      unlock: 'Paneli aç',
      checking: 'Kontrol ediliyor...',
      configuredHint:
        'Bu ortam icin tanimlanan gizli kullanici adi ve sifre ile giris yap.',
      notConfigured: 'Sunucuda admin girisi henuz ayarlanmamis.',
      unlocked: 'Yönetim paneli açıldı.',
      signedOut: 'Gizli yönetim panelinden çıkış yapıldı.',
      passwordSection: 'Giriş doğrulama ve şifre',
      passwordSectionHelp:
        'Admin girişini daha güvenli hale getirmek için mevcut şifreyi doğrulayıp yeni şifre belirleyebilirsin.',
      passwordSectionUnavailable:
        'Kalıcı şifre değişikliği için Supabase üzerinde public.admin_credentials tablosu gerekli. Tablo varsa ilk şifre değişikliği mevcut ortam şifresi ile yapılabilir.',
      currentPassword: 'Mevcut şifre',
      newPassword: 'Yeni şifre',
      confirmNewPassword: 'Yeni şifre tekrar',
      changePassword: 'Şifreyi güncelle',
      savingPassword: 'Şifre kaydediliyor...',
      passwordFieldsRequired: 'Şifre değişikliği için tüm alanları doldur.',
      passwordMismatch: 'Yeni sifreler birbiriyle ayni olmali.',
      passwordTooShort: 'Yeni sifre en az 8 karakter olmali.',
      passwordChangeSuccess: 'Admin şifresi başarıyla güncellendi.',
      passwordChangeError: 'Admin şifresi güncellenemedi.',
      eventsTab: 'Etkinlikler',
      demoTemplatesTab: "Master Demo'lar",
      createTitle: 'Son herkese açık albüm burada yönetilir.',
      settingsGeneral: 'Genel',
      settingsBrandingMedia: 'Marka & medya',
      settingsFeatures: 'Özellikler',
      settingsAccessSharing: 'Erişim & paylaşım',
      settingsDownloadsExports: 'İndirmeler & dışa aktarma',
      settingsDangerZone: 'Tehlikeli işlemler',
      selectedAlbumLabel: 'Seçili albüm',
      publicSlugLabel: 'Herkese açık slug',
      photostripBackground: 'Photostrip arka planı',
      photostripBackgroundHelp: 'Önerilen: 1080 × 1920 px (9:16)',
      changeFile: 'Dosyayı değiştir',
      chooseFile: 'Dosya seç',
      openAction: 'Aç',
      copyAction: 'Kopyala',
      guestLinkLabel: 'Misafir linki',
      dangerAction: 'Tehlikeli işlem',
      eventName: 'Etkinlik adı',
      demoTemplateName: 'Şablon adı',
      demoTemplateNamePlaceholder: 'Wedding Master',
      albumName: 'Albüm adı',
      accessCodeField: 'Oluşacak etkinlik kodu',
      accessCodeHelp:
        'Kod otomatik üretilir. İstersen oluşturmadan önce değiştirebilir veya yenileyebilirsin.',
      eventCodeToggle: 'Etkinlik kodu kullan',
      eventCodeEnabledHelp:
        'Açıksa ana sayfa girişinde ve bu etkinlikte etkinlik kodu kullanılır.',
      eventCodeDisabledHelp:
        'Kapalıysa QR veya özel link ile gelen misafirler sadece e-posta ile girer.',
      toggleOn: 'Açık',
      toggleOff: 'Kapalı',
      regenerateCode: 'Yeni kod üret',
      coverImage: 'Etkinlik görseli',
      backgroundImage: 'Arka plan görseli',
      posterTemplateImage: 'A3 poster şablonu',
      storyTemplateImage: 'Instagram Story şablonu',
      uploadCover: 'Etkinlik görseli yükle',
      uploadBackground: 'Arka plan yükle',
      uploadPosterTemplate: 'A3 şablon yükle',
      uploadStoryTemplate: 'Story şablonu yükle',
      updateCover: 'Kapak değiştir',
      updateBackground: 'Arka plan değiştir',
      updatePosterTemplate: 'A3 şablon değiştir',
      updateStoryTemplate: 'Story şablonu değiştir',
      visualsSection: 'Görseller',
      visualsHelp: 'Her görseli ayrı ayrı yükle.',
      visualReady: 'yüklü',
      visualMissing: 'eksik',
      visualSaved: 'kaydedildi.',
      eventDetails: 'Albüm bilgileri',
      saveEventDetails: 'Başlık ve albüm adını kaydet',
      eventDetailsSaved: 'Albüm bilgileri kaydedildi.',
      eventDetailsSaveError: 'Albüm bilgileri kaydedilemedi.',
      mediaUploading: 'Görsel yükleniyor...',
      mediaUploadError: 'Görsel yüklenemedi.',
      createButton: 'Etkinlik albümü oluştur',
      createDemoTemplateButton: 'Master Demo oluştur',
      saving: 'Kaydediliyor...',
      noEvents:
        'Henüz etkinlik kaydı yok. Burada ilk albümü oluştur ve anasayfada yayınla.',
      noDemoTemplates:
        'Henüz Master Demo yok. Hazır tasarım ve ayarlar için ilk master demoyu oluştur.',
      unlockToManage:
        'Etkinlikleri listelemek, oluşturmak veya silmek için önce paneli aç.',
      qrLabel: 'Misafir yükleme QR',
      downloadQrPng: 'QR PNG indir',
      downloadQrSvg: 'QR SVG indir',
      uploadCopied: 'Misafir yükleme linki kopyalandı.',
      galleryCopied: 'Galeri linki kopyalandı.',
      deleteConfirm:
        'Bu etkinliği silmek istiyor musun? Veritabanı kurallarına göre ilgili yüklemeler de silinebilir.',
      deleteSuccess: 'Etkinlik başarıyla silindi.',
      missingCredentials: 'Hem kullanıcı adı hem şifre gerekli.',
      invalidCredentials: 'Kullanıcı adı veya şifre hatalı.',
      loadError: 'Etkinlikler yüklenemedi.',
      createSuccess: 'Etkinlik albümü başarıyla oluşturuldu.',
      createError: 'Etkinlik oluşturulamadı.',
      deleteError: 'Etkinlik silinemedi.',
      adminAccess: 'Yönetim erişimi',
      enabled: 'Kısıtlı mod aktif',
      checkingSession: 'Yönetim oturumu kontrol ediliyor...',
      recentAlbums: 'Son albümler',
      hiddenRouteNote:
        'Bu rota herkese açık olarak paylaşılmaz; sadece iç erişim için kullanılır.',
      accessCodeLabel: 'Etkinlik kodu',
      copyCodeButton: 'Kodu kopyala',
      codeCopied: 'Etkinlik kodu panoya kopyalandı.',
      emailOnlyEntry: 'Yalnızca e-posta ile giriş',
      guestEmails: 'Girilen e-posta adresleri',
      guestEmailSummary: '{count} farkli e-posta kaydi',
      copyGuestEmails: 'E-postalari kopyala',
      guestEmailsCopied: 'E-posta adresleri kopyalandı.',
      showGuestEmails: 'Listeyi aç',
      noGuestEmails: 'Bu etkinlik için henüz e-posta kaydı yok.',
      guestEmailTimeUnknown: 'Giriş zamanı bilinmiyor',
      publicTools: 'Konuk aksiyonlari',
      shareEnabled: 'Paylaşımı aç',
      downloadEnabled: 'İndirmeyi aç',
      albumDownloadEnabled: 'Tüm albüm indirmeyi aç',
      deleteEnabled: 'Silmeyi aç',
      posterEnabled: 'A3 posteri aç',
      saveVisibility: 'Aksiyon ayarlarini kaydet',
      visibilitySaved: 'Etkinlik aksiyon ayarları güncellendi.',
      visibilitySaveError: 'Etkinlik aksiyon ayarları kaydedilemedi.',
      editAction: 'Düzenle',
      createDemoFromTemplate: 'Demo oluştur',
      demoCloneAction: 'Yeni demo kopyala',
      demoCloneTitle: 'Yeni demo kopyala',
      demoCloneIntro: 'Bu Master Demo tasarımı ve ayarlarıyla boş, bağımsız bir demo albümü oluştur.',
      demoCustomerName: 'Müşteri adı',
      demoCustomerPlaceholder: 'Studio Nova',
      demoCreate: 'Demo oluştur',
      demoCreated: 'Demo albümü oluşturuldu.',
      demoNameRequired: 'Müşteri adı gerekli.',
      demoOpenUpload: 'Yükleme linkini aç',
      demoOpenGallery: 'Galeri linkini aç',
      demoCopyLink: 'Demo linkini kopyala',
      liveOpen: 'Canlı yayını aç',
      liveCopyLink: 'Canlı linki kopyala',
      liveCopied: 'Canlı link kopyalandı.',
      liveEnable: 'Canlı yayını aç',
      liveDisable: 'Canlı yayını kapat',
      comingSoon: 'Yakinda',
      guestbookCoverPhoto: 'Anı defteri kapak fotoğrafı',
      guestbookCoverPhotoActive: 'Ayrı seçilmiş anı defteri fotoğrafı aktif.',
      guestbookCoverPhotoEmpty: 'Ayrı fotoğraf yok: PDF güvenli boş kapak kullanır.',
      guestbookCoverPhotoFallback: 'Ayrı fotoğraf yok: normal kapak fotoğrafı kullanılır.',
      guestbookCoverPhotoHelp: 'Dijital anı defteri kapağında kullanmak için ayrı bir fotoğraf yükle.',
      guestbookCoverPhotoRemove: 'Kaldır',
      guestbookCoverPhotoReplace: 'Kapak fotoğrafını değiştir',
      guestbookCoverPhotoUpload: 'Kapak fotoğrafı yükle',
      guestbookLabel: 'Anı defteri',
      guestbookMessagesEmpty: 'Bu albüm için henüz misafir notu yok.',
      guestbookMessagesSummary: '{count} not',
      guestbookMessagesTitle: 'Misafir notlari',
      guestbookMessageCancel: 'Iptal',
      guestbookMessageDelete: 'Sil',
      guestbookMessageDeleteConfirm: 'Bu anı defteri mesajını silmek istiyor musun?',
      guestbookMessageDeleted: 'Anı defteri mesajı silindi.',
      guestbookMessageDeleteError: 'Anı defteri mesajı silinemedi.',
      guestbookMessageEdit: 'Duzenle',
      guestbookMessageNamePlaceholder: 'Isim (opsiyonel)',
      guestbookMessageSave: 'Kaydet',
      guestbookMessageSaved: 'Anı defteri mesajı güncellendi.',
      guestbookMessageSaveError: 'Anı defteri mesajı kaydedilemedi.',
      guestbookPdfPreviewHelp: 'Seçilen anı defteri PDF stilinin önizlemesi.',
      guestbookPdfStyle: 'Anı defteri PDF stili',
      guestbookPdfThemeComingSoon: 'Bu anı defteri PDF stili yakında kullanılabilir olacak.',
      guestbookPdfThemeComingSoonButton: 'PDF stili yakında',
      guestbookPhotoSource: 'Fotoğraf',
      downloadGuestbookPdf: 'Anı defterini indir',
      noGuestbookMessages: 'İndirilecek anı defteri mesajı yok.',
      refreshGuestbook: 'Yenile',
    },
    upload: {
      badge: 'Misafir yükleme sayfası',
      intro: 'Fotoğraflarını seçip albüme yükleyebilirsin.',
      guidanceBadge: 'Yükleme kuralları',
      guidanceTitle: 'Lütfen sadece paylaşılması uygun içerik yükleyin',
      guidanceIntro:
        'Yükleme yaparak bu içerikleri kendi isteğinle paylaştığını ve etkinlikte yer alan kişilerin mahremiyetine saygı göstereceğini onaylarsın.',
      guidancePoints: [
        'Sadece paylaşma hakkın olan fotoğrafları yükle.',
        'Küçük düşürücü, ayıplı, nefret içeren, yasa dışı veya başkasının gizliliğini ihlal eden içerik yükleme.',
        'Yalnızca fotoğraf kabul edilir; kaldırma talebi için iletişim bilgilerini kullanabilirsin.',
      ],
      consentLabel:
        'Bu fotoğrafları yükleme ve paylaşma yetkisine sahip olduğumu; bu albüme yüklenen fotoğrafların üçüncü kişiler tarafından görüntülenebileceğini, indirilebileceğini ve paylaşılabileceğini onaylıyorum.',
      consentHelp: '',
      consentRequired:
        'Devam etmeden önce onay kutusunu işaretleyin.',
      uploadNeedsConsent: 'Devam etmeden önce onay kutusunu işaretleyin.',
      consentLinks:
        'Devam ederek kullanım şartlarını ve gizlilik bilgisini de kabul ettiğini beyan edersin.',
      consentButton: 'Devam et',
      uploadLabel: 'Yükleme',
      namingLabel: 'İsimlendirme',
      namingText: 'Dosyalar tarih bazlı klasörler altında tutulur.',
      retentionLabel: 'Saklama',
      retentionText: '',
      selectLabel: 'Fotoğraf seç',
      selectButton: 'Dosyaları seç',
      defaultAlbumName: 'Paylaşılan etkinlik albümü',
      guestbookPhotoLabel: 'Anı defteri fotoğrafı',
      guestbookPhotoHelp: 'İsterseniz mesajınızla birlikte gösterilecek bir fotoğraf seçin.',
      guestbookPhotoSelected: 'Seçildi',
      shareSectionTitle: 'Albümü paylaş / QR kod',
      guestbookPostError: 'Anı defteri mesajı gönderilemedi.',
      uploadEnvironmentError: 'Yükleme ortamı tam olarak ayarlanmamış.',
      uploadFailedFallback: 'Yükleme başarısız oldu.',
      heicConversionFailed: 'HEIC/HEIF fotoğrafı dönüştürülemedi; diğer fotoğraflar yüklenmeye devam etti.',
      photoOnlyNotice: 'Bu albüm şu anda sadece fotoğraf yüklemeleri içindir.',
      guestbookHint: '❤️ Fotoğraflarına anı defteri için bir mesaj da ekleyebilirsin.',
      guestbookCardTitle: 'Anı defteri için bir not bırak ❤️',
      guestbookCardDescription: 'İstersen ismini ve fotoğraflarına kişisel bir mesaj ekle.',
      guestNameLabel: 'İsim (opsiyonel)',
      guestNamePlaceholder: 'İsmin',
      messageLabel: 'Mesaj (opsiyonel)',
      messagePlaceholder: 'Örn. Ne güzel bir gün! Birlikte çok mutlu olun ❤️',
      messageHelp: 'Opsiyonel · Mesajın anı defterinde görünür.',
      messageLimitReached: 'Maksimum karakter sınırına ulaşıldı',
      noFilesChosen: 'Henüz dosya seçilmedi',
      readyPrefix: 'Hazır',
      photos: 'fotoğraf',
      filesSelected: 'dosya secildi',
      unsupportedIgnored: 'desteklenmeyen dosya yok sayildi',
      photoTooLarge: 'fotoğraf 20 MB sınırını aştı',
      photoBadRatio: 'çok uzun veya dar fotoğraf albüme eklenmedi',
      selectionLimit: 'bir kerede en fazla 30 fotoğraf seçilebilir',
      chooseSupported: 'JPG, PNG, WEBP, HEIC veya HEIF',
      chooseStart: 'Başlamak için fotoğraf seç.',
      eventNotFound: 'Bu etkinlik bulunamadı. Linki veya QR kodu kontrol et.',
      eventNotReady: 'Bu etkinlik henüz yüklemeye hazır değil.',
      uploadInProgress: 'Yükleniyor...',
      uploadComplete: 'Yükleme tamamlandı. Galeri açılıyor...',
      uploadButton: 'Ortak albüme yükle',
      uploadingButton: 'Yükleniyor...',
      clearSelection: 'Seçimi temizle',
      viewGallery: 'Galeriyi gör',
      qrTitle: 'QR kod ile paylaş',
      qrText: 'Misafirler bu kodu okutarak aynı yükleme sayfasına ulaşabilir.',
      albumLink: 'Albüm linki',
      keepLinkButton: 'Linki telefonda sakla',
      keepLinkText: 'Bu linki sakla, sonra tekrar fotoğraf yüklemek için açabilirsin.',
      keepLinkReady: 'Paylaşım ekranı açıldı. Linki WhatsApp ya da mesaj olarak kendine gönderebilirsin.',
      keepLinkCopied: 'Link kopyalandı. WhatsApp ya da mesajlara yapıştırabilirsin.',
      keepLinkError: 'Link şu anda paylaşılamadı.',
      selectionCleared: 'Seçim temizlendi.',
    },
    gallery: {
      badge: 'Ortak galeri',
      intro:
        'Misafir yüklemelerini incele, seç ve istediklerini indir.',
      loading: 'Bu etkinlik galerisi yükleniyor...',
      noUploads: 'Bu galeride henüz aktif yükleme yok.',
      showing: 'yükleme gösteriliyor',
      loadError: 'Galeri şu anda yüklenemedi.',
      notFound: 'Bu etkinlik galerisi bulunamadı.',
      downloadAll: 'Albümü indir',
      downloadAlbumPackage: 'Albüm paketini indir',
      downloadingAll: 'Tüm albüm hazırlanıyor...',
      downloadingSelected: 'Seçilen fotoğraflar hazırlanıyor...',
      downloadPreparing: 'ZIP dosyası hazırlanıyor, lütfen bekle.',
      allDownloaded: 'Albüm indirme işlemi başlatıldı.',
      downloadSelected: 'Seçilenleri indir',
      albumPackageReady: '{count} ZIP paketi hazır. Paketleri tek tek indir.',
      albumPackageNotice: 'Albüm güvenli indirme için {count} ZIP paketine bölündü.',
      albumPackageLabel: 'Paket',
      backToUpload: 'Fotoğraf ekle',
      posterButton: 'A3 poster',
      posterPreparing: 'Poster hazırlanıyor...',
      posterChoose: 'Poster için en fazla 12 fotoğraf seç.',
      designPreview: 'Örneği gör',
      memoryPosterTitle: 'Memory Poster A3',
      photostripCreating: 'Photostrip Story hazırlanıyor...',
      photostripReady: 'Photostrip Story hazır.',
      designChooseFormat: 'Tasarım için önce A3 poster veya Instagram story seç.',
      designChooseMode: 'Önce tasarım modunu seç.',
      designChoosePosterMode: 'Poster modunu seç.',
      designChooseStoryMode: 'Story modunu seç.',
      designPosterActive: 'A3 poster modu açık. En fazla 12 fotoğraf seç.',
      designStoryActive: 'Instagram story modu açık. Seçili moda göre fotoğraf seç.',
      designSelected: 'seçildi',
      designLimitReached: 'Maksimum sayıya ulaştın.',
      designPortraitLimitReached: 'Dikey fotoğraf limiti doldu.',
      designLandscapeLimitReached: 'Yatay fotoğraf limiti doldu.',
      designChangeFormat: 'Formatı değiştir',
      designSwitchConfirm: 'Format değişirse mevcut seçim temizlenecek. Devam edilsin mi?',
      designCreate: 'Oluştur',
      designPortraitFitsBetter: 'Bu fotoğraf Portrait moduna daha uygun.',
      designLandscapeFitsBetter: 'Bu fotoğraf Landscape moduna daha uygun.',
      designOrientationPending: 'Fotoğraf yönü hazırlanıyor. Bir saniye sonra tekrar dene.',
      designNeutralDisabled: 'Bu poster için dikey veya yatay bir fotoğraf seç.',
      designMixedHint: 'Mixed poster için 8 dikey ve 4 yatay fotoğraf seç.',
      designMixedIncomplete: 'Mixed poster 8 dikey ve 4 yatay fotoğraf tamamlanınca oluşturulur.',
      designPortraitCount: 'Dikey',
      designLandscapeCount: 'Yatay',
      clearSelection: 'Seçimi temizle',
      posterPortraitMode: 'Portrait Poster',
      posterLandscapeMode: 'Landscape Poster',
      posterMixedMode: 'Mixed Poster',
      posterLimitReached: '12 fotoğraf seçildi. Poster hazır.',
      posterMoreNeeded: 'fotoğraf daha seçersen poster dolacak.',
      posterLimitExceeded: 'Poster sadece ilk 12 fotoğrafı kullanacak.',
      posterExtraIgnored: 'fazla seçim poster için kullanılmayacak.',
      posterBlackWhite: 'Siyah-beyaz',
      posterStyleTitle: 'Poster rengi seç',
      posterStyleDescription: 'A3 poster 12 foto, Instagram story moda göre 4 veya 8 foto kullanır.',
      posterColorOption: 'Renkli poster (12 foto)',
      posterBlackWhiteOption: 'Siyah-beyaz poster (12 foto)',
      storyOption: 'Instagram story',
      storyButton: 'Instagram story',
      storyPortraitMode: 'Portrait Story',
      storyLandscapeMode: 'Landscape Story',
      storyPreparing: 'Instagram story hazırlanıyor...',
      storyReady: 'Instagram story indirildi.',
      photostripShortage:
        "Bu Story’yi oluşturmak için, photobooth’ta çekilmiş ve telefonunuza indirdiğiniz 3 adet 5x15 strip’i kullanın.",
      cancel: 'İptal',
      posterHorizontalTip: 'Poster için yatay fotoğraflar daha iyi sonuç verir.',
      posterLimitPopup: '12 fotoğraf seçildi. A3 poster en fazla 12 fotoğraf kullanır. Fazla seçilenler albüme iner ama posterde kullanılmaz.',
      posterRatioPopup: 'Çok uzun veya dar fotoğraf postere eklenmedi. Yatay fotoğraflar daha iyi sonuç verir.',
      posterNoUsablePhotos: 'Postere uygun fotoğraf bulunamadı.',
      posterReady: 'A3 poster indirildi.',
      guestMessageLabel: 'Misafir mesajı',
      selected: 'Seçildi',
      select: 'Seç',
      openPreview: 'Fotoğrafı büyüt',
      closePreview: 'Kapat',
      previousPhoto: 'Önceki fotoğraf',
      nextPhoto: 'Sonraki fotoğraf',
      delete: 'Sil',
      deleting: 'Siliniyor...',
      deleteSelected: 'Seçilenleri sil',
      deleteSelectedConfirm: 'Seçili yüklemeleri silmek istiyor musun?',
      deleteSelectedSuccess: 'Seçili yüklemeler silindi.',
      deleteConfirm: 'Bu yüklemeyi silmek istiyor musun?',
      deleteSuccess: 'Yükleme silindi.',
      deleteError: 'Yükleme silinemedi.',
      share: 'Paylaş',
      shareSuccess: 'Paylaşım linki hazırlandı.',
      shareCopied: 'Paylaşım linki panoya kopyalandı.',
      shareError: 'Paylaşım şu anda açılamadı.',
      download: 'İndir',
      downloaded: 'dosya indirildi',
      chooseBeforeDownload: 'İndirmeden önce en az bir öğe seç.',
      selectionLimitReached: 'Bir kerede en fazla 100 fotoğraf seçebilirsin.',
      uploadTimeUnavailable: 'Yükleme zamanı yok',
      photo: 'Fotoğraf',
      videoMessagesTab: "Video mesajları",
      videoEmpty: "Henüz video mesajı yok. İlk mesajı siz paylaşın!",
      videoLoading: "Videolar yükleniyor…",
      videoGalleryError: "Videolar yüklenemedi. Erişiminizi kontrol edip yenileyin.",
      videoPlaybackError: "Bu video oynatılamıyor veya bağlantının süresi dolmuş.",
      videoRefresh: "Yenile",
      videoPrevious: "Önceki",
      videoNext: "Sonraki",
      photosTab: 'Fotoğraflar',
      guestbookTab: 'Anı defteri',
      designsTab: 'Tasarla',
      downloadsTab: 'İndir',
      guestbookTitle: 'Anı defteri',
      guestbookFormTitle: 'Mesaj bırak',
      guestbookNameLabel: 'İsim (opsiyonel)',
      guestbookMessageLabel: 'Mesaj',
      guestbookMessagePlaceholder: 'Mesajını buraya yaz...',
      guestbookSubmit: 'Mesaj gönder',
      guestbookSubmitting: 'Gönderiliyor...',
      guestbookSubmitSuccess: 'Mesajın eklendi.',
      guestbookSubmitError: 'Mesaj eklenemedi.',
      guestbookMessageRequired: 'Önce bir mesaj yaz.',
      guestbookMessageTooLong: 'Mesaj en fazla 500 karakter olabilir.',
      guestbookEmptyTitle: 'Henüz mesaj yok.',
      guestbookEmptyText: 'İlk mesajı sen bırak.',
    },
      legal: {
      termsTitle: 'Kullanim Sartlari',
      termsIntro:
        'Bu etkinlik albumunu kullanarak asagidaki kurallari kabul etmis olursun.',
      termsSections: [
        {
          title: 'Icerik sorumlulugu',
          points: [
            'Yukledigin fotograflar uzerinde paylasim hakkina sahip oldugunu beyan edersin.',
            'Ayni etkinlikte yer alan diger katilimcilarin da seni iceren fotograflari yukleyebilecegini ve paylasabilecegini kabul edersin.',
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
            'Yuklenen icerikler etkinlik albumunde saklanir.',
            'Album ve fotograf silme islemleri admin tarafindan manuel yapilir.',
            'Gerekli durumlarda icerik kaldirma talebi iletilebilir.',
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
            'Yuklenen fotograflar ilgili etkinlik albumunde saklanir.',
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
            'Yuklenen medya etkinlik albumunde saklanir ve admin tarafindan manuel silinebilir.',
            'Teknik loglar guvenlik ve hata takibi icin sinirli sure boyunca saklanabilir.',
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
      guestEntryPage: 'Gast uploadpagina',
      terms: 'Gebruiksvoorwaarden',
      privacy: 'Privacy',
      back: 'Terug',
      uploadPage: 'Uploadpagina',
      gallery: 'Galerij',
      copyUploadLink: 'Uploadlink kopiëren',
      copyGalleryLink: 'Galerijlink kopiëren',
      deleteEvent: 'Evenement verwijderen',
      signOut: 'Uitloggen',
      latestPublicAlbum: 'Open laatste gastenalbum',
      restrictedAdmin: 'Beheerderszone',
      hiddenAdminAccess: 'Verborgen beheer',
      hiddenAdminDescription:
        'Deze pagina staat niet op de openbare homepage. Hier beheer je evenementen, albums en gasttoegang.',
      language: 'Taal',
    },
    home: {
      badge: 'QR photobooth voor evenementen',
      title: 'Alle foto’s van je evenement in één gedeeld album.',
      intro:
        'Photobooth Holland helpt gasten om foto’s via een QR code te delen in één overzichtelijk album. Geschikt voor bruiloften, bedrijfsfeesten, verjaardagen en 360 photobooth activaties.',
      entryLabel: 'Snelle toegang voor gasten',
      posterHeadline: 'DEEL JE',
      posterAccent: 'momenten',
      posterEyebrow: 'Scan. Upload. Klaar.',
      posterSubline: 'Alles van het evenement bij elkaar.',
      formTitle: 'Open jouw eventalbum',
      formIntro:
        'Scan de QR code en vul je e-mailadres en eventueel de eventcode in om direct het juiste album te openen.',
      emailLabel: 'E-mailadres',
      codeLabel: 'Eventcode',
      accessButton: 'Open album',
      accessHint: 'Vul je e-mailadres en eventcode in om verder te gaan.',
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
      marketingConsentLabel:
        'Ja, ik ontvang graag af en toe nieuws, inspiratie en aanbiedingen van EventDrop Sharing en Photobooth Holland per e-mail.',
      marketingConsentHelp: 'Je kunt je op elk moment afmelden.',
      latestAlbumLabel: 'Gasttoegang',
      latestAlbumReady: 'Gasttoegang wordt met een eventcode bevestigd.',
      noAlbum:
        'Evenementen worden niet openbaar getoond. Gebruik een eventcode om door te gaan.',
      uploadCta: 'Naar album',
      galleryCta: 'Galerij openen',
      contactLabel: 'Contact',
      bestFor: 'Perfect voor',
      bestForText:
        'Bruiloften, verjaardagen, bedrijfsfeesten, merkactivaties en 360 photobooth events.',
      flowTitle: 'Zo werkt het',
      flowText:
        'Gasten scannen de QR code, kiezen hun foto’s en alles komt direct in het juiste album terecht.',
      howItWorks: 'Zo werkt het',
      shareSite: 'Deel deze pagina',
      shareReady: 'Deelscherm is geopend.',
      shareCopied: 'Sitelink is naar het klembord gekopieerd.',
      points: [
        'Elk evenement krijgt een eigen QR-link en optionele eventcode',
        'Gasten uploaden zonder app of account',
        'Foto’s komen direct in het juiste album terecht',
        'Duidelijk en mobielvriendelijk voor ieder evenement',
      ],
      sections: [
        {
          title: 'Perfect voor elk evenement waar mensen foto’s willen delen',
          body: [
            'Van bruiloften en verjaardagen tot bedrijfsfeesten en merkactivaties: gasten maken de hele dag foto’s op hun telefoon.',
            'Met Photobooth Holland verzamel je die beelden in één duidelijk evenementalbum, zonder losse apps of onoverzichtelijke groepschats.',
            'Zo bewaar je niet alleen de photobooth beelden, maar ook de spontane momenten daaromheen.',
          ],
        },
        {
          title: 'Hoe Photobooth Holland werkt',
          body: [
            'Voor ieder evenement is er een eigen uploadpagina met QR code.',
            'Na het scannen kiezen gasten hun foto’s en delen die direct vanaf hun telefoon.',
            'Alle bestanden worden automatisch verzameld in één album dat bij het evenement hoort.',
          ],
        },
        {
          title: 'Waarom dit beter werkt dan losse fotodeling',
          body: [
            'Foto’s van een evenement blijven vaak verspreid staan op verschillende telefoons.',
            'Met één centrale uploadpagina blijft het eenvoudig voor gasten en overzichtelijk voor de organisator.',
            'Daardoor ontstaat een completer album met zowel photobooth beelden als spontane sfeerfoto’s.',
          ],
        },
        {
          title: 'Snel, simpel en zonder gedoe',
          body: [
            'Uploaden duurt maar een paar seconden en werkt direct in de browser.',
            'Er is geen app of account nodig.',
            'De pagina werkt eenvoudig op mobiel, zodat delen tijdens het evenement vanzelf gaat.',
          ],
        },
        {
          title: 'Veilig, overzichtelijk en per event afgeschermd',
          body: [
            'Elk evenement heeft een eigen albumstructuur, zodat beelden niet door elkaar lopen.',
            'Toegang kan worden gecombineerd met een eventcode als je extra controle wilt.',
            'Zo blijft het voor gasten eenvoudig en voor de organisator netjes geregeld.',
          ],
        },
      ],
      loading: 'Gasttoegang wordt voorbereid...',
    },
    admin: {
      title: 'Verborgen beheerpaneel',
      loginPrompt: 'Vul de beheerdersnaam en het wachtwoord in.',
      openClose: 'Open/sluit',
      username: 'Gebruikersnaam',
      password: 'Wachtwoord',
      unlock: 'Paneel openen',
      checking: 'Controleren...',
      configuredHint:
        'Gebruik de geheime gebruikersnaam en het wachtwoord die voor deze omgeving zijn ingesteld.',
      notConfigured: 'De admin-login is nog niet geconfigureerd op de server.',
      unlocked: 'Beheerpaneel is geopend.',
      signedOut: 'Je bent uitgelogd uit het verborgen beheerpaneel.',
      passwordSection: 'Inlogcontrole en wachtwoord',
      passwordSectionHelp:
        'Bevestig eerst je huidige wachtwoord en stel daarna een nieuw wachtwoord in voor het beheerpaneel.',
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
      passwordChangeSuccess: 'Het beheerderswachtwoord is bijgewerkt.',
      passwordChangeError: 'Het beheerderswachtwoord kon niet worden bijgewerkt.',
      eventsTab: 'Evenementen',
      demoTemplatesTab: "Master Demo's",
      createTitle: 'Beheer hier je evenementen en albums.',
      settingsGeneral: 'Algemeen',
      settingsBrandingMedia: 'Branding & media',
      settingsFeatures: 'Functies',
      settingsAccessSharing: 'Toegang & delen',
      settingsDownloadsExports: 'Downloads & exports',
      settingsDangerZone: 'Gevarenzone',
      selectedAlbumLabel: 'Geselecteerd album',
      publicSlugLabel: 'Openbare slug',
      photostripBackground: 'Photostrip achtergrond',
      photostripBackgroundHelp: 'Aanbevolen: 1080 × 1920 px (9:16)',
      changeFile: 'Bestand wijzigen',
      chooseFile: 'Bestand kiezen',
      openAction: 'Openen',
      copyAction: 'Kopiëren',
      guestLinkLabel: 'Gastlink',
      dangerAction: 'Gevaarlijke handeling',
      eventName: 'Naam van het evenement',
      demoTemplateName: 'Naam van het sjabloon',
      demoTemplateNamePlaceholder: 'Wedding Master',
      albumName: 'Naam van het album',
      accessCodeField: 'Nieuwe eventcode',
      accessCodeHelp:
        'De code wordt automatisch gemaakt. Je kunt hem voor het opslaan aanpassen of opnieuw laten genereren.',
      eventCodeToggle: 'Eventcode gebruiken',
      eventCodeEnabledHelp:
        'Als dit aan staat, gebruiken gasten op de homepage en bij handmatige toegang een eventcode.',
      eventCodeDisabledHelp:
        'Als dit uit staat, kunnen gasten via QR of een directe link binnenkomen met alleen hun e-mailadres.',
      toggleOn: 'Aan',
      toggleOff: 'Uit',
      regenerateCode: 'Nieuwe code genereren',
      coverImage: 'Omslagafbeelding',
      backgroundImage: 'Achtergrondafbeelding',
      posterTemplateImage: 'A3-postersjabloon',
      storyTemplateImage: 'Instagram Story-sjabloon',
      uploadCover: 'Omslagafbeelding uploaden',
      uploadBackground: 'Achtergrond uploaden',
      uploadPosterTemplate: 'A3-sjabloon uploaden',
      uploadStoryTemplate: 'Story-sjabloon uploaden',
      updateCover: 'Omslag wijzigen',
      updateBackground: 'Achtergrond wijzigen',
      updatePosterTemplate: 'A3-sjabloon wijzigen',
      updateStoryTemplate: 'Story-sjabloon wijzigen',
      visualsSection: 'Afbeeldingen',
      visualsHelp: 'Upload elke afbeelding apart.',
      visualReady: 'geüpload',
      visualMissing: 'ontbreekt',
      visualSaved: 'opgeslagen.',
      eventDetails: 'Albumgegevens',
      saveEventDetails: 'Naam en album opslaan',
      eventDetailsSaved: 'Albumgegevens opgeslagen.',
      eventDetailsSaveError: 'Albumgegevens konden niet worden opgeslagen.',
      mediaUploading: 'Afbeelding wordt geüpload...',
      mediaUploadError: 'De afbeelding kon niet worden geüpload.',
      createButton: 'Evenementalbum aanmaken',
      createDemoTemplateButton: 'Master Demo aanmaken',
      saving: 'Opslaan...',
      noEvents:
        'Er zijn nog geen evenementen aangemaakt. Maak hier je eerste album aan.',
      noDemoTemplates:
        "Er zijn nog geen Master Demo's. Maak een master met vaste vormgeving en instellingen.",
      unlockToManage:
        'Open eerst het paneel om evenementen te bekijken, maken of verwijderen.',
      qrLabel: 'QR-code voor gastenupload',
      downloadQrPng: 'QR als PNG',
      downloadQrSvg: 'QR als SVG',
      uploadCopied: 'Gastuploadlink gekopieerd.',
      galleryCopied: 'Galerijlink gekopieerd.',
      deleteConfirm:
        'Weet je zeker dat je dit evenement wilt verwijderen? Afhankelijk van je database-regels kunnen uploads ook verdwijnen.',
      deleteSuccess: 'Het evenement is verwijderd.',
      missingCredentials: 'Zowel gebruikersnaam als wachtwoord zijn verplicht.',
      invalidCredentials: 'Gebruikersnaam of wachtwoord is onjuist.',
      loadError: 'Evenementen konden niet worden geladen.',
      createSuccess: 'Het evenementalbum is aangemaakt.',
      createError: 'Het evenement kon niet worden aangemaakt.',
      deleteError: 'Het evenement kon niet worden verwijderd.',
      adminAccess: 'Beheertoegang',
      enabled: 'Beperkte modus actief',
      checkingSession: 'Beheersessie wordt gecontroleerd...',
      recentAlbums: 'Recente albums',
      hiddenRouteNote:
        'Deze route wordt niet publiek gedeeld en is alleen voor intern gebruik.',
      accessCodeLabel: 'Eventcode',
      copyCodeButton: 'Code kopiëren',
      codeCopied: 'De eventcode is naar het klembord gekopieerd.',
      emailOnlyEntry: 'Alleen toegang met e-mail',
      guestEmails: 'Ingevoerde e-mailadressen',
      guestEmailSummary: '{count} unieke e-mailregistraties',
      copyGuestEmails: 'E-mails kopiëren',
      guestEmailsCopied: 'E-mailadressen gekopieerd.',
      showGuestEmails: 'Lijst openen',
      noGuestEmails: 'Er zijn nog geen e-mailregistraties voor dit evenement.',
      guestEmailTimeUnknown: 'Moment onbekend',
      publicTools: 'Gastacties',
      shareEnabled: 'Delen toestaan',
      downloadEnabled: 'Download toestaan',
      albumDownloadEnabled: 'Hele album downloaden toestaan',
      deleteEnabled: 'Verwijderen toestaan',
      posterEnabled: 'A3-poster toestaan',
      saveVisibility: 'Instellingen opslaan',
      visibilitySaved: 'Actie-instellingen voor dit evenement zijn bijgewerkt.',
      visibilitySaveError: 'Actie-instellingen konden niet worden opgeslagen.',
      editAction: 'Bewerken',
      createDemoFromTemplate: 'Demo aanmaken',
      demoCloneAction: 'Nieuwe demo kopiëren',
      demoCloneTitle: 'Nieuwe demo kopiëren',
      demoCloneIntro: 'Maak een leeg, zelfstandig demoalbum met het ontwerp en de instellingen van deze Master Demo.',
      demoCustomerName: 'Klantnaam',
      demoCustomerPlaceholder: 'Studio Nova',
      demoCreate: 'Demo aanmaken',
      demoCreated: 'Demoalbum aangemaakt.',
      demoNameRequired: 'Klantnaam is verplicht.',
      demoOpenUpload: 'Uploadlink openen',
      demoOpenGallery: 'Galerijlink openen',
      demoCopyLink: 'Demo-link kopiëren',
      liveOpen: 'Live openen',
      liveCopyLink: 'Live-link kopiëren',
      liveCopied: 'Live-link gekopieerd.',
      liveEnable: 'Live inschakelen',
      liveDisable: 'Live uitschakelen',
      comingSoon: 'Binnenkort',
      guestbookCoverPhoto: 'Gastenboek omslagfoto',
      guestbookCoverPhotoActive: 'Aparte gastenboekfoto actief.',
      guestbookCoverPhotoEmpty: 'Geen aparte foto: PDF gebruikt de veilige lege omslag.',
      guestbookCoverPhotoFallback: 'Geen aparte foto: normale omslagfoto wordt gebruikt.',
      guestbookCoverPhotoHelp: 'Gebruik een aparte foto voor de omslag van het digitale gastenboek.',
      guestbookCoverPhotoRemove: 'Verwijderen',
      guestbookCoverPhotoReplace: 'Vervang omslagfoto',
      guestbookCoverPhotoUpload: 'Upload omslagfoto',
      guestbookLabel: 'Gastenboek',
      guestbookMessagesEmpty: 'Er zijn nog geen gastenboekberichten voor dit album.',
      guestbookMessagesSummary: '{count} berichten',
      guestbookMessagesTitle: 'Gastenboekberichten',
      guestbookMessageCancel: 'Annuleren',
      guestbookMessageDelete: 'Verwijderen',
      guestbookMessageDeleteConfirm: 'Weet je zeker dat je dit gastenboekbericht wilt verwijderen?',
      guestbookMessageDeleted: 'Gastenboekbericht verwijderd.',
      guestbookMessageDeleteError: 'Gastenboekbericht kon niet worden verwijderd.',
      guestbookMessageEdit: 'Bewerken',
      guestbookMessageNamePlaceholder: 'Naam (optioneel)',
      guestbookMessageSave: 'Opslaan',
      guestbookMessageSaved: 'Gastenboekbericht bijgewerkt.',
      guestbookMessageSaveError: 'Gastenboekbericht kon niet worden opgeslagen.',
      guestbookPdfPreviewHelp: 'Voorbeeld van de gekozen Gastenboek PDF-stijl.',
      guestbookPdfStyle: 'Gastenboek PDF-stijl',
      guestbookPdfThemeComingSoon: 'Deze Gastenboek PDF-stijl komt binnenkort beschikbaar.',
      guestbookPdfThemeComingSoonButton: 'PDF-stijl binnenkort',
      guestbookPhotoSource: 'Foto',
      downloadGuestbookPdf: 'Gastenboek downloaden',
      noGuestbookMessages: 'Er zijn geen gastenboekberichten om te downloaden.',
      refreshGuestbook: 'Vernieuwen',
    },
    upload: {
      badge: 'Gastenupload',
      intro: 'Kies je foto’s en upload ze naar het album.',
      guidanceBadge: 'Uploadregels',
      guidanceTitle: 'Upload alleen foto’s die je mag delen',
      guidanceIntro:
        'Door iets te uploaden bevestig je dat je dit vrijwillig deelt en rekening houdt met de privacy van andere aanwezigen.',
      guidancePoints: [
        'Upload alleen foto’s die je mag delen.',
        'Upload geen kwetsende, beledigende, haatdragende, onwettige of privacygevoelige inhoud.',
        'Bestanden worden tijdelijk bewaard. Wil je iets laten verwijderen, neem dan contact op via de contactgegevens.',
      ],
      consentLabel:
        'Ik bevestig dat ik bevoegd ben om deze foto’s te uploaden en te delen, en dat foto’s die aan dit album worden toegevoegd door derden kunnen worden bekeken, gedownload en gedeeld.',
      consentHelp: '',
      consentRequired:
        'Vink het toestemmingsvakje aan voordat je verdergaat.',
      uploadNeedsConsent: 'Vink het toestemmingsvakje aan voordat je verdergaat.',
      consentLinks:
        'Door verder te gaan bevestig je ook dat je de gebruiksvoorwaarden en privacyinformatie hebt gelezen.',
      consentButton: 'Verdergaan',
      uploadLabel: 'Upload',
      namingLabel: 'Bestandsnaam',
      namingText: 'Bestanden worden opgeslagen in datumgebonden mappen.',
      retentionLabel: 'Bewaartermijn',
      retentionText: '',
      selectLabel: 'Kies foto’s',
      selectButton: 'Bestanden kiezen',
      defaultAlbumName: 'Gedeeld evenementalbum',
      guestbookPhotoLabel: 'Gastenboekfoto',
      guestbookPhotoHelp: 'Selecteer eventueel één foto die bij je bericht wordt getoond.',
      guestbookPhotoSelected: 'Gekozen',
      shareSectionTitle: 'Album delen / QR-code',
      guestbookPostError: 'Gastenboekbericht kon niet worden geplaatst.',
      uploadEnvironmentError: 'De uploadomgeving is niet volledig ingesteld.',
      uploadFailedFallback: 'Uploaden is niet gelukt.',
      heicConversionFailed: 'HEIC/HEIF-foto kon niet worden geconverteerd; de overige foto’s zijn verder geüpload.',
      photoOnlyNotice: 'Dit album is op dit moment alleen bedoeld voor foto-uploads.',
      guestbookHint: "❤️ Voeg bij je foto's ook een bericht toe aan het gastenboek.",
      guestbookCardTitle: 'Laat iets achter in het gastenboek ❤️',
      guestbookCardDescription: "Voeg eventueel je naam en een persoonlijk bericht toe aan je foto's.",
      guestNameLabel: 'Naam (optioneel)',
      guestNamePlaceholder: 'Je naam',
      messageLabel: 'Bericht (optioneel)',
      messagePlaceholder: 'Bijv. Wat een prachtige dag! Veel geluk samen ❤️',
      messageHelp: 'Optioneel · Je bericht verschijnt in het gastenboek.',
      messageLimitReached: 'Maximum aantal tekens bereikt',
      noFilesChosen: 'Nog geen bestanden gekozen',
      readyPrefix: 'Klaar',
      photos: 'foto',
      filesSelected: 'bestanden geselecteerd',
      unsupportedIgnored: 'niet-ondersteunde bestanden zijn overgeslagen',
      photoTooLarge: 'foto boven limiet van 20 MB',
      photoBadRatio: 'te smalle of lange foto is niet aan het album toegevoegd',
      selectionLimit: 'je kunt maximaal 30 foto’s tegelijk selecteren',
      chooseSupported: 'JPG, PNG, WEBP, HEIC of HEIF',
      chooseStart: 'Kies een bestand om te beginnen.',
      eventNotFound: 'Dit evenement is niet gevonden. Controleer de link of QR code.',
      eventNotReady: 'Dit evenement is nog niet beschikbaar voor uploads.',
      uploadInProgress: 'Uploaden...',
      uploadComplete: 'Upload voltooid. Galerij wordt geopend...',
      uploadButton: 'Upload naar gedeeld album',
      uploadingButton: 'Uploaden...',
      clearSelection: 'Selectie wissen',
      viewGallery: 'Galerij bekijken',
      qrTitle: 'Delen via QR-code',
      qrText: 'Gasten kunnen met deze code direct dezelfde uploadpagina openen.',
      albumLink: 'Albumlink',
      keepLinkButton: 'Link bewaren',
      keepLinkText: 'Bewaar deze link om later opnieuw foto’s te uploaden.',
      keepLinkReady: 'Deelscherm geopend. Stuur de link naar jezelf via WhatsApp of berichten.',
      keepLinkCopied: 'Link gekopieerd. Plak hem in WhatsApp of berichten.',
      keepLinkError: 'De link kon nu niet worden gedeeld.',
      selectionCleared: 'Selectie gewist.',
    },
    gallery: {
      badge: 'Gedeelde galerij',
      intro:
        'Bekijk en deel de foto’s uit dit album.',
      loading: 'Deze galerij wordt geladen...',
      noUploads: 'Er staan nog geen uploads in deze galerij.',
      showing: 'uploads beschikbaar',
      loadError: 'De galerij kon op dit moment niet worden geladen.',
      notFound: 'Deze galerij is niet gevonden.',
      downloadAll: 'Album downloaden',
      downloadAlbumPackage: 'Albumpakket downloaden',
      downloadingAll: 'Het hele album wordt voorbereid...',
      downloadingSelected: 'De geselecteerde foto’s worden voorbereid...',
      downloadPreparing: 'Het ZIP-bestand wordt voorbereid, even geduld.',
      allDownloaded: 'Het downloaden van het album is gestart.',
      downloadSelected: 'Selectie downloaden',
      albumPackageReady: '{count} ZIP-pakketten staan klaar. Download de pakketten één voor één.',
      albumPackageNotice: 'Voor veilig downloaden is het album verdeeld in {count} ZIP-pakketten.',
      albumPackageLabel: 'Pakket',
      backToUpload: "Foto's toevoegen",
      posterButton: 'A3-poster',
      posterPreparing: 'Poster wordt gemaakt...',
      posterChoose: 'Selecteer maximaal 12 foto’s voor de poster.',
      designPreview: 'Voorbeeld bekijken',
      memoryPosterTitle: 'Memory Poster A3',
      photostripCreating: 'Photostrip Story wordt gemaakt...',
      photostripReady: 'Photostrip Story is klaar.',
      designChooseFormat: 'Kies eerst A3-poster of Instagram story.',
      designChooseMode: 'Kies eerst een ontwerpmodus.',
      designChoosePosterMode: 'Kies een postermodus.',
      designChooseStoryMode: 'Kies een storymodus.',
      designPosterActive: 'A3-poster actief. Kies maximaal 12 foto’s.',
      designStoryActive: 'Instagram story actief. Kies foto’s voor de gekozen modus.',
      designSelected: 'geselecteerd',
      designLimitReached: 'Maximum bereikt.',
      designPortraitLimitReached: 'Maximum verticale foto’s bereikt.',
      designLandscapeLimitReached: 'Maximum horizontale foto’s bereikt.',
      designChangeFormat: 'Formaat wijzigen',
      designSwitchConfirm: 'Bij wijzigen wordt je selectie gewist. Doorgaan?',
      designCreate: 'Maken',
      designPortraitFitsBetter: 'Deze foto past beter in Portrait.',
      designLandscapeFitsBetter: 'Deze foto past beter in Landscape.',
      designOrientationPending: 'De fotorichting wordt geladen. Probeer het zo opnieuw.',
      designNeutralDisabled: 'Kies voor deze poster een verticale of horizontale foto.',
      designMixedHint: 'Kies 8 verticale en 4 horizontale foto’s voor Mixed Poster.',
      designMixedIncomplete: 'Mixed Poster kan pas met 8 verticale en 4 horizontale foto’s worden gemaakt.',
      designPortraitCount: 'Portrait',
      designLandscapeCount: 'Landscape',
      clearSelection: 'Selectie wissen',
      posterPortraitMode: 'Portrait Poster',
      posterLandscapeMode: 'Landscape Poster',
      posterMixedMode: 'Mixed Poster',
      posterLimitReached: '12 foto’s geselecteerd. De poster is klaar.',
      posterMoreNeeded: 'foto’s extra om de poster te vullen.',
      posterLimitExceeded: 'De poster gebruikt alleen de eerste 12 foto’s.',
      posterExtraIgnored: 'extra selectie wordt niet gebruikt voor de poster.',
      posterBlackWhite: 'Zwart-wit',
      posterStyleTitle: 'Kies posterstijl',
      posterStyleDescription: 'A3-poster gebruikt 12 foto’s, Instagram story 4 of 8 foto’s per modus.',
      posterColorOption: 'Kleur poster (12 foto’s)',
      posterBlackWhiteOption: 'Zwart-wit poster (12 foto’s)',
      storyOption: 'Instagram story',
      storyButton: 'Instagram story',
      storyPortraitMode: 'Portrait Story',
      storyLandscapeMode: 'Landscape Story',
      storyPreparing: 'Instagram story wordt gemaakt...',
      storyReady: 'Instagram story is gedownload.',
      photostripShortage:
        'Gebruik voor deze Story 3 photobooth-strips van 5x15 die in de photobooth zijn gemaakt en die je op je telefoon hebt gedownload.',
      cancel: 'Annuleren',
      posterHorizontalTip: 'Liggende foto’s geven het beste resultaat op de poster.',
      posterLimitPopup: '12 foto’s geselecteerd. Een A3-poster gebruikt maximaal 12 foto’s. Extra foto’s blijven beschikbaar voor albumdownload, maar worden niet gebruikt op de poster.',
      posterRatioPopup: 'Een te lange of smalle foto is niet op de poster geplaatst. Liggende foto’s geven een beter resultaat.',
      posterNoUsablePhotos: 'Er zijn geen geschikte foto’s voor de poster gevonden.',
      posterReady: 'A3-poster is gedownload.',
      guestMessageLabel: 'Bericht van gast',
      selected: 'Geselecteerd',
      select: 'Selecteren',
      openPreview: 'Foto vergroten',
      closePreview: 'Sluiten',
      previousPhoto: 'Vorige foto',
      nextPhoto: 'Volgende foto',
      delete: 'Verwijderen',
      deleting: 'Bezig met verwijderen...',
      deleteSelected: 'Geselecteerde items verwijderen',
      deleteSelectedConfirm: 'Weet je zeker dat je de geselecteerde uploads wilt verwijderen?',
      deleteSelectedSuccess: 'Geselecteerde uploads verwijderd.',
      deleteConfirm: 'Weet je zeker dat je deze upload wilt verwijderen?',
      deleteSuccess: 'Upload verwijderd.',
      deleteError: 'Upload kon niet worden verwijderd.',
      share: 'Delen',
      shareSuccess: 'De deellink is klaar.',
      shareCopied: 'De deellink is naar het klembord gekopieerd.',
      shareError: 'Delen kon op dit moment niet worden geopend.',
      download: 'Downloaden',
      downloaded: 'bestanden gedownload',
      chooseBeforeDownload: 'Selecteer eerst minstens één item.',
      selectionLimitReached: 'Je kunt maximaal 100 foto’s tegelijk selecteren.',
      uploadTimeUnavailable: 'Uploadtijd onbekend',
      photo: 'Foto',
      videoMessagesTab: "Videoboodschappen",
      videoEmpty: "Nog geen videoboodschappen. Deel de eerste!",
      videoLoading: "Video’s laden…",
      videoGalleryError: "Video’s konden niet worden geladen. Controleer je toegang en vernieuw.",
      videoPlaybackError: "Deze video kan niet worden afgespeeld of de link is verlopen.",
      videoRefresh: "Vernieuwen",
      videoPrevious: "Vorige",
      videoNext: "Volgende",
      photosTab: "Foto's",
      guestbookTab: 'Gastenboek',
      designsTab: 'Ontwerpen',
      downloadsTab: 'Downloaden',
      guestbookTitle: 'Gastenboek',
      guestbookFormTitle: 'Laat een bericht achter',
      guestbookNameLabel: 'Naam (optioneel)',
      guestbookMessageLabel: 'Bericht',
      guestbookMessagePlaceholder: 'Schrijf hier je bericht...',
      guestbookSubmit: 'Bericht plaatsen',
      guestbookSubmitting: 'Plaatsen...',
      guestbookSubmitSuccess: 'Je bericht is geplaatst.',
      guestbookSubmitError: 'Je bericht kon niet worden geplaatst.',
      guestbookMessageRequired: 'Schrijf eerst een bericht.',
      guestbookMessageTooLong: 'Je bericht mag maximaal 500 tekens zijn.',
      guestbookEmptyTitle: 'Nog geen berichten.',
      guestbookEmptyText: 'Laat als eerste een bericht achter.',
    },
    legal: {
      termsTitle: 'Algemene voorwaarden',
      termsIntro:
        'Door dit evenementalbum te gebruiken ga je akkoord met de onderstaande voorwaarden.',
      termsSections: [
        {
          title: 'Verantwoordelijkheid voor inhoud',
          points: [
            'Je bevestigt dat je de foto’s die je upload zelf mag delen.',
            'Je mag geen privacygevoelige, schokkende, haatdragende of onwettige inhoud uploaden.',
            'Ongeschikte inhoud kan zonder voorafgaande waarschuwing worden verwijderd.',
          ],
        },
        {
          title: 'Gebruik en systeemregels',
          points: [
            'EventDrop is bedoeld om bijdragen van aanwezigen te verzamelen in één gedeeld evenementalbum.',
            'Bij misbruik, spam of schadelijke inhoud kan toegang tot het systeem worden beperkt.',
            'Een album kan tijdelijk of permanent worden gesloten als dat nodig is.',
          ],
        },
        {
          title: 'Bewaartermijn',
          points: [
            'Geüploade inhoud wordt bewaard in het evenementalbum.',
            'Albums en foto’s worden handmatig verwijderd via het beheerpanel.',
            'Wanneer nodig kan verwijdering van inhoud worden aangevraagd.',
          ],
        },
        {
          title: 'Aansprakelijkheidsuitsluiting',
          points: [
            'EventDrop is niet rechtstreeks verantwoordelijk voor inhoud die door gebruikers wordt geüpload.',
            'Bij technische storingen, onderbrekingen of gegevensverlies kan geen garantie worden gegeven.',
          ],
        },
      ],
      privacyTitle: 'Privacyverklaring',
      privacyIntro:
        'Op deze pagina lees je hoe persoonsgegevens binnen EventDrop worden verwerkt.',
      privacySections: [
        {
          title: 'Verwerkte gegevens',
          points: [
            'Je e-mailadres wordt gebruikt om toegang tot het evenement te beheren en je indien nodig te kunnen bereiken.',
            'Geüploade foto’s worden opgeslagen in het album van het betreffende evenement.',
            'Technische gegevens zoals IP-adres, apparaatinformatie en loggegevens kunnen tijdelijk worden bewaard voor beveiliging en foutopsporing.',
          ],
        },
        {
          title: 'Doel van gebruik',
          points: [
            'Gegevens worden alleen gebruikt om het evenementalbum beschikbaar te maken, delen mogelijk te maken en het systeem te beveiligen.',
            'Gegevens worden niet voor marketingdoeleinden aan derden verkocht of verstrekt.',
          ],
        },
        {
          title: 'Bewaren en verwijderen',
          points: [
            'Geüploade media wordt bewaard in het evenementalbum en kan handmatig worden verwijderd door de beheerder.',
            'Technische logs kunnen tijdelijk worden bewaard voor beveiliging en foutopsporing.',
          ],
        },
        {
          title: 'Rechten van gebruikers',
          points: [
            'Gebruikers kunnen verzoeken om verwijdering van geüploade inhoud.',
            'Op verzoek kunnen inzage, correctie of verwijdering van persoonsgegevens worden uitgevoerd.',
          ],
        },
        {
          title: 'Beveiliging',
          points: [
            'EventDrop neemt passende technische en organisatorische maatregelen om gegevens te beschermen.',
            'Volledige veiligheid van gegevensoverdracht via internet kan nooit volledig worden gegarandeerd.',
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
      guestEntryPage: 'Guest upload page',
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
      posterHeadline: 'DROP YOUR',
      posterAccent: 'moments',
      posterEyebrow: 'Scan. Upload. Done.',
      posterSubline: 'All event memories in one place.',
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
      marketingConsentLabel:
        'Yes, I would like to occasionally receive news, inspiration and offers from EventDrop Sharing and Photobooth Holland by email.',
      marketingConsentHelp: 'You can unsubscribe at any time.',
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
        'Albums and photos are deleted manually by the admin',
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
      openClose: 'Open/close',
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
      eventsTab: 'Events',
      demoTemplatesTab: 'Master Demos',
      createTitle: 'Manage the latest public album from here.',
      settingsGeneral: 'General',
      settingsBrandingMedia: 'Branding & media',
      settingsFeatures: 'Features',
      settingsAccessSharing: 'Access & sharing',
      settingsDownloadsExports: 'Downloads & exports',
      settingsDangerZone: 'Danger zone',
      selectedAlbumLabel: 'Selected album',
      publicSlugLabel: 'Public slug',
      photostripBackground: 'Photostrip background',
      photostripBackgroundHelp: 'Recommended: 1080 × 1920 px (9:16)',
      changeFile: 'Change file',
      chooseFile: 'Choose file',
      openAction: 'Open',
      copyAction: 'Copy',
      guestLinkLabel: 'Guest link',
      dangerAction: 'Dangerous action',
      eventName: 'Event name',
      demoTemplateName: 'Template name',
      demoTemplateNamePlaceholder: 'Wedding Master',
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
      posterTemplateImage: 'A3 poster template',
      storyTemplateImage: 'Instagram Story template',
      uploadCover: 'Upload cover image',
      uploadBackground: 'Upload background image',
      uploadPosterTemplate: 'Upload A3 template',
      uploadStoryTemplate: 'Upload Story template',
      updateCover: 'Change cover',
      updateBackground: 'Change background',
      updatePosterTemplate: 'Change A3 template',
      updateStoryTemplate: 'Change Story template',
      visualsSection: 'Visuals',
      visualsHelp: 'Upload each visual separately.',
      visualReady: 'uploaded',
      visualMissing: 'missing',
      visualSaved: 'saved.',
      eventDetails: 'Album details',
      saveEventDetails: 'Save title and album name',
      eventDetailsSaved: 'Album details saved.',
      eventDetailsSaveError: 'Album details could not be saved.',
      mediaUploading: 'Uploading image...',
      mediaUploadError: 'Image upload failed.',
      createButton: 'Create event album',
      createDemoTemplateButton: 'Create Master Demo',
      saving: 'Saving...',
      noEvents:
        'No events exist yet. Create the first album here and publish it on the homepage.',
      noDemoTemplates:
        'No Master Demos exist yet. Create a master with reusable design and settings.',
      unlockToManage:
        'Unlock the panel first to list, create, or delete events.',
      qrLabel: 'Guest upload QR',
      downloadQrPng: 'Download QR PNG',
      downloadQrSvg: 'Download QR SVG',
      uploadCopied: 'Guest upload link copied.',
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
      guestEmailSummary: '{count} unique email entries',
      copyGuestEmails: 'Copy emails',
      guestEmailsCopied: 'Email addresses copied.',
      showGuestEmails: 'Open list',
      noGuestEmails: 'No email entries have been recorded for this event yet.',
      guestEmailTimeUnknown: 'Entry time unavailable',
      publicTools: 'Guest actions',
      shareEnabled: 'Enable sharing',
      downloadEnabled: 'Enable downloads',
      albumDownloadEnabled: 'Enable full album download',
      deleteEnabled: 'Enable deletion',
      posterEnabled: 'Enable A3 poster',
      saveVisibility: 'Save action settings',
      visibilitySaved: 'Event action settings were updated.',
      visibilitySaveError: 'Event action settings could not be saved.',
      editAction: 'Edit',
      createDemoFromTemplate: 'Create demo',
      demoCloneAction: 'Copy new demo',
      demoCloneTitle: 'Copy new demo',
      demoCloneIntro: 'Create an empty, independent demo album with this Master Demo design and settings.',
      demoCustomerName: 'Customer name',
      demoCustomerPlaceholder: 'Studio Nova',
      demoCreate: 'Create demo',
      demoCreated: 'Demo album created.',
      demoNameRequired: 'Customer name is required.',
      demoOpenUpload: 'Open upload link',
      demoOpenGallery: 'Open gallery link',
      demoCopyLink: 'Copy demo link',
      liveOpen: 'Open live',
      liveCopyLink: 'Copy live link',
      liveCopied: 'Live link copied.',
      liveEnable: 'Enable live',
      liveDisable: 'Disable live',
      comingSoon: 'Coming soon',
      guestbookCoverPhoto: 'Guestbook cover photo',
      guestbookCoverPhotoActive: 'Dedicated guestbook photo is active.',
      guestbookCoverPhotoEmpty: 'No dedicated photo: the PDF uses a safe empty cover.',
      guestbookCoverPhotoFallback: 'No dedicated photo: the normal cover photo is used.',
      guestbookCoverPhotoHelp: 'Use a separate photo for the digital guestbook cover.',
      guestbookCoverPhotoRemove: 'Remove',
      guestbookCoverPhotoReplace: 'Replace cover photo',
      guestbookCoverPhotoUpload: 'Upload cover photo',
      guestbookLabel: 'Guestbook',
      guestbookMessagesEmpty: 'There are no guestbook messages for this album yet.',
      guestbookMessagesSummary: '{count} messages',
      guestbookMessagesTitle: 'Guestbook messages',
      guestbookMessageCancel: 'Cancel',
      guestbookMessageDelete: 'Delete',
      guestbookMessageDeleteConfirm: 'Delete this guestbook message?',
      guestbookMessageDeleted: 'Guestbook message deleted.',
      guestbookMessageDeleteError: 'Guestbook message could not be deleted.',
      guestbookMessageEdit: 'Edit',
      guestbookMessageNamePlaceholder: 'Name (optional)',
      guestbookMessageSave: 'Save',
      guestbookMessageSaved: 'Guestbook message updated.',
      guestbookMessageSaveError: 'Guestbook message could not be saved.',
      guestbookPdfPreviewHelp: 'Preview of the selected Guestbook PDF style.',
      guestbookPdfStyle: 'Guestbook PDF style',
      guestbookPdfThemeComingSoon: 'This Guestbook PDF style will be available soon.',
      guestbookPdfThemeComingSoonButton: 'PDF style coming soon',
      guestbookPhotoSource: 'Photo',
      downloadGuestbookPdf: 'Download guestbook',
      noGuestbookMessages: 'There are no guestbook messages to download.',
      refreshGuestbook: 'Refresh',
    },
    upload: {
      badge: 'Guest upload page',
      intro: 'Choose your photos and upload them to the album.',
      guidanceBadge: 'Upload rules',
      guidanceTitle: 'Please upload only photos that can be shared',
      guidanceIntro:
        'By uploading, you confirm that you are sharing these photos voluntarily and that you will respect the privacy of everyone at the event.',
      guidancePoints: [
        'Only upload photos that you are allowed to share.',
        'Do not upload humiliating, abusive, hateful, illegal, or privacy-violating content.',
        'In this first version, only photos are accepted; photos can be removed via the contact details.',
      ],
      consentLabel:
        'I confirm that I am authorized to upload and share these photos, and that photos added to this album may be viewed, downloaded, and shared by third parties.',
      consentHelp: '',
      consentRequired:
        'Please tick the consent checkbox before continuing.',
      uploadNeedsConsent: 'Please tick the consent checkbox before continuing.',
      consentLinks:
        'By continuing, you also confirm that you have read the terms and privacy notice.',
      consentButton: 'Continue',
      uploadLabel: 'Upload',
      namingLabel: 'Naming',
      namingText: 'Files are stored inside date-based folders.',
      retentionLabel: 'Retention',
      retentionText: '',
      selectLabel: 'Select photos',
      selectButton: 'Choose files',
      defaultAlbumName: 'Shared event album',
      guestbookPhotoLabel: 'Guestbook photo',
      guestbookPhotoHelp: 'Optionally select one photo to display with your message.',
      guestbookPhotoSelected: 'Selected',
      shareSectionTitle: 'Share album / QR code',
      guestbookPostError: 'Guestbook message could not be posted.',
      uploadEnvironmentError: 'The upload environment is not fully configured.',
      uploadFailedFallback: 'Upload failed.',
      heicConversionFailed: 'The HEIC/HEIF photo could not be converted; the remaining photos continued uploading.',
      photoOnlyNotice: 'This album is currently for photo uploads only.',
      guestbookHint: '❤️ You can also add a message to the guestbook with your photos.',
      guestbookCardTitle: 'Leave something in the guestbook ❤️',
      guestbookCardDescription: 'Optionally add your name and a personal message to your photos.',
      guestNameLabel: 'Name (optional)',
      guestNamePlaceholder: 'Your name',
      messageLabel: 'Message (optional)',
      messagePlaceholder: 'E.g. What a beautiful day! Wishing you lots of happiness ❤️',
      messageHelp: 'Optional · Your message appears in the guestbook.',
      messageLimitReached: 'Maximum character limit reached',
      noFilesChosen: 'No files selected yet',
      readyPrefix: 'Ready',
      photos: 'photos',
      filesSelected: 'files selected',
      unsupportedIgnored: 'unsupported files ignored',
      photoTooLarge: 'photo exceeds the 20 MB limit',
      photoBadRatio: 'very narrow or long photo was not added to the album',
      selectionLimit: 'you can choose up to 30 photos at a time',
      chooseSupported: 'JPG, PNG, WEBP, HEIC or HEIF',
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
      keepLinkButton: 'Save this link',
      keepLinkText: 'Save this link so you can upload photos again later.',
      keepLinkReady: 'Share sheet opened. Send the link to yourself on WhatsApp or messages.',
      keepLinkCopied: 'Link copied. Paste it into WhatsApp or messages.',
      keepLinkError: 'The link could not be shared right now.',
      selectionCleared: 'Selection cleared.',
    },
    gallery: {
      badge: 'Shared gallery',
      intro:
        'View and share the photos from this album.',
      loading: 'Loading this event gallery...',
      noUploads: 'No uploads are visible in this gallery yet.',
      showing: 'uploads visible',
      loadError: 'The gallery could not be loaded right now.',
      notFound: 'This event gallery could not be found.',
      downloadAll: 'Download album',
      downloadAlbumPackage: 'Download album package',
      downloadingAll: 'Preparing the full album...',
      downloadingSelected: 'Preparing the selected photos...',
      downloadPreparing: 'Preparing the ZIP file, please wait.',
      allDownloaded: 'The album download has started.',
      downloadSelected: 'Download selected',
      albumPackageReady: '{count} ZIP packages are ready. Download the packages one by one.',
      albumPackageNotice: 'For safe downloading, the album was split into {count} ZIP packages.',
      albumPackageLabel: 'Package',
      backToUpload: 'Add photos',
      posterButton: 'A3 poster',
      posterPreparing: 'Preparing poster...',
      posterChoose: 'Select up to 12 photos for the poster.',
      designPreview: 'View example',
      memoryPosterTitle: 'Memory Poster A3',
      photostripCreating: 'Creating Photostrip Story...',
      photostripReady: 'Photostrip Story is ready.',
      designChooseFormat: 'Choose A3 poster or Instagram story first.',
      designChooseMode: 'Choose a design mode first.',
      designChoosePosterMode: 'Choose a poster mode.',
      designChooseStoryMode: 'Choose a story mode.',
      designPosterActive: 'A3 poster mode. Select up to 12 photos.',
      designStoryActive: 'Instagram story mode. Select photos for the chosen mode.',
      designSelected: 'selected',
      designLimitReached: 'Maximum reached.',
      designPortraitLimitReached: 'Portrait photo limit reached.',
      designLandscapeLimitReached: 'Landscape photo limit reached.',
      designChangeFormat: 'Change format',
      designSwitchConfirm: 'Changing format will clear your current selection. Continue?',
      designCreate: 'Create',
      designPortraitFitsBetter: 'This photo fits better in Portrait.',
      designLandscapeFitsBetter: 'This photo fits better in Landscape.',
      designOrientationPending: 'Photo orientation is loading. Try again in a moment.',
      designNeutralDisabled: 'Choose a vertical or horizontal photo for this poster.',
      designMixedHint: 'Choose 8 portrait and 4 landscape photos for Mixed Poster.',
      designMixedIncomplete: 'Mixed Poster can be created after 8 portrait and 4 landscape photos.',
      designPortraitCount: 'Portrait',
      designLandscapeCount: 'Landscape',
      clearSelection: 'Clear selection',
      posterPortraitMode: 'Portrait Poster',
      posterLandscapeMode: 'Landscape Poster',
      posterMixedMode: 'Mixed Poster',
      posterLimitReached: '12 photos selected. The poster is ready.',
      posterMoreNeeded: 'more photos to fill the poster.',
      posterLimitExceeded: 'The poster will use only the first 12 photos.',
      posterExtraIgnored: 'extra selections will not be used for the poster.',
      posterBlackWhite: 'Black and white',
      posterStyleTitle: 'Choose poster style',
      posterStyleDescription: 'A3 poster uses 12 photos, Instagram story uses 4 or 8 photos by mode.',
      posterColorOption: 'Color poster (12 photos)',
      posterBlackWhiteOption: 'Black and white poster (12 photos)',
      storyOption: 'Instagram story',
      storyButton: 'Instagram story',
      storyPortraitMode: 'Portrait Story',
      storyLandscapeMode: 'Landscape Story',
      storyPreparing: 'Preparing Instagram story...',
      storyReady: 'Instagram story downloaded.',
      photostripShortage:
        'For this Story, use 3 photobooth strips in 5x15 format that were taken in the photobooth and downloaded to your phone.',
      cancel: 'Cancel',
      posterHorizontalTip: 'Landscape photos work best on the poster.',
      posterLimitPopup: '12 photos selected. An A3 poster uses up to 12 photos. Extra photos remain available for album download, but will not be used on the poster.',
      posterRatioPopup: 'A very long or narrow photo was not placed on the poster. Landscape photos work better.',
      posterNoUsablePhotos: 'No suitable photos were found for the poster.',
      posterReady: 'A3 poster downloaded.',
      guestMessageLabel: 'Guest message',
      selected: 'Selected',
      select: 'Select',
      openPreview: 'Open photo preview',
      closePreview: 'Close',
      previousPhoto: 'Previous photo',
      nextPhoto: 'Next photo',
      delete: 'Delete',
      deleting: 'Deleting...',
      deleteSelected: 'Delete selected',
      deleteSelectedConfirm: 'Are you sure you want to delete the selected uploads?',
      deleteSelectedSuccess: 'Selected uploads deleted.',
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
      selectionLimitReached: 'You can select up to 100 photos at a time.',
      uploadTimeUnavailable: 'Upload time unavailable',
      photo: 'Photo',
      videoMessagesTab: "Video Messages",
      videoEmpty: "No video messages yet. Share the first one!",
      videoLoading: "Loading videos…",
      videoGalleryError: "Videos could not be loaded. Check your access and refresh.",
      videoPlaybackError: "This video cannot be played or its link has expired.",
      videoRefresh: "Refresh",
      videoPrevious: "Previous",
      videoNext: "Next",
      photosTab: "Photos",
      guestbookTab: 'Guestbook',
      designsTab: 'Designs',
      downloadsTab: 'Downloads',
      guestbookTitle: 'Guestbook',
      guestbookFormTitle: 'Leave a message',
      guestbookNameLabel: 'Name (optional)',
      guestbookMessageLabel: 'Message',
      guestbookMessagePlaceholder: 'Write your message here...',
      guestbookSubmit: 'Post message',
      guestbookSubmitting: 'Posting...',
      guestbookSubmitSuccess: 'Your message was posted.',
      guestbookSubmitError: 'Your message could not be posted.',
      guestbookMessageRequired: 'Write a message first.',
      guestbookMessageTooLong: 'Your message can be up to 500 characters.',
      guestbookEmptyTitle: 'No messages yet.',
      guestbookEmptyText: 'Be the first to leave a message.',
    },
    legal: {
      termsTitle: 'Terms',
      termsIntro:
        'By using this event album, you agree to the rules below.',
      termsSections: [
        {
          title: 'Content responsibility',
          points: [
            'You confirm that you have the right to share the photos you upload.',
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
            'Uploaded content is stored inside the event album.',
            'Albums and photos are deleted manually from the admin panel.',
            'Content removal can be requested when needed.',
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
            'Uploaded photos are stored inside the relevant event album.',
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
            'Uploaded media is stored inside the event album and can be removed manually by the admin.',
            'Technical logs may be kept temporarily for security and troubleshooting.',
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

const germanTranslation: TranslationTree = {
  ...baseTranslations.en,
  common: {
    ...baseTranslations.en.common,
    contact: 'Kontakt', eventId: 'Event-ID', eventDate: 'Veranstaltungsdatum',
    guestEntryPage: 'Upload-Seite für Gäste', terms: 'Nutzungsbedingungen',
    privacy: 'Datenschutz', back: 'Zurück', uploadPage: 'Upload-Seite',
    gallery: 'Galerie', copyUploadLink: 'Gästelink kopieren',
    copyGalleryLink: 'Galerielink kopieren', deleteEvent: 'Event löschen',
    signOut: 'Abmelden', latestPublicAlbum: 'Neuestes Album öffnen',
    restrictedAdmin: 'Geschützte Verwaltung', language: 'Sprache',
  },
  home: {
    ...baseTranslations.en.home,
    badge: 'QR-Eventalbum',
    title: 'Alle Erinnerungen Ihres Events in einem gemeinsamen Album.',
    intro: 'Gäste öffnen per QR-Code das richtige Album und teilen ihre Fotos ganz einfach.',
    entryLabel: 'Sicherer Gästezugang', formTitle: 'Zum Eventalbum',
    formIntro: 'Geben Sie Ihre E-Mail-Adresse und gegebenenfalls den Eventcode ein.',
    emailLabel: 'E-Mail-Adresse', codeLabel: 'Eventcode', accessButton: 'Album öffnen',
    accessHint: 'E-Mail-Adresse und Eventcode eingeben, um fortzufahren.',
    accessGranted: 'Zugang bestätigt. Das Album wird geöffnet ...',
    accessError: 'Der Zugang konnte nicht bestätigt werden.',
    emailRequired: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    codeRequired: 'Bitte geben Sie den Eventcode ein.', checkingAccess: 'Wird geprüft ...',
    manualAccessHelp: 'Kein QR-Code? Öffnen Sie Ihr Album mit E-Mail-Adresse und Eventcode.',
    prefilledEvent: 'Dieses Event ist bereits ausgewählt. Geben Sie Ihre E-Mail-Adresse und den Eventcode ein.',
    prefilledEventEmailOnly: 'Dieses Event ist bereits ausgewählt. Geben Sie nur Ihre E-Mail-Adresse ein.',
    marketingConsentLabel: 'Ja, ich möchte gelegentlich Neuigkeiten, Inspirationen und Angebote von EventDrop Sharing und Photobooth Holland per E-Mail erhalten.',
    marketingConsentHelp: 'Sie können sich jederzeit abmelden.',
    latestAlbumLabel: 'Neuestes Album', latestAlbumReady: 'Das neueste Album ist bereit.',
    noAlbum: 'Noch kein Eventalbum verfügbar.', uploadCta: 'Fotos hochladen',
    galleryCta: 'Galerie ansehen', contactLabel: 'Kontakt', loading: 'Wird geladen ...',
    posterHeadline: 'TEILE DEINE', posterAccent: 'Momente', posterEyebrow: 'Scannen. Hochladen. Fertig.',
    posterSubline: 'Alle Eventerinnerungen an einem Ort.', bestFor: 'Ideal für',
    bestForText: 'Hochzeiten, Firmenfeiern, Geburtstage und Photobooth-Events.',
    flowTitle: 'So funktioniert EventDrop', flowText: 'QR-Code scannen, Fotos auswählen und direkt im gemeinsamen Album teilen.',
    howItWorks: 'So funktioniert es', shareSite: 'EventDrop teilen', shareReady: 'Der Freigabelink ist bereit.',
    shareCopied: 'Link kopiert.',
    points: ['Eigener QR-Link für jedes Event', 'Sicherer Zugang zum richtigen Album', 'Fotos ansehen, teilen und herunterladen'],
    sections: [
      { title: 'Ein Album für alle Gäste', body: ['Alle Fotos des Events werden an einem übersichtlichen Ort gesammelt.', 'Gäste können direkt vom Smartphone hochladen.'] },
      { title: 'Einfach und sicher', body: ['Jedes Event hat einen eigenen Link und optionalen Eventcode.', 'Die Freigabe- und Downloadrechte werden pro Album verwaltet.'] },
      { title: 'Erinnerungen sofort verfügbar', body: ['Fotos erscheinen direkt in der gemeinsamen Galerie.', 'Ausgewählte Fotos, Poster und Storys können heruntergeladen werden.'] },
    ],
  },
  admin: {
    ...baseTranslations.en.admin,
    openClose: 'Öffnen/schließen',
    settingsGeneral: 'Allgemein',
    settingsBrandingMedia: 'Branding & Medien',
    settingsFeatures: 'Funktionen',
    settingsAccessSharing: 'Zugang & Teilen',
    settingsDownloadsExports: 'Downloads & Exporte',
    settingsDangerZone: 'Gefahrenzone',
    selectedAlbumLabel: 'Ausgewähltes Album',
    publicSlugLabel: 'Öffentlicher Slug',
    photostripBackground: 'Photostrip-Hintergrund',
    photostripBackgroundHelp: 'Empfohlen: 1080 × 1920 px (9:16)',
    changeFile: 'Datei ändern',
    chooseFile: 'Datei auswählen',
    openAction: 'Öffnen',
    copyAction: 'Kopieren',
    guestLinkLabel: 'Gastlink',
    dangerAction: 'Gefährliche Aktion',
    downloadGuestbookPdf: 'Gästebuch herunterladen',
    noGuestbookMessages: 'Es gibt keine Gästebuchnachrichten zum Herunterladen.',
    refreshGuestbook: 'Aktualisieren',
  },
  upload: {
    ...baseTranslations.en.upload,
    badge: 'Gäste-Upload', intro: 'Fotos auswählen und zum Album hochladen.',
    guidanceBadge: 'Upload-Regeln', guidanceTitle: 'Bitte nur Fotos hochladen, die geteilt werden dürfen',
    guidanceIntro: 'Mit dem Upload bestätigen Sie, dass Sie die Fotos freiwillig teilen und die Privatsphäre anderer respektieren.',
    guidancePoints: [
      'Laden Sie nur Fotos hoch, die Sie teilen dürfen.',
      'Laden Sie keine beleidigenden, rechtswidrigen oder die Privatsphäre verletzenden Inhalte hoch.',
      'Dateien werden vorübergehend gespeichert. Für eine Löschung können Sie uns kontaktieren.',
    ],
    consentLabel: 'Ich bestätige, dass ich diese Fotos hochladen und teilen darf und dass sie von Dritten angesehen, heruntergeladen und geteilt werden können.',
    consentRequired: 'Bitte aktiviere das Zustimmungsfeld, bevor du fortfährst.',
    uploadNeedsConsent: 'Bitte aktiviere das Zustimmungsfeld, bevor du fortfährst.',
    consentLinks: 'Mit dem Fortfahren bestätigen Sie auch, dass Sie die Nutzungsbedingungen und Datenschutzhinweise gelesen haben.',
    consentButton: 'Weiter', uploadLabel: 'Upload', namingLabel: 'Dateiname',
    namingText: 'Dateien werden in datumsbasierten Ordnern gespeichert.', retentionLabel: 'Speicherdauer',
    selectLabel: 'Fotos auswählen', selectButton: 'Dateien auswählen',
    defaultAlbumName: 'Geteiltes Eventalbum',
    guestbookPhotoLabel: 'Gästebuchfoto',
    guestbookPhotoHelp: 'Wähle optional ein Foto aus, das zusammen mit deiner Nachricht angezeigt wird.',
    guestbookPhotoSelected: 'Ausgewählt',
    shareSectionTitle: 'Album teilen / QR-Code',
    guestbookPostError: 'Gästebuchnachricht konnte nicht gesendet werden.',
    uploadEnvironmentError: 'Die Upload-Umgebung ist nicht vollständig eingerichtet.',
    uploadFailedFallback: 'Upload fehlgeschlagen.',
    heicConversionFailed: 'Das HEIC/HEIF-Foto konnte nicht konvertiert werden; die übrigen Fotos wurden weiter hochgeladen.',
    photoOnlyNotice: 'Dieses Album akzeptiert derzeit nur Fotos.',
    guestbookHint: '❤️ Du kannst zu deinen Fotos auch eine Nachricht ins Gästebuch schreiben.',
    guestbookCardTitle: 'Hinterlasse etwas im Gästebuch ❤️',
    guestbookCardDescription: 'Optional kannst du deinen Namen und eine persönliche Nachricht zu deinen Fotos hinzufügen.',
    guestNameLabel: 'Name (optional)', guestNamePlaceholder: 'Dein Name',
    messageLabel: 'Nachricht (optional)', messagePlaceholder: 'Zum Beispiel: Was für ein schöner Tag! Alles Glück für euch ❤️',
    messageHelp: 'Optional · Deine Nachricht erscheint im Gästebuch.',
    messageLimitReached: 'Maximale Zeichenanzahl erreicht',
    noFilesChosen: 'Noch keine Dateien ausgewählt', readyPrefix: 'Bereit', photos: 'Fotos',
    filesSelected: 'Dateien ausgewählt', unsupportedIgnored: 'nicht unterstützte Dateien wurden ignoriert',
    photoTooLarge: 'Foto überschreitet das Limit von 20 MB',
    photoBadRatio: 'Sehr schmales oder langes Foto wurde nicht hinzugefügt',
    selectionLimit: 'Sie können bis zu 30 Fotos gleichzeitig auswählen',
    chooseSupported: 'JPG, PNG, WEBP, HEIC oder HEIF',
    chooseStart: 'Wählen Sie ein Foto, um zu beginnen.',
    eventNotFound: 'Dieses Event wurde nicht gefunden. Prüfen Sie den Link oder QR-Code.',
    eventNotReady: 'Dieses Event ist noch nicht für Uploads bereit.', uploadInProgress: 'Wird hochgeladen ...',
    uploadComplete: 'Upload abgeschlossen. Die Galerie wird geöffnet ...',
    uploadButton: 'Zum gemeinsamen Album hochladen', uploadingButton: 'Wird hochgeladen ...',
    clearSelection: 'Auswahl löschen', viewGallery: 'Galerie ansehen',
    qrTitle: 'Per QR-Code teilen', qrText: 'Gäste gelangen mit diesem QR-Code direkt zur Upload-Seite.',
    albumLink: 'Albumlink', keepLinkButton: 'Diesen Link speichern',
    keepLinkText: 'Speichern Sie diesen Link, um später weitere Fotos hochzuladen.',
    keepLinkReady: 'Teilen geöffnet. Senden Sie den Link per WhatsApp oder Nachricht an sich selbst.',
    keepLinkCopied: 'Link kopiert. Fügen Sie ihn in WhatsApp oder Nachrichten ein.',
    keepLinkError: 'Der Link konnte gerade nicht geteilt werden.', selectionCleared: 'Auswahl gelöscht.',
  },
  gallery: {
    ...baseTranslations.en.gallery,
    badge: 'Gemeinsame Galerie', intro: 'Fotos aus diesem Album ansehen und teilen.',
    loading: 'Eventgalerie wird geladen ...', noUploads: 'In dieser Galerie sind noch keine Fotos sichtbar.',
    showing: 'Uploads sichtbar', loadError: 'Die Galerie konnte nicht geladen werden.',
    notFound: 'Diese Eventgalerie wurde nicht gefunden.', downloadAll: 'Album herunterladen',
    downloadAlbumPackage: 'Albumpaket herunterladen', downloadingAll: 'Album wird vorbereitet ...',
    downloadingSelected: 'Ausgewählte Fotos werden vorbereitet ...',
    downloadPreparing: 'ZIP-Datei wird vorbereitet. Bitte warten.',
    allDownloaded: 'Der Album-Download wurde gestartet.', downloadSelected: 'Auswahl herunterladen',
    albumPackageReady: '{count} ZIP-Pakete sind bereit. Laden Sie sie einzeln herunter.',
    albumPackageNotice: 'Für einen sicheren Download wurde das Album in {count} ZIP-Pakete aufgeteilt.',
    albumPackageLabel: 'Paket', backToUpload: 'Fotos hinzufügen', posterButton: 'A3-Poster',
    posterPreparing: 'Poster wird vorbereitet ...', posterChoose: 'Wählen Sie bis zu 12 Fotos für das Poster.',
    designPreview: 'Beispiel ansehen',
    memoryPosterTitle: 'Memory Poster A3',
    photostripCreating: 'Photostrip Story wird erstellt...',
    photostripReady: 'Photostrip Story ist fertig.',
    designChooseFormat: 'Wählen Sie zuerst A3-Poster oder Instagram Story.',
    designChooseMode: 'Wählen Sie zuerst einen Gestaltungsmodus.',
    designChoosePosterMode: 'Postermodus wählen.',
    designChooseStoryMode: 'Story-Modus wählen.',
    designPosterActive: 'A3-Poster aktiv. Wählen Sie bis zu 12 Fotos.',
    designStoryActive: 'Instagram Story aktiv. Wählen Sie Fotos für den gewählten Modus.',
    designSelected: 'ausgewählt',
    designLimitReached: 'Maximum erreicht.',
    designPortraitLimitReached: 'Maximum für Hochformatfotos erreicht.',
    designLandscapeLimitReached: 'Maximum für Querformatfotos erreicht.',
    designChangeFormat: 'Format ändern',
    designSwitchConfirm: 'Beim Formatwechsel wird die aktuelle Auswahl gelöscht. Fortfahren?',
    designCreate: 'Erstellen',
    designPortraitFitsBetter: 'Dieses Foto passt besser in Portrait.',
    designLandscapeFitsBetter: 'Dieses Foto passt besser in Landscape.',
    designOrientationPending: 'Die Fotoausrichtung wird geladen. Bitte gleich erneut versuchen.',
    designNeutralDisabled: 'Wählen Sie für dieses Poster ein Hoch- oder Querformatfoto.',
    designMixedHint: 'Wählen Sie 8 Hochformat- und 4 Querformatfotos für Mixed Poster.',
    designMixedIncomplete: 'Mixed Poster kann erst mit 8 Hochformat- und 4 Querformatfotos erstellt werden.',
    designPortraitCount: 'Portrait',
    designLandscapeCount: 'Landscape',
    clearSelection: 'Auswahl löschen',
    posterPortraitMode: 'Portrait Poster',
    posterLandscapeMode: 'Landscape Poster',
    posterMixedMode: 'Mixed Poster',
    posterLimitReached: '12 Fotos ausgewählt. Das Poster ist bereit.',
    posterMoreNeeded: 'weitere Fotos, um das Poster zu füllen.',
    posterLimitExceeded: 'Für das Poster werden nur die ersten 12 Fotos verwendet.',
    posterExtraIgnored: 'Zusätzliche Fotos werden nicht für das Poster verwendet.',
    posterBlackWhite: 'Schwarz-Weiß', posterStyleTitle: 'Poster-Stil wählen',
    posterStyleDescription: 'Das A3-Poster verwendet 12 Fotos, die Instagram Story je nach Modus 4 oder 8.',
    posterColorOption: 'Farbposter (12 Fotos)', posterBlackWhiteOption: 'Schwarz-Weiß-Poster (12 Fotos)',
    storyOption: 'Instagram Story', storyButton: 'Instagram Story',
    storyPortraitMode: 'Portrait Story', storyLandscapeMode: 'Landscape Story',
    storyPreparing: 'Instagram Story wird vorbereitet ...', storyReady: 'Instagram Story heruntergeladen.',
    photostripShortage: 'Verwende für diese Story 3 Photobooth-Strips im Format 5x15, die in der Photobooth aufgenommen und auf dein Handy heruntergeladen wurden.',
    cancel: 'Abbrechen', posterHorizontalTip: 'Querformatfotos liefern das beste Poster-Ergebnis.',
    posterLimitPopup: '12 Fotos ausgewählt. Ein A3-Poster verwendet höchstens 12 Fotos. Weitere Fotos bleiben für den Album-Download verfügbar.',
    posterRatioPopup: 'Ein sehr langes oder schmales Foto wurde nicht auf dem Poster platziert. Querformatfotos funktionieren besser.',
    posterNoUsablePhotos: 'Für das Poster wurden keine geeigneten Fotos gefunden.',
    posterReady: 'A3-Poster heruntergeladen.', guestMessageLabel: 'Nachricht des Gastes',
    selected: 'Ausgewählt', select: 'Auswählen', openPreview: 'Fotovorschau öffnen',
    closePreview: 'Schließen', previousPhoto: 'Vorheriges Foto', nextPhoto: 'Nächstes Foto',
    delete: 'Löschen', deleting: 'Wird gelöscht ...', deleteSelected: 'Auswahl löschen',
    deleteSelectedConfirm: 'Möchten Sie die ausgewählten Uploads wirklich löschen?',
    deleteSelectedSuccess: 'Ausgewählte Uploads gelöscht.', deleteConfirm: 'Diesen Upload wirklich löschen?',
    deleteSuccess: 'Upload gelöscht.', deleteError: 'Upload konnte nicht gelöscht werden.',
    share: 'Teilen', shareSuccess: 'Der Freigabelink ist bereit.', shareCopied: 'Freigabelink kopiert.',
    shareError: 'Teilen konnte gerade nicht geöffnet werden.', download: 'Herunterladen',
    downloaded: 'Dateien heruntergeladen', chooseBeforeDownload: 'Wählen Sie vor dem Download mindestens ein Foto aus.',
    selectionLimitReached: 'Sie können bis zu 100 Fotos gleichzeitig auswählen.',
    uploadTimeUnavailable: 'Upload-Zeit nicht verfügbar', photo: 'Foto',
    videoMessagesTab: "Videobotschaften",
    videoEmpty: "Noch keine Videobotschaften. Teile die erste!",
    videoLoading: "Videos werden geladen…",
    videoGalleryError: "Videos konnten nicht geladen werden. Prüfe deinen Zugang und lade neu.",
    videoPlaybackError: "Dieses Video kann nicht abgespielt werden oder der Link ist abgelaufen.",
    videoRefresh: "Aktualisieren",
    videoPrevious: "Zurück",
    videoNext: "Weiter",
    photosTab: 'Fotos', guestbookTab: 'Gästebuch', designsTab: 'Designs', downloadsTab: 'Downloads', guestbookTitle: 'Gästebuch',
    guestbookFormTitle: 'Nachricht hinterlassen',
    guestbookNameLabel: 'Name (optional)',
    guestbookMessageLabel: 'Nachricht',
    guestbookMessagePlaceholder: 'Schreiben Sie hier Ihre Nachricht...',
    guestbookSubmit: 'Nachricht senden',
    guestbookSubmitting: 'Wird gesendet...',
    guestbookSubmitSuccess: 'Ihre Nachricht wurde hinzugefügt.',
    guestbookSubmitError: 'Ihre Nachricht konnte nicht gesendet werden.',
    guestbookMessageRequired: 'Schreiben Sie zuerst eine Nachricht.',
    guestbookMessageTooLong: 'Ihre Nachricht darf höchstens 500 Zeichen lang sein.',
    guestbookEmptyTitle: 'Noch keine Nachrichten.',
    guestbookEmptyText: 'Hinterlassen Sie die erste Nachricht.',
  },
  legal: {
    ...baseTranslations.en.legal,
    termsTitle: 'Nutzungsbedingungen',
    termsIntro: 'Mit der Nutzung dieses Eventalbums stimmen Sie den folgenden Regeln zu.',
    privacyTitle: 'Datenschutzhinweise',
    privacyIntro: 'Hier erfahren Sie, wie personenbezogene Daten in EventDrop verarbeitet werden.',
    termsSections: [
      { title: 'Zulässige Inhalte', points: ['Laden Sie nur Inhalte hoch, die Sie teilen dürfen.', 'Verletzende, rechtswidrige oder die Privatsphäre verletzende Inhalte sind nicht erlaubt.'] },
      { title: 'Nutzung des Systems', points: ['EventDrop sammelt Beiträge von Gästen in einem gemeinsamen Eventalbum.', 'Bei Missbrauch oder Spam kann der Zugang eingeschränkt werden.'] },
      { title: 'Speicherdauer', points: ['Inhalte werden normalerweise vorübergehend nach dem Event gespeichert.', 'Der Veranstalter kann eine andere Speicherdauer festlegen.'] },
      { title: 'Haftung', points: ['Nutzer sind für ihre hochgeladenen Inhalte verantwortlich.', 'Bei technischen Problemen oder Datenverlust kann keine vollständige Garantie gegeben werden.'] },
    ],
    privacySections: [
      { title: 'Erhobene Daten', points: ['Die E-Mail-Adresse wird für den Eventzugang verwendet.', 'Hochgeladene Fotos werden im jeweiligen Eventalbum gespeichert.', 'Technische Protokolle können vorübergehend für Sicherheit und Fehlerbehebung gespeichert werden.'] },
      { title: 'Verwendungszweck', points: ['Daten werden nur für das Eventalbum, die Freigabe und den Schutz des Systems verwendet.', 'Daten werden nicht für Marketingzwecke an Dritte verkauft.'] },
      { title: 'Speicherung und Löschung', points: ['Medien und technische Protokolle werden nur für einen begrenzten Zeitraum gespeichert.', 'Eine Löschung kann über die Kontaktdaten angefordert werden.'] },
      { title: 'Ihre Rechte', points: ['Sie können Auskunft, Berichtigung oder Löschung Ihrer Daten verlangen.'] },
      { title: 'Sicherheit', points: ['EventDrop setzt technische und organisatorische Schutzmaßnahmen ein.', 'Eine vollständig risikofreie Übertragung im Internet kann nicht garantiert werden.'] },
    ],
    acknowledge: 'Ich habe dies gelesen und verstanden',
  },
}

const frenchTranslation: TranslationTree = {
  ...baseTranslations.en,
  common: {
    ...baseTranslations.en.common,
    contact: 'Contact', eventId: "ID de l’événement", eventDate: "Date de l’événement",
    guestEntryPage: 'Page de dépôt des invités', terms: "Conditions d’utilisation",
    privacy: 'Confidentialité', back: 'Retour', uploadPage: 'Ajouter des photos',
    gallery: 'Galerie', copyUploadLink: "Copier le lien d’accès", copyGalleryLink: 'Copier le lien de la galerie',
    deleteEvent: "Supprimer l’événement", signOut: 'Se déconnecter',
    latestPublicAlbum: 'Ouvrir le dernier album', restrictedAdmin: 'Administration sécurisée', language: 'Langue',
  },
  home: {
    ...baseTranslations.en.home,
    badge: 'Album événementiel par QR code',
    title: 'Tous les souvenirs de votre événement dans un album partagé.',
    intro: 'Les invités ouvrent le bon album via le QR code et partagent facilement leurs photos.',
    entryLabel: 'Accès sécurisé des invités', formTitle: "Accéder à l’album",
    formIntro: "Saisissez votre adresse e-mail et, si nécessaire, le code de l’événement.",
    emailLabel: 'Adresse e-mail', codeLabel: "Code de l’événement", accessButton: "Ouvrir l’album",
    accessHint: "Saisissez votre e-mail et le code de l’événement pour continuer.",
    accessGranted: "Accès confirmé. Ouverture de l’album…", accessError: "L’accès n’a pas pu être confirmé.",
    emailRequired: 'Veuillez saisir une adresse e-mail valide.', codeRequired: "Veuillez saisir le code de l’événement.",
    checkingAccess: 'Vérification…', manualAccessHelp: "Pas de QR code ? Accédez à l’album avec votre e-mail et le code.",
    prefilledEvent: 'Cet événement est déjà sélectionné. Saisissez votre e-mail et le code.',
    prefilledEventEmailOnly: 'Cet événement est déjà sélectionné. Saisissez uniquement votre e-mail.',
    marketingConsentLabel: 'Oui, je souhaite recevoir de temps en temps par e-mail des actualités, de l’inspiration et des offres d’EventDrop Sharing et de Photobooth Holland.',
    marketingConsentHelp: 'Vous pouvez vous désinscrire à tout moment.',
    latestAlbumLabel: 'Dernier album', latestAlbumReady: 'Le dernier album est disponible.',
    noAlbum: "Aucun album n’est encore disponible.", uploadCta: 'Ajouter des photos',
    galleryCta: 'Voir la galerie', contactLabel: 'Contact', loading: 'Chargement…',
    posterHeadline: 'PARTAGEZ VOS', posterAccent: 'moments', posterEyebrow: 'Scannez. Ajoutez. Terminé.',
    posterSubline: 'Tous les souvenirs de l’événement au même endroit.', bestFor: 'Idéal pour',
    bestForText: 'Mariages, événements professionnels, anniversaires et photobooths.',
    flowTitle: 'Comment fonctionne EventDrop', flowText: 'Scannez le QR code, sélectionnez vos photos et partagez-les dans l’album commun.',
    howItWorks: 'Comment ça marche', shareSite: 'Partager EventDrop', shareReady: 'Le lien de partage est prêt.',
    shareCopied: 'Lien copié.',
    points: ['Un lien QR propre à chaque événement', 'Accès sécurisé au bon album', 'Photos à consulter, partager et télécharger'],
    sections: [
      { title: 'Un album pour tous les invités', body: ['Toutes les photos de l’événement sont réunies au même endroit.', 'Les invités ajoutent leurs photos directement depuis leur téléphone.'] },
      { title: 'Simple et sécurisé', body: ['Chaque événement possède son propre lien et éventuellement un code.', 'Les droits de partage et de téléchargement sont réglés par album.'] },
      { title: 'Des souvenirs disponibles immédiatement', body: ['Les photos apparaissent directement dans la galerie partagée.', 'Les photos sélectionnées, posters et stories peuvent être téléchargés.'] },
    ],
  },
  admin: {
    ...baseTranslations.en.admin,
    openClose: 'Ouvrir/fermer',
    settingsGeneral: 'Général',
    settingsBrandingMedia: 'Branding & médias',
    settingsFeatures: 'Fonctionnalités',
    settingsAccessSharing: 'Accès & partage',
    settingsDownloadsExports: 'Téléchargements & exports',
    settingsDangerZone: 'Zone dangereuse',
    selectedAlbumLabel: 'Album sélectionné',
    publicSlugLabel: 'Slug public',
    photostripBackground: 'Arrière-plan Photostrip',
    photostripBackgroundHelp: 'Recommandé : 1080 × 1920 px (9:16)',
    changeFile: 'Changer le fichier',
    chooseFile: 'Choisir un fichier',
    openAction: 'Ouvrir',
    copyAction: 'Copier',
    guestLinkLabel: 'Lien invité',
    dangerAction: 'Action dangereuse',
    downloadGuestbookPdf: "Télécharger le livre d’or",
    noGuestbookMessages: "Aucun message du livre d’or à télécharger.",
    refreshGuestbook: 'Actualiser',
  },
  upload: {
    ...baseTranslations.en.upload,
    badge: 'Dépôt des invités', intro: "Sélectionnez vos photos et ajoutez-les à l’album.",
    guidanceBadge: 'Règles de partage', guidanceTitle: 'Ajoutez uniquement des photos que vous pouvez partager',
    guidanceIntro: "En ajoutant des photos, vous confirmez les partager volontairement et respecter la vie privée des autres participants.",
    guidancePoints: [
      'Ajoutez uniquement des photos que vous êtes autorisé à partager.',
      'N’ajoutez aucun contenu offensant, illégal ou portant atteinte à la vie privée.',
      'Les fichiers sont conservés temporairement. Contactez-nous pour demander une suppression.',
    ],
    consentLabel: "Je confirme être autorisé à ajouter et partager ces photos et qu’elles peuvent être vues, téléchargées et partagées par des tiers.",
    consentRequired: 'Cochez la case de consentement avant de continuer.',
    uploadNeedsConsent: 'Cochez la case de consentement avant de continuer.',
    consentLinks: "En continuant, vous confirmez également avoir lu les conditions d’utilisation et la politique de confidentialité.",
    consentButton: 'Continuer', uploadLabel: 'Ajout', namingLabel: 'Nom du fichier',
    namingText: 'Les fichiers sont classés dans des dossiers par date.', retentionLabel: 'Durée de conservation',
    selectLabel: 'Sélectionner des photos', selectButton: 'Choisir des fichiers',
    defaultAlbumName: 'Album événementiel partagé',
    guestbookPhotoLabel: 'Photo du livre d’or',
    guestbookPhotoHelp: 'Sélectionnez éventuellement une photo à afficher avec votre message.',
    guestbookPhotoSelected: 'Sélectionnée',
    shareSectionTitle: 'Partager l’album / QR code',
    guestbookPostError: "Le message du livre d’or n’a pas pu être publié.",
    uploadEnvironmentError: "L’environnement d’envoi n’est pas complètement configuré.",
    uploadFailedFallback: "L’envoi a échoué.",
    heicConversionFailed: 'La photo HEIC/HEIF n’a pas pu être convertie ; les autres photos ont continué à être envoyées.',
    photoOnlyNotice: "Cet album accepte actuellement uniquement les photos.",
    guestbookHint: '❤️ Vous pouvez aussi ajouter un message au livre d’or avec vos photos.',
    guestbookCardTitle: 'Laissez un mot dans le livre d’or ❤️',
    guestbookCardDescription: 'Ajoutez éventuellement votre nom et un message personnel à vos photos.',
    guestNameLabel: 'Nom (facultatif)', guestNamePlaceholder: 'Votre nom',
    messageLabel: 'Message (facultatif)', messagePlaceholder: 'Par exemple : Quelle belle journée ! Beaucoup de bonheur à vous ❤️',
    messageHelp: 'Facultatif · Votre message apparaîtra dans le livre d’or.',
    messageLimitReached: 'Nombre maximal de caractères atteint',
    noFilesChosen: 'Aucun fichier sélectionné', readyPrefix: 'Prêt', photos: 'photos',
    filesSelected: 'fichiers sélectionnés', unsupportedIgnored: 'fichiers non pris en charge ignorés',
    photoTooLarge: 'la photo dépasse la limite de 20 Mo', photoBadRatio: "la photo très étroite ou très longue n’a pas été ajoutée",
    selectionLimit: "vous pouvez sélectionner jusqu’à 30 photos à la fois",
    chooseSupported: 'JPG, PNG, WEBP, HEIC ou HEIF', chooseStart: 'Choisissez une photo pour commencer.',
    eventNotFound: "Cet événement est introuvable. Vérifiez le lien ou le QR code.",
    eventNotReady: "Cet événement n’est pas encore prêt à recevoir des photos.", uploadInProgress: 'Envoi en cours…',
    uploadComplete: 'Envoi terminé. Ouverture de la galerie…', uploadButton: "Ajouter à l’album partagé",
    uploadingButton: 'Envoi en cours…', clearSelection: 'Effacer la sélection', viewGallery: 'Voir la galerie',
    qrTitle: 'Partager par QR code', qrText: "Les invités accèdent directement à cette page avec ce QR code.",
    albumLink: "Lien de l’album", keepLinkButton: 'Enregistrer ce lien',
    keepLinkText: "Enregistrez ce lien pour ajouter d’autres photos plus tard.",
    keepLinkReady: 'Partage ouvert. Envoyez-vous le lien par WhatsApp ou message.',
    keepLinkCopied: 'Lien copié. Collez-le dans WhatsApp ou vos messages.',
    keepLinkError: "Le lien ne peut pas être partagé pour le moment.", selectionCleared: 'Sélection effacée.',
  },
  gallery: {
    ...baseTranslations.en.gallery,
    badge: 'Galerie partagée', intro: 'Consultez et partagez les photos de cet album.',
    loading: "Chargement de la galerie…", noUploads: "Aucune photo n’est encore visible dans cette galerie.",
    showing: 'photos visibles', loadError: "La galerie n’a pas pu être chargée.", notFound: 'Cette galerie est introuvable.',
    downloadAll: "Télécharger l’album", downloadAlbumPackage: "Télécharger le lot de l’album",
    downloadingAll: "Préparation de l’album…", downloadingSelected: 'Préparation des photos sélectionnées…',
    downloadPreparing: 'Préparation du fichier ZIP. Veuillez patienter.', allDownloaded: "Le téléchargement de l’album a commencé.",
    downloadSelected: 'Télécharger la sélection',
    albumPackageReady: '{count} fichiers ZIP sont prêts. Téléchargez-les un par un.',
    albumPackageNotice: "Pour un téléchargement fiable, l’album a été divisé en {count} fichiers ZIP.",
    albumPackageLabel: 'Lot', backToUpload: 'Ajouter des photos', posterButton: 'Poster A3',
    posterPreparing: 'Préparation du poster…', posterChoose: "Sélectionnez jusqu’à 12 photos pour le poster.",
    designPreview: 'Voir un exemple',
    memoryPosterTitle: 'Memory Poster A3',
    photostripCreating: 'Création de la Photostrip Story...',
    photostripReady: 'Photostrip Story prête.',
    designChooseFormat: 'Choisissez d’abord Poster A3 ou Story Instagram.',
    designChooseMode: 'Choisissez d’abord un mode de création.',
    designChoosePosterMode: 'Choisissez un mode poster.',
    designChooseStoryMode: 'Choisissez un mode story.',
    designPosterActive: 'Mode Poster A3. Sélectionnez jusqu’à 12 photos.',
    designStoryActive: 'Mode Story Instagram. Sélectionnez les photos pour le mode choisi.',
    designSelected: 'sélectionnées',
    designLimitReached: 'Maximum atteint.',
    designPortraitLimitReached: 'Maximum de photos verticales atteint.',
    designLandscapeLimitReached: 'Maximum de photos horizontales atteint.',
    designChangeFormat: 'Changer de format',
    designSwitchConfirm: 'Changer de format effacera la sélection actuelle. Continuer ?',
    designCreate: 'Créer',
    designPortraitFitsBetter: 'Cette photo convient mieux au mode Portrait.',
    designLandscapeFitsBetter: 'Cette photo convient mieux au mode Landscape.',
    designOrientationPending: "L’orientation de la photo est en cours de chargement. Réessayez dans un instant.",
    designNeutralDisabled: 'Choisissez une photo verticale ou horizontale pour ce poster.',
    designMixedHint: 'Choisissez 8 photos verticales et 4 horizontales pour Mixed Poster.',
    designMixedIncomplete: 'Mixed Poster peut être créé avec 8 photos verticales et 4 horizontales.',
    designPortraitCount: 'Portrait',
    designLandscapeCount: 'Landscape',
    clearSelection: 'Effacer la sélection',
    posterPortraitMode: 'Portrait Poster',
    posterLandscapeMode: 'Landscape Poster',
    posterMixedMode: 'Mixed Poster',
    posterLimitReached: '12 photos sélectionnées. Le poster est prêt.', posterMoreNeeded: 'photos supplémentaires pour remplir le poster.',
    posterLimitExceeded: 'Seules les 12 premières photos seront utilisées pour le poster.',
    posterExtraIgnored: 'Les sélections supplémentaires ne seront pas utilisées pour le poster.',
    posterBlackWhite: 'Noir et blanc', posterStyleTitle: 'Choisir le style du poster',
    posterStyleDescription: "Le poster A3 utilise 12 photos et la Story Instagram 4 ou 8 selon le mode.",
    posterColorOption: 'Poster couleur (12 photos)', posterBlackWhiteOption: 'Poster noir et blanc (12 photos)',
    storyOption: 'Story Instagram', storyButton: 'Story Instagram',
    storyPortraitMode: 'Portrait Story', storyLandscapeMode: 'Landscape Story',
    storyPreparing: 'Préparation de la Story Instagram…', storyReady: 'Story Instagram téléchargée.',
    photostripShortage: 'Pour cette Story, utilisez 3 photostrips au format 5x15 pris dans le photobooth et téléchargés sur votre téléphone.',
    cancel: 'Annuler', posterHorizontalTip: 'Les photos horizontales donnent le meilleur résultat sur le poster.',
    posterLimitPopup: '12 photos sélectionnées. Un poster A3 utilise au maximum 12 photos. Les autres restent disponibles pour le téléchargement de l’album.',
    posterRatioPopup: 'Une photo très longue ou étroite n’a pas été placée sur le poster. Les photos horizontales fonctionnent mieux.',
    posterNoUsablePhotos: 'Aucune photo adaptée au poster n’a été trouvée.',
    posterReady: 'Poster A3 téléchargé.', guestMessageLabel: "Message de l’invité", selected: 'Sélectionnée',
    select: 'Sélectionner', openPreview: "Ouvrir l’aperçu", closePreview: 'Fermer',
    previousPhoto: 'Photo précédente', nextPhoto: 'Photo suivante', delete: 'Supprimer', deleting: 'Suppression…',
    deleteSelected: 'Supprimer la sélection', deleteSelectedConfirm: 'Supprimer définitivement les éléments sélectionnés ?',
    deleteSelectedSuccess: 'Éléments sélectionnés supprimés.', deleteConfirm: 'Supprimer définitivement cette photo ?',
    deleteSuccess: 'Photo supprimée.', deleteError: "La photo n’a pas pu être supprimée.", share: 'Partager',
    shareSuccess: 'Le lien de partage est prêt.', shareCopied: 'Lien de partage copié.',
    shareError: "Le partage ne peut pas être ouvert pour le moment.", download: 'Télécharger',
    downloaded: 'fichiers téléchargés', chooseBeforeDownload: 'Sélectionnez au moins une photo avant de télécharger.',
    selectionLimitReached: "Vous pouvez sélectionner jusqu’à 100 photos à la fois.",
    uploadTimeUnavailable: "Heure d’envoi indisponible", photo: 'Photo',
    videoMessagesTab: "Messages vidéo",
    videoEmpty: "Pas encore de message vidéo. Partagez le premier !",
    videoLoading: "Chargement des vidéos…",
    videoGalleryError: "Impossible de charger les vidéos. Vérifiez votre accès et actualisez.",
    videoPlaybackError: "Cette vidéo ne peut pas être lue ou son lien a expiré.",
    videoRefresh: "Actualiser",
    videoPrevious: "Précédent",
    videoNext: "Suivant",
    photosTab: 'Photos', guestbookTab: "Livre d’or", designsTab: 'Créations', downloadsTab: 'Télécharger', guestbookTitle: "Livre d’or",
    guestbookFormTitle: 'Laisser un message',
    guestbookNameLabel: 'Nom (facultatif)',
    guestbookMessageLabel: 'Message',
    guestbookMessagePlaceholder: 'Écrivez votre message ici...',
    guestbookSubmit: 'Publier le message',
    guestbookSubmitting: 'Publication...',
    guestbookSubmitSuccess: 'Votre message a été ajouté.',
    guestbookSubmitError: "Votre message n’a pas pu être publié.",
    guestbookMessageRequired: 'Écrivez d’abord un message.',
    guestbookMessageTooLong: 'Votre message peut contenir 500 caractères maximum.',
    guestbookEmptyTitle: 'Aucun message pour le moment.',
    guestbookEmptyText: 'Soyez le premier à laisser un message.',
  },
  legal: {
    ...baseTranslations.en.legal,
    termsTitle: "Conditions d’utilisation",
    termsIntro: 'En utilisant cet album, vous acceptez les règles ci-dessous.',
    privacyTitle: 'Politique de confidentialité',
    privacyIntro: 'Cette page explique comment les données personnelles sont traitées dans EventDrop.',
    termsSections: [
      { title: 'Contenu autorisé', points: ['Ajoutez uniquement du contenu que vous êtes autorisé à partager.', 'Les contenus offensants, illégaux ou portant atteinte à la vie privée sont interdits.'] },
      { title: 'Utilisation du service', points: ['EventDrop rassemble les contributions des invités dans un album commun.', 'L’accès peut être limité en cas d’abus ou de spam.'] },
      { title: 'Durée de conservation', points: ['Les contenus sont normalement conservés temporairement après l’événement.', 'L’organisateur peut définir une autre durée.'] },
      { title: 'Responsabilité', points: ['Les utilisateurs sont responsables du contenu qu’ils ajoutent.', 'Aucune garantie totale ne peut être donnée en cas de problème technique ou de perte de données.'] },
    ],
    privacySections: [
      { title: 'Données collectées', points: ['L’adresse e-mail sert à gérer l’accès à l’événement.', 'Les photos sont stockées dans l’album concerné.', 'Des données techniques peuvent être conservées temporairement pour la sécurité et le dépannage.'] },
      { title: 'Finalité', points: ['Les données servent uniquement à fournir l’album, permettre le partage et protéger le système.', 'Les données ne sont pas vendues à des tiers à des fins commerciales.'] },
      { title: 'Conservation et suppression', points: ['Les médias et journaux techniques sont conservés pendant une durée limitée.', 'Une demande de suppression peut être faite via les coordonnées de contact.'] },
      { title: 'Vos droits', points: ['Vous pouvez demander l’accès, la correction ou la suppression de vos données.'] },
      { title: 'Sécurité', points: ['EventDrop applique des mesures techniques et organisationnelles de protection.', 'Une transmission totalement sans risque sur internet ne peut être garantie.'] },
    ],
    acknowledge: "J’ai lu et compris ces informations",
  },
}

const marketingHomepage = {
  "nl": {
    "entry": "Naar je event",
    "nav": "Hoofdnavigatie",
    "homeNav": "Home",
    "featureNavigationLabel": "Productnavigatie",
    "how": "Hoe werkt het",
    "features": "Mogelijkheden",
    "photoboothMemory": "Photobooth Memory",
    "memoryPosterNav": "Memory Poster",
    "events": "Voor events",
    "heroEyebrow": "Kleine momenten. Grootse herinneringen.",
    "heroTitle": "Alle herinneringen van jullie event.",
    "heroAccent": "Op één plek.",
    "intro": "Foto’s, video messages en persoonlijke berichten van jullie gasten, eenvoudig verzameld via één QR-code.",
    "watchHow": "Bekijk hoe het werkt",
    "trust": "Geen app. Geen gedoe. Gewoon scannen en delen.",
    "noApp": "Geen app nodig",
    "oneQr": "Één QR-code",
    "fromPhone": "Direct vanaf je telefoon",
    "private": "Privé eventalbum",
    "featureEyebrow": "SAMEN VERZAMELD",
    "featureTitle": "Meer dan een fotoalbum.",
    "featureIntro": "Foto’s, video messages en gastenboekberichten: bewaar jullie event door de ogen van alle gasten.",
    "photos": "Foto’s",
    "videos": "Video Messages",
    "guestbook": "Gastenboek",
    "live": "Live Slideshow",
    "story": "Story Creator",
    "poster": "Memory Poster A3",
    "photoBody": "Van de eerste ontmoeting tot de laatste dans. Alle perspectieven bij elkaar.",
    "videoBody": "Een lieve wens, een grappig verhaal. Persoonlijker dan een foto.",
    "bookBody": "Woorden om te bewaren. Laat gasten hun mooiste herinnering achterlaten.",
    "liveBody": "Foto’s van jullie gasten verschijnen tijdens het event op een scherm.",
    "storyBody": "Maak van jullie foto’s een story die je meteen wilt delen.",
    "posterBody": "Geef jullie herinneringen een plek aan de muur met een fotoposter.",
    "packagesEyebrow": "PAKKETTEN",
    "packagesTitle": "Kies wat past bij jullie event.",
    "packagesIntro": "Begin met een gedeeld album en breid uit met gastenboek, ontwerpen, video en Live Slideshow.",
    "packageMomentTitle": "Het Moment",
    "packageMomentDescription": "Alle foto’s van jullie event op één plek.",
    "packageMomentItems": ["QR-code voor een gedeeld album", "Foto’s uploaden, bekijken en downloaden", "Gepersonaliseerde albumcover"],
    "packageStoryTitle": "Het Verhaal",
    "packageStoryDescription": "Foto’s, lieve berichten en creatieve herinneringen samen.",
    "packageStoryItems": ["Alles uit Het Moment", "Digitaal gastenboek", "Instagram Story Creator", "Memory Poster A3"],
    "packageExperienceTitle": "De Beleving",
    "packageExperienceDescription": "Beleef en herbeleef jullie event met video en Live Slideshow.",
    "packageExperienceItems": ["Alles uit Het Verhaal", "Video Messages", "Live Slideshow", "Photobooth Memory"],
    "packagePhotoboothNote": "Alleen beschikbaar en actief bij evenementen met een photobooth.",
    "packagePhotoboothFootnote": "*Alleen beschikbaar bij evenementen met een photobooth.",
    "packageRecommended": "Meest gekozen",
    "packagePriceSuffix": "per evenement · incl. btw",
    "packageCta": "Neem contact op",
    "heroSteps": ["Scan de QR-code", "Deel je momenten", "Bekijk alles samen"],
    "featurePages": {
      "photos": {
        "eyebrow": "FOTOALBUM VOOR IEDEREEN",
        "heroTitle": "Alle foto’s van jullie event.",
        "heroAccent": "Samen op één plek.",
        "intro": "Gasten scannen de QR-code en voegen hun foto’s toe aan één gezamenlijk album. Iedereen kan de gedeelde momenten bekijken en downloaden.",
        "packageLabel": "Alle pakketten",
        "visualCaption": "Foto’s van alle gasten",
        "badgeTitle": "Gedeeld album",
        "badgeBody": "Scannen, uploaden en bewaren.",
        "benefits": [
          { "title": "Geen app nodig", "body": "Iedere gast kan via de QR-code meedoen." },
          { "title": "Alles overzichtelijk", "body": "Foto’s bekijken, verzamelen en downloaden vanaf één plek." },
          { "title": "Persoonlijke uitstraling", "body": "Het album sluit aan op jullie eventstijl." }
        ]
      },
      "videoMessages": {
        "eyebrow": "PERSOONLIJKE VIDEOBERICHTEN",
        "heroTitle": "Videoboodschappen vol gevoel.",
        "heroAccent": "Om terug te kijken.",
        "intro": "Gasten uploaden een korte videoboodschap voor jullie. Zo blijven stemmen, gezichten en persoonlijke wensen ook na het event bewaard.",
        "packageLabel": "De Beleving",
        "visualCaption": "Korte video’s van gasten",
        "badgeTitle": "Video Messages",
        "badgeBody": "Persoonlijker dan een foto.",
        "benefits": [
          { "title": "Dichtbij en persoonlijk", "body": "Bewaar stemmen, gezichten en spontane momenten." },
          { "title": "Mobiel opgenomen", "body": "Gasten nemen hun boodschap direct op met hun telefoon." },
          { "title": "Veilig terugkijken", "body": "De video’s blijven onderdeel van het privé eventalbum." }
        ]
      },
      "guestbook": {
        "eyebrow": "GASTENBOEK",
        "heroTitle": "Woorden die je wilt bewaren.",
        "heroAccent": "Van iedereen samen.",
        "intro": "Laat gasten een persoonlijk bericht achterlaten bij jullie event. Lees alle lieve woorden later rustig terug in het album.",
        "packageLabel": "Het Verhaal & De Beleving",
        "visualCaption": "Berichten bij jullie album",
        "badgeTitle": "Digitaal gastenboek",
        "badgeBody": "Lieve woorden voor later.",
        "benefits": [
          { "title": "Persoonlijke berichten", "body": "Gasten laten hun mooiste herinnering achter." },
          { "title": "Met optionele foto", "body": "Een gekozen foto kan bij het bericht worden getoond." },
          { "title": "Mooi om te bewaren", "body": "Perfect naast het album en de gedeelde foto’s." }
        ]
      },
      "liveSlideshow": {
        "eyebrow": "LIVE SLIDESHOW",
        "heroTitle": "Jullie momenten op groot scherm.",
        "heroAccent": "Terwijl het feest doorgaat.",
        "intro": "Toon de gedeelde foto’s tijdens het event op een scherm. Zo genieten jullie samen van de momenten terwijl het feest nog bezig is.",
        "packageLabel": "De Beleving",
        "visualCaption": "Live foto’s op scherm",
        "badgeTitle": "Live Slideshow",
        "badgeBody": "Samen kijken tijdens het event.",
        "benefits": [
          { "title": "Meer sfeer in de zaal", "body": "Nieuwe foto’s worden onderdeel van de beleving." },
          { "title": "Gasten doen mee", "body": "Iedere upload kan zichtbaar worden op het scherm." },
          { "title": "Past bij elk event", "body": "Mooi voor bruiloften, feesten en bedrijfsevents." }
        ]
      },
      "storyCreator": {
        "eyebrow": "SOCIAL READY",
        "heroTitle": "Van eventfoto naar Instagram Story.",
        "heroAccent": "Klaar om te delen.",
        "intro": "Kies 4 verticale of 8 horizontale foto’s uit jullie album en maak direct een persoonlijke Instagram Story.",
        "packageLabel": "Het Verhaal & De Beleving",
        "visualCaption": "Verticale story preview",
        "badgeTitle": "Story Creator",
        "badgeBody": "Gemaakt voor delen.",
        "benefits": [
          { "title": "4 verticale foto’s", "body": "Ideaal voor portretten en staande foto’s." },
          { "title": "8 horizontale foto’s", "body": "Breng meer momenten samen in één Story." },
          { "title": "Klaar om te delen", "body": "Download jullie Story direct in 9:16-formaat." }
        ]
      },
      "photoboothMemory": {
        "eyebrow": "PHOTOBOOTH MEMORY",
        "heroTitle": "Jullie photoboothmomenten.",
        "heroAccent": "Opnieuw beleefd.",
        "intro": "Geef de photoboothmomenten van jullie event digitaal een plek om opnieuw te bekijken en te delen.",
        "packageLabel": "De Beleving · alleen met photobooth",
        "visualCaption": "Photobooth strips blijven heel",
        "badgeTitle": "Photobooth Memory",
        "badgeBody": "Voor events met photobooth.",
        "benefits": [
          { "title": "Voor 1 of 3 strips", "body": "Gebruik één centrale strip of drie strips met subtiele diepte." },
          { "title": "Volledige strip zichtbaar", "body": "De photobooth strip blijft intact, zonder splitsing." },
          { "title": "Gemaakt voor stories", "body": "De verticale compositie is klaar om te delen." }
        ]
      },
      "memoryPoster": {
        "eyebrow": "A3 HERINNERING",
        "heroTitle": "Jullie mooiste foto’s.",
        "heroAccent": "Samen op A3.",
        "intro": "Kies favoriete foto’s uit het gezamenlijke album en maak er een persoonlijk A3-poster van. Een tastbare herinnering aan de dag.",
        "packageLabel": "Het Verhaal & De Beleving",
        "visualCaption": "A3 poster preview",
        "badgeTitle": "Memory Poster A3",
        "badgeBody": "Voor aan de muur.",
        "benefits": [
          { "title": "Voor eventfoto’s", "body": "Gebruik de mooiste gedeelde foto’s uit het album." },
          { "title": "A3 compositie", "body": "Ontwerp een poster met meerdere herinneringen samen." },
          { "title": "Los van Photobooth Memory", "body": "Memory Poster gebruikt eventfoto’s, geen photobooth strips." }
        ]
      }
    },
    "personal": "Een persoonlijke boodschap",
    "miniQuote": "Deze dag krijgt een speciaal plekje in ons hart.",
    "bookExample": "Voorbeeld uit het gastenboek",
    "liveTag": "Samen kijken. Samen beleven.",
    "storyTag": "Jullie foto’s. Jullie verhaal.",
    "posterTag": "Een herinnering om op te hangen.",
    "workflowEyebrow": "VAN HET MOMENT NAAR EEN HERINNERING",
    "workflowTitle": "Zo eenvoudig is het.",
    "scan": "SCAN",
    "upload": "UPLOAD",
    "share": "SHARE",
    "relive": "RELIVE",
    "scanBody": "Scan de persoonlijke QR-code.",
    "uploadBody": "Deel foto’s en korte video messages vanaf je telefoon.",
    "shareBody": "Bekijk samen alle momenten van het event.",
    "reliveBody": "Bewaar en beleef de herinneringen opnieuw.",
    "previewEyebrow": "JULLIE EVENT, JULLIE UITSTRALING",
    "previewTitle": "Zo ziet jullie EventDrop Sharing eruit.",
    "previewIntro": "Een eigen plek voor alle herinneringen. Ontdek hieronder hoe dat voelt.",
    "example": "VOORBEELDWEERGAVE",
    "yourEvent": "jullie event",
    "theirEyes": "JULLIE DAG, DOOR HUN OGEN",
    "dayToKeep": "Een dag om te bewaren",
    "momentsTogether": "Alle mooie momenten, samen verzameld.",
    "previewLabel": "Bekijk EventDrop Sharing voorbeelden",
    "designs": "Designs",
    "videoExample": "VIDEO MESSAGE · VOORBEELD",
    "words": "Sommige woorden wil je blijven horen.",
    "wordsBody": "Korte videoboodschappen, in een eigen galerij. Dichtbij, ook na jullie event.",
    "stillExample": "Dit is een stilstaand productvoorbeeld.",
    "message1": "Wat een prachtige dag. Nog heel veel geluk en mooie avonturen samen!",
    "message2": "Van de eerste toast tot de laatste dans: dit vergeten we nooit.",
    "message3": "Zoveel liefde op één plek. Bedankt voor deze bijzondere herinnering.",
    "sampleMessage": "Voorbeeldbericht",
    "together": "SAMEN.",
    "thousand": "Een dag. Duizend herinneringen.",
    "bestMoments": "ONZE MOOISTE MOMENTEN",
    "wall": "Van telefoon naar een plek aan de muur.",
    "wallBody": "Maak een Memory Poster A3 of een story met jullie eventfoto’s.",
    "composition": "Voorbeeld van een fotocompositie.",
    "occasionsEyebrow": "ELKE REDEN OM SAMEN TE KOMEN",
    "occasionsTitle": "Gemaakt voor jullie moment.",
    "weddings": "Bruiloften",
    "parties": "Feesten",
    "corporate": "Bedrijfsevents",
    "weddingBody": "Alle spontane momenten van jullie gasten samen.",
    "partyBody": "Van verjaardag tot jubileum: iedereen deelt mee.",
    "corporateBody": "Foto’s, berichten en eventmomenten eenvoudig verzameld.",
    "accessEyebrow": "DE MOOISTE MOMENTEN WACHTEN OP JE",
    "already": "Al een",
    "accessIntro": "Ga direct naar jullie event.",
    "accessHelp": "Gebruik het e-mailadres en de eventcode voor jullie event.",
    "bottomQuickNavLabel": "Snelle acties",
    "bookQuickNav": "Boeken",
    "contactQuickNav": "Contact",
    "mailQuickNav": "Mail",
    "eventQuickNav": "Naar je event",
    "photoBandHeadline": "Alle momenten. Eén herinnering.",
    "photoBandBody": "Van spontane foto’s tot persoonlijke berichten van jullie gasten.",
    "footer": "Scan. Deel. Herbeleef.",
    "phoneLabel": "Voorbeeld van een EventDrop Sharing eventalbum",
    "bestDay": "ONZE MOOISTE DAG",
    "betterTogether": "Samen is alles mooier.",
    "phoneVideos": "Video’s",
    "shareMoments": "Deel jullie momenten",
    "dance": "De dansvloer was van ons.",
    "bookSample": "GASTENBOEK · VOORBEELD",
    "heroQuote": "Wat een dag. Wat een liefde. Dankjewel dat we erbij mochten zijn!",
    "later": "Een herinnering voor later",
    "personalLater": "Persoonlijk. Ook na jullie event.",
    "homeLabel": "EventDrop Sharing — home",
    "accessTitle": "Al een EventDrop Sharing?"
  },
  "en": {
    "entry": "Go to your event",
    "nav": "Main navigation",
    "homeNav": "Home",
    "featureNavigationLabel": "Product navigation",
    "how": "How it works",
    "features": "Features",
    "photoboothMemory": "Photobooth Memory",
    "memoryPosterNav": "Memory Poster",
    "events": "For events",
    "heroEyebrow": "Little moments. Lasting memories.",
    "heroTitle": "Every memory from your event.",
    "heroAccent": "In one place.",
    "intro": "Photos, video messages and personal notes from your guests, collected with one QR code.",
    "watchHow": "See how it works",
    "trust": "No app. No fuss. Just scan and share.",
    "noApp": "No app needed",
    "oneQr": "One QR code",
    "fromPhone": "Straight from your phone",
    "private": "Private event album",
    "featureEyebrow": "COLLECTED TOGETHER",
    "featureTitle": "More than a photo album.",
    "featureIntro": "Photos, video messages and guestbook notes: keep your event through every guest’s eyes.",
    "photos": "Photos",
    "videos": "Video Messages",
    "guestbook": "Guestbook",
    "live": "Live Slideshow",
    "story": "Story Creator",
    "poster": "Memory Poster A3",
    "photoBody": "From the first hello to the last dance. Every perspective together.",
    "videoBody": "A kind wish, a funny story. More personal than a photo.",
    "bookBody": "Words to keep. Let guests leave their favourite memories.",
    "liveBody": "Photos from your guests appear on a screen during the event.",
    "storyBody": "Turn your photos into a story you’ll want to share.",
    "posterBody": "Give your memories a place on the wall with a photo poster.",
    "packagesEyebrow": "PACKAGES",
    "packagesTitle": "Choose what fits your event.",
    "packagesIntro": "Start with a shared album and add guestbook, designs, video and Live Slideshow when you need them.",
    "packageMomentTitle": "The Moment",
    "packageMomentDescription": "All photos from your event in one place.",
    "packageMomentItems": ["QR code for a shared album", "Upload, view and download photos", "Personalized album cover"],
    "packageStoryTitle": "The Story",
    "packageStoryDescription": "Photos, kind messages and creative memories together.",
    "packageStoryItems": ["Everything in The Moment", "Digital guestbook", "Instagram Story Creator", "Memory Poster A3"],
    "packageExperienceTitle": "The Experience",
    "packageExperienceDescription": "Experience and relive your event with video and Live Slideshow.",
    "packageExperienceItems": ["Everything in The Story", "Video Messages", "Live Slideshow", "Photobooth Memory"],
    "packagePhotoboothNote": "Only available and active for events with a photobooth.",
    "packagePhotoboothFootnote": "*Only available for events with a photobooth.",
    "packageRecommended": "Most chosen",
    "packagePriceSuffix": "per event · VAT included",
    "packageCta": "Get in touch",
    "heroSteps": ["Scan the QR code", "Share your moments", "View everything together"],
    "featurePages": {
      "photos": {
        "eyebrow": "PHOTO ALBUM FOR EVERYONE",
        "heroTitle": "Every photo from your event.",
        "heroAccent": "Together in one place.",
        "intro": "Guests share their photos through one simple event page, creating a complete private album.",
        "packageLabel": "All packages",
        "visualCaption": "Photos from every guest",
        "badgeTitle": "Shared album",
        "badgeBody": "Scan, upload and keep.",
        "benefits": [
          { "title": "No app needed", "body": "Every guest can join through the QR code." },
          { "title": "Everything organized", "body": "View, collect and download photos from one place." },
          { "title": "Personal event style", "body": "The album matches the look of your event." }
        ]
      },
      "videoMessages": {
        "eyebrow": "PERSONAL VIDEO NOTES",
        "heroTitle": "Video messages full of feeling.",
        "heroAccent": "Ready to watch again.",
        "intro": "Let guests record short wishes, stories and congratulations that you can revisit later.",
        "packageLabel": "The Experience",
        "visualCaption": "Short videos from guests",
        "badgeTitle": "Video Messages",
        "badgeBody": "More personal than a photo.",
        "benefits": [
          { "title": "Close and personal", "body": "Keep voices, faces and spontaneous moments." },
          { "title": "Recorded on mobile", "body": "Guests record their message directly on their phone." },
          { "title": "Private playback", "body": "The videos stay part of the private event album." }
        ]
      },
      "guestbook": {
        "eyebrow": "GUESTBOOK",
        "heroTitle": "Words worth keeping.",
        "heroAccent": "From everyone together.",
        "intro": "Collect kind wishes, memories and messages from guests alongside the shared photos.",
        "packageLabel": "The Story & The Experience",
        "visualCaption": "Messages with your album",
        "badgeTitle": "Digital guestbook",
        "badgeBody": "Kind words for later.",
        "benefits": [
          { "title": "Personal messages", "body": "Guests leave their favourite memory." },
          { "title": "Optional photo", "body": "A selected photo can be shown with the message." },
          { "title": "Made to keep", "body": "A natural companion to the album and photos." }
        ]
      },
      "liveSlideshow": {
        "eyebrow": "LIVE SLIDESHOW",
        "heroTitle": "Your moments on the big screen.",
        "heroAccent": "While the party continues.",
        "intro": "Photos from your guests appear on a screen during the event.",
        "packageLabel": "The Experience",
        "visualCaption": "Live photos on screen",
        "badgeTitle": "Live Slideshow",
        "badgeBody": "Watch together during the event.",
        "benefits": [
          { "title": "More atmosphere", "body": "New photos become part of the live experience." },
          { "title": "Guests join in", "body": "Every upload can appear on the screen." },
          { "title": "Fits every event", "body": "Great for weddings, parties and company events." }
        ]
      },
      "storyCreator": {
        "eyebrow": "SOCIAL READY",
        "heroTitle": "From event photo to Instagram Story.",
        "heroAccent": "Ready to share.",
        "intro": "Choose 4 vertical or 8 horizontal photos from your album and instantly create a personal Instagram Story.",
        "packageLabel": "The Story & The Experience",
        "visualCaption": "Vertical story preview",
        "badgeTitle": "Story Creator",
        "badgeBody": "Made for sharing.",
        "benefits": [
          { "title": "4 vertical photos", "body": "Ideal for portraits and upright photos." },
          { "title": "8 horizontal photos", "body": "Bring more moments together in one Story." },
          { "title": "Ready to share", "body": "Download your Story directly in 9:16 format." }
        ]
      },
      "photoboothMemory": {
        "eyebrow": "PHOTOBOOTH MEMORY",
        "heroTitle": "Your photobooth moments.",
        "heroAccent": "Relived again.",
        "intro": "Use finished photobooth strips as one complete vertical memory for stories and socials.",
        "packageLabel": "The Experience · photobooth only",
        "visualCaption": "Photobooth strips stay whole",
        "badgeTitle": "Photobooth Memory",
        "badgeBody": "For events with a photobooth.",
        "benefits": [
          { "title": "For 1 or 3 strips", "body": "Use one central strip or three strips with subtle depth." },
          { "title": "Full strip visible", "body": "The photobooth strip stays intact without splitting." },
          { "title": "Made for stories", "body": "The vertical composition is ready to share." }
        ]
      },
      "memoryPoster": {
        "eyebrow": "A3 MEMORY",
        "heroTitle": "Your best photos.",
        "heroAccent": "Together on A3.",
        "intro": "Create an A3 poster composition with photos from your event album, ready to keep or print.",
        "packageLabel": "The Story & The Experience",
        "visualCaption": "A3 poster preview",
        "badgeTitle": "Memory Poster A3",
        "badgeBody": "For your wall.",
        "benefits": [
          { "title": "For event photos", "body": "Use the best shared photos from the album." },
          { "title": "A3 composition", "body": "Design a poster with several memories together." },
          { "title": "Separate from Photobooth Memory", "body": "Memory Poster uses event photos, not photobooth strips." }
        ]
      }
    },
    "personal": "A personal message",
    "miniQuote": "This day will hold a special place in our hearts.",
    "bookExample": "Guestbook example",
    "liveTag": "Watch together. Feel it together.",
    "storyTag": "Your photos. Your story.",
    "posterTag": "A memory to hang on your wall.",
    "workflowEyebrow": "FROM MOMENT TO MEMORY",
    "workflowTitle": "It’s that simple.",
    "scan": "SCAN",
    "upload": "UPLOAD",
    "share": "SHARE",
    "relive": "RELIVE",
    "scanBody": "Scan the personal QR code.",
    "uploadBody": "Share photos and short video messages from your phone.",
    "shareBody": "Enjoy all the event’s moments together.",
    "reliveBody": "Keep your memories and relive them.",
    "previewEyebrow": "YOUR EVENT, YOUR STYLE",
    "previewTitle": "This is your EventDrop Sharing.",
    "previewIntro": "A place for all your memories. Take a look around.",
    "example": "PRODUCT EXAMPLE",
    "yourEvent": "your event",
    "theirEyes": "YOUR DAY, THROUGH THEIR EYES",
    "dayToKeep": "A day to remember",
    "momentsTogether": "All the lovely moments, gathered together.",
    "previewLabel": "Explore EventDrop Sharing examples",
    "designs": "Designs",
    "videoExample": "VIDEO MESSAGE · EXAMPLE",
    "words": "Some words deserve to be heard again.",
    "wordsBody": "Short video messages in their own gallery. Close, even after your event.",
    "stillExample": "This is a still product illustration.",
    "message1": "What a beautiful day. Wishing you happiness and wonderful adventures together!",
    "message2": "From the first toast to the last dance: we’ll never forget this.",
    "message3": "So much love in one place. Thank you for this special memory.",
    "sampleMessage": "Sample message",
    "together": "TOGETHER.",
    "thousand": "One day. A thousand memories.",
    "bestMoments": "OUR FAVOURITE MOMENTS",
    "wall": "From your phone to your wall.",
    "wallBody": "Create a Memory Poster A3 or a story with your event photos.",
    "composition": "Example photo composition.",
    "occasionsEyebrow": "EVERY REASON TO GET TOGETHER",
    "occasionsTitle": "Made for your moment.",
    "weddings": "Weddings",
    "parties": "Parties",
    "corporate": "Company events",
    "weddingBody": "All your guests’ spontaneous moments together.",
    "partyBody": "From birthdays to anniversaries: everyone joins in.",
    "corporateBody": "Photos, messages and event moments, easily collected.",
    "accessEyebrow": "YOUR BEST MOMENTS ARE WAITING",
    "already": "Already have an",
    "accessIntro": "Go straight to your event.",
    "accessHelp": "Enter your email address and event code.",
    "bottomQuickNavLabel": "Quick actions",
    "bookQuickNav": "Book",
    "contactQuickNav": "Contact",
    "mailQuickNav": "Mail",
    "eventQuickNav": "Your event",
    "photoBandHeadline": "Every moment. One memory.",
    "photoBandBody": "From spontaneous photos to personal notes from your guests.",
    "footer": "Scan. Share. Relive.",
    "phoneLabel": "Example EventDrop Sharing event album",
    "bestDay": "OUR SPECIAL DAY",
    "betterTogether": "Everything’s better together.",
    "phoneVideos": "Videos",
    "shareMoments": "Share your moments",
    "dance": "The dance floor was ours.",
    "bookSample": "GUESTBOOK · EXAMPLE",
    "heroQuote": "What a day. So much love. Thank you for having us!",
    "later": "A memory for later",
    "personalLater": "Personal. Even after your event.",
    "homeLabel": "EventDrop Sharing — home",
    "accessTitle": "Already have an EventDrop Sharing?"
  },
  "de": {
    "entry": "Zu deinem Event",
    "nav": "Hauptnavigation",
    "homeNav": "Home",
    "featureNavigationLabel": "Produktnavigation",
    "how": "So funktioniert’s",
    "features": "Funktionen",
    "photoboothMemory": "Photobooth Memory",
    "memoryPosterNav": "Memory Poster",
    "events": "Für Events",
    "heroEyebrow": "Kleine Momente. Große Erinnerungen.",
    "heroTitle": "Alle Erinnerungen an euer Event.",
    "heroAccent": "An einem Ort.",
    "intro": "Fotos, Videobotschaften und persönliche Worte eurer Gäste, gesammelt über einen QR-Code.",
    "watchHow": "So geht’s",
    "trust": "Keine App. Kein Aufwand. Einfach scannen und teilen.",
    "noApp": "Keine App nötig",
    "oneQr": "Ein QR-Code",
    "fromPhone": "Direkt vom Handy",
    "private": "Privates Eventalbum",
    "featureEyebrow": "GEMEINSAM GESAMMELT",
    "featureTitle": "Mehr als ein Fotoalbum.",
    "featureIntro": "Fotos, Videobotschaften und Gästebucheinträge: euer Event aus der Sicht aller Gäste.",
    "photos": "Fotos",
    "videos": "Videobotschaften",
    "guestbook": "Gästebuch",
    "live": "Live Slideshow",
    "story": "Story Creator",
    "poster": "Memory Poster A3",
    "photoBody": "Vom ersten Hallo bis zum letzten Tanz. Alle Perspektiven vereint.",
    "videoBody": "Ein lieber Wunsch, eine lustige Geschichte. Persönlicher als ein Foto.",
    "bookBody": "Worte zum Aufbewahren. Gäste teilen ihre schönsten Erinnerungen.",
    "liveBody": "Fotos eurer Gäste erscheinen während des Events auf einem Bildschirm.",
    "storyBody": "Macht aus euren Fotos eine Story zum Teilen.",
    "posterBody": "Gebt euren Erinnerungen mit einem Fotoposter einen Platz an der Wand.",
    "packagesEyebrow": "PAKETE",
    "packagesTitle": "Wählt, was zu eurem Event passt.",
    "packagesIntro": "Startet mit einem gemeinsamen Album und erweitert es bei Bedarf um Gästebuch, Designs, Video und Live Slideshow.",
    "packageMomentTitle": "Der Moment",
    "packageMomentDescription": "Alle Fotos eures Events an einem Ort.",
    "packageMomentItems": ["QR-Code für ein gemeinsames Album", "Fotos hochladen, ansehen und herunterladen", "Personalisierter Albumtitel"],
    "packageStoryTitle": "Die Geschichte",
    "packageStoryDescription": "Fotos, liebe Nachrichten und kreative Erinnerungen zusammen.",
    "packageStoryItems": ["Alles aus Der Moment", "Digitales Gästebuch", "Instagram Story Creator", "Memory Poster A3"],
    "packageExperienceTitle": "Das Erlebnis",
    "packageExperienceDescription": "Erlebt euer Event mit Video und Live Slideshow immer wieder.",
    "packageExperienceItems": ["Alles aus Die Geschichte", "Video Messages", "Live Slideshow", "Photobooth Memory"],
    "packagePhotoboothNote": "Nur verfügbar und aktiv bei Events mit einer Photobooth.",
    "packagePhotoboothFootnote": "*Nur verfügbar bei Veranstaltungen mit einer Photobooth.",
    "packageRecommended": "Am häufigsten gewählt",
    "packagePriceSuffix": "pro Veranstaltung · inkl. MwSt.",
    "packageCta": "Kontakt aufnehmen",
    "heroSteps": ["QR-Code scannen", "Momente teilen", "Alles gemeinsam ansehen"],
    "featurePages": {
      "photos": {
        "eyebrow": "FOTOALBUM FÜR ALLE",
        "heroTitle": "Alle Fotos eures Events.",
        "heroAccent": "Gemeinsam an einem Ort.",
        "intro": "Gäste teilen ihre Fotos über eine einfache Eventseite. So entsteht automatisch ein vollständiges privates Album.",
        "packageLabel": "Alle Pakete",
        "visualCaption": "Fotos von allen Gästen",
        "badgeTitle": "Gemeinsames Album",
        "badgeBody": "Scannen, hochladen und behalten.",
        "benefits": [
          { "title": "Keine App nötig", "body": "Alle Gäste können über den QR-Code mitmachen." },
          { "title": "Alles übersichtlich", "body": "Fotos an einem Ort ansehen, sammeln und herunterladen." },
          { "title": "Persönlicher Stil", "body": "Das Album passt zur Optik eures Events." }
        ]
      },
      "videoMessages": {
        "eyebrow": "PERSÖNLICHE VIDEOBOTSCHAFTEN",
        "heroTitle": "Videobotschaften voller Gefühl.",
        "heroAccent": "Zum Wiederanschauen.",
        "intro": "Lasst Gäste kurze Wünsche, Geschichten und Glückwünsche aufnehmen, die ihr später erneut ansehen könnt.",
        "packageLabel": "Das Erlebnis",
        "visualCaption": "Kurze Videos von Gästen",
        "badgeTitle": "Video Messages",
        "badgeBody": "Persönlicher als ein Foto.",
        "benefits": [
          { "title": "Nah und persönlich", "body": "Bewahrt Stimmen, Gesichter und spontane Momente." },
          { "title": "Direkt vom Handy", "body": "Gäste nehmen ihre Botschaft direkt mit dem Telefon auf." },
          { "title": "Privat ansehen", "body": "Die Videos bleiben Teil des privaten Eventalbums." }
        ]
      },
      "guestbook": {
        "eyebrow": "GÄSTEBUCH",
        "heroTitle": "Worte, die bleiben sollen.",
        "heroAccent": "Von allen zusammen.",
        "intro": "Sammelt liebe Wünsche, Erinnerungen und Nachrichten eurer Gäste neben den geteilten Fotos.",
        "packageLabel": "Die Geschichte & Das Erlebnis",
        "visualCaption": "Nachrichten zum Album",
        "badgeTitle": "Digitales Gästebuch",
        "badgeBody": "Liebe Worte für später.",
        "benefits": [
          { "title": "Persönliche Nachrichten", "body": "Gäste hinterlassen ihre schönste Erinnerung." },
          { "title": "Optionales Foto", "body": "Ein ausgewähltes Foto kann mit der Nachricht angezeigt werden." },
          { "title": "Zum Aufbewahren", "body": "Passt perfekt zum Album und den geteilten Fotos." }
        ]
      },
      "liveSlideshow": {
        "eyebrow": "LIVE SLIDESHOW",
        "heroTitle": "Eure Momente auf großem Bildschirm.",
        "heroAccent": "Während die Feier weitergeht.",
        "intro": "Fotos eurer Gäste erscheinen während des Events auf einem Bildschirm.",
        "packageLabel": "Das Erlebnis",
        "visualCaption": "Live-Fotos auf dem Bildschirm",
        "badgeTitle": "Live Slideshow",
        "badgeBody": "Gemeinsam während des Events ansehen.",
        "benefits": [
          { "title": "Mehr Stimmung im Raum", "body": "Neue Fotos werden Teil des Live-Erlebnisses." },
          { "title": "Gäste machen mit", "body": "Jeder Upload kann auf dem Bildschirm erscheinen." },
          { "title": "Für jedes Event", "body": "Schön für Hochzeiten, Feiern und Firmenevents." }
        ]
      },
      "storyCreator": {
        "eyebrow": "SOCIAL READY",
        "heroTitle": "Vom Eventfoto zur Instagram Story.",
        "heroAccent": "Bereit zum Teilen.",
        "intro": "Wählt 4 vertikale oder 8 horizontale Fotos aus eurem Album und erstellt direkt eine persönliche Instagram Story.",
        "packageLabel": "Die Geschichte & Das Erlebnis",
        "visualCaption": "Vertikale Story-Vorschau",
        "badgeTitle": "Story Creator",
        "badgeBody": "Gemacht zum Teilen.",
        "benefits": [
          { "title": "4 vertikale Fotos", "body": "Ideal für Porträts und Hochformatfotos." },
          { "title": "8 horizontale Fotos", "body": "Bringt mehr Momente in einer Story zusammen." },
          { "title": "Bereit zum Teilen", "body": "Ladet eure Story direkt im 9:16-Format herunter." }
        ]
      },
      "photoboothMemory": {
        "eyebrow": "PHOTOBOOTH MEMORY",
        "heroTitle": "Eure Photobooth-Momente.",
        "heroAccent": "Neu erlebt.",
        "intro": "Verwendet fertige Photobooth-Strips als vollständige vertikale Erinnerung für Stories und Socials.",
        "packageLabel": "Das Erlebnis · nur mit Photobooth",
        "visualCaption": "Photobooth-Strips bleiben vollständig",
        "badgeTitle": "Photobooth Memory",
        "badgeBody": "Für Events mit Photobooth.",
        "benefits": [
          { "title": "Für 1 oder 3 Strips", "body": "Nutzt einen zentralen Strip oder drei Strips mit dezenter Tiefe." },
          { "title": "Vollständiger Strip sichtbar", "body": "Der Photobooth-Strip bleibt intakt und wird nicht geteilt." },
          { "title": "Für Stories gemacht", "body": "Die vertikale Komposition ist direkt teilbar." }
        ]
      },
      "memoryPoster": {
        "eyebrow": "A3 ERINNERUNG",
        "heroTitle": "Eure schönsten Fotos.",
        "heroAccent": "Gemeinsam auf A3.",
        "intro": "Erstellt eine A3-Posterkomposition mit Fotos aus eurem Eventalbum.",
        "packageLabel": "Die Geschichte & Das Erlebnis",
        "visualCaption": "A3-Poster-Vorschau",
        "badgeTitle": "Memory Poster A3",
        "badgeBody": "Für die Wand.",
        "benefits": [
          { "title": "Für Eventfotos", "body": "Nutzt die schönsten geteilten Fotos aus dem Album." },
          { "title": "A3-Komposition", "body": "Gestaltet ein Poster mit mehreren Erinnerungen zusammen." },
          { "title": "Getrennt von Photobooth Memory", "body": "Memory Poster nutzt Eventfotos, keine Photobooth-Strips." }
        ]
      }
    },
    "personal": "Eine persönliche Botschaft",
    "miniQuote": "Dieser Tag bekommt einen besonderen Platz in unserem Herzen.",
    "bookExample": "Gästebuchbeispiel",
    "liveTag": "Gemeinsam schauen. Gemeinsam erleben.",
    "storyTag": "Eure Fotos. Eure Geschichte.",
    "posterTag": "Eine Erinnerung für die Wand.",
    "workflowEyebrow": "VOM MOMENT ZUR ERINNERUNG",
    "workflowTitle": "So einfach geht’s.",
    "scan": "SCANNEN",
    "upload": "HOCHLADEN",
    "share": "TEILEN",
    "relive": "WIEDERERLEBEN",
    "scanBody": "Scannt den persönlichen QR-Code.",
    "uploadBody": "Teilt Fotos und kurze Videobotschaften vom Handy.",
    "shareBody": "Schaut euch die Eventmomente gemeinsam an.",
    "reliveBody": "Bewahrt Erinnerungen und erlebt sie erneut.",
    "previewEyebrow": "EUER EVENT, EUER STIL",
    "previewTitle": "So sieht euer EventDrop Sharing aus.",
    "previewIntro": "Ein eigener Ort für Erinnerungen. Schaut euch um.",
    "example": "BEISPIELANSICHT",
    "yourEvent": "euer Event",
    "theirEyes": "EUER TAG, DURCH IHRE AUGEN",
    "dayToKeep": "Ein Tag zum Erinnern",
    "momentsTogether": "Alle schönen Momente, gemeinsam gesammelt.",
    "previewLabel": "EventDrop Sharing-Beispiele entdecken",
    "designs": "Designs",
    "videoExample": "VIDEOBOTSCHAFT · BEISPIEL",
    "words": "Manche Worte möchte man immer wieder hören.",
    "wordsBody": "Kurze Videobotschaften in einer eigenen Galerie. Nah, auch nach dem Event.",
    "stillExample": "Dies ist eine statische Produktansicht.",
    "message1": "Was für ein schöner Tag. Viel Glück und tolle Abenteuer zusammen!",
    "message2": "Vom ersten Anstoßen bis zum letzten Tanz: unvergesslich.",
    "message3": "So viel Liebe an einem Ort. Danke für diese besondere Erinnerung.",
    "sampleMessage": "Beispielnachricht",
    "together": "ZUSAMMEN.",
    "thousand": "Ein Tag. Tausend Erinnerungen.",
    "bestMoments": "UNSERE SCHÖNSTEN MOMENTE",
    "wall": "Vom Handy an die Wand.",
    "wallBody": "Erstellt ein Memory Poster A3 oder eine Story mit euren Eventfotos.",
    "composition": "Beispiel einer Fotokomposition.",
    "occasionsEyebrow": "JEDER ANLASS ZUM ZUSAMMENKOMMEN",
    "occasionsTitle": "Gemacht für euren Moment.",
    "weddings": "Hochzeiten",
    "parties": "Feiern",
    "corporate": "Firmenevents",
    "weddingBody": "Alle spontanen Momente eurer Gäste vereint.",
    "partyBody": "Vom Geburtstag bis zum Jubiläum: Alle teilen mit.",
    "corporateBody": "Fotos, Nachrichten und Eventmomente einfach gesammelt.",
    "accessEyebrow": "DIE SCHÖNSTEN MOMENTE WARTEN AUF DICH",
    "already": "Schon ein",
    "accessIntro": "Direkt zu eurem Event.",
    "accessHelp": "Gib deine E-Mail-Adresse und den Eventcode ein.",
    "bottomQuickNavLabel": "Schnellzugriff",
    "bookQuickNav": "Buchen",
    "contactQuickNav": "Kontakt",
    "mailQuickNav": "Mail",
    "eventQuickNav": "Zum Event",
    "photoBandHeadline": "Alle Momente. Eine Erinnerung.",
    "photoBandBody": "Von spontanen Fotos bis zu persönlichen Nachrichten eurer Gäste.",
    "footer": "Scannen. Teilen. Wiedererleben.",
    "phoneLabel": "Beispiel eines EventDrop Sharing-Albums",
    "bestDay": "UNSER SCHÖNSTER TAG",
    "betterTogether": "Zusammen ist alles schöner.",
    "phoneVideos": "Videos",
    "shareMoments": "Teilt eure Momente",
    "dance": "Die Tanzfläche gehörte uns.",
    "bookSample": "GÄSTEBUCH · BEISPIEL",
    "heroQuote": "Was für ein Tag. So viel Liebe. Danke, dass wir dabei sein durften!",
    "later": "Eine Erinnerung für später",
    "personalLater": "Persönlich. Auch nach dem Event.",
    "homeLabel": "EventDrop Sharing — Startseite",
    "accessTitle": "Schon ein EventDrop Sharing?"
  },
  "fr": {
    "entry": "Accéder à votre événement",
    "nav": "Navigation principale",
    "homeNav": "Accueil",
    "featureNavigationLabel": "Navigation produit",
    "how": "Comment ça marche",
    "features": "Fonctionnalités",
    "photoboothMemory": "Photobooth Memory",
    "memoryPosterNav": "Memory Poster",
    "events": "Pour vos événements",
    "heroEyebrow": "Petits moments. Grands souvenirs.",
    "heroTitle": "Tous les souvenirs de votre événement.",
    "heroAccent": "Au même endroit.",
    "intro": "Photos, messages vidéo et petits mots de vos invités, réunis grâce à un seul QR code.",
    "watchHow": "Découvrir comment ça marche",
    "trust": "Sans appli. Sans souci. Scannez et partagez.",
    "noApp": "Sans application",
    "oneQr": "Un seul QR code",
    "fromPhone": "Depuis votre téléphone",
    "private": "Album privé",
    "featureEyebrow": "RÉUNIS ENSEMBLE",
    "featureTitle": "Bien plus qu’un album photo.",
    "featureIntro": "Photos, vidéos et mots du livre d’or : votre événement à travers les yeux de vos invités.",
    "photos": "Photos",
    "videos": "Messages vidéo",
    "guestbook": "Livre d’or",
    "live": "Live Slideshow",
    "story": "Story Creator",
    "poster": "Memory Poster A3",
    "photoBody": "Du premier sourire à la dernière danse. Tous les regards réunis.",
    "videoBody": "Un joli vœu, une anecdote drôle. Plus personnel qu’une photo.",
    "bookBody": "Des mots à garder. Vos invités racontent leurs plus beaux souvenirs.",
    "liveBody": "Les photos de vos invités apparaissent sur un écran pendant l’événement.",
    "storyBody": "Transformez vos photos en une story à partager.",
    "posterBody": "Offrez une place sur vos murs à vos souvenirs avec un poster photo.",
    "packagesEyebrow": "FORMULES",
    "packagesTitle": "Choisissez ce qui convient à votre événement.",
    "packagesIntro": "Commencez par un album partagé, puis ajoutez livre d’or, créations, vidéo et Live Slideshow selon vos besoins.",
    "packageMomentTitle": "Le Moment",
    "packageMomentDescription": "Toutes les photos de votre événement au même endroit.",
    "packageMomentItems": ["QR code pour un album partagé", "Envoyer, consulter et télécharger les photos", "Couverture d’album personnalisée"],
    "packageStoryTitle": "L’Histoire",
    "packageStoryDescription": "Photos, messages touchants et souvenirs créatifs réunis.",
    "packageStoryItems": ["Tout Le Moment", "Livre d’or numérique", "Instagram Story Creator", "Memory Poster A3"],
    "packageExperienceTitle": "L’Expérience",
    "packageExperienceDescription": "Vivez et revivez votre événement avec la vidéo et Live Slideshow.",
    "packageExperienceItems": ["Tout L’Histoire", "Video Messages", "Live Slideshow", "Photobooth Memory"],
    "packagePhotoboothNote": "Disponible et actif uniquement pour les événements avec photobooth.",
    "packagePhotoboothFootnote": "*Disponible uniquement pour les événements avec photobooth.",
    "packageRecommended": "Le plus choisi",
    "packagePriceSuffix": "par événement · TVA incluse",
    "packageCta": "Nous contacter",
    "heroSteps": ["Scannez le QR code", "Partagez vos moments", "Regardez tout ensemble"],
    "featurePages": {
      "photos": {
        "eyebrow": "ALBUM PHOTO POUR TOUS",
        "heroTitle": "Toutes les photos de votre événement.",
        "heroAccent": "Réunies au même endroit.",
        "intro": "Vos invités partagent leurs photos via une page événement simple, pour créer un album privé complet.",
        "packageLabel": "Toutes les formules",
        "visualCaption": "Photos de tous les invités",
        "badgeTitle": "Album partagé",
        "badgeBody": "Scannez, envoyez, gardez.",
        "benefits": [
          { "title": "Sans application", "body": "Chaque invité participe grâce au QR code." },
          { "title": "Tout est organisé", "body": "Consultez, réunissez et téléchargez les photos au même endroit." },
          { "title": "Style personnalisé", "body": "L’album s’accorde à l’identité de votre événement." }
        ]
      },
      "videoMessages": {
        "eyebrow": "MESSAGES VIDÉO PERSONNELS",
        "heroTitle": "Des messages vidéo pleins d’émotion.",
        "heroAccent": "À revoir plus tard.",
        "intro": "Vos invités enregistrent de courts vœux, histoires et félicitations que vous pourrez revoir.",
        "packageLabel": "L’Expérience",
        "visualCaption": "Courtes vidéos des invités",
        "badgeTitle": "Video Messages",
        "badgeBody": "Plus personnel qu’une photo.",
        "benefits": [
          { "title": "Proche et personnel", "body": "Gardez les voix, les visages et les moments spontanés." },
          { "title": "Enregistré sur mobile", "body": "Les invités enregistrent leur message directement sur leur téléphone." },
          { "title": "Lecture privée", "body": "Les vidéos restent dans l’album privé de l’événement." }
        ]
      },
      "guestbook": {
        "eyebrow": "LIVRE D’OR",
        "heroTitle": "Des mots à conserver.",
        "heroAccent": "De tout le monde.",
        "intro": "Réunissez les vœux, souvenirs et messages de vos invités avec les photos partagées.",
        "packageLabel": "L’Histoire & L’Expérience",
        "visualCaption": "Messages dans votre album",
        "badgeTitle": "Livre d’or numérique",
        "badgeBody": "Des mots pour plus tard.",
        "benefits": [
          { "title": "Messages personnels", "body": "Les invités laissent leur plus beau souvenir." },
          { "title": "Photo optionnelle", "body": "Une photo choisie peut accompagner le message." },
          { "title": "À garder", "body": "Un complément naturel à l’album et aux photos." }
        ]
      },
      "liveSlideshow": {
        "eyebrow": "LIVE SLIDESHOW",
        "heroTitle": "Vos moments sur grand écran.",
        "heroAccent": "Pendant que la fête continue.",
        "intro": "Les photos de vos invités apparaissent sur un écran pendant l’événement.",
        "packageLabel": "L’Expérience",
        "visualCaption": "Photos en direct sur écran",
        "badgeTitle": "Live Slideshow",
        "badgeBody": "À regarder ensemble pendant l’événement.",
        "benefits": [
          { "title": "Plus d’ambiance", "body": "Les nouvelles photos deviennent partie de l’expérience." },
          { "title": "Les invités participent", "body": "Chaque envoi peut apparaître sur l’écran." },
          { "title": "Pour tous les événements", "body": "Idéal pour mariages, fêtes et événements d’entreprise." }
        ]
      },
      "storyCreator": {
        "eyebrow": "PRÊT POUR LES RÉSEAUX",
        "heroTitle": "De la photo événement à l’Instagram Story.",
        "heroAccent": "Prête à partager.",
        "intro": "Choisissez 4 photos verticales ou 8 photos horizontales dans votre album et créez directement une Instagram Story personnelle.",
        "packageLabel": "L’Histoire & L’Expérience",
        "visualCaption": "Aperçu de story verticale",
        "badgeTitle": "Story Creator",
        "badgeBody": "Pensé pour être partagé.",
        "benefits": [
          { "title": "4 photos verticales", "body": "Idéal pour les portraits et les photos en orientation verticale." },
          { "title": "8 photos horizontales", "body": "Réunissez plus de moments dans une seule Story." },
          { "title": "Prête à partager", "body": "Téléchargez votre Story directement au format 9:16." }
        ]
      },
      "photoboothMemory": {
        "eyebrow": "PHOTOBOOTH MEMORY",
        "heroTitle": "Vos moments photobooth.",
        "heroAccent": "À revivre.",
        "intro": "Utilisez des strips photobooth finalisés comme souvenir vertical complet pour stories et réseaux sociaux.",
        "packageLabel": "L’Expérience · photobooth uniquement",
        "visualCaption": "Les strips photobooth restent entiers",
        "badgeTitle": "Photobooth Memory",
        "badgeBody": "Pour les événements avec photobooth.",
        "benefits": [
          { "title": "Pour 1 ou 3 strips", "body": "Utilisez un strip central ou trois strips avec une profondeur subtile." },
          { "title": "Strip complet visible", "body": "Le strip photobooth reste intact, sans découpage." },
          { "title": "Fait pour les stories", "body": "La composition verticale est prête à partager." }
        ]
      },
      "memoryPoster": {
        "eyebrow": "SOUVENIR A3",
        "heroTitle": "Vos plus belles photos.",
        "heroAccent": "Réunies en A3.",
        "intro": "Créez une composition poster A3 avec les photos de votre album événement.",
        "packageLabel": "L’Histoire & L’Expérience",
        "visualCaption": "Aperçu poster A3",
        "badgeTitle": "Memory Poster A3",
        "badgeBody": "Pour vos murs.",
        "benefits": [
          { "title": "Pour les photos d’événement", "body": "Utilisez les plus belles photos partagées dans l’album." },
          { "title": "Composition A3", "body": "Créez un poster avec plusieurs souvenirs réunis." },
          { "title": "Séparé de Photobooth Memory", "body": "Memory Poster utilise des photos d’événement, pas des strips photobooth." }
        ]
      }
    },
    "personal": "Un message personnel",
    "miniQuote": "Cette journée gardera une place spéciale dans nos cœurs.",
    "bookExample": "Exemple du livre d’or",
    "liveTag": "Regarder ensemble. Vivre ensemble.",
    "storyTag": "Vos photos. Votre histoire.",
    "posterTag": "Un souvenir à accrocher.",
    "workflowEyebrow": "DU MOMENT AU SOUVENIR",
    "workflowTitle": "C’est aussi simple que ça.",
    "scan": "SCANNEZ",
    "upload": "ENVOYEZ",
    "share": "PARTAGEZ",
    "relive": "REVIVEZ",
    "scanBody": "Scannez le QR code personnel.",
    "uploadBody": "Partagez photos et courtes vidéos depuis votre téléphone.",
    "shareBody": "Découvrez ensemble les moments de l’événement.",
    "reliveBody": "Gardez vos souvenirs et revivez-les.",
    "previewEyebrow": "VOTRE ÉVÉNEMENT, VOTRE STYLE",
    "previewTitle": "Voici votre EventDrop Sharing.",
    "previewIntro": "Un espace pour vos souvenirs. Découvrez-le ci-dessous.",
    "example": "APERÇU FICTIF",
    "yourEvent": "votre événement",
    "theirEyes": "VOTRE JOURNÉE, À TRAVERS LEURS YEUX",
    "dayToKeep": "Une journée à garder",
    "momentsTogether": "Tous les beaux moments réunis.",
    "previewLabel": "Découvrir les exemples EventDrop Sharing",
    "designs": "Créations",
    "videoExample": "MESSAGE VIDÉO · EXEMPLE",
    "words": "Certains mots méritent d’être réécoutés.",
    "wordsBody": "De courts messages vidéo dans leur galerie. Proches, même après l’événement.",
    "stillExample": "Ceci est un aperçu statique du produit.",
    "message1": "Quelle belle journée. Plein de bonheur et de belles aventures ensemble !",
    "message2": "Du premier toast à la dernière danse : inoubliable.",
    "message3": "Tant d’amour au même endroit. Merci pour ce souvenir unique.",
    "sampleMessage": "Message d’exemple",
    "together": "ENSEMBLE.",
    "thousand": "Un jour. Mille souvenirs.",
    "bestMoments": "NOS PLUS BEAUX MOMENTS",
    "wall": "Du téléphone à vos murs.",
    "wallBody": "Créez un Memory Poster A3 ou une story avec vos photos.",
    "composition": "Exemple de composition photo.",
    "occasionsEyebrow": "TOUTES LES OCCASIONS DE SE RÉUNIR",
    "occasionsTitle": "Pour votre moment à vous.",
    "weddings": "Mariages",
    "parties": "Fêtes",
    "corporate": "Événements d’entreprise",
    "weddingBody": "Tous les instants spontanés de vos invités réunis.",
    "partyBody": "De l’anniversaire au jubilé : chacun participe.",
    "corporateBody": "Photos, messages et moments réunis simplement.",
    "accessEyebrow": "VOS PLUS BEAUX MOMENTS VOUS ATTENDENT",
    "already": "Déjà un",
    "accessIntro": "Accédez directement à votre événement.",
    "accessHelp": "Saisissez votre adresse e-mail et le code de l’événement.",
    "bottomQuickNavLabel": "Actions rapides",
    "bookQuickNav": "Réserver",
    "contactQuickNav": "Contact",
    "mailQuickNav": "Mail",
    "eventQuickNav": "Votre événement",
    "photoBandHeadline": "Tous les moments. Un souvenir.",
    "photoBandBody": "Des photos spontanées aux messages personnels de vos invités.",
    "footer": "Scannez. Partagez. Revivez.",
    "phoneLabel": "Exemple d’album EventDrop Sharing",
    "bestDay": "NOTRE PLUS BEAU JOUR",
    "betterTogether": "Tout est plus beau ensemble.",
    "phoneVideos": "Vidéos",
    "shareMoments": "Partagez vos moments",
    "dance": "La piste était à nous.",
    "bookSample": "LIVRE D’OR · EXEMPLE",
    "heroQuote": "Quelle journée, quel amour. Merci de nous avoir invités !",
    "later": "Un souvenir pour plus tard",
    "personalLater": "Personnel. Même après l’événement.",
    "homeLabel": "EventDrop Sharing — accueil",
    "accessTitle": "Déjà un EventDrop Sharing ?"
  },
  "tr": {
    "entry": "Etkinliğine git",
    "nav": "Ana menü",
    "homeNav": "Ana sayfa",
    "featureNavigationLabel": "Ürün menüsü",
    "how": "Nasıl çalışır",
    "features": "Özellikler",
    "photoboothMemory": "Photobooth Memory",
    "memoryPosterNav": "Memory Poster",
    "events": "Etkinlikler için",
    "heroEyebrow": "Küçük anlar. Büyük hatıralar.",
    "heroTitle": "Etkinliğinizin tüm anıları.",
    "heroAccent": "Tek bir yerde.",
    "intro": "Misafirlerinizin fotoğrafları, video mesajları ve notları tek bir QR koduyla bir arada.",
    "watchHow": "Nasıl çalıştığını gör",
    "trust": "Uygulama yok. Zahmet yok. Tara ve paylaş.",
    "noApp": "Uygulama gerektirmez",
    "oneQr": "Tek QR kodu",
    "fromPhone": "Doğrudan telefonundan",
    "private": "Özel etkinlik albümü",
    "featureEyebrow": "BİRLİKTE BİRİKTİRİN",
    "featureTitle": "Bir fotoğraf albümünden fazlası.",
    "featureIntro": "Fotoğraflar, video mesajları ve anı defteri notları: etkinliğinizi tüm misafirlerin gözünden saklayın.",
    "photos": "Fotoğraflar",
    "videos": "Video mesajları",
    "guestbook": "Anı defteri",
    "live": "Live Slideshow",
    "story": "Story Creator",
    "poster": "Memory Poster A3",
    "photoBody": "İlk karşılaşmadan son dansa. Her bakış açısı bir arada.",
    "videoBody": "Güzel bir dilek, komik bir hikâye. Fotoğraftan daha kişisel.",
    "bookBody": "Saklanacak sözler. Misafirleriniz en güzel anılarını bıraksın.",
    "liveBody": "Misafirlerinizin fotoğrafları etkinlik sırasında bir ekranda görünür.",
    "storyBody": "Fotoğraflarınızı paylaşmak isteyeceğiniz bir hikâyeye dönüştürün.",
    "posterBody": "Fotoğraf posteriyle anılarınıza duvarınızda yer açın.",
    "packagesEyebrow": "PAKETLER",
    "packagesTitle": "Etkinliğinize uygun paketi seçin.",
    "packagesIntro": "Ortak albümle başlayın; ihtiyaç olursa anı defteri, tasarımlar, video ve Live Slideshow ile genişletin.",
    "packageMomentTitle": "An",
    "packageMomentDescription": "Etkinliğinizin tüm fotoğrafları tek bir yerde.",
    "packageMomentItems": ["Ortak albüm için QR kodu", "Fotoğraf yükleme, görüntüleme ve indirme", "Kişiselleştirilmiş albüm kapağı"],
    "packageStoryTitle": "Hikâye",
    "packageStoryDescription": "Fotoğraflar, güzel mesajlar ve yaratıcı hatıralar bir arada.",
    "packageStoryItems": ["An paketindeki her şey", "Dijital anı defteri", "Instagram Story Creator", "Memory Poster A3"],
    "packageExperienceTitle": "Deneyim",
    "packageExperienceDescription": "Etkinliğinizi video ve Live Slideshow ile yaşayın, yeniden yaşayın.",
    "packageExperienceItems": ["Hikâye paketindeki her şey", "Video Messages", "Live Slideshow", "Photobooth Memory"],
    "packagePhotoboothNote": "Yalnızca photobooth bulunan etkinliklerde kullanılabilir ve aktiftir.",
    "packagePhotoboothFootnote": "*Yalnızca photobooth bulunan etkinliklerde kullanılabilir.",
    "packageRecommended": "En çok seçilen",
    "packagePriceSuffix": "etkinlik başına · KDV dahil",
    "packageCta": "İletişime geç",
    "heroSteps": ["QR kodunu tara", "Anlarını paylaş", "Her şeyi birlikte izle"],
    "featurePages": {
      "photos": {
        "eyebrow": "HERKES İÇİN FOTOĞRAF ALBÜMÜ",
        "heroTitle": "Etkinliğinizin tüm fotoğrafları.",
        "heroAccent": "Tek yerde birlikte.",
        "intro": "Misafirler fotoğraflarını tek bir basit etkinlik sayfasından paylaşır; özel albüm kendiliğinden tamamlanır.",
        "packageLabel": "Tüm paketler",
        "visualCaption": "Tüm misafirlerden fotoğraflar",
        "badgeTitle": "Ortak albüm",
        "badgeBody": "Tara, yükle ve sakla.",
        "benefits": [
          { "title": "Uygulama gerekmez", "body": "Her misafir QR koduyla kolayca katılır." },
          { "title": "Her şey düzenli", "body": "Fotoğrafları tek yerden görüntüleyin, toplayın ve indirin." },
          { "title": "Kişisel etkinlik stili", "body": "Albüm etkinliğinizin görünümüne uyum sağlar." }
        ]
      },
      "videoMessages": {
        "eyebrow": "KİŞİSEL VİDEO MESAJLARI",
        "heroTitle": "Duygu dolu video mesajları.",
        "heroAccent": "Yeniden izlemek için.",
        "intro": "Misafirlerinizin kısa dileklerini, hikâyelerini ve tebriklerini daha sonra yeniden izlemek üzere toplayın.",
        "packageLabel": "Deneyim",
        "visualCaption": "Misafirlerden kısa videolar",
        "badgeTitle": "Video Messages",
        "badgeBody": "Fotoğraftan daha kişisel.",
        "benefits": [
          { "title": "Yakın ve kişisel", "body": "Sesleri, yüzleri ve doğal anları saklayın." },
          { "title": "Telefondan kaydedilir", "body": "Misafirler mesajlarını doğrudan telefonlarıyla kaydeder." },
          { "title": "Özel izleme", "body": "Videolar özel etkinlik albümünün parçası olarak kalır." }
        ]
      },
      "guestbook": {
        "eyebrow": "ANI DEFTERİ",
        "heroTitle": "Saklamak isteyeceğiniz sözler.",
        "heroAccent": "Herkesten birlikte.",
        "intro": "Misafirlerinizin güzel dileklerini, anılarını ve mesajlarını paylaşılan fotoğrafların yanında toplayın.",
        "packageLabel": "Hikâye & Deneyim",
        "visualCaption": "Albümle birlikte mesajlar",
        "badgeTitle": "Dijital anı defteri",
        "badgeBody": "Geleceğe güzel sözler.",
        "benefits": [
          { "title": "Kişisel mesajlar", "body": "Misafirler en güzel anılarını bırakır." },
          { "title": "İsteğe bağlı fotoğraf", "body": "Seçilen bir fotoğraf mesajla birlikte gösterilebilir." },
          { "title": "Saklamak için güzel", "body": "Albüm ve fotoğrafların doğal tamamlayıcısıdır." }
        ]
      },
      "liveSlideshow": {
        "eyebrow": "LIVE SLIDESHOW",
        "heroTitle": "Anlarınız büyük ekranda.",
        "heroAccent": "Kutlama devam ederken.",
        "intro": "Misafirlerinizin fotoğrafları etkinlik sırasında bir ekranda görünür.",
        "packageLabel": "Deneyim",
        "visualCaption": "Ekranda canlı fotoğraflar",
        "badgeTitle": "Live Slideshow",
        "badgeBody": "Etkinlikte birlikte izleyin.",
        "benefits": [
          { "title": "Ortama daha fazla atmosfer", "body": "Yeni fotoğraflar etkinliğin canlı deneyimine katılır." },
          { "title": "Misafirler katılır", "body": "Her yükleme ekranda görünebilir." },
          { "title": "Her etkinliğe uygun", "body": "Düğünler, kutlamalar ve kurumsal etkinlikler için uygundur." }
        ]
      },
      "storyCreator": {
        "eyebrow": "SOSYAL MEDYAYA HAZIR",
        "heroTitle": "Etkinlik fotoğrafından Instagram Story’ye.",
        "heroAccent": "Paylaşmaya hazır.",
        "intro": "Albümünüzden 4 dikey veya 8 yatay fotoğraf seçin ve hemen kişisel bir Instagram Story oluşturun.",
        "packageLabel": "Hikâye & Deneyim",
        "visualCaption": "Dikey hikâye önizlemesi",
        "badgeTitle": "Story Creator",
        "badgeBody": "Paylaşmak için tasarlandı.",
        "benefits": [
          { "title": "4 dikey fotoğraf", "body": "Portreler ve dikey fotoğraflar için idealdir." },
          { "title": "8 yatay fotoğraf", "body": "Daha fazla anı tek bir Story’de birleştirin." },
          { "title": "Paylaşmaya hazır", "body": "Story’nizi doğrudan 9:16 formatında indirin." }
        ]
      },
      "photoboothMemory": {
        "eyebrow": "PHOTOBOOTH MEMORY",
        "heroTitle": "Photobooth anlarınız.",
        "heroAccent": "Yeniden yaşansın.",
        "intro": "Tamamlanmış photobooth şeritlerini hikâye ve sosyal paylaşımlar için tek bir dikey anıya dönüştürün.",
        "packageLabel": "Deneyim · yalnızca photobooth ile",
        "visualCaption": "Photobooth şeritleri bütün kalır",
        "badgeTitle": "Photobooth Memory",
        "badgeBody": "Photobooth bulunan etkinlikler için.",
        "benefits": [
          { "title": "1 veya 3 şerit için", "body": "Bir merkezi şerit ya da hafif derinlikli üç şerit kullanın." },
          { "title": "Tam şerit görünür", "body": "Photobooth şeridi bölünmeden bütün kalır." },
          { "title": "Hikâyeler için", "body": "Dikey kompozisyon paylaşmaya hazırdır." }
        ]
      },
      "memoryPoster": {
        "eyebrow": "A3 HATIRA",
        "heroTitle": "En güzel fotoğraflarınız.",
        "heroAccent": "A3 üzerinde birlikte.",
        "intro": "Etkinlik albümünüzdeki fotoğraflarla saklamaya veya bastırmaya hazır bir A3 poster tasarımı oluşturun.",
        "packageLabel": "Hikâye & Deneyim",
        "visualCaption": "A3 poster önizlemesi",
        "badgeTitle": "Memory Poster A3",
        "badgeBody": "Duvarınız için.",
        "benefits": [
          { "title": "Etkinlik fotoğrafları için", "body": "Albümde paylaşılan en güzel fotoğrafları kullanın." },
          { "title": "A3 kompozisyon", "body": "Birden çok anıyı tek posterde birleştirin." },
          { "title": "Photobooth Memory’den ayrı", "body": "Memory Poster, photobooth şeritleri değil etkinlik fotoğrafları kullanır." }
        ]
      }
    },
    "personal": "Kişisel bir mesaj",
    "miniQuote": "Bu gün kalbimizde özel bir yer edinecek.",
    "bookExample": "Anı defteri örneği",
    "liveTag": "Birlikte izleyin. Birlikte yaşayın.",
    "storyTag": "Fotoğraflarınız. Hikâyeniz.",
    "posterTag": "Duvara asılacak bir anı.",
    "workflowEyebrow": "ANDAN HATIRAYA",
    "workflowTitle": "İşte bu kadar kolay.",
    "scan": "TARA",
    "upload": "YÜKLE",
    "share": "PAYLAŞ",
    "relive": "YENİDEN YAŞA",
    "scanBody": "Etkinliğe özel QR kodunu tarayın.",
    "uploadBody": "Telefonunuzdan fotoğraflar ve kısa video mesajları paylaşın.",
    "shareBody": "Etkinliğin tüm anlarını birlikte izleyin.",
    "reliveBody": "Anılarınızı saklayın ve yeniden yaşayın.",
    "previewEyebrow": "ETKİNLİĞİNİZ, TARZINIZ",
    "previewTitle": "İşte sizin EventDrop Sharing’iniz.",
    "previewIntro": "Tüm anılarınız için bir yer. Aşağıda keşfedin.",
    "example": "ÖRNEK GÖRÜNÜM",
    "yourEvent": "etkinliğiniz",
    "theirEyes": "SİZİN GÜNÜNÜZ, ONLARIN GÖZÜNDEN",
    "dayToKeep": "Hatırlanacak bir gün",
    "momentsTogether": "Tüm güzel anlar bir arada.",
    "previewLabel": "EventDrop Sharing örneklerini keşfet",
    "designs": "Tasarımlar",
    "videoExample": "VİDEO MESAJI · ÖRNEK",
    "words": "Bazı sözleri tekrar duymak istersiniz.",
    "wordsBody": "Kısa video mesajları, kendi galerisinde. Etkinlikten sonra da yakın.",
    "stillExample": "Bu, durağan bir ürün örneğidir.",
    "message1": "Ne güzel bir gün. Birlikte mutluluk ve harika maceralar dileriz!",
    "message2": "İlk kadehten son dansa: bunu hiç unutmayacağız.",
    "message3": "Bir yerde bu kadar sevgi. Bu özel anı için teşekkürler.",
    "sampleMessage": "Örnek mesaj",
    "together": "BİRLİKTE.",
    "thousand": "Bir gün. Bin anı.",
    "bestMoments": "EN GÜZEL ANLARIMIZ",
    "wall": "Telefonunuzdan duvarınıza.",
    "wallBody": "Etkinlik fotoğraflarınızla Memory Poster A3 veya hikâye oluşturun.",
    "composition": "Örnek fotoğraf düzeni.",
    "occasionsEyebrow": "BİR ARAYA GELMEK İÇİN HER NEDEN",
    "occasionsTitle": "Sizin anınız için.",
    "weddings": "Düğünler",
    "parties": "Kutlamalar",
    "corporate": "Kurumsal etkinlikler",
    "weddingBody": "Misafirlerinizin tüm doğal anları bir arada.",
    "partyBody": "Doğum gününden yıl dönümüne: herkes paylaşır.",
    "corporateBody": "Fotoğraflar, mesajlar ve etkinlik anları kolayca bir arada.",
    "accessEyebrow": "EN GÜZEL ANLAR SİZİ BEKLİYOR",
    "already": "EventDrop Sharing’iniz var mı?",
    "accessIntro": "Doğrudan etkinliğinize gidin.",
    "accessHelp": "E-posta adresinizi ve etkinlik kodunu girin.",
    "bottomQuickNavLabel": "Hızlı işlemler",
    "bookQuickNav": "Rezervasyon",
    "contactQuickNav": "İletişim",
    "mailQuickNav": "E-posta",
    "eventQuickNav": "Etkinliğin",
    "photoBandHeadline": "Tüm anlar. Tek bir hatıra.",
    "photoBandBody": "Doğal fotoğraflardan misafirlerinizin kişisel mesajlarına kadar.",
    "footer": "Tara. Paylaş. Yeniden yaşa.",
    "phoneLabel": "Örnek EventDrop Sharing etkinlik albümü",
    "bestDay": "EN GÜZEL GÜNÜMÜZ",
    "betterTogether": "Birlikte her şey daha güzel.",
    "phoneVideos": "Videolar",
    "shareMoments": "Anlarınızı paylaşın",
    "dance": "Dans pisti bizimdi.",
    "bookSample": "ANI DEFTERİ · ÖRNEK",
    "heroQuote": "Ne güzel bir gün, ne büyük sevgi. Bizi davet ettiğiniz için teşekkürler!",
    "later": "Geleceğe bir hatıra",
    "personalLater": "Kişisel. Etkinlikten sonra da.",
    "homeLabel": "EventDrop Sharing — ana sayfa",
    "accessTitle": "EventDrop Sharing’iniz var mı?"
  }
}

type MarketingHomepage = typeof marketingHomepage.nl

export const translations: Record<Locale, TranslationTree & { marketing: MarketingHomepage }> = {
  nl: { ...baseTranslations.nl, marketing: marketingHomepage.nl },
  en: { ...baseTranslations.en, marketing: marketingHomepage.en },
  de: { ...germanTranslation, marketing: marketingHomepage.de },
  fr: { ...frenchTranslation, marketing: marketingHomepage.fr },
  tr: { ...baseTranslations.tr, marketing: marketingHomepage.tr },
}

export const videoMessageUploadTranslations = {
  nl: {
    duration: 'Videoboodschappen mogen maximaal 15 seconden duren.',
    metadata: 'De videoduur kon niet worden gelezen. Kies een ander bestand.',
    checking: 'Videoduur controleren…',

    title: 'Videoboodschap', hint: 'MP4 / WebM / MOV · max. 25 MB · max. 15 sec.',
    choose: 'Kies een video', send: 'Verstuur video', cancel: 'Annuleren',
    uploading: 'Video uploaden…', finalizing: 'Video afronden…', success: 'Je videoboodschap is opgeslagen.',
    type: 'Kies een MP4-, WebM- of MOV-video.', size: 'Deze video is groter dan 25 MiB.', empty: 'Dit bestand is leeg.',
    upload: 'Uploaden is niet gelukt. Probeer het opnieuw.', finalize: 'Opslaan kon niet worden bevestigd. Probeer het opnieuw.', cancelled: 'Upload geannuleerd.',
  },
  en: {
    duration: 'Video messages can be a maximum of 15 seconds.',
    metadata: 'The video duration could not be read. Choose another file.',
    checking: 'Checking video duration…',

    title: 'Video Message', hint: 'MP4 / WebM / MOV · max. 25 MB · max. 15 sec.',
    choose: 'Choose a video', send: 'Upload video', cancel: 'Cancel',
    uploading: 'Uploading video…', finalizing: 'Finalizing video…', success: 'Your video message has been saved.',
    type: 'Choose an MP4, WebM, or MOV video.', size: 'This video exceeds 25 MiB.', empty: 'This file is empty.',
    upload: 'Upload failed. Please try again.', finalize: 'Saving could not be confirmed. Please try again.', cancelled: 'Upload cancelled.',
  },
  de: {
    duration: 'Videobotschaften dürfen maximal 15 Sekunden dauern.',
    metadata: 'Die Videodauer konnte nicht gelesen werden. Wähle eine andere Datei.',
    checking: 'Videodauer wird geprüft…',

    title: 'Videobotschaft', hint: 'MP4 / WebM / MOV · max. 25 MB · max. 15 sec.',
    choose: 'Video auswählen', send: 'Video hochladen', cancel: 'Abbrechen',
    uploading: 'Video wird hochgeladen…', finalizing: 'Video wird gespeichert…', success: 'Deine Videobotschaft wurde gespeichert.',
    type: 'Wähle ein MP4-, WebM- oder MOV-Video.', size: 'Dieses Video ist größer als 25 MiB.', empty: 'Diese Datei ist leer.',
    upload: 'Upload fehlgeschlagen. Bitte erneut versuchen.', finalize: 'Speichern konnte nicht bestätigt werden. Bitte erneut versuchen.', cancelled: 'Upload abgebrochen.',
  },
  fr: {
    duration: 'Les messages vidéo ne peuvent pas dépasser 15 secondes.',
    metadata: 'Impossible de lire la durée. Choisissez un autre fichier.',
    checking: 'Vérification de la durée…',

    title: 'Message vidéo', hint: 'MP4 / WebM / MOV · max. 25 MB · max. 15 sec.',
    choose: 'Choisir une vidéo', send: 'Envoyer la vidéo', cancel: 'Annuler',
    uploading: 'Envoi de la vidéo…', finalizing: 'Enregistrement de la vidéo…', success: 'Votre message vidéo a été enregistré.',
    type: 'Choisissez une vidéo MP4, WebM ou MOV.', size: 'Cette vidéo dépasse 25 MiB.', empty: 'Ce fichier est vide.',
    upload: 'Échec de l’envoi. Veuillez réessayer.', finalize: 'L’enregistrement n’a pas pu être confirmé. Veuillez réessayer.', cancelled: 'Envoi annulé.',
  },
  tr: {
    duration: 'Video mesajları en fazla 15 saniye olabilir.',
    metadata: 'Video süresi okunamadı. Başka bir dosya seçin.',
    checking: 'Video süresi kontrol ediliyor…',

    title: 'Video mesajı', hint: 'MP4 / WebM / MOV · maks. 25 MB · maks. 15 sn.',
    choose: 'Video seç', send: 'Videoyu yükle', cancel: 'İptal',
    uploading: 'Video yükleniyor…', finalizing: 'Video kaydediliyor…', success: 'Video mesajınız kaydedildi.',
    type: 'MP4, WebM veya MOV video seçin.', size: 'Bu video 25 MiB sınırını aşıyor.', empty: 'Bu dosya boş.',
    upload: 'Yükleme başarısız. Lütfen tekrar deneyin.', finalize: 'Kayıt doğrulanamadı. Lütfen tekrar deneyin.', cancelled: 'Yükleme iptal edildi.',
  },
} satisfies Record<Locale, Record<string, string>>
