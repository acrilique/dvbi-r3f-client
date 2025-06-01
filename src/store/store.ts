import { create } from "zustand";
import {
  AppState,
  AvailableServiceListEntry,
  ChannelRepresentation,
  DashPlayerInstance,
  // EpgViewState, // Removed, will be local to EPG component
  LanguageSettings,
  LowLatencySettings,
  ParentalSettings,
  ParsedServiceList,
} from "./types";
import { MediaPlayer } from "dashjs";
import { parseServiceListXml } from "../utils/serviceListParser";
import {
  parseProgramInfoXml,
  parseScheduleXml,
} from "../utils/programInfoParser";

const initialState: AppState = {
  channels: [],
  selectedChannelId: null,
  serviceListInfo: null,
  // epgViewState: { // Removed
  //   displayIndex: 0,
  //   currentEpgDate: new Date(new Date().setHours(0, 0, 0, 0)).getTime(),
  // },
  playerInstance: null,
  languageSettings: {
    audioLanguage: "eng", // Default to English as per dvbi-mobile.js
    subtitleLanguage: "eng",
    uiLanguage: "en", // Default UI language
    accessibleAudio: false,
  },
  lowLatencySettings: {
    lowLatencyEnabled: false,
    liveDelay: 3,
    liveCatchUpMinDrift: 0.05,
    liveCatchUpPlaybackRate: 0.5,
  },
  parentalSettings: {
    parentalEnabled: false,
    minimumAge: 0,
    parentalPin: null,
  },
  isLoadingServiceList: false,
  isLoadingEpg: {},
  globalError: null,
  availableServiceLists: [],
  // Player State initial values
  isPlaying: false,
  volume: 1, // Default volume to max
  isMuted: false,
  duration: 0,
  currentTime: 0,
  isSeeking: false,
};

export interface AppActions {
  // Service List Actions
  fetchAndProcessServiceList: (newIdentifier?: string) => Promise<void>;
  setServiceListLoading: (isLoading: boolean) => void;
  setChannels: (channels: ChannelRepresentation[]) => void;
  setServiceListInfo: (info: AppState["serviceListInfo"]) => void;
  discoverAvailableServiceLists: () => void;

  // Channel Actions
  selectChannel: (channelId: string) => void;

  // Player Actions
  setPlayerInstance: (player: DashPlayerInstance) => void;
  setIsPlaying: (playing: boolean) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;
  setDuration: (duration: number) => void;
  setCurrentTime: (time: number) => void;
  setIsSeeking: (seeking: boolean) => void;
  togglePlayPausePlayer: () => void;
  setPlayerVolume: (newVolume: number) => void;
  togglePlayerMute: () => void;
  seekPlayerTo: (time: number) => void;

  // EPG Actions
  setEpgLoading: (channelId: string, isLoading: boolean) => void;

  // Settings Actions
  updateLanguageSetting: <K extends keyof LanguageSettings>(
    key: K,
    value: LanguageSettings[K],
  ) => void;
  updateLowLatencySetting: <K extends keyof LowLatencySettings>(
    key: K,
    value: LowLatencySettings[K],
  ) => void;
  updateParentalSetting: <K extends keyof ParentalSettings>(
    key: K,
    value: ParentalSettings[K],
  ) => void;
  setParentalPin: (pin: string | null) => void; // For setting/changing PIN

  // Error Actions
  setGlobalError: (error: string | null) => void;
  clearGlobalError: () => void;

  // Program Info Actions
  fetchNowNextForChannel: (channelId: string) => Promise<void>;
  fetchScheduleForChannel: (
    channelId: string,
    date: number,
    windowHours?: number,
  ) => Promise<void>;
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  ...initialState,

  // --- Service List Actions ---
  fetchAndProcessServiceList: async (newIdentifier?: string) => {
    const SERVICE_LIST_STORAGE_KEY = "dvbi_current_service_list_url";
    const DEFAULT_SERVICE_LIST_FILENAME = "example.xml";
    const queryParams = new URLSearchParams(window.location.search);

    let pathOrUrl: string | null = null; // Explicitly initialize

    if (newIdentifier) {
      pathOrUrl = newIdentifier;
    } else {
      pathOrUrl = queryParams.get("servicelist");
      if (!pathOrUrl) {
        // Check if null or empty string from queryParams
        const storedValue = localStorage.getItem(SERVICE_LIST_STORAGE_KEY);
        if (storedValue) {
          pathOrUrl = storedValue;
        }
      }
    }

    if (!pathOrUrl) {
      // Check again if still null or empty
      pathOrUrl = DEFAULT_SERVICE_LIST_FILENAME;
    }

    // Ensure pathOrUrl is not null before proceeding, though the logic above should prevent it.
    if (!pathOrUrl) {
      console.error(
        "Critical error: Service list path or URL is null after all checks.",
      );
      set({
        globalError: "Critical error: Service list path or URL is null.",
        isLoadingServiceList: false,
        channels: [],
        serviceListInfo: null,
      });
      return;
    }

    let isExternalUrl = false;
    if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
      isExternalUrl = true;
    }

    let finalFetchUrl: string;

    if (isExternalUrl) {
      finalFetchUrl = pathOrUrl;
    } else {
      // It's a local file path (e.g., "example.xml" or "custom/list.xml")
      // All local lists are assumed to be inside 'public/servicelists/'
      let localPath = pathOrUrl;
      if (!localPath.startsWith("servicelists/")) {
        localPath = `servicelists/${localPath}`;
      }

      let baseUrl = import.meta.env.BASE_URL;
      if (!baseUrl.endsWith("/")) {
        baseUrl += "/";
      }
      // Remove leading slash from localPath if baseUrl already ends with one, to prevent double slashes
      if (localPath.startsWith("/") && baseUrl.endsWith("/")) {
        localPath = localPath.substring(1);
      }
      finalFetchUrl = `${baseUrl}${localPath}`;
    }

    set({
      isLoadingServiceList: true,
      globalError: null,
      channels: [],
      serviceListInfo: null,
    });
    try {
      const response = await fetch(finalFetchUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch service list: ${response.status} ${response.statusText} from ${finalFetchUrl}`,
        );
      }
      const xmlString = await response.text();

      const parsedData: ParsedServiceList = parseServiceListXml(xmlString);

      localStorage.setItem(SERVICE_LIST_STORAGE_KEY, pathOrUrl); // pathOrUrl is the identifier

      set({
        channels: parsedData.services,
        serviceListInfo: { sourceUrl: finalFetchUrl, identifier: pathOrUrl }, // Store both identifier and finalFetchUrl
        isLoadingServiceList: false,
      });

      if (parsedData.services.length > 0) {
        get().selectChannel(parsedData.services[0].id);
      }
    } catch (error: unknown) {
      console.error("Error fetching or parsing service list:", error);
      const message =
        error instanceof Error
          ? error.message
          : `Failed to load service list from ${finalFetchUrl}`;
      set({
        globalError: message,
        isLoadingServiceList: false,
      });
    }
  },
  setServiceListLoading: (isLoading) =>
    set({ isLoadingServiceList: isLoading }),
  setChannels: (channels) => set({ channels }),
  setServiceListInfo: (info) => set({ serviceListInfo: info }),
  discoverAvailableServiceLists: () => {
    const lists: AvailableServiceListEntry[] = [
      { name: "Default (example.xml)", identifier: "example.xml" },
      { name: "Advanced Codecs", identifier: "advanced_codecs.xml" },
      { name: "DRM Protected", identifier: "drm.xml" },
      { name: "Availability Example", identifier: "example_availability.xml" },
      { name: "Prominence R6", identifier: "prominence_r6.xml" },
      { name: "Regions Example", identifier: "regions.xml" },
      {
        name: "TM-STREAM0075r1 DVB-DASH",
        identifier: "TM-STREAM0075r1 DVB-DASH_Reference_Streams.xml",
      },
      // To add an external list for testing:
      // { name: "External Test List (URL)", identifier: "http://your-external-url.com/list.xml" }
    ];
    set({ availableServiceLists: lists });
  },

  // --- Channel Actions ---
  selectChannel: (channelId) => {
    set({ selectedChannelId: channelId });
    // Fetch Now/Next for the newly selected channel
    void get().fetchNowNextForChannel(channelId);
    // Example: Fetch EPG for selected channel if not already loading/loaded
    // if (!get().isLoadingEpg[channelId] && !get().channels.find(c => c.id === channelId)?.schedulePrograms) {
    //   void get().fetchEpgForChannel(channelId, get().epgViewState.currentEpgDate);
    // }
  },

  // --- Player Actions ---
  setPlayerInstance: (newPlayerInstance) => {
    const currentPlayerInstance = get().playerInstance;

    // Define event handlers
    const onError = (e: unknown) => {
      let errorMessage = "Unknown Dash.js Error";
      if (typeof e === "object" && e !== null && "error" in e) {
        const errorDetails = (e as { error: unknown }).error;
        if (
          typeof errorDetails === "object" &&
          errorDetails !== null &&
          "message" in errorDetails
        ) {
          errorMessage = String((errorDetails as { message: string }).message);
        } else {
          errorMessage = String(errorDetails);
        }
      }
      console.error("Dash.js Error in store:", errorMessage, e);
      set({ globalError: `Player Error: ${errorMessage}` }); // Example: set a global error
    };
    const onPlaying = () => set({ isPlaying: true });
    const onPaused = () => set({ isPlaying: false });
    const onTimeUpdate = (data: { time: number }) =>
      set({ currentTime: data.time });
    const onStreamInitialized = () => {
      const player = get().playerInstance;
      if (player) {
        try {
          if (player.isReady()) {
            set({ duration: player.duration() });
          }
        } catch (error) {
          console.error(
            "Error getting player duration on stream initialization:",
            error,
          );
          // Don't set global error here as this is not critical
        }
      }
    };
    const onSeeked = () => set({ isSeeking: false });
    const onSeeking = () => set({ isSeeking: true });
    const onVolumeChanged = (data: { muted: boolean; volume: number }) => {
      set({ volume: data.volume, isMuted: data.muted });
    };

    // Clean up listeners from the current player instance if it exists
    if (currentPlayerInstance) {
      try {
        currentPlayerInstance.off(MediaPlayer.events.ERROR, onError);
        currentPlayerInstance.off(
          MediaPlayer.events.PLAYBACK_PLAYING,
          onPlaying,
        );
        currentPlayerInstance.off(MediaPlayer.events.PLAYBACK_PAUSED, onPaused);
        currentPlayerInstance.off(
          MediaPlayer.events.PLAYBACK_TIME_UPDATED,
          onTimeUpdate,
        );
        currentPlayerInstance.off(
          MediaPlayer.events.STREAM_INITIALIZED,
          onStreamInitialized,
        );
        currentPlayerInstance.off(MediaPlayer.events.PLAYBACK_SEEKED, onSeeked);
        currentPlayerInstance.off(
          MediaPlayer.events.PLAYBACK_SEEKING,
          onSeeking,
        );
        currentPlayerInstance.off(
          MediaPlayer.events.PLAYBACK_VOLUME_CHANGED,
          onVolumeChanged,
        );
      } catch (error) {
        console.error("Error removing event listeners from player:", error);
        // Don't set global error here as this is cleanup
      }
    }

    // If a new player instance is provided, set it up
    if (newPlayerInstance) {
      try {
        newPlayerInstance.on(MediaPlayer.events.ERROR, onError);
        newPlayerInstance.on(MediaPlayer.events.PLAYBACK_PLAYING, onPlaying);
        newPlayerInstance.on(MediaPlayer.events.PLAYBACK_PAUSED, onPaused);
        newPlayerInstance.on(
          MediaPlayer.events.PLAYBACK_TIME_UPDATED,
          onTimeUpdate,
        );
        newPlayerInstance.on(
          MediaPlayer.events.STREAM_INITIALIZED,
          onStreamInitialized,
        );
        newPlayerInstance.on(MediaPlayer.events.PLAYBACK_SEEKED, onSeeked);
        newPlayerInstance.on(MediaPlayer.events.PLAYBACK_SEEKING, onSeeking);
        newPlayerInstance.on(
          MediaPlayer.events.PLAYBACK_VOLUME_CHANGED,
          onVolumeChanged,
        );

        // Get current playing state
        // let isCurrentlyPlaying = false; // Original logic removed
        // try {
        //   isCurrentlyPlaying = newPlayerInstance.isPaused() === false;
        // } catch (error) {
        //   console.error('Error checking player paused state:', error);
        // }

        set({ playerInstance: newPlayerInstance, isPlaying: false }); // Initialize isPlaying to false, actual state will be set by event handlers
      } catch (error) {
        console.error("Error setting up event listeners for player:", error);
        set({
          globalError: `Player setup error: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    } else {
      // If null is passed, reset player state
      set({
        playerInstance: null,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        isSeeking: false,
        // volume and isMuted could be preserved or reset based on desired behavior
        // volume: 1,
        // isMuted: false,
      });
    }
  },
  setIsPlaying: (playing) => set({ isPlaying: playing }), // Direct setters might still be useful for optimistic updates or manual control
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }), // Clamp volume between 0 and 1
  setIsMuted: (muted) => set({ isMuted: muted }),
  setDuration: (duration) => set({ duration }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setIsSeeking: (seeking) => set({ isSeeking: seeking }),
  togglePlayPausePlayer: () => {
    const { playerInstance, isPlaying } = get();
    if (playerInstance) {
      try {
        if (isPlaying) {
          playerInstance.pause();
        } else {
          playerInstance.play();
        }
      } catch (error) {
        console.error("Error toggling play/pause:", error);
        set({
          globalError: `Player control error: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }
  },
  setPlayerVolume: (newVolume) => {
    const { playerInstance } = get();
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    if (playerInstance) {
      try {
        playerInstance.setVolume(clampedVolume);
        playerInstance.setMute(clampedVolume === 0);
      } catch (error) {
        console.error("Error setting player volume:", error);
        set({
          globalError: `Player volume error: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }
    set({
      volume: clampedVolume,
      isMuted: clampedVolume === 0 && newVolume === 0,
    }); // Update store state
  },
  togglePlayerMute: () => {
    const { playerInstance } = get();
    if (playerInstance) {
      try {
        playerInstance.setMute(!playerInstance.isMuted());
      } catch (error) {
        console.error("Error toggling player mute:", error);
        set({
          globalError: `Player mute error: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }
  },
  seekPlayerTo: (time) => {
    const { playerInstance, duration } = get();
    if (playerInstance && duration > 0) {
      const seekTime = Math.max(0, Math.min(time, duration));
      set({ isSeeking: true });
      try {
        playerInstance.seek(seekTime);
      } catch (error) {
        console.error("Error seeking player:", error);
        set({
          globalError: `Player seek error: ${error instanceof Error ? error.message : "Unknown error"}`,
          isSeeking: false,
        });
      }
    }
  },

  // --- EPG Actions ---
  setEpgLoading: (channelId, isLoading) =>
    set((state) => ({
      isLoadingEpg: { ...state.isLoadingEpg, [channelId]: isLoading },
    })),

  // --- Settings Actions ---
  updateLanguageSetting: (key, value) =>
    set((state) => ({
      languageSettings: { ...state.languageSettings, [key]: value },
    })),
  updateLowLatencySetting: (key, value) =>
    set((state) => ({
      lowLatencySettings: { ...state.lowLatencySettings, [key]: value },
    })),
  updateParentalSetting: (key, value) =>
    set((state) => ({
      parentalSettings: { ...state.parentalSettings, [key]: value },
    })),
  setParentalPin: (pin) =>
    set((state) => ({
      parentalSettings: { ...state.parentalSettings, parentalPin: pin },
    })),

  // --- Error Actions ---
  setGlobalError: (error) => set({ globalError: error }),
  clearGlobalError: () => set({ globalError: null }),

  // --- Program Info Actions ---
  fetchNowNextForChannel: async (channelId) => {
    const channel = get().channels.find((c) => c.id === channelId);
    if (!channel || !channel.programInfoURI) {
      // TODO: Potentially try to use contentGuideURI if programInfoURI is missing,
      // or derive from a ContentGuideSource if that's implemented.
      console.warn(
        `No programInfoURI for channel ${channelId} or channel not found.`,
      );
      set({ isLoadingEpg: { ...get().isLoadingEpg, [channelId]: false } });
      return;
    }

    set({
      isLoadingEpg: { ...get().isLoadingEpg, [channelId]: true },
      globalError: null,
    });

    try {
      // TODO: This is a placeholder. In a real scenario, you might need to construct
      // the URL with specific parameters for "now" and "next" if the programInfoURI
      // itself isn't directly pointing to a combined Now/Next feed.
      // For now, we assume programInfoURI directly gives us the Now/Next XML.
      const response = await fetch(channel.programInfoURI);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch Now/Next data: ${response.status} ${response.statusText} from ${channel.programInfoURI}`,
        );
      }
      const xmlString = await response.text();

      const parsedProgramInfo = parseProgramInfoXml(xmlString);

      console.log(
        `Fetched programInfo from ${channel.programInfoURI}, got now: ${parsedProgramInfo.now?.titles[0]?.text}, next: ${parsedProgramInfo.next?.titles[0]?.text}`,
      );

      set((state) => ({
        channels: state.channels.map((ch) =>
          ch.id === channelId
            ? {
                ...ch,
                nowProgram: parsedProgramInfo.now,
                nextProgram: parsedProgramInfo.next,
              }
            : ch,
        ),
        isLoadingEpg: { ...state.isLoadingEpg, [channelId]: false },
      }));
    } catch (error: unknown) {
      console.error(`Error fetching Now/Next for channel ${channelId}:`, error);
      const message =
        error instanceof Error
          ? error.message
          : `Failed to load Now/Next for channel ${channelId}`;
      set({
        globalError: message,
        isLoadingEpg: { ...get().isLoadingEpg, [channelId]: false },
      });
    }
  },

  fetchScheduleForChannel: async (channelId, date, windowHours = 24) => {
    const channel = get().channels.find((c) => c.id === channelId);
    // TODO: Handle contentGuideServiceRef to look up actual contentGuideURI from a list if necessary.
    // For now, assume contentGuideURI is directly available and usable.
    if (!channel || !channel.contentGuideURI) {
      console.warn(
        `No contentGuideURI for channel ${channelId} or channel not found.`,
      );
      set({ isLoadingEpg: { ...get().isLoadingEpg, [channelId]: false } });
      return;
    }

    set({
      isLoadingEpg: { ...get().isLoadingEpg, [channelId]: true },
      globalError: null,
    });

    // Construct the EPG request URL.
    // This is a common pattern, but the exact parameters might vary by EPG provider.
    // Example: http://epg.example.com/schedule?channelId=xxx&start=YYYY-MM-DDTHH:MM:SSZ&duration=PT24H
    // We'll use URLSearchParams to build the query string.
    const startDate = new Date(date); // 'date' is expected to be the start of the day timestamp
    const startTimeISO = startDate.toISOString();
    // Duration in ISO 8601 format (e.g., PT24H for 24 hours)
    const durationISO = `PT${windowHours}H`;

    let scheduleUrl = channel.contentGuideURI;
    try {
      const url = new URL(scheduleUrl); // Check if it's a valid base URL
      url.searchParams.append("start", startTimeISO);
      url.searchParams.append("duration", durationISO);
      // Some EPGs might expect channel ID or service reference in the query too.
      // url.searchParams.append('sid', channel.contentGuideServiceRef || channel.id);
      scheduleUrl = url.toString();
    } catch (e) {
      // If contentGuideURI is not a valid base URL for URLSearchParams (e.g., it already has query params)
      // A more robust solution would be needed to append/update params. For now, log and proceed.
      console.warn(
        `Could not automatically append query parameters to contentGuideURI: ${channel.contentGuideURI}. Using it as is or with manual concatenation if needed.`,
      );
      // A simple append, hoping it works for most cases or the URI is pre-formatted
      const separator = scheduleUrl.includes("?") ? "&" : "?";
      scheduleUrl = `${scheduleUrl}${separator}start=${startTimeISO}&duration=${durationISO}`;
    }

    try {
      const response = await fetch(scheduleUrl);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch schedule data: ${response.status} ${response.statusText} from ${scheduleUrl}`,
        );
      }
      const xmlString = await response.text();
      const parsedSchedule = parseScheduleXml(xmlString);

      console.log(
        `Fetched schedule from ${scheduleUrl}, got ${parsedSchedule.length} programs.`,
      );

      set((state) => ({
        channels: state.channels.map((ch) =>
          ch.id === channelId
            ? { ...ch, schedulePrograms: parsedSchedule }
            : ch,
        ),
        isLoadingEpg: { ...state.isLoadingEpg, [channelId]: false },
      }));
    } catch (error: unknown) {
      console.error(`Error fetching schedule for channel ${channelId}:`, error);
      const message =
        error instanceof Error
          ? error.message
          : `Failed to load schedule for channel ${channelId}`;
      set({
        globalError: message,
        isLoadingEpg: { ...get().isLoadingEpg, [channelId]: false },
      });
    }
  },
}));

// Example of how to persist parts of the store to localStorage (optional)
// import { persist, createJSONStorage } from 'zustand/middleware';
// export const useAppStore = create(
//   persist<AppState & AppActions>(
//     (set, get) => ({
//       // ... store definition ...
//     }),
//     {
//       name: 'dvbi-r3f-app-storage', // name of the item in the storage (must be unique)
//       storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
//       partialize: (state) => ({
//         languageSettings: state.languageSettings,
//         lowLatencySettings: state.lowLatencySettings,
//         parentalSettings: state.parentalSettings,
//         // Potentially last used service list URL
//         // lastServiceListUrl: state.serviceListInfo?.sourceUrl
//       }),
//     }
//   )
// );
