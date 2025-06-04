import {
  Fullscreen,
  Container,
  Text,
  Video,
  DefaultProperties,
} from "@react-three/uikit";
import {
  Suspense,
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { MediaPlayer } from "dashjs";
import { useAppStore } from "./store/store";
import { SettingsView } from "./components/SettingsView";
import { PlayerControls } from "./components/PlayerControls";
import { ChannelListView } from "./components/ChannelListView";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { computed, Signal } from "@preact/signals-react";
import { MathUtils } from "three";

const HAVE_FUTURE_DATA =
  typeof HTMLMediaElement !== "undefined" && HTMLMediaElement.HAVE_FUTURE_DATA
    ? HTMLMediaElement.HAVE_FUTURE_DATA
    : 3;

function useDampedSignal(initialValue: number, dampingFactor = 7) {
  const signal = useMemo(() => new Signal(initialValue), [initialValue]);
  const target = useRef(initialValue);
  const callbackRef = useRef<((value: number) => void) | null>(null);
  const callbackInvokedRef = useRef(false);

  useFrame((_, dt) => {
    const newValue = MathUtils.damp(
      signal.value,
      target.current,
      dampingFactor,
      dt,
    );

    signal.value = newValue;

    // Check if target is reached (within a small threshold)
    const isTargetReached = Math.abs(newValue - target.current) < 0.001;

    if (isTargetReached && callbackRef.current && !callbackInvokedRef.current) {
      callbackRef.current(newValue);
      callbackInvokedRef.current = true;
    } else if (!isTargetReached) {
      callbackInvokedRef.current = false;
    }
  });

  const setTarget = useCallback((value: number) => {
    target.current = value;
    callbackInvokedRef.current = false;
  }, []);

  const onTargetReached = useCallback((callback: (value: number) => void) => {
    callbackRef.current = callback;
  }, []);

  return [signal, setTarget, onTargetReached] as const;
}

export function Player() {
  // Global state selectors from Zustand store
  const fetchAndProcessServiceList = useAppStore(
    (state) => state.fetchAndProcessServiceList,
  );
  const isLoadingServiceList = useAppStore(
    (state) => state.isLoadingServiceList,
  );
  const globalError = useAppStore((state) => state.globalError);
  const clearGlobalError = useAppStore((state) => state.clearGlobalError);
  const playerInstance = useAppStore((state) => state.playerInstance);
  const setPlayerInstance = useAppStore((state) => state.setPlayerInstance);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);

  const [activeSettingsPage, setActiveSettingsPage] = useState<string | null>(
    null,
  );

  const timeoutIdRef = useRef<number | null>(null);

  // Non-modal ui visibility
  const [opacity, setOpacity] = useDampedSignal(0);

  const footerBackgroundOpacity = computed(() => {
    return opacity.value * 0.7;
  });

  const handleMouseMove = useCallback(() => {
    setOpacity(1);
    // eslint-disable-next-line react-compiler/react-compiler
    document.body.style.cursor = "default";

    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    let blockUIOverlay = true;
    if (playerInstance && videoElementRef.current) {
      try {
        const isPlayerReady = playerInstance.isReady();
        const isPlayerPaused = playerInstance.isPaused(); // This might throw
        const videoElement = videoElementRef.current;

        if (
          isPlayerReady &&
          !isPlayerPaused &&
          videoElement.readyState >= HAVE_FUTURE_DATA
        ) {
          blockUIOverlay = false; // Allow transparency
        }
      } catch (e) {
        console.warn(
          "Error determining player state for UI overlay (isPaused might have thrown):",
          e,
        );
      }
    }

    if (!blockUIOverlay) {
      // Set new timeout to hide UI only if video is actually playing
      timeoutIdRef.current = window.setTimeout(() => {
        setOpacity(0);
        document.body.style.cursor = "none";
      }, 3000);
    }
  }, [setOpacity, playerInstance]);

  // Effect to handle global mouse move for UI visibility
  useEffect(() => {
    document.body.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.body.removeEventListener("mousemove", handleMouseMove);
      document.body.style.cursor = "default";
      // Clearing the timeout is also important on unmount if it's active
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [handleMouseMove]);

  useEffect(() => {
    // Cleanup the timeout when the component unmounts
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  // --- Local UI State Management ---
  const [isEpgVisible, setIsEpgVisible] = useState(false);
  // TODO: Define EpgViewState type locally or import if moved to a shared types file for components
  // const [epgViewState, setEpgViewState] = useState<{ displayIndex: number; currentEpgDate: number }>({
  //   displayIndex: 0,
  //   currentEpgDate: new Date(new Date().setHours(0, 0, 0, 0)).getTime()
  // });

  useEffect(() => {
    void fetchAndProcessServiceList();
  }, [fetchAndProcessServiceList]);

  // Initialize and manage Dash.js player instance
  useEffect(() => {
    if (!videoElementRef.current) {
      // Create the video element if it doesn't exist
      const video = document.createElement("video");
      video.id = "dashjs-video-player";
      video.muted = false;
      video.crossOrigin = "anonymous";
      //offscreen
      video.style.position = "absolute";
      video.style.left = "-9999px";
      video.style.top = "-9999px";

      document.body.appendChild(video);
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

  // // --- Derived State ---
  // const currentChannel = channels.find((c) => c.id === selectedChannelId);

  // --- UI Event Handlers (Examples) ---
  const handleOpenEpg = useCallback(() => setIsEpgVisible(true), []);
  const handleCloseEpg = useCallback(() => setIsEpgVisible(false), []);

  const handleOpenSettings = useCallback((_event: ThreeEvent<MouseEvent>) => {
    setActiveSettingsPage("main");
  }, []); // Assuming setActiveSettingsPage and setIsSettingsVisible are stable (from useState)

  const handleCloseSettings = useCallback(() => {
    setActiveSettingsPage(null);
  }, []); // Assuming setIsSettingsVisible and setActiveSettingsPage are stable

  // Display loading or error state
  // TODO replace this with a notification overlay to avoid unmount/remount
  if (isLoadingServiceList) {
    return (
      <Fullscreen backgroundColor="rgb(0,0,0)" backgroundOpacity={0.8}>
        <Container alignSelf={"center"}>
          <Text fontSize={30} color="white">
            Loading service list...
          </Text>
        </Container>
      </Fullscreen>
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
      <Suspense>
        <Fullscreen flexDirection={"column"}>
          {/* Background Video Player */}
          {videoElementRef.current && (
            <Video
              src={videoElementRef.current}
              width="100%"
              height="100%"
              positionType="absolute"
              renderOrder={-1}
            />
          )}

          <DefaultProperties opacity={opacity}>
            {/* UI Overlay */}
            <Container
              positionType="absolute"
              inset={0}
              flexDirection="row"
              padding={20}
              gap={20}
            >
              {/* Left Panel: Info & Buttons */}
              <Container
                width="60%"
                height="100%"
                flexDirection="row"
                padding={15}
              >
                {/* Footer: Channel Info & Buttons */}
                <Container
                  flexDirection="column"
                  gap={10}
                  alignSelf={"flex-end"}
                  backgroundColor="rgb(0,0,0)"
                  backgroundOpacity={footerBackgroundOpacity}
                  padding={20}
                  borderRadius={10}
                >
                  {/* <Text fontSize={20} color="white">
                    {currentChannel
                      ? `Playing: ${currentChannel.titles[0]?.text || currentChannel.id}`
                      : "No channel selected"}
                  </Text>
                  {currentChannel && (
                    <Text fontSize={16} color="lightgray">
                      Provider: {currentChannel.provider}
                    </Text>
                  )} */}
                  <Container flexDirection="row" gap={10} marginTop={10}>
                    <Container
                      onClick={handleOpenEpg}
                      paddingX={15}
                      paddingY={8}
                      cursor="pointer"
                    >
                      <Text color="white">EPG</Text>
                    </Container>
                    <Container
                      onClick={handleOpenSettings}
                      paddingX={15}
                      paddingY={8}
                      cursor="pointer"
                    >
                      <Text color="white">Settings</Text>
                    </Container>
                  </Container>
                </Container>
              </Container>

              {/* Right Panel: Channel List */}
              <ChannelListView opacity={opacity} />
            </Container>

            {/* Player Controls Overlay */}
            <PlayerControls opacity={opacity} />
          </DefaultProperties>

          {/* Settings Modal Overlay */}
          <SettingsView
            activePage={activeSettingsPage}
            onClose={handleCloseSettings}
            onNavigate={setActiveSettingsPage}
          />

          {/* Error Modal Overlay */}
          {globalError && (
            <Container
              positionType="absolute"
              inset={0}
              alignItems="center"
              justifyContent="center"
              backgroundColor="rgb(0,0,0)"
              backgroundOpacity={0.8}
              zIndexOffset={10}
            >
              <Container
                alignSelf="center"
                flexDirection="column"
                gap={20}
                padding={30}
                borderRadius={10}
                backgroundColor="rgb(80,80,80)"
                width={500}
              >
                <Text fontSize={30} color="red" textAlign="center">
                  Error
                </Text>
                <Text
                  fontSize={18}
                  color="white"
                  textAlign="center"
                  wordBreak={"break-all"}
                >
                  {globalError}
                </Text>
                <Container
                  onClick={() => {
                    clearGlobalError();
                  }}
                  paddingX={20}
                  paddingY={10}
                  borderRadius={5}
                  backgroundColor="rgb(0,122,204)"
                  hover={{ backgroundColor: "rgb(0,152,244)" }}
                  cursor="pointer"
                  alignSelf="center"
                  marginTop={20}
                >
                  <Text color="white" fontSize={18}>
                    Dismiss
                  </Text>
                </Container>
              </Container>
            </Container>
          )}
        </Fullscreen>
      </Suspense>
    </>
  );
}
