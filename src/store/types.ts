import { MediaPlayerClass } from "dashjs";

// --- Generic Types ---
export interface LocalizedString {
  lang: string; // From xml:lang
  text: string;
}

export interface MediaRepresentation {
  mediaUri?: string;
  // Potentially mediaData64 if we decide to handle embedded base64 images directly
  // type?: string; // Mime type if mediaData64 is used
}

// --- Program Related Types ---
export interface ParentalRating {
  scheme?: string;
  minimumage?: number;
}

export interface CreditItem {
  role?: string; // href from Role element
  personName?: LocalizedString; // From PersonName or OrganizationName
  characterName?: LocalizedString; // From Character
}

export interface KeywordItem {
  type?: string; // From Type element
  value: string; // From Keyword content
}

export interface ProgramRepresentation {
  id: string;
  titles: LocalizedString[];
  startTime: number; // Unix timestamp (ms)
  endTime: number; // Unix timestamp (ms)
  description?: string;
  parentalRatings?: ParentalRating[];
  cpsIndex?: string;
  bilingual?: boolean; // This might be derived from audio/subtitle languages
  channelImage?: string; // URL or MediaRepresentation - usually part of ChannelRepresentation
  channelStreamUrl?: string; // Usually part of ServiceInstanceRepresentation

  // New fields for Task C.3
  genre?: string; // From Genre href (first one, simplified)
  // TODO: Consider if genre should be LocalizedString[] if Genre has text content + lang
  mediaImage?: MediaRepresentation; // From RelatedMaterial
  credits?: CreditItem[]; // From CreditsList
  keywords?: KeywordItem[]; // From Keyword elements
  accessibilityAttributes?: AccessibilityAttributes; // Program-level accessibility
}

// --- Accessibility Types ---
export interface AccessibilityAudioAttributes {
  coding?: string;
  mix_type?: string;
  language?: string;
}

export interface AccessibilitySubtitleAttributes {
  language?: string;
  carriage?: string[];
  coding?: string[];
  purpose?: string[];
  forTTS?: string;
  app?: string;
}

export interface AccessibilityAudioDescription {
  audio_attributes?: AccessibilityAudioAttributes;
  mix?: string;
  app?: string;
}

export interface AccessibilitySigning {
  coding?: string;
  language?: string;
  closed?: string;
  app?: string;
}

export interface AccessibilityAppAndPurpose {
  app?: string;
  purpose?: string[];
}

export interface AccessibilityAttributes {
  subtitles?: AccessibilitySubtitleAttributes[];
  audio_descriptions?: AccessibilityAudioDescription[];
  signings?: AccessibilitySigning[];
  dialogue_enhancements?: {
    audio_attributes?: AccessibilityAudioAttributes;
    app?: string;
  }[];
  spoken_subtitles?: {
    audio_attributes?: AccessibilityAudioAttributes;
    app?: string;
  }[];
  magnification_ui?: AccessibilityAppAndPurpose[];
  high_contrast_ui?: AccessibilityAppAndPurpose[];
  screen_reader_ui?: AccessibilityAppAndPurpose[];
  response_to_user_action_ui?: AccessibilityAppAndPurpose[];
}

// --- Channel & Service Instance Related Types ---
export interface DrmSystemRepresentation {
  encryptionScheme?: string;
  drmSystemId?: string;
  cpsIndex?: string;
}

export interface MediaPresentationApp {
  contentType: string;
  url: string;
}

export interface CmcdInitInfo {
  enabled: boolean;
  mode?: "header" | "query";
  enabledKeys?: string[];
  cid?: string;
  version?: number;
}

export interface AvailabilityInterval {
  days?: string;
  recurrence?: string;
  startTime?: string;
  endTime?: string;
}

export interface AvailabilityPeriod {
  validFrom?: string;
  validTo?: string;
  intervals?: AvailabilityInterval[];
}

export interface ServiceInstanceRepresentation {
  priority?: number;
  titles?: LocalizedString[];
  contentProtection?: DrmSystemRepresentation[];
  parallelApps?: MediaPresentationApp[];
  mediaPresentationApps?: MediaPresentationApp[];
  availability?: AvailabilityPeriod[];
  dashUrl?: string;
  CMCDinit?: CmcdInitInfo | null;
}

export interface ProminenceInfo {
  country?: string;
  region?: string;
  ranking?: number;
}

export interface ChannelRepresentation {
  id: string; // UniqueIdentifier from Service
  lcn: number;
  titles: LocalizedString[]; // From ServiceName
  image?: MediaRepresentation; // From RelatedMaterial (Service Logo)
  provider?: string; // From ProviderName (first one)
  providers?: LocalizedString[]; // All ProviderNames
  contentGuideURI?: string;
  moreEpisodesURI?: string;
  programInfoURI?: string;
  contentGuideServiceRef?: string;
  targetRegions?: string[];
  parallelApps?: MediaPresentationApp[]; // From Service's RelatedMaterial
  mediaPresentationApps?: MediaPresentationApp[]; // From Service's RelatedMaterial
  prominences?: ProminenceInfo[];
  accessibility_attributes?: AccessibilityAttributes;
  out_of_service_image?: MediaRepresentation;
  serviceInstances: ServiceInstanceRepresentation[];

  nowProgram?: ProgramRepresentation;
  nextProgram?: ProgramRepresentation;
  schedulePrograms?: ProgramRepresentation[]; // EPG data for this channel
}

// --- Service List Structure (Reflecting parsed data from parseServiceList) ---
export interface ContentGuideSourceInfo {
  id: string;
  contentGuideURI: string | null;
  moreEpisodesURI: string | null;
  programInfoURI: string | null;
}

export interface RegionInfo {
  countryCodes?: string;
  selectable: boolean;
  regionID: string;
  regionName?: string;
  regionNames?: LocalizedString[];
  wildcardPostcodes?: string[];
  postcodes?: string[];
  postcodeRanges?: { from: string; to: string }[];
  coordinates?: { latitude: string; longitude: string; radius: string }[];
}

export interface LcnItem {
  serviceRef: string;
  channelNumber: number;
}

export interface LcnTableInfo {
  lcn: LcnItem[];
  targetRegions?: string[];
  defaultRegion: boolean;
}

// This interface represents the object returned by the parseServiceList function
export interface ParsedServiceList {
  services: ChannelRepresentation[]; // The core list of processed channels
  image?: MediaRepresentation; // Overall service list logo
  regions?: RegionInfo[];
  lcnTables?: LcnTableInfo[];
}

// --- Service List Provider & Registry Types ---
export interface ServiceListOffering {
  name: string;
  url: string;
  icons: MediaRepresentation[];
  postcodeFiltering?: boolean;
  regionIdFiltering?: boolean;
  multiplexFiltering?: boolean;
}

export interface ProviderInfo {
  name: string;
  icons: MediaRepresentation[];
  servicelists: ServiceListOffering[];
}

export interface ParsedProviderRegistry {
  registryInfo: Partial<ProviderInfo>; // Info about the registry itself
  providerList: ProviderInfo[]; // List of providers offering service lists
}

// --- Settings ---
export interface LanguageSettings {
  audioLanguage: string;
  subtitleLanguage: string;
  uiLanguage: string;
  accessibleAudio: boolean;
}

export interface LowLatencySettings {
  liveDelay: number;
  liveCatchupMaxDrift: number;
  liveCatchupPlaybackRate: {
    min: number;
    max: number;
  };
}

export interface ParentalSettings {
  parentalEnabled: boolean;
  minimumAge: number;
  parentalPin: string | null;
}

export interface AvailableServiceListEntry {
  name: string; // User-friendly name, e.g., "Default Example List"
  identifier: string; // The value to pass to fetchAndProcessServiceList, e.g., "example.xml" or a full URL
}

// --- Player ---
export type DashPlayerInstance = MediaPlayerClass | null;

export interface MediaTrack {
  id: number;
  lang: string;
  label: string;
  type: "audio" | "subtitle";
}

// --- Zustand Store Shape ---
export interface AppState {
  // Processed Data
  channels: ChannelRepresentation[];
  selectedChannelId: string | null;
  serviceListInfo: {
    // Info about the loaded service list itself
    nameFromRegistry?: string; // If loaded via a registry that provides a name
    logoFromRegistryUrl?: string; // If loaded via a registry
    sourceUrl: string; // The fully resolved URL that was fetched
    identifier: string; // The pathOrUrl (e.g., "example.xml" or "http://...") used to initiate the fetch
  } | null;
  availableServiceLists: AvailableServiceListEntry[];

  // epgViewState: EpgViewState; // Removed: Will be local to EPG component
  playerInstance: DashPlayerInstance;

  activeSettingsPage:
    | "none"
    | "main"
    | "language"
    | "lowLatency"
    | "parentalControls"
    | "serviceListSelection"; //TODO Extract these to a type so we avoid dups

  languageSettings: LanguageSettings;
  lowLatencySettings: LowLatencySettings;
  parentalSettings: ParentalSettings;

  // Player State
  isStreamInitialized: boolean;
  isPlaying: boolean;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  duration: number; // in seconds
  currentTime: number; // in seconds
  isSeeking: boolean;

  // Track selection
  availableAudioTracks: MediaTrack[];
  availableSubtitleTracks: MediaTrack[];
  selectedAudioTrackId: number | null;
  selectedSubtitleTrackId: number | null;
  isAudioTrackMenuVisible: boolean;
  isSubtitleTrackMenuVisible: boolean;

  // Loading/Error States
  isLoadingServiceList: boolean;
  isLoadingEpg: Record<string, boolean>; // Key: channelId
  globalError: string | null;

  opacityTargetRef: { current: number };
  uiTimeoutRef: { current: number | null };

  // CanvasRef for fullscreen
  canvasRef: React.RefObject<HTMLCanvasElement> | null;
}
