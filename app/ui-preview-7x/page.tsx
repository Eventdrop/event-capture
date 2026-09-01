'use client'

import { useEffect, useRef, useState } from 'react'

type SectionKey = 'photos' | 'guestbook' | 'designs' | 'downloads'
type PreviewMode = 'album' | 'access'
type ModalKey = 'upload-info' | 'email-info' | null
type PreviewLocale = 'nl' | 'en' | 'fr' | 'de' | 'tr'
type PreviewPhoto = {
  src: string
  ratio: string
  name?: string
}

const GUEST_MESSAGE_MAX_LENGTH = 500
const UPLOAD_CONSENT_STORAGE_KEY = 'eventdrop-ui-preview-upload-consent'

const languages: { code: PreviewLocale; label: string }[] = [
  { code: 'nl', label: 'NL' },
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'de', label: 'DE' },
  { code: 'tr', label: 'TR' },
]

const navigation: { key: SectionKey }[] = [
  { key: 'photos' },
  { key: 'guestbook' },
  { key: 'designs' },
  { key: 'downloads' },
]

const copy = {
  nl: {
    accessPreview: 'Bekijk toegangsscherm',
    albumPreview: 'Bekijk album',
    nav: { photos: 'Foto’s', guestbook: 'Gastenboek', designs: 'Ontwerpen', downloads: 'Downloaden' },
    addPhotos: 'Foto’s toevoegen',
    addPhotosSub: "Deel jouw foto's met het album",
    chooseFiles: 'Kiezen',
    selectedPhotos: "foto's geselecteerd",
    checkSelection: 'Controleer je selectie voordat je uploadt.',
    upload: 'Uploaden',
    added: 'Foto’s toegevoegd',
    removed: 'Foto verwijderd',
    deleteTitle: 'Foto verwijderen?',
    deleteText: 'Weet je zeker dat je deze foto wilt verwijderen?',
    cancel: 'Annuleren',
    delete: 'Verwijderen',
    shareReady: 'Gedeeld',
    shareCopied: 'Link gekopieerd',
    shareError: 'Delen mislukt',
    downloadStarted: 'Download gestart',
    downloadError: 'Download mislukt',
    openPreview: 'Voorbeeld openen',
    selected: 'Geselecteerd',
    select: 'Selecteren',
    share: 'Delen',
    download: 'Downloaden',
    close: 'Sluiten',
    previous: 'Vorige foto',
    next: 'Volgende foto',
    access: 'Toegang',
    accessTitle: 'Bekijk en deel foto’s van het event',
    accessText: 'Vul je e-mailadres in om toegang te krijgen tot het album van Monique 70 jaar.',
    email: 'E-mailadres',
    emailPlaceholder: 'naam@example.com',
    whyEmail: 'Waarom vragen we dit?',
    marketing: 'Ik wil af en toe nieuws, updates en aanbiedingen van Photobooth Holland / EventDrop Sharing ontvangen.',
    continue: 'Verder',
    emailInfoTitle: 'Waarom vragen we dit?',
    emailInfoText: 'Je e-mailadres helpt om toegang tot dit evenement te bevestigen en om je later veilig terug te brengen naar hetzelfde album.',
    consentTitle: 'Foto’s uploaden en delen',
    consentText: 'Ik bevestig dat ik bevoegd ben om deze foto’s te uploaden en te delen, en dat foto’s die aan dit album worden toegevoegd door derden kunnen worden bekeken, gedownload en gedeeld.',
    consentCheck: 'Ik heb bovenstaande informatie gelezen en ga akkoord.',
    consentButton: 'Akkoord en bestanden kiezen',
    guestbookTitle: 'Laat iets achter in het gastenboek',
    optional: 'Optioneel',
    guestName: 'Naam (optioneel)',
    guestNamePlaceholder: 'Je naam',
    message: 'Bericht (optioneel)',
    messagePlaceholder: 'Bijv. Wat een prachtige dag! Veel geluk samen',
    messageHelp: 'Optioneel · Je bericht verschijnt in het gastenboek.',
    limitReached: 'Maximum aantal tekens bereikt',
    chooseGuestbookPhoto: 'Kies een foto voor het gastenboek',
    noPhoto: 'Geen foto',
    guestbookPageTitle: 'Gastenboek',
    guestbookPageIntro: 'Alle mooie berichten en herinneringen op één plek.',
    guestbookEmptyTitle: 'Nog geen berichten',
    guestbookEmptyText: 'Zodra gasten een bericht achterlaten, verschijnen de herinneringen hier.',
    guestbookIntro: 'Persoonlijke berichten van gasten, samen met hun mooiste foto’s.',
    designsTitle: 'Ontwerpen',
    designsIntro: 'Maak van het album een printbaar of deelbaar ontwerp.',
    posterDesc: 'Een printklare collage met de mooiste foto’s van de dag.',
    storyDesc: 'Een verticale herinnering om direct te delen.',
    viewPreview: 'Voorbeeld bekijken',
    downloadsTitle: 'Bewaar het complete album',
    downloadsIntro: 'Download losse favorieten of alle foto’s in één pakket.',
    fullAlbum: 'Compleet album',
    selectionDownload: 'Selectie downloaden',
    stats: ['39 foto’s', '3 ontwerpen', '12 berichten'],
  },
  en: {
    accessPreview: 'View access screen',
    albumPreview: 'View album',
    nav: { photos: 'Photos', guestbook: 'Guestbook', designs: 'Designs', downloads: 'Downloads' },
    addPhotos: 'Add photos',
    addPhotosSub: 'Share your photos with the album',
    chooseFiles: 'Choose',
    selectedPhotos: 'photos selected',
    checkSelection: 'Check your selection before uploading.',
    upload: 'Upload',
    added: 'Photos added',
    removed: 'Photo removed',
    deleteTitle: 'Delete photo?',
    deleteText: 'Are you sure you want to delete this photo?',
    cancel: 'Cancel',
    delete: 'Delete',
    shareReady: 'Shared',
    shareCopied: 'Link copied',
    shareError: 'Sharing failed',
    downloadStarted: 'Download started',
    downloadError: 'Download failed',
    openPreview: 'Open preview',
    selected: 'Selected',
    select: 'Select',
    share: 'Share',
    download: 'Download',
    close: 'Close',
    previous: 'Previous photo',
    next: 'Next photo',
    access: 'Access',
    accessTitle: 'View and share event photos',
    accessText: 'Enter your email address to access the album for Monique 70 jaar.',
    email: 'Email address',
    emailPlaceholder: 'name@example.com',
    whyEmail: 'Why do we ask this?',
    marketing: 'I would like to occasionally receive news, updates and offers from Photobooth Holland / EventDrop Sharing.',
    continue: 'Continue',
    emailInfoTitle: 'Why do we ask this?',
    emailInfoText: 'Your email address helps confirm access to this event and safely bring you back to the same album later.',
    consentTitle: 'Uploading and sharing photos',
    consentText: 'I confirm that I am authorized to upload and share these photos, and that photos added to this album may be viewed, downloaded and shared by third parties.',
    consentCheck: 'I have read the information above and agree.',
    consentButton: 'Agree and choose files',
    guestbookTitle: 'Leave something in the guestbook',
    optional: 'Optional',
    guestName: 'Name (optional)',
    guestNamePlaceholder: 'Your name',
    message: 'Message (optional)',
    messagePlaceholder: 'E.g. What a beautiful day! Wishing you lots of happiness',
    messageHelp: 'Optional · Your message appears in the guestbook.',
    limitReached: 'Maximum character limit reached',
    chooseGuestbookPhoto: 'Choose a photo for the guestbook',
    noPhoto: 'No photo',
    guestbookPageTitle: 'Guestbook',
    guestbookPageIntro: 'All beautiful messages and memories in one place.',
    guestbookEmptyTitle: 'No messages yet',
    guestbookEmptyText: 'Once guests leave a message, the memories will appear here.',
    guestbookIntro: 'Personal messages from guests, together with their best photos.',
    designsTitle: 'Designs',
    designsIntro: 'Turn the album into a printable or shareable design.',
    posterDesc: 'A print-ready collage with the best photos of the day.',
    storyDesc: 'A vertical memory ready to share.',
    viewPreview: 'View preview',
    downloadsTitle: 'Save the complete album',
    downloadsIntro: 'Download favorites or all photos in one package.',
    fullAlbum: 'Full album',
    selectionDownload: 'Download selection',
    stats: ['39 photos', '3 designs', '12 messages'],
  },
  fr: {
    accessPreview: 'Voir l’écran d’accès',
    albumPreview: 'Voir l’album',
    nav: { photos: 'Photos', guestbook: "Livre d’or", designs: 'Créations', downloads: 'Télécharger' },
    addPhotos: 'Ajouter des photos',
    addPhotosSub: 'Partagez vos photos avec l’album',
    chooseFiles: 'Choisir',
    selectedPhotos: 'photos sélectionnées',
    checkSelection: 'Vérifiez votre sélection avant l’envoi.',
    upload: 'Envoyer',
    added: 'Photos ajoutées',
    removed: 'Photo supprimée',
    deleteTitle: 'Supprimer la photo ?',
    deleteText: 'Voulez-vous vraiment supprimer cette photo ?',
    cancel: 'Annuler',
    delete: 'Supprimer',
    shareReady: 'Partagé',
    shareCopied: 'Lien copié',
    shareError: 'Partage impossible',
    downloadStarted: 'Téléchargement lancé',
    downloadError: 'Téléchargement impossible',
    openPreview: 'Ouvrir l’aperçu',
    selected: 'Sélectionné',
    select: 'Sélectionner',
    share: 'Partager',
    download: 'Télécharger',
    close: 'Fermer',
    previous: 'Photo précédente',
    next: 'Photo suivante',
    access: 'Accès',
    accessTitle: 'Voir et partager les photos de l’événement',
    accessText: 'Saisissez votre adresse e-mail pour accéder à l’album de Monique 70 jaar.',
    email: 'Adresse e-mail',
    emailPlaceholder: 'nom@example.com',
    whyEmail: 'Pourquoi demandons-nous cela ?',
    marketing: 'Je souhaite recevoir occasionnellement des nouvelles, mises à jour et offres de Photobooth Holland / EventDrop Sharing.',
    continue: 'Continuer',
    emailInfoTitle: 'Pourquoi demandons-nous cela ?',
    emailInfoText: 'Votre adresse e-mail aide à confirmer l’accès à cet événement et à vous ramener plus tard au même album.',
    consentTitle: 'Importer et partager des photos',
    consentText: 'Je confirme être autorisé à importer et partager ces photos, et que les photos ajoutées à cet album peuvent être vues, téléchargées et partagées par des tiers.',
    consentCheck: 'J’ai lu les informations ci-dessus et j’accepte.',
    consentButton: 'Accepter et choisir des fichiers',
    guestbookTitle: 'Laissez un mot dans le livre d’or',
    optional: 'Facultatif',
    guestName: 'Nom (facultatif)',
    guestNamePlaceholder: 'Votre nom',
    message: 'Message (facultatif)',
    messagePlaceholder: 'Par exemple : Quelle belle journée ! Beaucoup de bonheur',
    messageHelp: 'Facultatif · Votre message apparaîtra dans le livre d’or.',
    limitReached: 'Nombre maximal de caractères atteint',
    chooseGuestbookPhoto: 'Choisir une photo pour le livre d’or',
    noPhoto: 'Aucune photo',
    guestbookPageTitle: "Livre d’or",
    guestbookPageIntro: 'Tous les beaux messages et souvenirs au même endroit.',
    guestbookEmptyTitle: 'Aucun message pour le moment',
    guestbookEmptyText: 'Dès que les invités laisseront un message, les souvenirs apparaîtront ici.',
    guestbookIntro: 'Messages personnels des invités, avec leurs plus belles photos.',
    designsTitle: 'Créations',
    designsIntro: 'Transformez l’album en création imprimable ou partageable.',
    posterDesc: 'Un collage prêt à imprimer avec les plus belles photos de la journée.',
    storyDesc: 'Un souvenir vertical prêt à partager.',
    viewPreview: 'Voir l’aperçu',
    downloadsTitle: 'Conserver tout l’album',
    downloadsIntro: 'Téléchargez vos favoris ou toutes les photos en un seul lot.',
    fullAlbum: 'Album complet',
    selectionDownload: 'Télécharger la sélection',
    stats: ['39 photos', '3 créations', '12 messages'],
  },
  de: {
    accessPreview: 'Zugang anzeigen',
    albumPreview: 'Album anzeigen',
    nav: { photos: 'Fotos', guestbook: 'Gästebuch', designs: 'Designs', downloads: 'Downloads' },
    addPhotos: 'Fotos hinzufügen',
    addPhotosSub: 'Teile deine Fotos mit dem Album',
    chooseFiles: 'Auswählen',
    selectedPhotos: 'Fotos ausgewählt',
    checkSelection: 'Prüfe deine Auswahl vor dem Hochladen.',
    upload: 'Hochladen',
    added: 'Fotos hinzugefügt',
    removed: 'Foto gelöscht',
    deleteTitle: 'Foto löschen?',
    deleteText: 'Möchtest du dieses Foto wirklich löschen?',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    shareReady: 'Geteilt',
    shareCopied: 'Link kopiert',
    shareError: 'Teilen fehlgeschlagen',
    downloadStarted: 'Download gestartet',
    downloadError: 'Download fehlgeschlagen',
    openPreview: 'Vorschau öffnen',
    selected: 'Ausgewählt',
    select: 'Auswählen',
    share: 'Teilen',
    download: 'Herunterladen',
    close: 'Schließen',
    previous: 'Vorheriges Foto',
    next: 'Nächstes Foto',
    access: 'Zugang',
    accessTitle: 'Eventfotos ansehen und teilen',
    accessText: 'Gib deine E-Mail-Adresse ein, um auf das Album von Monique 70 jaar zuzugreifen.',
    email: 'E-Mail-Adresse',
    emailPlaceholder: 'name@example.com',
    whyEmail: 'Warum fragen wir das?',
    marketing: 'Ich möchte gelegentlich Neuigkeiten, Updates und Angebote von Photobooth Holland / EventDrop Sharing erhalten.',
    continue: 'Weiter',
    emailInfoTitle: 'Warum fragen wir das?',
    emailInfoText: 'Deine E-Mail-Adresse hilft, den Zugang zu diesem Event zu bestätigen und dich später sicher zum selben Album zurückzubringen.',
    consentTitle: 'Fotos hochladen und teilen',
    consentText: 'Ich bestätige, dass ich berechtigt bin, diese Fotos hochzuladen und zu teilen, und dass Fotos in diesem Album von Dritten angesehen, heruntergeladen und geteilt werden können.',
    consentCheck: 'Ich habe die obigen Informationen gelesen und stimme zu.',
    consentButton: 'Zustimmen und Dateien auswählen',
    guestbookTitle: 'Hinterlasse etwas im Gästebuch',
    optional: 'Optional',
    guestName: 'Name (optional)',
    guestNamePlaceholder: 'Dein Name',
    message: 'Nachricht (optional)',
    messagePlaceholder: 'Zum Beispiel: Was für ein schöner Tag! Alles Glück',
    messageHelp: 'Optional · Deine Nachricht erscheint im Gästebuch.',
    limitReached: 'Maximale Zeichenanzahl erreicht',
    chooseGuestbookPhoto: 'Foto für das Gästebuch auswählen',
    noPhoto: 'Kein Foto',
    guestbookPageTitle: 'Gästebuch',
    guestbookPageIntro: 'Alle schönen Nachrichten und Erinnerungen an einem Ort.',
    guestbookEmptyTitle: 'Noch keine Nachrichten',
    guestbookEmptyText: 'Sobald Gäste eine Nachricht hinterlassen, erscheinen die Erinnerungen hier.',
    guestbookIntro: 'Persönliche Nachrichten von Gästen zusammen mit ihren schönsten Fotos.',
    designsTitle: 'Designs',
    designsIntro: 'Mache aus dem Album ein druckbares oder teilbares Design.',
    posterDesc: 'Eine druckfertige Collage mit den schönsten Fotos des Tages.',
    storyDesc: 'Eine vertikale Erinnerung zum Teilen.',
    viewPreview: 'Vorschau ansehen',
    downloadsTitle: 'Das komplette Album speichern',
    downloadsIntro: 'Lade Favoriten oder alle Fotos in einem Paket herunter.',
    fullAlbum: 'Komplettes Album',
    selectionDownload: 'Auswahl herunterladen',
    stats: ['39 Fotos', '3 Designs', '12 Nachrichten'],
  },
  tr: {
    accessPreview: 'Erişim ekranını göster',
    albumPreview: 'Albümü göster',
    nav: { photos: 'Fotoğraflar', guestbook: 'Anı defteri', designs: 'Tasarımlar', downloads: 'İndir' },
    addPhotos: 'Fotoğraf ekle',
    addPhotosSub: 'Fotoğraflarını albümle paylaş',
    chooseFiles: 'Seç',
    selectedPhotos: 'fotoğraf seçildi',
    checkSelection: 'Yüklemeden önce seçimini kontrol et.',
    upload: 'Yükle',
    added: 'Fotoğraflar eklendi',
    removed: 'Fotoğraf silindi',
    deleteTitle: 'Fotoğraf silinsin mi?',
    deleteText: 'Bu fotoğrafı silmek istediğinden emin misin?',
    cancel: 'Vazgeç',
    delete: 'Sil',
    shareReady: 'Paylaşıldı',
    shareCopied: 'Link kopyalandı',
    shareError: 'Paylaşım başarısız',
    downloadStarted: 'İndirme başladı',
    downloadError: 'İndirme başarısız',
    openPreview: 'Önizlemeyi aç',
    selected: 'Seçildi',
    select: 'Seç',
    share: 'Paylaş',
    download: 'İndir',
    close: 'Kapat',
    previous: 'Önceki fotoğraf',
    next: 'Sonraki fotoğraf',
    access: 'Erişim',
    accessTitle: 'Etkinlik fotoğraflarını gör ve paylaş',
    accessText: 'Monique 70 jaar albümüne erişmek için e-posta adresini gir.',
    email: 'E-posta adresi',
    emailPlaceholder: 'isim@example.com',
    whyEmail: 'Bunu neden soruyoruz?',
    marketing: 'Photobooth Holland / EventDrop Sharing haberlerini, güncellemelerini ve tekliflerini ara sıra almak istiyorum.',
    continue: 'Devam et',
    emailInfoTitle: 'Bunu neden soruyoruz?',
    emailInfoText: 'E-posta adresin bu etkinliğe erişimi doğrulamaya ve seni daha sonra aynı albüme güvenli şekilde geri getirmeye yardımcı olur.',
    consentTitle: 'Fotoğraf yükleme ve paylaşma',
    consentText: 'Bu fotoğrafları yüklemeye ve paylaşmaya yetkili olduğumu, albüme eklenen fotoğrafların üçüncü kişiler tarafından görüntülenebileceğini, indirilebileceğini ve paylaşılabileceğini onaylıyorum.',
    consentCheck: 'Yukarıdaki bilgileri okudum ve kabul ediyorum.',
    consentButton: 'Kabul et ve dosyaları seç',
    guestbookTitle: 'Anı defterine bir not bırak',
    optional: 'Opsiyonel',
    guestName: 'İsim (opsiyonel)',
    guestNamePlaceholder: 'İsmin',
    message: 'Mesaj (opsiyonel)',
    messagePlaceholder: 'Örn. Ne güzel bir gün! Mutluluklar',
    messageHelp: 'Opsiyonel · Mesajın anı defterinde görünür.',
    limitReached: 'Maksimum karakter sınırına ulaşıldı',
    chooseGuestbookPhoto: 'Anı defteri için bir fotoğraf seç',
    noPhoto: 'Fotoğraf yok',
    guestbookPageTitle: 'Anı defteri',
    guestbookPageIntro: 'Tüm güzel mesajlar ve anılar tek bir yerde.',
    guestbookEmptyTitle: 'Henüz mesaj yok',
    guestbookEmptyText: 'Misafirler mesaj bıraktığında anılar burada görünecek.',
    guestbookIntro: 'Misafirlerin kişisel mesajları ve en güzel fotoğrafları.',
    designsTitle: 'Tasarımlar',
    designsIntro: 'Albümü yazdırılabilir veya paylaşılabilir bir tasarıma dönüştür.',
    posterDesc: 'Günün en güzel fotoğraflarıyla baskıya hazır kolaj.',
    storyDesc: 'Paylaşmaya hazır dikey bir anı.',
    viewPreview: 'Önizleme',
    downloadsTitle: 'Tüm albümü sakla',
    downloadsIntro: 'Favorileri veya tüm fotoğrafları tek pakette indir.',
    fullAlbum: 'Tüm albüm',
    selectionDownload: 'Seçimi indir',
    stats: ['39 fotoğraf', '3 tasarım', '12 mesaj'],
  },
} satisfies Record<PreviewLocale, {
  accessPreview: string
  albumPreview: string
  nav: Record<SectionKey, string>
  [key: string]: string | string[] | Record<SectionKey, string>
}>

const photoCards: PreviewPhoto[] = [
  { src: '/home-tile-1.png', ratio: 'aspect-[4/5]' },
  { src: '/home-tile-2.png', ratio: 'aspect-[3/4]' },
  { src: '/home-poster-reference.jpg', ratio: 'aspect-[4/5]' },
  { src: '/home-hero-custom.png', ratio: 'aspect-[6/5]' },
  { src: '/home-tile-3.png', ratio: 'aspect-[3/4]' },
  { src: '/home-hero-fun.jpg', ratio: 'aspect-[5/4]' },
]

const guestbookMessages: Record<
  PreviewLocale,
  { name: string; text: string; time: string; photoSrc?: string }[]
> = {
  nl: [
    { name: 'Sanne', text: 'Wat een prachtige avond. De sfeer, de muziek en alle lieve mensen pasten helemaal bij Monique.', time: '20:14', photoSrc: '/home-tile-1.png' },
    { name: 'Peter en Linda', text: 'Gefeliciteerd met je 70e verjaardag. We hebben genoten van ieder moment.', time: '20:38' },
    { name: 'Eva', text: 'Een heel warme herinnering aan een bijzondere dag. Dank je wel dat we erbij mochten zijn.', time: '21:02', photoSrc: '/home-tile-2.png' },
    { name: 'Marcel', text: 'Lieve Monique, op naar nog veel mooie jaren vol muziek, familie en gezelligheid.', time: '21:26' },
  ],
  en: [
    { name: 'Sanne', text: 'What a beautiful evening. The atmosphere, the music and all the lovely people suited Monique perfectly.', time: '20:14', photoSrc: '/home-tile-1.png' },
    { name: 'Peter and Linda', text: 'Happy 70th birthday. We enjoyed every single moment.', time: '20:38' },
    { name: 'Eva', text: 'A warm memory of a very special day. Thank you for having us.', time: '21:02', photoSrc: '/home-tile-2.png' },
    { name: 'Marcel', text: 'Dear Monique, here’s to many more wonderful years full of music, family and joy.', time: '21:26' },
  ],
  fr: [
    { name: 'Sanne', text: 'Quelle belle soirée. L’ambiance, la musique et toutes les personnes présentes correspondaient parfaitement à Monique.', time: '20:14', photoSrc: '/home-tile-1.png' },
    { name: 'Peter et Linda', text: 'Joyeux 70e anniversaire. Nous avons profité de chaque instant.', time: '20:38' },
    { name: 'Eva', text: 'Un souvenir chaleureux d’une journée très spéciale. Merci de nous avoir invités.', time: '21:02', photoSrc: '/home-tile-2.png' },
    { name: 'Marcel', text: 'Chère Monique, encore beaucoup de belles années remplies de musique, de famille et de joie.', time: '21:26' },
  ],
  de: [
    { name: 'Sanne', text: 'Was für ein schöner Abend. Die Stimmung, die Musik und all die lieben Menschen haben perfekt zu Monique gepasst.', time: '20:14', photoSrc: '/home-tile-1.png' },
    { name: 'Peter und Linda', text: 'Alles Gute zum 70. Geburtstag. Wir haben jeden Moment genossen.', time: '20:38' },
    { name: 'Eva', text: 'Eine warme Erinnerung an einen ganz besonderen Tag. Danke, dass wir dabei sein durften.', time: '21:02', photoSrc: '/home-tile-2.png' },
    { name: 'Marcel', text: 'Liebe Monique, auf viele weitere schöne Jahre voller Musik, Familie und Freude.', time: '21:26' },
  ],
  tr: [
    { name: 'Sanne', text: 'Çok güzel bir akşamdı. Atmosfer, müzik ve tüm güzel insanlar Monique’e çok yakıştı.', time: '20:14', photoSrc: '/home-tile-1.png' },
    { name: 'Peter ve Linda', text: '70. yaş günün kutlu olsun. Her anından çok keyif aldık.', time: '20:38' },
    { name: 'Eva', text: 'Çok özel bir günden sıcak bir anı. Bizi davet ettiğin için teşekkürler.', time: '21:02', photoSrc: '/home-tile-2.png' },
    { name: 'Marcel', text: 'Sevgili Monique, müzik, aile ve neşeyle dolu daha nice güzel yıllara.', time: '21:26' },
  ],
}

const designCards = [
  {
    title: 'Memory Poster A3',
    description: 'Een printklare collage met de mooiste foto’s van de dag.',
    shape: 'aspect-[3/4]',
  },
  {
    title: 'Instagram Story',
    description: 'Een verticale herinnering om direct te delen.',
    shape: 'aspect-[9/16]',
  },
]

function NavIcon({ icon }: { icon: SectionKey }) {
  if (icon === 'photos') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
        <path d="M4 8.5h3.3l1.4-2h6.6l1.4 2H20v9H4v-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }

  if (icon === 'guestbook') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
        <path d="M5 6.5A2.5 2.5 0 0 1 7.5 4H19v13.5H7.5A2.5 2.5 0 0 0 5 20V6.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M9 9.5c1.2-1.7 4.8-1.7 6 0 1 1.5-.4 3.1-3 4.7-2.6-1.6-4-3.2-3-4.7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    )
  }

  if (icon === 'designs') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
        <path d="M5 5h6v6H5V5Zm8 2h6m-6 4h6M5 15h14v4H5v-4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="m17.5 3 .5 1.2 1.2.5-1.2.5-.5 1.2-.5-1.2-1.2-.5 1.2-.5.5-1.2Z" fill="currentColor" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none">
      <path d="M12 4v10m0 0 4-4m-4 4-4-4M5 18.5h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function UiPreview7xPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const objectUrlsRef = useRef<string[]>([])
  const [locale, setLocale] = useState<PreviewLocale>('nl')
  const [previewMode, setPreviewMode] = useState<PreviewMode>('album')
  const [activeSection, setActiveSection] = useState<SectionKey>('photos')
  const [modal, setModal] = useState<ModalKey>(null)
  const [uploadConsent, setUploadConsent] = useState(false)
  const [hasUploadConsent, setHasUploadConsent] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([photoCards[0].src])
  const [visiblePhotos, setVisiblePhotos] = useState(photoCards)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  const [photoToDelete, setPhotoToDelete] = useState<PreviewPhoto | null>(null)
  const [photoFeedback, setPhotoFeedback] = useState('')
  const [pendingPhotos, setPendingPhotos] = useState<PreviewPhoto[]>([])
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false)
  const [guestbookPhotoSrc, setGuestbookPhotoSrc] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestMessage, setGuestMessage] = useState('')
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const t = copy[locale]

  useEffect(() => {
    setHasUploadConsent(sessionStorage.getItem(UPLOAD_CONSENT_STORAGE_KEY) === 'true')
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const chooseFiles = () => {
    if (!hasUploadConsent) {
      setUploadConsent(false)
      setModal('upload-info')
      return
    }

    fileInputRef.current?.click()
  }

  const acceptUploadConsent = () => {
    if (!uploadConsent) return

    sessionStorage.setItem(UPLOAD_CONSENT_STORAGE_KEY, 'true')
    setHasUploadConsent(true)
    setModal(null)
    fileInputRef.current?.click()
  }

  const showPhotoFeedback = (message: string) => {
    setPhotoFeedback(message)
    window.setTimeout(() => setPhotoFeedback(''), 1600)
  }

  const previewIndex = previewPhoto
    ? visiblePhotos.findIndex((photo) => photo.src === previewPhoto)
    : -1
  const previousPreviewPhoto =
    previewIndex > 0 ? visiblePhotos[previewIndex - 1] : null
  const nextPreviewPhoto =
    previewIndex >= 0 && previewIndex < visiblePhotos.length - 1
      ? visiblePhotos[previewIndex + 1]
      : null

  const confirmPhotoDelete = () => {
    if (!photoToDelete) return

    if (photoToDelete.src.startsWith('blob:')) {
      URL.revokeObjectURL(photoToDelete.src)
      objectUrlsRef.current = objectUrlsRef.current.filter(
        (url) => url !== photoToDelete.src
      )
    }
    setVisiblePhotos((current) =>
      current.filter((item) => item.src !== photoToDelete.src)
    )
    setSelectedPhotos((current) =>
      current.filter((item) => item !== photoToDelete.src)
    )
    if (previewPhoto === photoToDelete.src) setPreviewPhoto(null)
    setPhotoToDelete(null)
    showPhotoFeedback(t.removed)
  }

  useEffect(() => {
    if (!previewPhoto) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setPreviewPhoto(null)
      } else if (event.key === 'ArrowLeft' && previousPreviewPhoto) {
        setPreviewPhoto(previousPreviewPhoto.src)
      } else if (event.key === 'ArrowRight' && nextPreviewPhoto) {
        setPreviewPhoto(nextPreviewPhoto.src)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [nextPreviewPhoto, previewPhoto, previousPreviewPhoto])

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []).filter((file) =>
      file.type.startsWith('image/')
    )

    pendingPhotos.forEach((photo) => URL.revokeObjectURL(photo.src))
    const nextPhotos = files.map((file) => {
      const src = URL.createObjectURL(file)
      objectUrlsRef.current.push(src)

      return {
        src,
        ratio: 'aspect-[4/5]',
        name: file.name,
      }
    })

    setPendingPhotos(nextPhotos)
    setGuestbookPhotoSrc('')
    setUploadSheetOpen(nextPhotos.length > 0)
  }

  const uploadPendingPhotos = () => {
    if (pendingPhotos.length === 0) return

    setVisiblePhotos((current) => [...pendingPhotos, ...current])
    setPendingPhotos([])
    setGuestbookPhotoSrc('')
    setUploadSheetOpen(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
    showPhotoFeedback(t.added)
  }

  const removePendingPhoto = (photo: PreviewPhoto) => {
    if (photo.src.startsWith('blob:')) {
      URL.revokeObjectURL(photo.src)
      objectUrlsRef.current = objectUrlsRef.current.filter((url) => url !== photo.src)
    }

    setPendingPhotos((current) => current.filter((item) => item.src !== photo.src))
    if (guestbookPhotoSrc === photo.src) setGuestbookPhotoSrc('')
  }

  const sharePhoto = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    try {
      const shareData = {
        title: 'Monique 70 jaar',
        text: locale === 'nl'
          ? 'Bekijk het EventDrop Sharing album van Monique 70 jaar.'
          : 'EventDrop Sharing · Monique 70 jaar',
        url: window.location.href,
      }

      if (navigator.share) {
        await navigator.share(shareData)
        showPhotoFeedback(t.shareReady)
        return
      }

      await navigator.clipboard.writeText(window.location.href)
      showPhotoFeedback(t.shareCopied)
    } catch {
      showPhotoFeedback(t.shareError)
    }
  }

  const downloadPhoto = async (
    event: React.MouseEvent<HTMLButtonElement>,
    photo: PreviewPhoto
  ) => {
    event.stopPropagation()

    try {
      const response = await fetch(photo.src)
      if (!response.ok) throw new Error('Download failed')

      const blob = await response.blob()
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      const fallbackExtension = blob.type.includes('png') ? 'png' : 'jpg'
      const fileName =
        photo.name ||
        photo.src.split('/').pop()?.split('?')[0] ||
        `eventdrop-foto.${fallbackExtension}`

      anchor.href = objectUrl
      anchor.download = fileName.includes('.') ? fileName : `${fileName}.${fallbackExtension}`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
      showPhotoFeedback(t.downloadStarted)
    } catch {
      showPhotoFeedback(t.downloadError)
    }
  }

  return (
    <main className="min-h-screen bg-white text-[#191817]">
      <div className="mx-auto w-full max-w-[900px] px-2.5 py-2 sm:px-5 sm:py-5">
        {previewMode === 'access' ? (
          <section className="mt-4 rounded-[1.5rem] border border-neutral-200 bg-white p-4 shadow-[0_14px_40px_rgba(20,20,20,0.07)] sm:p-6">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d71920]">
              {t.access}
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-neutral-950">
              {t.accessTitle}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-600">
              {t.accessText}
            </p>

            <label className="mt-5 block text-xs font-black uppercase tracking-[0.08em] text-neutral-500">
              {t.email}
              <input
                type="email"
                placeholder={t.emailPlaceholder}
                className="mt-2 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-base font-semibold text-neutral-950 outline-none transition focus:border-[#d71920] focus:bg-white"
              />
            </label>

            <button
              type="button"
              onClick={() => setModal('email-info')}
              className="mt-2 text-left text-sm font-bold text-[#b51218] underline decoration-[#f0b4b8] underline-offset-4"
            >
              {t.whyEmail}
            </button>

            <label className="mt-4 flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm leading-6 text-neutral-600">
              <input
                type="checkbox"
                checked={marketingConsent}
                onChange={(event) => setMarketingConsent(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-neutral-300 accent-[#d71920]"
              />
              <span>
                {t.marketing}
              </span>
            </label>

            <button
              type="button"
              className="mt-5 w-full rounded-2xl bg-[#d71920] px-5 py-4 text-base font-black text-white shadow-[0_12px_26px_rgba(215,25,32,0.2)]"
            >
              {t.continue}
            </button>
          </section>
        ) : (
          <>
            <section className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <img
                  src="/eventdrop-brand.png"
                  alt="EventDrop Sharing"
                  className="h-auto w-[92px]"
                />
                <label className="sr-only" htmlFor="preview-language">
                  Taal
                </label>
                <select
                  id="preview-language"
                  value={locale}
                  onChange={(event) => setLocale(event.target.value as PreviewLocale)}
                  className="h-9 rounded-lg border border-neutral-200 bg-white px-2 text-xs font-black text-neutral-700 outline-none"
                >
                  {languages.map((language) => (
                    <option key={language.code} value={language.code}>
                      {language.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="relative h-[195px] overflow-hidden rounded-[13px] sm:h-[290px]">
                <img
                  src="/home-hero-custom.png"
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/68 via-black/30 to-transparent px-4 pb-4 pt-16 sm:px-5 sm:pb-5">
                  <h1 className="text-[1.65rem] font-black leading-none tracking-[-0.03em] text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.55)] sm:text-3xl">
                    Monique 70 jaar
                  </h1>
                  <p className="mt-1 text-[11px] font-semibold leading-tight text-white/82 [text-shadow:0_1px_7px_rgba(0,0,0,0.55)] sm:text-xs">
                    31 augustus 2026 · {t.stats[0]}
                  </p>
                </div>
              </div>
            </section>

            <nav className="mt-3 border-b border-neutral-200">
              <div className="grid grid-cols-4 gap-1">
                {navigation.map((item) => {
                  const isActive = activeSection === item.key

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveSection(item.key)}
                      className={`relative flex flex-col items-center gap-1 px-1 pb-2.5 pt-2 text-[11px] font-black transition sm:text-sm ${
                        isActive
                          ? 'text-[#d71920]'
                          : 'text-neutral-500 hover:text-neutral-950'
                      }`}
                    >
                      <NavIcon icon={item.key} />
                      <span>{t.nav[item.key]}</span>
                      {isActive ? (
                        <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[#d71920]" />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </nav>

            <div className="py-3 sm:py-5">
              {activeSection === 'photos' ? (
                <section className="space-y-3">
                  <div className="border-b border-neutral-200 bg-white px-1 pb-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-base font-black tracking-[-0.02em] text-neutral-950 sm:text-lg">
                          {t.addPhotos}
                        </h2>
                        <p className="mt-0.5 text-sm leading-5 text-neutral-500">
                          {t.addPhotosSub}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={chooseFiles}
                        className="inline-flex min-h-8 shrink-0 items-center justify-center rounded-lg bg-[#d71920] px-2.5 py-1.5 text-[11px] font-black text-white sm:min-h-9 sm:px-3 sm:text-xs"
                      >
                        {t.chooseFiles}
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileSelection}
                        className="sr-only"
                      />
                    </div>

                  </div>

                  {photoFeedback ? (
                    <p className="rounded-full bg-neutral-950 px-3 py-1.5 text-center text-xs font-bold text-white">
                      {photoFeedback}
                    </p>
                  ) : null}

                  <div className="grid grid-cols-3 gap-1.5 min-[500px]:grid-cols-4 sm:gap-2 lg:grid-cols-5 xl:grid-cols-6">
                    {visiblePhotos.map((photo) => {
                      const isSelected = selectedPhotos.includes(photo.src)

                      return (
                        <article
                          key={photo.src}
                          className={`overflow-hidden rounded-xl bg-neutral-100 ${
                            isSelected ? 'ring-2 ring-[#d71920]/75 ring-offset-2' : ''
                          }`}
                        >
                          <div className="relative">
                            <img
                              src={photo.src}
                              alt=""
                              className="aspect-[4/5] w-full bg-neutral-100 object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => setPreviewPhoto(photo.src)}
                              aria-label={t.openPreview}
                              title={t.openPreview}
                              className="absolute inset-0 z-10"
                            />

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setSelectedPhotos((current) =>
                                  current.includes(photo.src)
                                    ? current.filter((item) => item !== photo.src)
                                    : [...current, photo.src]
                                )
                              }}
                              aria-label={isSelected ? t.selected : t.select}
                              title={isSelected ? t.selected : t.select}
                              className={`absolute left-1.5 top-1.5 z-20 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/75 shadow-sm backdrop-blur sm:h-7 sm:w-7 ${
                                isSelected
                                  ? 'bg-[#d71920] text-white'
                                  : 'bg-white/90 text-neutral-700'
                              }`}
                            >
                              {isSelected ? (
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-[2.8]">
                                  <path d="M5 12.5 9.5 17 19 7.5" />
                                </svg>
                              ) : (
                                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                                  <circle cx="12" cy="12" r="8" />
                                </svg>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation()
                                setPhotoToDelete(photo)
                              }}
                              aria-label={t.delete}
                              title={t.delete}
                              className="absolute right-1.5 top-1.5 z-20 inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/75 bg-[#d71920]/92 text-white shadow-sm backdrop-blur sm:h-7 sm:w-7"
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-2">
                                <path d="M4 7h16" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M6 7l1 12h10l1-12" />
                                <path d="M9 7V4h6v3" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={sharePhoto}
                              aria-label={t.share}
                              title={t.share}
                              className="absolute bottom-1.5 left-1.5 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/75 bg-white/92 text-neutral-800 shadow-[0_4px_14px_rgba(0,0,0,0.16)] backdrop-blur"
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[2.2]">
                                <path d="M12 5v10" />
                                <path d="m8 9 4-4 4 4" />
                                <path d="M5 19h14" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              onClick={(event) => downloadPhoto(event, photo)}
                              aria-label={t.download}
                              title={t.download}
                              className="absolute bottom-1.5 right-1.5 z-20 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#d71920]/75 bg-[#d71920]/94 text-white shadow-[0_4px_14px_rgba(215,25,32,0.24)] backdrop-blur"
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-none stroke-current stroke-[2.2]">
                                <path d="M12 4v10" />
                                <path d="m8 10 4 4 4-4" />
                                <path d="M5 19h14" />
                              </svg>
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </section>
              ) : null}

              {activeSection === 'guestbook' ? (
                <section className="space-y-3">
                  <div>
                    <h2 className="text-xl font-black tracking-[-0.03em] text-neutral-950">
                      {t.guestbookPageTitle}
                    </h2>
                    <p className="mt-0.5 text-sm leading-5 text-neutral-500">
                      {t.guestbookPageIntro}
                    </p>
                  </div>

                  {false ? (
                    <div className="rounded-xl border border-neutral-200 bg-white p-4">
                      <p className="text-sm font-black text-neutral-950">
                        {t.guestbookEmptyTitle}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-neutral-500">
                        {t.guestbookEmptyText}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {guestbookMessages[locale].map((message) => (
                        <article
                          key={`${message.name}-${message.time}`}
                          className="rounded-xl border border-neutral-200 bg-white p-3 shadow-[0_6px_18px_rgba(20,20,20,0.04)]"
                        >
                          <div className="flex gap-3">
                            {message.photoSrc ? (
                              <button
                                type="button"
                                onClick={() => setPreviewPhoto(message.photoSrc || null)}
                                className="h-16 w-16 shrink-0 overflow-hidden rounded-[10px] bg-neutral-100 sm:h-20 sm:w-20"
                                aria-label={t.openPreview}
                                title={t.openPreview}
                              >
                                <img
                                  src={message.photoSrc}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              </button>
                            ) : null}
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-black text-neutral-950">
                                  {message.name}
                                </p>
                                <p className="shrink-0 text-[11px] font-bold text-neutral-400">
                                  {message.time}
                                </p>
                              </div>
                              <p className="mt-1 break-words text-sm font-medium leading-5 text-neutral-700">
                                {message.text}
                              </p>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              ) : null}

              {activeSection === 'designs' ? (
                <section className="space-y-4">
                  <div>
                    <h2 className="text-2xl font-black tracking-[-0.03em] text-neutral-950">
                      {t.designsTitle}
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">
                      {t.designsIntro}
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {designCards.map((design) => (
                      <article
                        key={design.title}
                        className="rounded-[1.35rem] border border-neutral-200 bg-white p-4 shadow-[0_10px_28px_rgba(20,20,20,0.06)]"
                      >
                        <div
                          className={`${design.shape} mx-auto w-full max-w-[260px] rounded-[1.2rem] bg-[linear-gradient(145deg,#d71920_0%,#ffffff_48%,#efefef_100%)] p-3`}
                        >
                          <div className="grid h-full grid-cols-2 gap-2">
                            <div className="rounded-xl bg-white/70" />
                            <div className="rounded-xl bg-neutral-200/70" />
                            <div className="rounded-xl bg-neutral-100/80" />
                            <div className="rounded-xl bg-white/80" />
                          </div>
                        </div>
                        <h3 className="mt-4 text-lg font-black text-neutral-950">
                          {design.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-neutral-600">
                          {design.title === 'Memory Poster A3' ? t.posterDesc : t.storyDesc}
                        </p>
                        <button
                          type="button"
                          className="mt-4 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-sm font-black text-neutral-950"
                        >
                          {t.viewPreview}
                        </button>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              {activeSection === 'downloads' ? (
                <section className="space-y-4">
                  <div className="rounded-[1.35rem] border border-neutral-200 bg-white p-5 shadow-[0_10px_28px_rgba(20,20,20,0.06)]">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#d71920]">
                      {t.nav.downloads}
                    </p>
                    <h2 className="mt-2 text-2xl font-black tracking-[-0.03em] text-neutral-950">
                      {t.downloadsTitle}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-neutral-600">
                      {t.downloadsIntro}
                    </p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <button
                        type="button"
                        className="rounded-2xl bg-[#d71920] px-4 py-4 text-sm font-black text-white shadow-[0_10px_22px_rgba(215,25,32,0.16)]"
                      >
                        {t.fullAlbum}
                      </button>
                      <button
                        type="button"
                        className="rounded-2xl border border-neutral-200 bg-white px-4 py-4 text-sm font-black text-neutral-950"
                      >
                        {t.selectionDownload}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {t.stats.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl bg-neutral-100 px-3 py-4 text-center text-sm font-black text-neutral-700"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          </>
        )}
      </div>

      {modal ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/35 p-3 sm:items-center sm:justify-center">
          <div className="w-full max-w-[420px] rounded-3xl bg-white p-5 shadow-2xl">
            {modal === 'upload-info' ? (
              <>
                <h2 className="text-lg font-black text-neutral-950">{t.consentTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-700">
                  {t.consentText}
                </p>
                <label className="mt-4 flex items-start gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-6 text-neutral-700">
                  <input
                    type="checkbox"
                    checked={uploadConsent}
                    onChange={(event) => setUploadConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 accent-[#d71920]"
                  />
                  <span>{t.consentCheck}</span>
                </label>
              </>
            ) : (
              <>
                <h2 className="text-lg font-black text-neutral-950">{t.emailInfoTitle}</h2>
                <p className="mt-3 text-sm leading-6 text-neutral-700">
                  {t.emailInfoText}
                </p>
              </>
            )}
            <button
              type="button"
              onClick={modal === 'upload-info' ? acceptUploadConsent : () => setModal(null)}
              disabled={modal === 'upload-info' && !uploadConsent}
              className={`mt-5 w-full rounded-xl px-4 py-3 text-sm font-black text-white ${
                modal === 'upload-info' && !uploadConsent
                  ? 'cursor-not-allowed bg-neutral-300'
                  : 'bg-[#d71920]'
              }`}
            >
              {modal === 'upload-info' ? t.consentButton : t.close}
            </button>
          </div>
        </div>
      ) : null}

      {uploadSheetOpen && pendingPhotos.length > 0 ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/35 p-3 sm:items-center sm:justify-center">
          <div className="max-h-[88vh] w-full max-w-[520px] overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-neutral-950">
                  {pendingPhotos.length} {t.selectedPhotos}
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  {t.checkSelection}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUploadSheetOpen(false)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg font-black text-neutral-700"
              >
                ×
              </button>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {pendingPhotos.map((photo) => (
                <div key={photo.src} className="relative">
                  <img
                    src={photo.src}
                    alt=""
                    className="aspect-[4/5] w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePendingPhoto(photo)}
                    aria-label={t.delete}
                    className="absolute -right-1 -top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-950 text-xs font-black text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-neutral-50 p-3">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-black text-neutral-950">
                  {t.guestbookTitle}
                </p>
                <p className="text-xs font-bold text-neutral-400">{t.optional}</p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)]">
                <label className="block text-xs font-bold text-neutral-600">
                  {t.guestName}
                  <input
                    value={guestName}
                    onChange={(event) => setGuestName(event.target.value)}
                    placeholder={t.guestNamePlaceholder}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-950 outline-none focus:border-[#d71920]"
                  />
                </label>
                <label className="block text-xs font-bold text-neutral-600">
                  {t.message}
                  <textarea
                    value={guestMessage}
                    onChange={(event) =>
                      setGuestMessage(event.target.value.slice(0, GUEST_MESSAGE_MAX_LENGTH))
                    }
                    maxLength={GUEST_MESSAGE_MAX_LENGTH}
                    placeholder={t.messagePlaceholder}
                    rows={3}
                    className="mt-1 w-full resize-none rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-950 outline-none focus:border-[#d71920]"
                  />
                  <span className="mt-1 flex justify-between gap-2 text-[11px] font-semibold text-neutral-400">
                    <span>
                      {guestMessage.length === GUEST_MESSAGE_MAX_LENGTH
                        ? t.limitReached
                        : t.messageHelp}
                    </span>
                    <span>{guestMessage.length} / {GUEST_MESSAGE_MAX_LENGTH}</span>
                  </span>
                </label>
              </div>

              {guestMessage.trim() ? (
                <div className="mt-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-black text-neutral-950">
                      {t.chooseGuestbookPhoto}
                    </p>
                    <p className="text-xs font-bold text-neutral-400">{t.optional}</p>
                  </div>
                  <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                    <button
                      type="button"
                      onClick={() => setGuestbookPhotoSrc('')}
                      className={`h-16 w-16 shrink-0 rounded-xl border text-xs font-black ${
                        guestbookPhotoSrc
                          ? 'border-neutral-200 bg-white text-neutral-500'
                          : 'border-[#d71920] bg-[#fff1f1] text-[#d71920]'
                      }`}
                    >
                      {t.noPhoto}
                    </button>
                    {pendingPhotos.map((photo) => {
                      const isGuestbookPhoto = guestbookPhotoSrc === photo.src

                      return (
                        <button
                          key={photo.src}
                          type="button"
                          onClick={() => setGuestbookPhotoSrc(photo.src)}
                          className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 ${
                            isGuestbookPhoto ? 'border-[#d71920]' : 'border-transparent'
                          }`}
                        >
                          <img src={photo.src} alt="" className="h-full w-full object-cover" />
                          {isGuestbookPhoto ? (
                            <span className="absolute right-1 top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#d71920] text-white">
                              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-3.5 w-3.5 fill-none stroke-current stroke-[3]">
                                <path d="M5 12.5 9.5 17 19 7.5" />
                              </svg>
                            </span>
                          ) : null}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={uploadPendingPhotos}
              className="mt-4 w-full rounded-xl bg-[#d71920] px-4 py-3 text-sm font-black text-white"
            >
              {t.upload}
            </button>
          </div>
        </div>
      ) : null}

      {previewPhoto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-4"
          onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
          onTouchEnd={(event) => {
            if (touchStartX === null) return

            const deltaX = event.changedTouches[0]?.clientX - touchStartX
            if (deltaX < -45 && nextPreviewPhoto) {
              setPreviewPhoto(nextPreviewPhoto.src)
            } else if (deltaX > 45 && previousPreviewPhoto) {
              setPreviewPhoto(previousPreviewPhoto.src)
            }
            setTouchStartX(null)
          }}
        >
          <button
            type="button"
            aria-label={t.close}
            onClick={() => setPreviewPhoto(null)}
            className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-950"
          >
            ×
          </button>
          {previousPreviewPhoto ? (
            <button
              type="button"
              aria-label={t.previous}
              onClick={() => setPreviewPhoto(previousPreviewPhoto.src)}
              className="absolute left-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-950 shadow-lg backdrop-blur"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current stroke-2">
                <path d="m15 6-6 6 6 6" />
              </svg>
            </button>
          ) : null}
          {nextPreviewPhoto ? (
            <button
              type="button"
              aria-label={t.next}
              onClick={() => setPreviewPhoto(nextPreviewPhoto.src)}
              className="absolute right-3 top-1/2 z-10 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-neutral-950 shadow-lg backdrop-blur"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-6 w-6 fill-none stroke-current stroke-2">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>
          ) : null}
          <img
            src={previewPhoto}
            alt=""
            className="max-h-[82vh] max-w-full rounded-2xl object-contain"
          />
          <p className="absolute bottom-4 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-neutral-900">
            {previewIndex + 1} / {visiblePhotos.length}
          </p>
        </div>
      ) : null}

      {photoToDelete ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/35 p-3 sm:items-center sm:justify-center">
          <div className="w-full max-w-[360px] rounded-3xl bg-white p-5 shadow-2xl">
            <h2 className="text-lg font-black text-neutral-950">{t.deleteTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-700">
              {t.deleteText}
            </p>
            <img
              src={photoToDelete.src}
              alt=""
              className="mt-4 h-24 w-20 rounded-xl object-cover"
            />
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-black text-neutral-800"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={confirmPhotoDelete}
                className="rounded-xl bg-[#d71920] px-4 py-3 text-sm font-black text-white"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
