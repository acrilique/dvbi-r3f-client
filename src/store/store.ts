import { create } from 'zustand';
import {
  AppState,
  ChannelRepresentation,
  DashPlayerInstance,
  EpgViewState,
  LanguageSettings,
  LowLatencySettings,
  ParentalSettings,
  ParsedServiceList
} from './types';
import { parseServiceListXml } from '../utils/serviceListParser';

const initialState: AppState = {
  channels: [],
  selectedChannelId: null,
  serviceListInfo: null,
  epgViewState: {
    displayIndex: 0,
    currentEpgDate: new Date(new Date().setHours(0, 0, 0, 0)).getTime(), // Start of today
  },
  playerInstance: null,
  languageSettings: {
    audioLanguage: 'eng', // Default to English as per dvbi-mobile.js
    subtitleLanguage: 'eng',
    uiLanguage: 'en', // Default UI language
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
  isEpgVisible: false,
  isSettingsVisible: false,
  activeSettingsPage: null,
  isStreamInfoVisible: false,
  isPlayerControlsVisible: true, // Show controls by default
  activeTrackSelectionMenu: null,
  isModalOpen: false,
  modalConfig: null,
  isPinModalOpen: false,
  pinModalConfig: null,
  notification: null,
  isLoadingServiceList: false,
  isLoadingEpg: {},
  globalError: null,
};

export interface AppActions {
  // Service List Actions
  fetchAndProcessServiceList: (url: string) => Promise<void>;
  setServiceListLoading: (isLoading: boolean) => void;
  setChannels: (channels: ChannelRepresentation[]) => void;
  setServiceListInfo: (info: AppState['serviceListInfo']) => void;

  // Channel Actions
  selectChannel: (channelId: string) => void;

  // Player Actions
  setPlayerInstance: (player: DashPlayerInstance) => void;
  // TODO: Add actions for play, pause, seek, volume, track selection etc. (those actions are provided by the player itself so I'm not so sure, it depends)

  // EPG Actions
  setEpgVisibility: (isVisible: boolean) => void;
  setEpgDate: (date: number) => void; // timestamp
  setEpgDisplayIndex: (index: number) => void;
  setEpgLoading: (channelId: string, isLoading: boolean) => void;
  // TODO: Action to fetch EPG data for a channel for a given date range

  // Settings Actions
  setSettingsVisibility: (isVisible: boolean, page?: string | null) => void;
  setActiveSettingsPage: (page: string | null) => void;
  updateLanguageSetting: <K extends keyof LanguageSettings>(key: K, value: LanguageSettings[K]) => void;
  updateLowLatencySetting: <K extends keyof LowLatencySettings>(key: K, value: LowLatencySettings[K]) => void;
  updateParentalSetting: <K extends keyof ParentalSettings>(key: K, value: ParentalSettings[K]) => void;
  setParentalPin: (pin: string | null) => void; // For setting/changing PIN

  // UI Actions
  setStreamInfoVisibility: (isVisible: boolean) => void;
  setPlayerControlsVisibility: (isVisible: boolean) => void;
  setActiveTrackSelectionMenu: (menu: 'audio' | 'subtitle' | null) => void;
  showModal: (config: AppState['modalConfig']) => void;
  hideModal: () => void;
  showPinModal: (config: AppState['pinModalConfig']) => void;
  hidePinModal: () => void;
  showNotification: (notification: AppState['notification']) => void;
  hideNotification: () => void;

  // Error Actions
  setGlobalError: (error: string | null) => void;
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  ...initialState,

  // --- Service List Actions ---
  fetchAndProcessServiceList: async (url) => {
    set({ isLoadingServiceList: true, globalError: null, channels: [], serviceListInfo: null });
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch service list: ${response.status} ${response.statusText}`);
      }
      const xmlString = await response.text();

      // TODO: Potentially pass supportedDrmSystems from settings or a config
      const parsedData: ParsedServiceList = parseServiceListXml(xmlString);

      set({
        channels: parsedData.services,
        // serviceListInfo could also store parsedData.image, parsedData.regions, parsedData.lcnTables if needed globally
        // For now, just the sourceUrl and potentially a name/logo if the list is from a known registry.
        serviceListInfo: { sourceUrl: url /*, nameFromRegistry, logoFromRegistryUrl if available */ },
        isLoadingServiceList: false,
      });

      // Optionally, select the first channel if available
      if (parsedData.services.length > 0) {
        get().selectChannel(parsedData.services[0].id);
      }

    } catch (error: any) {
      console.error("Error fetching or parsing service list:", error);
      set({ globalError: error.message || 'Failed to load service list', isLoadingServiceList: false });
    }
  },
  setServiceListLoading: (isLoading) => set({ isLoadingServiceList: isLoading }),
  setChannels: (channels) => set({ channels }),
  setServiceListInfo: (info) => set({ serviceListInfo: info }),

  // --- Channel Actions ---
  selectChannel: (channelId) => {
    // TODO: Add logic to stop current playback, update player source, fetch Now/Next for new channel
    set({ selectedChannelId: channelId });
    // Example: Fetch EPG for selected channel if not already loading/loaded
    // if (!get().isLoadingEpg[channelId] && !get().channels.find(c => c.id === channelId)?.schedulePrograms) {
    //   get().fetchEpgForChannel(channelId, get().epgViewState.currentEpgDate);
    // }
  },

  // --- Player Actions ---
  setPlayerInstance: (player) => set({ playerInstance: player }),

  // --- EPG Actions ---
  setEpgVisibility: (isVisible) => set({ isEpgVisible: isVisible }),
  setEpgDate: (date) => set((state) => ({ epgViewState: { ...state.epgViewState, currentEpgDate: date } })),
  setEpgDisplayIndex: (index) => set((state) => ({ epgViewState: { ...state.epgViewState, displayIndex: index } })),
  setEpgLoading: (channelId, isLoading) => set((state) => ({ isLoadingEpg: { ...state.isLoadingEpg, [channelId]: isLoading }})),


  // --- Settings Actions ---
  setSettingsVisibility: (isVisible, page = null) => set({ isSettingsVisible: isVisible, activeSettingsPage: isVisible ? (page || 'main') : null }),
  setActiveSettingsPage: (page) => set({ activeSettingsPage: page }),
  updateLanguageSetting: (key, value) => set((state) => ({ languageSettings: { ...state.languageSettings, [key]: value } })),
  updateLowLatencySetting: (key, value) => set((state) => ({ lowLatencySettings: { ...state.lowLatencySettings, [key]: value } })),
  updateParentalSetting: (key, value) => set((state) => ({ parentalSettings: { ...state.parentalSettings, [key]: value } })),
  setParentalPin: (pin) => set((state) => ({ parentalSettings: { ...state.parentalSettings, parentalPin: pin }})),

  // --- UI Actions ---
  setStreamInfoVisibility: (isVisible) => set({ isStreamInfoVisible: isVisible }),
  setPlayerControlsVisibility: (isVisible) => set({ isPlayerControlsVisible: isVisible }),
  setActiveTrackSelectionMenu: (menu) => set({ activeTrackSelectionMenu: menu }),
  showModal: (config) => set({ isModalOpen: true, modalConfig: config }),
  hideModal: () => set({ isModalOpen: false, modalConfig: null }),
  showPinModal: (config) => set({ isPinModalOpen: true, pinModalConfig: config }),
  hidePinModal: () => set({ isPinModalOpen: false, pinModalConfig: null }),
  showNotification: (notification) => set({ notification }),
  hideNotification: () => set({ notification: null }),

  // --- Error Actions ---
  setGlobalError: (error) => set({ globalError: error }),
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
