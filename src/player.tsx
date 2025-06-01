import { XR, createXRStore } from "@react-three/xr";
import { Fullscreen, Container, Text, Image, Video } from "@react-three/uikit";
import { Suspense, useEffect, useState, useRef, useCallback } from "react"; // useState is already here
import { MediaPlayer } from "dashjs";
import { useAppStore } from "./store/store";
import { SettingsView } from "./components/SettingsView";
import { PlayerControls } from "./components/PlayerControls";
import { ChannelListView } from "./components/ChannelListView";
import { ThreeEvent } from "@react-three/fiber";

const xrStore = createXRStore({});
export function Player() {
  // Global state selectors from Zustand store
  const fetchAndProcessServiceList = useAppStore(
    (state) => state.fetchAndProcessServiceList,
  );
  const channels = useAppStore((state) => state.channels);
  const selectedChannelId = useAppStore((state) => state.selectedChannelId);
  const selectChannel = useAppStore((state) => state.selectChannel);
  const isLoadingServiceList = useAppStore(
    (state) => state.isLoadingServiceList,
  );
  const globalError = useAppStore((state) => state.globalError);
  const playerInstance = useAppStore((state) => state.playerInstance);
  const setPlayerInstance = useAppStore((state) => state.setPlayerInstance);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const [hasSourceBeenAttached, setHasSourceBeenAttached] = useState(false); // Added state

  useEffect(() => {
    void fetchAndProcessServiceList();
  }, [fetchAndProcessServiceList]);

  // Initialize and manage Dash.js player instance
  useEffect(() => {
    if (!videoElementRef.current) {
      // Create the video element if it doesn't exist
      const video = document.createElement("video");
      video.id = "dashjs-video-player";
      video.muted = true;
      video.crossOrigin = "anonymous";
      videoElementRef.current = video;
    }

    const newPlayer = MediaPlayer().create();
    try {
      newPlayer.initialize(videoElementRef.current);
    } catch (error) {
      console.error("Error initializing Dash.js player:", error);
    }
    setPlayerInstance(newPlayer);

    return () => {
      if (newPlayer) {
        try {
          newPlayer.destroy();
        } catch (error) {
          console.error("Error destroying Dash.js player:", error);
        }
      }
      setPlayerInstance(null);
      if (videoElementRef.current && videoElementRef.current.parentNode) {
        videoElementRef.current.parentNode.removeChild(videoElementRef.current);
        videoElementRef.current = null;
      }
    };
  }, [setPlayerInstance]);

  // --- Local UI State Management ---
  const [isEpgVisible, setIsEpgVisible] = useState(false);
  // TODO: Define EpgViewState type locally or import if moved to a shared types file for components
  // const [epgViewState, setEpgViewState] = useState<{ displayIndex: number; currentEpgDate: number }>({
  //   displayIndex: 0,
  //   currentEpgDate: new Date(new Date().setHours(0, 0, 0, 0)).getTime()
  // });

  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [activeSettingsPage, setActiveSettingsPage] = useState<string | null>(
    null,
  );

  const [isStreamInfoVisible, setIsStreamInfoVisible] = useState(false);
  const [isPlayerControlsVisible, setIsPlayerControlsVisible] = useState(true); // Default
  const [activeTrackSelectionMenu, setActiveTrackSelectionMenu] = useState<
    "audio" | "subtitle" | null
  >(null);

  // TODO: Add state for modals and notifications
  // const [isModalOpen, setIsModalOpen] = useState(false);
  // const [modalConfig, setModalConfig] = useState<any | null>(null); // Define proper type
  // const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  // const [pinModalConfig, setPinModalConfig] = useState<any | null>(null); // Define proper type
  // const [notification, setNotification] = useState<any | null>(null); // Define proper type

  // --- Derived State ---
  const currentChannel = channels.find((c) => c.id === selectedChannelId);

  // Effect to update video source when currentChannel or playerInstance changes
  useEffect(() => {
    if (!playerInstance || !videoElementRef.current) {
      return;
    }

    const serviceInstanceWithDash = currentChannel?.serviceInstances.find(
      (si) => si.dashUrl,
    );

    if (serviceInstanceWithDash && serviceInstanceWithDash.dashUrl) {
      // Valid DASH URL found for the current channel
      try {
        playerInstance.attachSource(serviceInstanceWithDash.dashUrl);
        setHasSourceBeenAttached(true); // Mark that source has been attached
        playerInstance.play(); // Explicitly play after attaching source
      } catch (error) {
        console.error("Error attaching source or playing:", error);
        setHasSourceBeenAttached(false); // Attachment failed
      }
    } else {
      // No valid DASH URL for the current channel (or no channel selected initially)
      // Reset player only if a source was previously attached.
      try {
        if (playerInstance && hasSourceBeenAttached) {
          // Check our flag
          playerInstance.reset();
          setHasSourceBeenAttached(false); // Mark that source has been reset
        }
      } catch (error) {
        console.error("Error resetting player:", error); // Updated error message
        setHasSourceBeenAttached(false); // If reset fails, assume source is no longer reliably attached
      }
    }
  }, [currentChannel, playerInstance, channels, hasSourceBeenAttached]); // Added hasSourceBeenAttached

  // --- UI Event Handlers (Examples) ---
  const handleOpenEpg = useCallback(() => setIsEpgVisible(true), []);
  const handleCloseEpg = useCallback(() => setIsEpgVisible(false), []);

  const handleOpenSettings = useCallback((event: ThreeEvent<MouseEvent>) => {
    setActiveSettingsPage("main");
    setIsSettingsVisible(true);
  }, []); // Assuming setActiveSettingsPage and setIsSettingsVisible are stable (from useState)

  const handleCloseSettings = useCallback(() => {
    setIsSettingsVisible(false);
    setActiveSettingsPage(null);
  }, []); // Assuming setIsSettingsVisible and setActiveSettingsPage are stable

  const handleToggleStreamInfo = useCallback(
    () => setIsStreamInfoVisible((prev) => !prev),
    [],
  );
  const handleTogglePlayerControls = useCallback(
    () => setIsPlayerControlsVisible((prev) => !prev),
    [],
  );

  // --- PlayerControls Handlers ---
  const handleOpenAudioTrackMenu = useCallback(() => {
    setActiveTrackSelectionMenu("audio");
    console.log("Open audio track menu - UI to be implemented");
    // Future: Show a modal or panel with audio track options from playerInstance.getTracksFor('audio')
  }, []);

  const handleOpenSubtitleTrackMenu = useCallback(() => {
    setActiveTrackSelectionMenu("subtitle");
    console.log("Open subtitle track menu - UI to be implemented");
    // Future: Show a modal or panel with subtitle track options from playerInstance.getTracksFor('text')
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      // Attempt to fullscreen the entire app container or a specific element
      // For simplicity, let's assume we want to fullscreen the video element if available,
      // or the document body as a fallback for the general UI.
      const elementToFullscreen =
        videoElementRef.current || document.documentElement;
      elementToFullscreen.requestFullscreen().catch((err: Error) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
        );
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err: Error) => {
          console.error(
            `Error attempting to disable full-screen mode: ${err.message} (${err.name})`,
          );
        });
      }
    }
    // TODO: Consider XR specific fullscreen if xrStore.enterVR() or similar is intended.
    console.log("Toggle Fullscreen action triggered");
  }, []);

  // Display loading or error state
  if (isLoadingServiceList) {
    return (
      <XR store={xrStore}>
        <ambientLight intensity={Math.PI / 2} />
        <Fullscreen backgroundColor="rgb(0,0,0)" backgroundOpacity={0.8}>
          <Container alignSelf={"center"}>
            <Text fontSize={30} color="white">
              Loading service list...
            </Text>
          </Container>
        </Fullscreen>
      </XR>
    );
  }

  if (globalError) {
    return (
      <XR store={xrStore}>
        <ambientLight intensity={Math.PI / 2} />
        <Fullscreen backgroundColor="rgb(0,0,0)" backgroundOpacity={0.8}>
          <Container alignSelf={"center"} flexDirection="column" gap={10}>
            <Text fontSize={30} color="red">
              Error:
            </Text>
            <Text fontSize={20} color="white">
              {globalError}
            </Text>
          </Container>
        </Fullscreen>
      </XR>
    );
  }

  return (
    <>
      {/* <div style={{
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
        position: 'absolute',
        zIndex: 10000,
        background: 'black',
        borderRadius: '0.5rem',
        border: 'none',
        fontWeight: 'bold',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1.5rem',
        bottom: '1rem',
        left: '50%',
        boxShadow: '0px 0px 20px rgb(0,0,0,1)',
        transform: 'translate(-50%, 0)',
      }}>
        <button
          style={{ cursor: "pointer", padding: '1rem 2rem', fontSize: "1rem", background: "none", color: "white", border: "none" }}
          onClick={() => xrStore.enterAR()}
        >
          Enter AR
        </button>
        <button
          style={{ cursor: "pointer", padding: '1rem 2rem', fontSize: "1rem", background: "none", color: "white", border: "none" }}
          onClick={() => xrStore.enterVR()}
        >
          Enter VR
        </button>
      </div> */}
      <XR store={xrStore}>
        <ambientLight intensity={Math.PI / 2} />
        <spotLight
          position={[10, 10, 10]}
          angle={0.15}
          penumbra={1}
          decay={0}
          intensity={Math.PI}
        />
        <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

        <Suspense>
          <Fullscreen
            backgroundColor="rgb(0,0,0)"
            backgroundOpacity={0.5}
            flexDirection={"column"}
          >
            {/* Background Video Player */}
            {/* The actual <video> element is now managed by videoElementRef and controlled by Dash.js */}
            {/* The @react-three/uikit <Video> component will use this existing element */}
            {videoElementRef.current && (
              <Video
                src={videoElementRef.current} // Use the Dash.js controlled video element
                width="100%"
                height="100%"
                positionType="absolute" // To be in the background
                zIndexOffset={-1} // Ensure it's behind the UI overlay
              />
            )}

            {/* UI Overlay */}
            <Container
              positionType="absolute"
              inset={0}
              flexDirection="row" // Main layout: Info/Buttons on left, Channel list on right
              padding={20}
              gap={20}
            >
              {/* Left Panel: Info & Buttons */}
              <Container
                width="60%" // Takes up 60% of the space
                height="100%"
                flexDirection="column"
                justifyContent="space-between" // Pushes logo to top, info/buttons to bottom
                backgroundColor="rgb(50,50,50)"
                backgroundOpacity={0.3}
                borderRadius={10}
                padding={15}
              >
                {/* Footer: Channel Info & Buttons */}
                <Container flexDirection="column" gap={10}>
                  <Text fontSize={20} color="white">
                    {currentChannel
                      ? `Playing: ${currentChannel.titles[0]?.text || currentChannel.id}`
                      : "No channel selected"}
                  </Text>
                  {currentChannel && (
                    <Text fontSize={16} color="lightgray">
                      Provider: {currentChannel.provider}
                    </Text>
                  )}
                  <Container flexDirection="row" gap={10} marginTop={10}>
                    <Container
                      onClick={handleOpenEpg}
                      paddingX={15}
                      paddingY={8}
                      borderRadius={5}
                      backgroundColor="rgb(0,152,244)"
                      backgroundOpacity={0.7}
                      hover={{
                        backgroundColor: "rgb(0,152,244)",
                        backgroundOpacity: 1,
                      }}
                      cursor="pointer"
                    >
                      <Text color="white">EPG</Text>
                    </Container>
                    <Container
                      onClick={handleOpenSettings} // Pass directly
                      paddingX={15}
                      paddingY={8}
                      borderRadius={5}
                      backgroundColor="rgb(100,100,100)"
                      backgroundOpacity={0.7}
                      hover={{
                        backgroundColor: "rgb(120,120,120)",
                        backgroundOpacity: 1,
                      }}
                      cursor="pointer"
                    >
                      <Text color="white">Settings</Text>
                    </Container>
                    {/* Example for toggling player controls - can be a button or an auto-hide mechanism */}
                    <Container
                      onClick={handleTogglePlayerControls}
                      paddingX={15}
                      paddingY={8}
                      borderRadius={5}
                      backgroundColor="rgb(150,150,150)"
                      backgroundOpacity={0.7}
                      hover={{
                        backgroundColor: "rgb(170,170,170)",
                        backgroundOpacity: 1,
                      }}
                      cursor="pointer"
                    >
                      <Text onClick={handleTogglePlayerControls} color="white">
                        {isPlayerControlsVisible
                          ? "Hide Controls"
                          : "Show Controls"}
                      </Text>
                    </Container>
                  </Container>
                </Container>
              </Container>

              {/* Right Panel: Channel List */}
              <ChannelListView
                channels={channels}
                selectedChannelId={selectedChannelId}
                isLoadingServiceList={isLoadingServiceList}
                onSelectChannel={selectChannel}
              />
            </Container>

            {/* Settings Modal Overlay */}
            <SettingsView
              isVisible={isSettingsVisible}
              activePage={activeSettingsPage}
              onClose={handleCloseSettings}
              onNavigate={setActiveSettingsPage}
            />

            {/* Player Controls Overlay */}
            <PlayerControls
              isVisible={isPlayerControlsVisible}
              onOpenAudioTrackMenu={handleOpenAudioTrackMenu}
              onOpenSubtitleTrackMenu={handleOpenSubtitleTrackMenu}
              onToggleFullscreen={handleToggleFullscreen}
            />
          </Fullscreen>
        </Suspense>
      </XR>
    </>
  );
}
