export type Locale = 'tr' | 'nl' | 'en' | 'de' | 'fr'

export const locales: Locale[] = ['nl', 'en', 'de', 'fr', 'tr']

export const localeLabels: Record<Locale, string> = {
  tr: 'TR',
  nl: 'NL',
  en: 'EN',
  de: 'DE',
  fr: 'FR',
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
    guestbookPhotoSelected: string
    shareSectionTitle: string
    guestbookPostError: string
    uploadEnvironmentError: string
    uploadFailedFallback: string
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
        'Devam etmek için önce onay kutusunu işaretleyin.',
      uploadNeedsConsent: 'Ortak albüme yüklemek için önce yukarıdaki onay kutusunu işaretle.',
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
      guestbookPhotoSelected: 'Seçildi',
      shareSectionTitle: 'Albümü paylaş / QR kod',
      guestbookPostError: 'Anı defteri mesajı gönderilemedi.',
      uploadEnvironmentError: 'Yükleme ortamı tam olarak ayarlanmamış.',
      uploadFailedFallback: 'Yükleme başarısız oldu.',
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
      chooseSupported: 'JPG, PNG veya WEBP',
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
        'Vink eerst de toestemming aan om door te gaan.',
      uploadNeedsConsent: 'Vink eerst de toestemming hierboven aan om naar het gedeelde album te uploaden.',
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
      guestbookPhotoSelected: 'Gekozen',
      shareSectionTitle: 'Album delen / QR-code',
      guestbookPostError: 'Gastenboekbericht kon niet worden geplaatst.',
      uploadEnvironmentError: 'De uploadomgeving is niet volledig ingesteld.',
      uploadFailedFallback: 'Uploaden is niet gelukt.',
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
      chooseSupported: 'JPG, PNG of WEBP',
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
      uploadNeedsConsent: 'Tick the consent checkbox above before uploading to the shared album.',
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
      guestbookPhotoSelected: 'Selected',
      shareSectionTitle: 'Share album / QR code',
      guestbookPostError: 'Guestbook message could not be posted.',
      uploadEnvironmentError: 'The upload environment is not fully configured.',
      uploadFailedFallback: 'Upload failed.',
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
      chooseSupported: 'JPG, PNG of WEBP',
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
    consentRequired: 'Bitte stimmen Sie zuerst zu, um fortzufahren.',
    uploadNeedsConsent: 'Bitte markieren Sie zuerst die Zustimmung oben.',
    consentLinks: 'Mit dem Fortfahren bestätigen Sie auch, dass Sie die Nutzungsbedingungen und Datenschutzhinweise gelesen haben.',
    consentButton: 'Weiter', uploadLabel: 'Upload', namingLabel: 'Dateiname',
    namingText: 'Dateien werden in datumsbasierten Ordnern gespeichert.', retentionLabel: 'Speicherdauer',
    selectLabel: 'Fotos auswählen', selectButton: 'Dateien auswählen',
    defaultAlbumName: 'Geteiltes Eventalbum',
    guestbookPhotoLabel: 'Gästebuchfoto',
    guestbookPhotoSelected: 'Ausgewählt',
    shareSectionTitle: 'Album teilen / QR-Code',
    guestbookPostError: 'Gästebuchnachricht konnte nicht gesendet werden.',
    uploadEnvironmentError: 'Die Upload-Umgebung ist nicht vollständig eingerichtet.',
    uploadFailedFallback: 'Upload fehlgeschlagen.',
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
    chooseSupported: 'JPG, PNG of WEBP',
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
    consentRequired: 'Veuillez accepter avant de continuer.',
    uploadNeedsConsent: 'Veuillez d’abord cocher la case de consentement ci-dessus.',
    consentLinks: "En continuant, vous confirmez également avoir lu les conditions d’utilisation et la politique de confidentialité.",
    consentButton: 'Continuer', uploadLabel: 'Ajout', namingLabel: 'Nom du fichier',
    namingText: 'Les fichiers sont classés dans des dossiers par date.', retentionLabel: 'Durée de conservation',
    selectLabel: 'Sélectionner des photos', selectButton: 'Choisir des fichiers',
    defaultAlbumName: 'Album événementiel partagé',
    guestbookPhotoLabel: 'Photo du livre d’or',
    guestbookPhotoSelected: 'Sélectionnée',
    shareSectionTitle: 'Partager l’album / QR code',
    guestbookPostError: "Le message du livre d’or n’a pas pu être publié.",
    uploadEnvironmentError: "L’environnement d’envoi n’est pas complètement configuré.",
    uploadFailedFallback: "L’envoi a échoué.",
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
    chooseSupported: 'JPG, PNG of WEBP', chooseStart: 'Choisissez une photo pour commencer.',
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

export const translations: Record<Locale, TranslationTree> = {
  ...baseTranslations,
  de: germanTranslation,
  fr: frenchTranslation,
}
