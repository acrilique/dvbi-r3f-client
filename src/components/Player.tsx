import {
  Fullscreen,
  Container,
  Video,
  DefaultProperties,
} from "@react-three/uikit";
import { Suspense, useEffect, useRef, useCallback, useMemo } from "react";
import { MediaPlayer } from "dashjs";
import { useAppStore } from "../store/store";
import { SettingsView } from "./SettingsView";
import { PlayerControls } from "./PlayerControls";
import { ChannelListView } from "./ChannelListView";
import { useFrame } from "@react-three/fiber";
import { Signal } from "@preact/signals-react";
import { MathUtils } from "three";
import { InfoFooter } from "./InfoFooter";
import { ErrorModal } from "./ErrorModal";

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
  const globalError = useAppStore((state) => state.globalError);
  const clearGlobalError = useAppStore((state) => state.clearGlobalError);
  const playerInstance = useAppStore((state) => state.playerInstance);
  const setPlayerInstance = useAppStore((state) => state.setPlayerInstance);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const timeoutIdRef = useRef<number | null>(null);

  // Non-modal ui visibility
  const [opacity, setOpacity] = useDampedSignal(0);

  // Callback and effect to handle global mouse move for UI visibility
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

  // Ensure timeout cleanup when the component unmounts
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  // Fetch and process service list on mount
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

  return (
    <>
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
              {/* Left Footer: Channel Info and EPG/Settings buttons */}
              <InfoFooter opacity={opacity} />

              {/* Right Panel: Channel List */}
              <ChannelListView opacity={opacity} />
            </Container>

            {/* Player Controls Overlay */}
            <PlayerControls opacity={opacity} />
          </DefaultProperties>

          {/* Settings Modal Overlay */}
          <SettingsView />

          {/* Error Modal Overlay */}
          <ErrorModal />
        </Fullscreen>
      </Suspense>
    </>
  );
}
