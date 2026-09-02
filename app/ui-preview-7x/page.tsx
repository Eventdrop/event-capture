'use client'

import { useEffect, useRef, useState } from 'react'

type SectionKey = 'photos' | 'guestbook' | 'designs' | 'downloads'
type DesignProductKey = 'poster' | 'story' | 'photostrip'
type PreviewMode = 'album' | 'access'
type ModalKey = 'upload-info' | 'email-info' | null
type PreviewLocale = 'nl' | 'en' | 'fr' | 'de' | 'tr'
type PreviewPhoto = {
  src: string
  ratio: string
  name?: string
  width?: number
  height?: number
  orientation?: 'portrait' | 'landscape' | 'neutral'
}

const GUEST_MESSAGE_MAX_LENGTH = 500
const UPLOAD_CONSENT_STORAGE_KEY = 'eventdrop-ui-preview-upload-consent'
const DOWNLOAD_SELECTION_LIMIT = 100
const ALBUM_PACKAGE_SIZE = 40
const PHOTOSTRIP_MIN_HEIGHT_RATIO = 2.4
const PHOTOSTRIP_REQUIRED_COUNT = 3

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

const designProductTabs: { key: DesignProductKey; label: string }[] = [
  { key: 'poster', label: 'Memory Poster A3' },
  { key: 'story', label: 'Instagram Story' },
  { key: 'photostrip', label: 'Photostrip 5x15' },
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
    posterDesc: "Maak een blijvende herinnering met je favoriete foto's.",
    storyDesc: 'Maak een Story die direct klaar is om te delen.',
    viewPreview: 'Bekijken',
    exampleAction: 'Voorbeeld bekijken',
    previewModeTitle: 'Previewmodus',
    previewModeText: 'De echte generatie wordt gekoppeld wanneer deze interface naar productie wordt overgezet.',
    examplesLabel: 'Zo kan het eruitzien',
    previewBadge: 'Voorbeeld',
    chooseVersion: 'Kies je formaat',
    styleLabel: 'Stijl',
    selectedCount: 'geselecteerd',
    clearSelection: 'Selectie wissen',
    makeDesign: 'Maken',
    choosePhotos: "Kies foto's",
    maxSelection: "Je kunt maximaal {count} foto's selecteren.",
    remainingPhotos: "Nog {count} foto's kiezen",
    reduceSelection: 'Verminder je selectie om dit formaat te maken.',
    fitsBetterLandscape: 'Deze foto past beter in Landscape.',
    fitsBetterPortrait: 'Deze foto past beter in Portrait.',
    mixedHint: 'Mixed gebruikt 8 portrait en 4 landscape foto’s.',
    posterModes: ['Portrait Poster', 'Landscape Poster', 'Mixed Poster'],
    posterStyles: ['Kleur', 'Zwart-wit'],
    storyModes: ['Portrait Story', 'Landscape Story'],
    photostripTitle: 'Photostrip Story 5x15',
    photostripDesc: 'Maak van je photobooth strips een kant-en-klare Instagram Story.',
    choosePhotostrips: 'Photostrips kiezen',
    viewStory: 'Story bekijken',
    makeStory: 'Story maken',
    stripHelper: 'Kies volledige 5x15 photostrips.',
    noStripsTitle: 'Geen photostrips gevonden.',
    noStripsText: 'Upload eerst een volledige 5x15 photostrip via Foto’s.',
    confirmSelection: 'Selectie bevestigen',
    maxPhotostrips: 'Je kunt maximaal {count} photostrips selecteren.',
    stripsSelected: 'strips geselecteerd',
    downloadsTitle: 'Bewaar het complete album',
    downloadsIntro: 'Download losse favorieten of alle foto’s in één pakket.',
    albumDownload: 'Album downloaden',
    downloadPreviewText: 'Previewmodus: de echte download wordt gekoppeld wanneer deze interface naar productie wordt overgezet.',
    fullAlbum: 'Compleet album',
    selectionDownload: 'Selectie downloaden',
    stats: ['39 foto’s', '3 ontwerpen', '12 berichten'],
    contact: 'Contact',
    terms: 'Algemene voorwaarden',
    privacy: 'Privacy',
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
    posterDesc: 'Create a lasting memory with your favorite photos.',
    storyDesc: 'Create a Story that is ready to share right away.',
    viewPreview: 'View',
    exampleAction: 'View example',
    previewModeTitle: 'Preview mode',
    previewModeText: 'The real generation will be connected when this interface is moved into production.',
    examplesLabel: 'What it can look like',
    previewBadge: 'Example',
    chooseVersion: 'Choose your format',
    styleLabel: 'Style',
    selectedCount: 'selected',
    clearSelection: 'Clear selection',
    makeDesign: 'Create',
    choosePhotos: 'Choose photos',
    maxSelection: 'You can select up to {count} photos.',
    remainingPhotos: 'Choose {count} more photos',
    reduceSelection: 'Reduce your selection to create this format.',
    fitsBetterLandscape: 'This photo fits better in Landscape.',
    fitsBetterPortrait: 'This photo fits better in Portrait.',
    mixedHint: 'Mixed uses 8 portrait and 4 landscape photos.',
    posterModes: ['Portrait Poster', 'Landscape Poster', 'Mixed Poster'],
    posterStyles: ['Color', 'Black and white'],
    storyModes: ['Portrait Story', 'Landscape Story'],
    photostripTitle: 'Photostrip Story 5x15',
    photostripDesc: 'Turn your photobooth strips into a ready-to-share Instagram Story.',
    choosePhotostrips: 'Choose photostrips',
    viewStory: 'View Story',
    makeStory: 'Create Story',
    stripHelper: 'Choose complete 5x15 photostrips.',
    noStripsTitle: 'No photostrips found.',
    noStripsText: 'Upload a complete 5x15 photostrip via Photos first.',
    confirmSelection: 'Confirm selection',
    maxPhotostrips: 'You can select up to {count} photostrips.',
    stripsSelected: 'strips selected',
    downloadsTitle: 'Save the complete album',
    downloadsIntro: 'Download favorites or all photos in one package.',
    albumDownload: 'Download album',
    downloadPreviewText: 'Preview mode: the real download will be connected when this interface is moved into production.',
    fullAlbum: 'Full album',
    selectionDownload: 'Download selection',
    stats: ['39 photos', '3 designs', '12 messages'],
    contact: 'Contact',
    terms: 'Terms',
    privacy: 'Privacy',
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
    posterDesc: 'Créez un souvenir durable avec vos photos préférées.',
    storyDesc: 'Créez une Story prête à être partagée immédiatement.',
    viewPreview: 'Voir',
    exampleAction: 'Voir un exemple',
    previewModeTitle: 'Mode aperçu',
    previewModeText: 'La vraie génération sera connectée lorsque cette interface sera mise en production.',
    examplesLabel: 'Aperçu du résultat',
    previewBadge: 'Exemple',
    chooseVersion: 'Choisissez votre format',
    styleLabel: 'Style',
    selectedCount: 'sélectionnées',
    clearSelection: 'Effacer la sélection',
    makeDesign: 'Créer',
    choosePhotos: 'Choisir des photos',
    maxSelection: 'Vous pouvez sélectionner au maximum {count} photos.',
    remainingPhotos: 'Encore {count} photos à choisir',
    reduceSelection: 'Réduisez votre sélection pour créer ce format.',
    fitsBetterLandscape: 'Cette photo convient mieux en Landscape.',
    fitsBetterPortrait: 'Cette photo convient mieux en Portrait.',
    mixedHint: 'Mixed utilise 8 photos portrait et 4 photos landscape.',
    posterModes: ['Portrait Poster', 'Landscape Poster', 'Mixed Poster'],
    posterStyles: ['Couleur', 'Noir et blanc'],
    storyModes: ['Portrait Story', 'Landscape Story'],
    photostripTitle: 'Photostrip Story 5x15',
    photostripDesc: 'Transformez vos strips photobooth en Story Instagram prête à partager.',
    choosePhotostrips: 'Choisir des photostrips',
    viewStory: 'Voir la Story',
    makeStory: 'Créer la Story',
    stripHelper: 'Choisissez des photostrips 5x15 complets.',
    noStripsTitle: 'Aucun photostrip trouvé.',
    noStripsText: 'Importez d’abord un photostrip 5x15 complet via Photos.',
    confirmSelection: 'Confirmer la sélection',
    maxPhotostrips: 'Vous pouvez sélectionner au maximum {count} photostrips.',
    stripsSelected: 'strips sélectionnés',
    downloadsTitle: 'Conserver tout l’album',
    downloadsIntro: 'Téléchargez vos favoris ou toutes les photos en un seul lot.',
    albumDownload: 'Télécharger l’album',
    downloadPreviewText: 'Mode aperçu : le vrai téléchargement sera connecté lorsque cette interface sera mise en production.',
    fullAlbum: 'Album complet',
    selectionDownload: 'Télécharger la sélection',
    stats: ['39 photos', '3 créations', '12 messages'],
    contact: 'Contact',
    terms: 'Conditions d’utilisation',
    privacy: 'Confidentialité',
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
    posterDesc: 'Erstelle eine bleibende Erinnerung mit deinen Lieblingsfotos.',
    storyDesc: 'Erstelle eine Story, die sofort geteilt werden kann.',
    viewPreview: 'Ansehen',
    exampleAction: 'Beispiel ansehen',
    previewModeTitle: 'Vorschaumodus',
    previewModeText: 'Die echte Generierung wird verbunden, wenn diese Oberfläche in Produktion übernommen wird.',
    examplesLabel: 'So kann es aussehen',
    previewBadge: 'Beispiel',
    chooseVersion: 'Format wählen',
    styleLabel: 'Stil',
    selectedCount: 'ausgewählt',
    clearSelection: 'Auswahl löschen',
    makeDesign: 'Erstellen',
    choosePhotos: 'Fotos auswählen',
    maxSelection: 'Du kannst maximal {count} Fotos auswählen.',
    remainingPhotos: 'Noch {count} Fotos auswählen',
    reduceSelection: 'Reduziere deine Auswahl, um dieses Format zu erstellen.',
    fitsBetterLandscape: 'Dieses Foto passt besser in Landscape.',
    fitsBetterPortrait: 'Dieses Foto passt besser in Portrait.',
    mixedHint: 'Mixed verwendet 8 Portrait- und 4 Landscape-Fotos.',
    posterModes: ['Portrait Poster', 'Landscape Poster', 'Mixed Poster'],
    posterStyles: ['Farbe', 'Schwarz-Weiß'],
    storyModes: ['Portrait Story', 'Landscape Story'],
    photostripTitle: 'Photostrip Story 5x15',
    photostripDesc: 'Mach aus deinen Photobooth-Strips eine fertige Instagram Story.',
    choosePhotostrips: 'Photostrips auswählen',
    viewStory: 'Story ansehen',
    makeStory: 'Story erstellen',
    stripHelper: 'Wähle vollständige 5x15-Photostrips.',
    noStripsTitle: 'Keine Photostrips gefunden.',
    noStripsText: 'Lade zuerst einen vollständigen 5x15-Photostrip über Fotos hoch.',
    confirmSelection: 'Auswahl bestätigen',
    maxPhotostrips: 'Du kannst maximal {count} Photostrips auswählen.',
    stripsSelected: 'Strips ausgewählt',
    downloadsTitle: 'Das komplette Album speichern',
    downloadsIntro: 'Lade Favoriten oder alle Fotos in einem Paket herunter.',
    albumDownload: 'Album herunterladen',
    downloadPreviewText: 'Vorschaumodus: Der echte Download wird verbunden, wenn diese Oberfläche in Produktion übernommen wird.',
    fullAlbum: 'Komplettes Album',
    selectionDownload: 'Auswahl herunterladen',
    stats: ['39 Fotos', '3 Designs', '12 Nachrichten'],
    contact: 'Kontakt',
    terms: 'Nutzungsbedingungen',
    privacy: 'Datenschutz',
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
    posterDesc: 'Favori fotoğraflarınla kalıcı bir anı oluştur.',
    storyDesc: 'Hemen paylaşmaya hazır bir Story oluştur.',
    viewPreview: 'Görüntüle',
    exampleAction: 'Örneği görüntüle',
    previewModeTitle: 'Önizleme modu',
    previewModeText: 'Gerçek oluşturma, bu arayüz production’a taşındığında bağlanacak.',
    examplesLabel: 'Böyle görünebilir',
    previewBadge: 'Örnek',
    chooseVersion: 'Formatını seç',
    styleLabel: 'Stil',
    selectedCount: 'seçildi',
    clearSelection: 'Seçimi temizle',
    makeDesign: 'Oluştur',
    choosePhotos: 'Fotoğraf seç',
    maxSelection: 'En fazla {count} fotoğraf seçebilirsin.',
    remainingPhotos: '{count} fotoğraf daha seç',
    reduceSelection: 'Bu formatı oluşturmak için seçimi azalt.',
    fitsBetterLandscape: 'Bu fotoğraf Landscape için daha uygun.',
    fitsBetterPortrait: 'Bu fotoğraf Portrait için daha uygun.',
    mixedHint: 'Mixed 8 portrait ve 4 landscape fotoğraf kullanır.',
    posterModes: ['Portrait Poster', 'Landscape Poster', 'Mixed Poster'],
    posterStyles: ['Renkli', 'Siyah-beyaz'],
    storyModes: ['Portrait Story', 'Landscape Story'],
    photostripTitle: 'Photostrip Story 5x15',
    photostripDesc: 'Photobooth striplerini paylaşmaya hazır bir Instagram Story’ye dönüştür.',
    choosePhotostrips: 'Photostrip seç',
    viewStory: 'Story görüntüle',
    makeStory: 'Story oluştur',
    stripHelper: 'Tam 5x15 photostrip seç.',
    noStripsTitle: 'Photostrip bulunamadı.',
    noStripsText: 'Önce Fotoğraflar üzerinden tam bir 5x15 photostrip yükle.',
    confirmSelection: 'Seçimi onayla',
    maxPhotostrips: 'En fazla {count} photostrip seçebilirsin.',
    stripsSelected: 'strip seçildi',
    downloadsTitle: 'Tüm albümü sakla',
    downloadsIntro: 'Favorileri veya tüm fotoğrafları tek pakette indir.',
    albumDownload: 'Albümü indir',
    downloadPreviewText: 'Önizleme modu: Gerçek indirme, bu arayüz production’a taşındığında bağlanacak.',
    fullAlbum: 'Tüm albüm',
    selectionDownload: 'Seçimi indir',
    stats: ['39 fotoğraf', '3 tasarım', '12 mesaj'],
    contact: 'İletişim',
    terms: 'Kullanım şartları',
    privacy: 'Gizlilik',
  },
} satisfies Record<PreviewLocale, {
  accessPreview: string
  albumPreview: string
  nav: Record<SectionKey, string>
  [key: string]: string | string[] | Record<SectionKey, string>
}>

const photoCards: PreviewPhoto[] = [
  { src: '/home-tile-1.png', ratio: 'aspect-[4/5]', orientation: 'portrait' },
  { src: '/home-tile-2.png', ratio: 'aspect-[3/4]', orientation: 'portrait' },
  { src: '/home-poster-reference.jpg', ratio: 'aspect-[4/5]', orientation: 'portrait' },
  { src: '/home-hero-custom.png', ratio: 'aspect-[6/5]', orientation: 'portrait' },
  { src: '/home-tile-3.png', ratio: 'aspect-[3/4]', orientation: 'portrait' },
  { src: '/home-hero-fun.jpg', ratio: 'aspect-[5/4]', orientation: 'portrait' },
]

const guestbookMessages: Record<
  PreviewLocale,
  { name: string; text: string; dateTime: string; photoSrc?: string }[]
> = {
  nl: [
    { name: 'Sanne', text: 'Wat een prachtige avond ❤️ De sfeer, de muziek en alle lieve mensen pasten helemaal bij Monique.', dateTime: '31 augustus · 20:14', photoSrc: '/home-tile-1.png' },
    { name: 'Peter en Linda', text: 'Gefeliciteerd met je 70e verjaardag 🎉 We hebben genoten van ieder moment.', dateTime: '31 augustus · 20:38' },
    { name: 'Eva', text: 'Een heel warme herinnering aan een bijzondere dag. Dank je wel dat we erbij mochten zijn 🥂', dateTime: '31 augustus · 21:02', photoSrc: '/home-tile-2.png' },
    { name: 'Marcel', text: 'Lieve Monique, op naar nog veel mooie jaren vol muziek, familie en gezelligheid 🌷', dateTime: '31 augustus · 21:26' },
  ],
  en: [
    { name: 'Sanne', text: 'What a beautiful evening ❤️ The atmosphere, the music and all the lovely people suited Monique perfectly.', dateTime: '31 August · 20:14', photoSrc: '/home-tile-1.png' },
    { name: 'Peter and Linda', text: 'Happy 70th birthday 🎉 We enjoyed every single moment.', dateTime: '31 August · 20:38' },
    { name: 'Eva', text: 'A warm memory of a very special day. Thank you for having us 🥂', dateTime: '31 August · 21:02', photoSrc: '/home-tile-2.png' },
    { name: 'Marcel', text: 'Dear Monique, here’s to many more wonderful years full of music, family and joy 🌷', dateTime: '31 August · 21:26' },
  ],
  fr: [
    { name: 'Sanne', text: 'Quelle belle soirée ❤️ L’ambiance, la musique et toutes les personnes présentes correspondaient parfaitement à Monique.', dateTime: '31 août · 20:14', photoSrc: '/home-tile-1.png' },
    { name: 'Peter et Linda', text: 'Joyeux 70e anniversaire 🎉 Nous avons profité de chaque instant.', dateTime: '31 août · 20:38' },
    { name: 'Eva', text: 'Un souvenir chaleureux d’une journée très spéciale. Merci de nous avoir invités 🥂', dateTime: '31 août · 21:02', photoSrc: '/home-tile-2.png' },
    { name: 'Marcel', text: 'Chère Monique, encore beaucoup de belles années remplies de musique, de famille et de joie 🌷', dateTime: '31 août · 21:26' },
  ],
  de: [
    { name: 'Sanne', text: 'Was für ein schöner Abend ❤️ Die Stimmung, die Musik und all die lieben Menschen haben perfekt zu Monique gepasst.', dateTime: '31. August · 20:14', photoSrc: '/home-tile-1.png' },
    { name: 'Peter und Linda', text: 'Alles Gute zum 70. Geburtstag 🎉 Wir haben jeden Moment genossen.', dateTime: '31. August · 20:38' },
    { name: 'Eva', text: 'Eine warme Erinnerung an einen ganz besonderen Tag. Danke, dass wir dabei sein durften 🥂', dateTime: '31. August · 21:02', photoSrc: '/home-tile-2.png' },
    { name: 'Marcel', text: 'Liebe Monique, auf viele weitere schöne Jahre voller Musik, Familie und Freude 🌷', dateTime: '31. August · 21:26' },
  ],
  tr: [
    { name: 'Sanne', text: 'Çok güzel bir akşamdı ❤️ Atmosfer, müzik ve tüm güzel insanlar Monique’e çok yakıştı.', dateTime: '31 Ağustos · 20:14', photoSrc: '/home-tile-1.png' },
    { name: 'Peter ve Linda', text: '70. yaş günün kutlu olsun 🎉 Her anından çok keyif aldık.', dateTime: '31 Ağustos · 20:38' },
    { name: 'Eva', text: 'Çok özel bir günden sıcak bir anı. Bizi davet ettiğin için teşekkürler 🥂', dateTime: '31 Ağustos · 21:02', photoSrc: '/home-tile-2.png' },
    { name: 'Marcel', text: 'Sevgili Monique, müzik, aile ve neşeyle dolu daha nice güzel yıllara 🌷', dateTime: '31 Ağustos · 21:26' },
  ],
}

const posterExamples = [
  {
    label: 'Portrait',
    colorSrc: '/design-examples/memory-a3-portrait.webp',
    bwSrc: '/design-examples/memory-a3-portrait-bw.webp',
    frame: 'w-[112px]',
  },
  {
    label: 'Landscape',
    colorSrc: '/design-examples/memory-a3-landscape.webp',
    bwSrc: '/design-examples/memory-a3-landscape-bw.webp',
    frame: 'w-[138px]',
  },
  {
    label: 'Mixed',
    colorSrc: '/design-examples/memory-a3-mix.webp',
    bwSrc: '/design-examples/memory-a3-mix-bw.webp',
    frame: 'w-[112px]',
  },
]

const storyExamples = [
  { label: 'Portrait Story', src: '/design-examples/story-portrait.webp' },
  { label: 'Landscape Story', src: '/design-examples/story-landscape.webp' },
]

const posterRequiredCounts = [12, 12, 12]
const storyRequiredCounts = [4, 8]

function templateText(text: string, count: number) {
  return text.replace('{count}', String(count))
}

function getPreviewOrientation(width: number, height: number): PreviewPhoto['orientation'] {
  if (!width || !height) return 'neutral'

  const ratio = width / height
  if (ratio < 0.9) return 'portrait'
  if (ratio > 1.1) return 'landscape'
  return 'neutral'
}

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
  const [galleryPhotos, setGalleryPhotos] = useState(photoCards)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)
  const [designPreview, setDesignPreview] = useState<string | null>(null)
  const [activeDesignProduct, setActiveDesignProduct] = useState<DesignProductKey>('poster')
  const [posterFormat, setPosterFormat] = useState(2)
  const [posterStyle, setPosterStyle] = useState(0)
  const [storyFormat, setStoryFormat] = useState(0)
  const [posterDesignPhotos, setPosterDesignPhotos] = useState<string[]>([])
  const [storyDesignPhotos, setStoryDesignPhotos] = useState<string[]>([])
  const [downloadSelection, setDownloadSelection] = useState<string[]>([])
  const [designWarning, setDesignWarning] = useState('')
  const [downloadFeedback, setDownloadFeedback] = useState('')
  const [photostripSelectedPhotos, setPhotostripSelectedPhotos] = useState<string[]>([])
  const [photostripDraftPhotos, setPhotostripDraftPhotos] = useState<string[]>([])
  const [photostripSelectorOpen, setPhotostripSelectorOpen] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState<PreviewPhoto | null>(null)
  const [photoFeedback, setPhotoFeedback] = useState('')
  const [pendingPhotos, setPendingPhotos] = useState<PreviewPhoto[]>([])
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false)
  const [guestbookPhotoSrc, setGuestbookPhotoSrc] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestMessage, setGuestMessage] = useState('')
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const t = copy[locale]
  const posterRequired = posterRequiredCounts[posterFormat]
  const storyRequired = storyRequiredCounts[storyFormat]
  const activeDesignRequired =
    activeDesignProduct === 'poster' ? posterRequired : storyRequired
  const activeDesignSelectedPhotos =
    activeDesignProduct === 'poster' ? posterDesignPhotos : storyDesignPhotos
  const activeDesignModeLabel =
    activeDesignProduct === 'poster' ? t.posterModes[posterFormat] : t.storyModes[storyFormat]
  const activeDesignRemaining = Math.max(
    0,
    activeDesignRequired - activeDesignSelectedPhotos.length
  )
  const selectedPosterPortraitCount = galleryPhotos.filter(
    (photo) =>
      posterDesignPhotos.includes(photo.src) && photo.orientation === 'portrait'
  ).length
  const selectedPosterLandscapeCount = galleryPhotos.filter(
    (photo) =>
      posterDesignPhotos.includes(photo.src) && photo.orientation === 'landscape'
  ).length
  const activeDesignReady =
    activeDesignProduct === 'poster' && posterFormat === 2
      ? selectedPosterPortraitCount === 8 && selectedPosterLandscapeCount === 4
      : activeDesignSelectedPhotos.length === activeDesignRequired
  const totalAlbumPackages = Math.max(1, Math.ceil(galleryPhotos.length / ALBUM_PACKAGE_SIZE))
  const likelyPhotostripPhotos = galleryPhotos.filter(
    (photo) =>
      Boolean(photo.width && photo.height) &&
      Number(photo.height) / Number(photo.width) >= PHOTOSTRIP_MIN_HEIGHT_RATIO
  )
  const likelyPhotostripPhotoSources = likelyPhotostripPhotos.map((photo) => photo.src)
  const photostripSelectedPhotoSources = photostripSelectedPhotos.filter((src) =>
    likelyPhotostripPhotoSources.includes(src)
  )
  const photostripSelectionReady = photostripSelectedPhotoSources.length === PHOTOSTRIP_REQUIRED_COUNT
  const photostripDraftReady = photostripDraftPhotos.length === PHOTOSTRIP_REQUIRED_COUNT

  useEffect(() => {
    setHasUploadConsent(sessionStorage.getItem(UPLOAD_CONSENT_STORAGE_KEY) === 'true')
    return () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  useEffect(() => {
    const photosToMeasure = galleryPhotos.filter((photo) => !photo.width || !photo.height)
    let cancelled = false

    photosToMeasure.forEach((photo) => {
      const image = new Image()
      image.onload = () => {
        if (cancelled) return

        const orientation = getPreviewOrientation(image.naturalWidth, image.naturalHeight)
        setGalleryPhotos((current) =>
          current.map((item) =>
            item.src === photo.src
              ? {
                  ...item,
                  width: image.naturalWidth,
                  height: image.naturalHeight,
                  orientation,
                }
              : item
          )
        )
      }
      image.src = photo.src
    })

    return () => {
      cancelled = true
    }
  }, [galleryPhotos])

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

  const showDesignWarning = (message: string) => {
    setDesignWarning(message)
    window.setTimeout(() => setDesignWarning(''), 1800)
  }

  const showDownloadFeedback = (message: string) => {
    setDownloadFeedback(message)
    window.setTimeout(() => setDownloadFeedback(''), 1800)
  }

  const toggleDownloadSelection = (src: string) => {
    if (downloadSelection.includes(src)) {
      setDownloadSelection(downloadSelection.filter((item) => item !== src))
      return
    }

    if (downloadSelection.length >= DOWNLOAD_SELECTION_LIMIT) {
      showDownloadFeedback(templateText(t.maxSelection, DOWNLOAD_SELECTION_LIMIT))
      return
    }

    setDownloadSelection([...downloadSelection, src])
  }

  const openPhotostripSelector = () => {
    setPhotostripDraftPhotos(photostripSelectedPhotoSources.slice(0, PHOTOSTRIP_REQUIRED_COUNT))
    setPhotostripSelectorOpen(true)
  }

  const togglePhotostripDraftPhoto = (src: string) => {
    if (photostripDraftPhotos.includes(src)) {
      setPhotostripDraftPhotos(photostripDraftPhotos.filter((item) => item !== src))
      return
    }

    if (photostripDraftPhotos.length >= PHOTOSTRIP_REQUIRED_COUNT) {
      showDesignWarning(templateText(t.maxPhotostrips, PHOTOSTRIP_REQUIRED_COUNT))
      return
    }

    setPhotostripDraftPhotos([...photostripDraftPhotos, src])
  }

  const confirmPhotostripSelection = () => {
    if (!photostripDraftReady) return

    setPhotostripSelectedPhotos(photostripDraftPhotos)
    setPhotostripSelectorOpen(false)
  }

  const getDesignOrientationHint = (
    orientation: PreviewPhoto['orientation'],
    selectedFormat: number
  ) => {
    if (selectedFormat === 0 && orientation === 'landscape') return t.fitsBetterLandscape
    if (selectedFormat === 1 && orientation === 'portrait') return t.fitsBetterPortrait
    return ''
  }

  const toggleDesignPhoto = (
    id: string,
    selectedIds: string[],
    setSelectedIds: (value: string[]) => void,
    required: number
  ) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id))
      return
    }

    if (selectedIds.length >= required) {
      showDesignWarning(templateText(t.maxSelection, required))
      return
    }

    setSelectedIds([...selectedIds, id])
  }

  const toggleActiveDesignPhoto = (id: string) => {
    if (activeDesignProduct === 'poster') {
      const photo = galleryPhotos.find((item) => item.src === id)

      if (
        posterFormat === 2 &&
        photo &&
        !posterDesignPhotos.includes(id)
      ) {
        if (photo.orientation === 'portrait' && selectedPosterPortraitCount >= 8) {
          showDesignWarning(templateText(t.maxSelection, 8))
          return
        }

        if (photo.orientation === 'landscape' && selectedPosterLandscapeCount >= 4) {
          showDesignWarning(templateText(t.maxSelection, 4))
          return
        }
      }

      toggleDesignPhoto(id, posterDesignPhotos, setPosterDesignPhotos, posterRequired)
      return
    }

    if (activeDesignProduct === 'story') {
      toggleDesignPhoto(id, storyDesignPhotos, setStoryDesignPhotos, storyRequired)
    }
  }

  const clearActiveDesignSelection = () => {
    if (activeDesignProduct === 'poster') {
      setPosterDesignPhotos([])
      return
    }

    if (activeDesignProduct === 'story') {
      setStoryDesignPhotos([])
    }
  }

  const updateGalleryPhotoOrientation = (
    src: string,
    image: HTMLImageElement
  ) => {
    const orientation = getPreviewOrientation(image.naturalWidth, image.naturalHeight)

    setGalleryPhotos((current) =>
      current.map((photo) =>
        photo.src === src
          ? {
              ...photo,
              width: image.naturalWidth,
              height: image.naturalHeight,
              orientation,
            }
          : photo
      )
    )
  }

  const previewIndex = previewPhoto
    ? galleryPhotos.findIndex((photo) => photo.src === previewPhoto)
    : -1
  const previousPreviewPhoto =
    previewIndex > 0 ? galleryPhotos[previewIndex - 1] : null
  const nextPreviewPhoto =
    previewIndex >= 0 && previewIndex < galleryPhotos.length - 1
      ? galleryPhotos[previewIndex + 1]
      : null

  const confirmPhotoDelete = () => {
    if (!photoToDelete) return

    if (photoToDelete.src.startsWith('blob:')) {
      URL.revokeObjectURL(photoToDelete.src)
      objectUrlsRef.current = objectUrlsRef.current.filter(
        (url) => url !== photoToDelete.src
      )
    }
    setGalleryPhotos((current) =>
      current.filter((item) => item.src !== photoToDelete.src)
    )
    setSelectedPhotos((current) =>
      current.filter((item) => item !== photoToDelete.src)
    )
    setPosterDesignPhotos((current) =>
      current.filter((item) => item !== photoToDelete.src)
    )
    setStoryDesignPhotos((current) =>
      current.filter((item) => item !== photoToDelete.src)
    )
    setDownloadSelection((current) =>
      current.filter((item) => item !== photoToDelete.src)
    )
    setPhotostripSelectedPhotos((current) =>
      current.filter((item) => item !== photoToDelete.src)
    )
    setPhotostripDraftPhotos((current) =>
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

    setGalleryPhotos((current) => [...pendingPhotos, ...current])
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

            <nav className="sticky top-0 z-30 mt-3 border-b border-neutral-200 bg-white">
              <div className="grid grid-cols-4 gap-1">
                {navigation.map((item) => {
                  const isActive = activeSection === item.key

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveSection(item.key)}
                      className={`relative flex flex-col items-center gap-1 px-1 pb-2.5 pt-2 text-[11px] font-black transition outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-[#d71920]/25 sm:text-sm ${
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
                    {galleryPhotos.map((photo) => {
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
                          key={`${message.name}-${message.dateTime}`}
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
                                  {message.dateTime}
                                </p>
                              </div>
                              <p className="mt-1 break-words text-sm font-medium leading-5 text-neutral-700 [font-family:Arial,Helvetica,sans-serif,'Apple_Color_Emoji','Segoe_UI_Emoji','Noto_Color_Emoji']">
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
                    <h2 className="text-xl font-black tracking-[-0.03em] text-neutral-950 sm:text-2xl">
                      {t.designsTitle}
                    </h2>
                    <p className="mt-1 text-sm leading-5 text-neutral-600">
                      {t.designsIntro}
                    </p>
                  </div>
                  <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
                    {designProductTabs.map((product) => {
                      const isActive = activeDesignProduct === product.key

                      return (
                        <button
                          key={product.key}
                          type="button"
                          onClick={() => setActiveDesignProduct(product.key)}
                          className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-black transition ${
                            isActive
                              ? 'border-[#d71920] bg-[#d71920] text-white shadow-[0_6px_14px_rgba(215,25,32,0.16)]'
                              : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:border-neutral-300 hover:bg-white hover:text-neutral-950'
                          }`}
                        >
                          {product.label}
                        </button>
                      )
                    })}
                  </div>
                  {designWarning ? (
                    <p className="rounded-full bg-neutral-950 px-3 py-1.5 text-center text-xs font-bold text-white">
                      {designWarning}
                    </p>
                  ) : null}
                  <div className="space-y-3">
                    {activeDesignProduct === 'poster' ? (
                      <article className="rounded-xl border border-neutral-200 bg-white p-3 shadow-[0_8px_22px_rgba(20,20,20,0.04)]">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-black text-neutral-950">Memory Poster A3</h3>
                            <p className="mt-1 text-sm leading-5 text-neutral-600">{t.posterDesc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDesignPreview('poster-examples')}
                            className="shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-neutral-700"
                          >
                            {t.exampleAction}
                          </button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {t.posterModes.map((mode, index) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => {
                                setPosterFormat(index)
                                if (posterDesignPhotos.length > posterRequiredCounts[index]) {
                                  showDesignWarning(t.reduceSelection)
                                }
                              }}
                              className={`rounded-full border px-3 py-1.5 text-xs font-black ${
                                posterFormat === index
                                  ? 'border-[#d71920] bg-[#d71920] text-white shadow-[0_6px_14px_rgba(215,25,32,0.16)]'
                                  : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:border-neutral-300 hover:bg-white hover:text-neutral-950'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3 rounded-xl bg-neutral-50 p-3">
                          <p className="text-xs font-black text-neutral-500">{t.styleLabel}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {t.posterStyles.map((style, index) => (
                              <button
                                key={style}
                                type="button"
                                onClick={() => setPosterStyle(index)}
                                className={`rounded-full border px-3 py-1.5 text-xs font-black ${
                                  posterStyle === index
                                    ? 'border-[#d71920] bg-[#d71920] text-white shadow-[0_6px_14px_rgba(215,25,32,0.16)]'
                                    : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:border-neutral-300 hover:bg-white hover:text-neutral-950'
                                }`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>
                        </div>
                      </article>
                    ) : null}

                    {activeDesignProduct === 'story' ? (
                      <article className="rounded-xl border border-neutral-200 bg-white p-3 shadow-[0_8px_22px_rgba(20,20,20,0.04)]">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-base font-black text-neutral-950">Instagram Story</h3>
                            <p className="mt-1 text-sm leading-5 text-neutral-600">{t.storyDesc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setDesignPreview('story-examples')}
                            className="shrink-0 rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-neutral-700"
                          >
                            {t.exampleAction}
                          </button>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {t.storyModes.map((mode, index) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => {
                                setStoryFormat(index)
                                if (storyDesignPhotos.length > storyRequiredCounts[index]) {
                                  showDesignWarning(t.reduceSelection)
                                }
                              }}
                              className={`rounded-full border px-3 py-1.5 text-xs font-black ${
                                storyFormat === index
                                  ? 'border-[#d71920] bg-[#d71920] text-white shadow-[0_6px_14px_rgba(215,25,32,0.16)]'
                                  : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:border-neutral-300 hover:bg-white hover:text-neutral-950'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </article>
                    ) : null}

                    {activeDesignProduct !== 'photostrip' ? (
                      <article className="rounded-xl border border-neutral-200 bg-white p-3 shadow-[0_8px_22px_rgba(20,20,20,0.04)]">
                        <div className="sticky top-[58px] z-20 -mx-3 -mt-3 rounded-t-xl border-b border-neutral-200 bg-white/96 p-3 backdrop-blur">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.12em] text-neutral-400">
                                {activeDesignModeLabel}
                              </p>
                              <p className="text-sm font-black text-neutral-950">
                                {activeDesignSelectedPhotos.length} / {activeDesignRequired} {t.selectedCount}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={clearActiveDesignSelection}
                                disabled={activeDesignSelectedPhotos.length === 0}
                                className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-[11px] font-black text-neutral-700 disabled:text-neutral-300"
                              >
                                {t.clearSelection}
                              </button>
                              <button
                                type="button"
                                disabled={!activeDesignReady}
                                onClick={() => setDesignPreview('preview-mode')}
                                className="rounded-lg bg-[#d71920] px-2.5 py-1.5 text-[11px] font-black text-white disabled:bg-neutral-300"
                              >
                                {t.makeDesign}
                              </button>
                            </div>
                          </div>
                          {activeDesignSelectedPhotos.length === activeDesignRequired ? null : (
                            <p className="mt-2 text-xs font-semibold text-[#d71920]">
                              {activeDesignSelectedPhotos.length > activeDesignRequired
                                ? t.reduceSelection
                                : templateText(t.remainingPhotos, activeDesignRemaining)}
                            </p>
                          )}
                          {activeDesignProduct === 'poster' && posterFormat === 2 ? (
                            <p className="mt-1 text-xs font-semibold text-neutral-500">
                              {selectedPosterPortraitCount} / 8 portrait · {selectedPosterLandscapeCount} / 4 landscape
                            </p>
                          ) : null}
                          {activeDesignProduct === 'poster' && posterFormat === 2 ? (
                            <p className="mt-0.5 text-xs font-semibold text-neutral-500">{t.mixedHint}</p>
                          ) : null}
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-2 min-[520px]:grid-cols-4 lg:grid-cols-5">
                          {galleryPhotos.map((photo) => {
                            const isSelected = activeDesignSelectedPhotos.includes(photo.src)
                            const hint = getDesignOrientationHint(
                              photo.orientation,
                              activeDesignProduct === 'poster' ? posterFormat : storyFormat
                            )

                            return (
                              <button
                                key={photo.src}
                                type="button"
                                onClick={() => toggleActiveDesignPhoto(photo.src)}
                                className="relative overflow-hidden rounded-[10px] bg-[#171717] p-[2px] shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
                                title={hint}
                              >
                                <img
                                  src={photo.src}
                                  alt=""
                                  onLoad={(event) =>
                                    updateGalleryPhotoOrientation(
                                      photo.src,
                                      event.currentTarget
                                    )
                                  }
                                  className={`${photo.ratio} w-full rounded-md object-cover`}
                                />
                                <span
                                  className={`absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-black ${
                                    isSelected
                                      ? 'border-[#d71920] bg-[#d71920] text-white'
                                      : 'border-white bg-white/90 text-transparent'
                                  }`}
                                >
                                  {isSelected ? '✓' : ''}
                                </span>
                                {hint ? (
                                  <span className="absolute inset-x-1.5 bottom-1.5 rounded bg-neutral-950/78 px-1.5 py-1 text-[8px] font-black leading-tight text-white">
                                    {hint}
                                  </span>
                                ) : null}
                              </button>
                            )
                          })}
                        </div>
                      </article>
                    ) : null}

                    {activeDesignProduct === 'photostrip' ? (
                    <article className="rounded-xl border border-neutral-200 bg-white p-3 shadow-[0_8px_22px_rgba(20,20,20,0.04)]">
                      <h3 className="text-base font-black text-neutral-950">{t.photostripTitle}</h3>
                      <p className="mt-1 text-sm leading-5 text-neutral-600">{t.photostripDesc}</p>
                      <div className="mt-3 rounded-xl bg-neutral-50 p-3">
                        <p className="mt-2 text-xs font-semibold text-neutral-500">
                          {photostripSelectedPhotoSources.length} / {PHOTOSTRIP_REQUIRED_COUNT} {t.selectedCount}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-neutral-500">
                          {t.stripHelper}
                        </p>
                        <button
                          type="button"
                          onClick={openPhotostripSelector}
                          className="mt-3 inline-flex h-8 items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-800"
                        >
                          {t.choosePhotostrips}
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setDesignPreview('photostrip-story')}
                          disabled={!photostripSelectionReady}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 text-xs font-black text-neutral-800 disabled:text-neutral-300"
                        >
                          {t.exampleAction}
                        </button>
                        <button
                          type="button"
                          onClick={() => showDesignWarning(t.previewModeText)}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-[#d71920] px-3 text-xs font-black text-white"
                        >
                          {t.makeStory}
                        </button>
                      </div>
                    </article>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {activeSection === 'downloads' ? (
                <section className="space-y-3">
                  <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-[0_8px_22px_rgba(20,20,20,0.04)]">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => showDownloadFeedback(t.downloadPreviewText)}
                        disabled={downloadSelection.length === 0}
                        className={`inline-flex min-h-10 flex-1 items-center justify-center rounded-full px-3 py-2 text-center text-xs font-black shadow-sm sm:flex-none ${
                          downloadSelection.length === 0
                            ? 'cursor-not-allowed bg-neutral-300 text-neutral-500'
                            : 'bg-[#d71920] text-white'
                        }`}
                      >
                        {t.selectionDownload} ({downloadSelection.length}/{DOWNLOAD_SELECTION_LIMIT})
                      </button>
                      <button
                        type="button"
                        onClick={() => showDownloadFeedback(t.downloadPreviewText)}
                        disabled={galleryPhotos.length === 0}
                        className={`inline-flex min-h-10 flex-1 items-center justify-center rounded-full px-3 py-2 text-center text-xs font-black shadow-sm sm:flex-none ${
                          galleryPhotos.length === 0
                            ? 'cursor-not-allowed bg-neutral-300 text-neutral-500'
                            : 'bg-neutral-950 text-white'
                        }`}
                      >
                        {t.albumDownload} ({totalAlbumPackages} ZIP)
                      </button>
                    </div>
                  </div>

                  {downloadFeedback ? (
                    <p className="rounded-full bg-neutral-950 px-3 py-1.5 text-center text-xs font-bold text-white">
                      {downloadFeedback}
                    </p>
                  ) : null}

                  <div className="grid grid-cols-3 gap-2 min-[520px]:grid-cols-4 lg:grid-cols-5">
                    {galleryPhotos.map((photo) => {
                      const isSelected = downloadSelection.includes(photo.src)

                      return (
                        <button
                          key={photo.src}
                          type="button"
                          onClick={() => toggleDownloadSelection(photo.src)}
                          className={`relative overflow-hidden rounded-[10px] bg-[#171717] p-1.5 shadow-[0_8px_18px_rgba(0,0,0,0.18)] ${
                            isSelected ? 'ring-2 ring-[#d71920]' : ''
                          }`}
                        >
                          <img
                            src={photo.src}
                            alt=""
                            className={`${photo.ratio} w-full rounded-md object-cover`}
                          />
                          <span
                            className={`absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-black ${
                              isSelected
                                ? 'border-[#d71920] bg-[#d71920] text-white'
                                : 'border-white bg-white/90 text-transparent'
                            }`}
                          >
                            {isSelected ? '✓' : ''}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </section>
              ) : null}
            </div>

            <footer className="mt-3 border-t border-neutral-200 bg-white px-1 py-5 text-sm text-neutral-600">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="font-semibold text-neutral-800">
                  EventDrop Sharing · Foto’s eenvoudig delen
                </p>
                <div className="flex flex-col gap-1 sm:items-end">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-400">
                    {t.contact}
                  </p>
                  <p>photobooth@3worksmedia.com</p>
                  <a
                    href="https://www.photoboothholland.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-neutral-300 underline-offset-4 hover:text-[#d71920]"
                  >
                    www.photoboothholland.com
                  </a>
                  <p>+31 6 24 57 59 19 · Breda, Nederland</p>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs">
                    <a
                      href="/terms"
                      className="underline decoration-neutral-300 underline-offset-4 hover:text-[#d71920]"
                    >
                      {t.terms}
                    </a>
                    <a
                      href="/privacy"
                      className="underline decoration-neutral-300 underline-offset-4 hover:text-[#d71920]"
                    >
                      {t.privacy}
                    </a>
                  </div>
                </div>
              </div>
            </footer>
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
            {previewIndex + 1} / {galleryPhotos.length}
          </p>
        </div>
      ) : null}

      {designPreview ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 p-4">
          <button
            type="button"
            aria-label={t.close}
            onClick={() => setDesignPreview(null)}
            className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-neutral-950"
          >
            ×
          </button>
          {designPreview === 'preview-mode' ? (
            <div className="w-full max-w-[360px] rounded-2xl bg-white p-5 text-center shadow-2xl">
              <h2 className="text-lg font-black text-neutral-950">{t.previewModeTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                {t.previewModeText}
              </p>
              <button
                type="button"
                onClick={() => setDesignPreview(null)}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-[#d71920] px-4 text-sm font-black text-white"
              >
                {t.close}
              </button>
            </div>
          ) : designPreview === 'poster-examples' ? (
            <div className="max-h-[86vh] w-full max-w-[560px] overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl">
              <h2 className="text-base font-black text-neutral-950">Memory Poster A3</h2>
              <p className="mt-1 text-sm text-neutral-500">{t.examplesLabel}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {t.posterStyles.map((style, index) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setPosterStyle(index)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-black ${
                      posterStyle === index
                        ? 'border-[#d71920] bg-[#d71920] text-white shadow-[0_6px_14px_rgba(215,25,32,0.16)]'
                        : 'border-neutral-200 bg-neutral-100 text-neutral-600 hover:border-neutral-300 hover:bg-white hover:text-neutral-950'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {posterExamples.map((example) => (
                  <div
                    key={example.label}
                    className={`${example.frame} relative aspect-[3/4] shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50`}
                  >
                    <img
                      src={posterStyle === 0 ? example.colorSrc : example.bwSrc}
                      alt=""
                      className="h-full w-full object-contain"
                    />
                    <p className="absolute inset-x-1 bottom-1 rounded bg-white/92 px-2 py-1 text-[10px] font-black text-neutral-700">
                      {example.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : designPreview === 'story-examples' ? (
            <div className="max-h-[86vh] w-full max-w-[420px] overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl">
              <h2 className="text-base font-black text-neutral-950">Instagram Story</h2>
              <p className="mt-1 text-sm text-neutral-500">{t.examplesLabel}</p>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {storyExamples.map((example) => (
                  <div
                    key={example.src}
                    className="relative aspect-[9/16] w-[118px] shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50"
                  >
                    <img src={example.src} alt="" className="h-full w-full object-contain" />
                    <p className="absolute inset-x-1 bottom-1 rounded bg-white/92 px-2 py-1 text-[10px] font-black text-neutral-700">
                      {example.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : designPreview === 'photostrip-story' ? (
            <div className="relative aspect-[9/16] h-[82vh] max-h-[720px] overflow-hidden rounded-2xl bg-[#10100f] p-4 shadow-2xl">
              <div className="absolute inset-3 rounded-[18px] border border-[#c8a45d]/80" />
              <div className="absolute inset-6 rounded-[14px] border border-[#c8a45d]/20 bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,0.08),rgba(255,255,255,0)_42%)]" />
              <img
                src={photostripSelectedPhotoSources[0] || '/home-strip-fun.jpg'}
                alt=""
                className="absolute left-[6%] top-[24%] z-10 h-[54%] w-[27%] rotate-[-8deg] rounded-lg object-contain drop-shadow-[0_20px_26px_rgba(0,0,0,0.36)]"
              />
              <img
                src={photostripSelectedPhotoSources[2] || photostripSelectedPhotoSources[0] || '/home-strip-fun.jpg'}
                alt=""
                className="absolute right-[6%] top-[24%] z-10 h-[54%] w-[27%] rotate-[8deg] rounded-lg object-contain drop-shadow-[0_20px_26px_rgba(0,0,0,0.36)]"
              />
              <img
                src={photostripSelectedPhotoSources[1] || photostripSelectedPhotoSources[0] || '/home-strip-fun.jpg'}
                alt=""
                className="absolute left-1/2 top-[8%] z-20 h-[82%] w-[43%] -translate-x-1/2 rounded-xl object-contain drop-shadow-[0_30px_38px_rgba(0,0,0,0.48)]"
              />
            </div>
          ) : (
            <img
              src={designPreview}
              alt=""
              className="max-h-[84vh] max-w-full rounded-2xl object-contain"
            />
          )}
        </div>
      ) : null}

      {photostripSelectorOpen ? (
        <div className="fixed inset-0 z-50 flex items-end bg-black/35 p-3 sm:items-center sm:justify-center">
          <div className="max-h-[86vh] w-full max-w-[520px] overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-neutral-950">{t.choosePhotostrips}</h2>
                <p className="mt-1 text-sm leading-5 text-neutral-600">{t.stripHelper}</p>
                <p className="mt-2 text-xs font-black text-[#d71920]">
                  {photostripDraftPhotos.length} / {PHOTOSTRIP_REQUIRED_COUNT} {t.selectedCount}
                </p>
                {designWarning ? (
                  <p className="mt-1 text-xs font-semibold text-[#d71920]">
                    {designWarning}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setPhotostripSelectorOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-lg font-black text-neutral-700"
                aria-label={t.close}
              >
                ×
              </button>
            </div>

            {likelyPhotostripPhotos.length > 0 ? (
              <div className="mt-4 grid grid-cols-3 gap-2 min-[520px]:grid-cols-4">
                {likelyPhotostripPhotos.map((photo) => {
                  const isSelected = photostripDraftPhotos.includes(photo.src)

                  return (
                    <button
                      key={photo.src}
                      type="button"
                      onClick={() => togglePhotostripDraftPhoto(photo.src)}
                      className={`relative overflow-hidden rounded-[10px] bg-[#171717] p-[2px] shadow-[0_8px_18px_rgba(0,0,0,0.18)] ${
                        isSelected ? 'ring-2 ring-[#d71920]' : ''
                      }`}
                    >
                      <img
                        src={photo.src}
                        alt=""
                        className={`${photo.ratio} w-full rounded-md object-contain`}
                      />
                      <span
                        className={`absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-black ${
                          isSelected
                            ? 'border-[#d71920] bg-[#d71920] text-white'
                            : 'border-white bg-white/90 text-transparent'
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-neutral-100 p-4 text-center">
                <p className="text-sm font-black text-neutral-950">{t.noStripsTitle}</p>
                <p className="mt-1 text-sm leading-5 text-neutral-600">{t.noStripsText}</p>
              </div>
            )}

            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPhotostripSelectorOpen(false)}
                className="rounded-xl border border-neutral-200 px-4 py-3 text-sm font-black text-neutral-800"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={confirmPhotostripSelection}
                disabled={!photostripDraftReady}
                className="rounded-xl bg-[#d71920] px-4 py-3 text-sm font-black text-white disabled:bg-neutral-300"
              >
                {t.confirmSelection}
              </button>
            </div>
          </div>
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
