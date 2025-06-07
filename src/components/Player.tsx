import {
  Fullscreen,
  Container,
  Video,
  DefaultProperties,
} from "@react-three/uikit";
import { Suspense, useEffect, useCallback, useMemo, useState } from "react";
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

function useDampedSignal(
  initialValue: number,
  targetRef: { current: number },
  dampingFactor = 7,
) {
  const signal = useMemo(
    () => new Signal<number>(initialValue),
    [initialValue],
  );

  useFrame((_, dt) => {
    const newValue = MathUtils.damp(
      signal.value,
      targetRef.current,
      dampingFactor,
      dt,
    );

    signal.value = newValue;
  });

  return signal;
}

export function Player() {
  // Global state selectors from Zustand store
  const fetchAndProcessServiceList = useAppStore(
    (state) => state.fetchAndProcessServiceList,
  );
  const setPlayerInstance = useAppStore((state) => state.setPlayerInstance);
  const opacityTargetRef = useAppStore((state) => state.opacityTargetRef);
  const showUi = useAppStore((state) => state.showUi);

  const [videoElement] = useState(() => {
    const video = document.createElement("video");
    video.id = "dashjs-video-player";
    video.muted = false;
    video.crossOrigin = "anonymous";
    video.playsInline = true;
    // Offscreen styling
    video.style.position = "absolute";
    video.style.left = "-9999px";
    video.style.top = "-9999px";
    document.body.appendChild(video);
    return video;
  });

  // Non-modal ui visibility - pass the store's target ref to the hook
  const opacitySignal = useDampedSignal(
    opacityTargetRef.current,
    opacityTargetRef,
  );

  const handlePointerAction = useCallback(() => {
    showUi();
  }, [showUi]);

  useEffect(() => {
    document.body.addEventListener("pointermove", handlePointerAction);
    document.body.addEventListener("pointerdown", handlePointerAction);

    return () => {
      document.body.removeEventListener("pointermove", handlePointerAction);
      document.body.removeEventListener("pointerdown", handlePointerAction);
      document.body.style.cursor = "default";
    };
  }, [handlePointerAction]);

  // Fetch and process service list on mount
  useEffect(() => {
    void fetchAndProcessServiceList();
  }, [fetchAndProcessServiceList]);

  // Initialize and manage Dash.js player instance
  useEffect(() => {
    const newPlayer = MediaPlayer().create();
    try {
      newPlayer.initialize(videoElement);
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
      if (videoElement && videoElement.parentNode) {
        videoElement.parentNode.removeChild(videoElement);
      }
    };
  }, [setPlayerInstance, videoElement]);

  return (
    <>
      <Suspense>
        <Fullscreen flexDirection={"column"}>
          {/* Background Video Player */}
          {videoElement && (
            <Video
              src={videoElement}
              width="100%"
              positionType="absolute"
              renderOrder={-1}
            />
          )}

          <DefaultProperties opacity={opacitySignal}>
            {/* UI Overlay */}
            <Container
              positionType="absolute"
              inset={0}
              flexDirection="row"
              padding={20}
              gap={20}
            >
              {/* Left Footer: Channel Info and EPG/Settings buttons */}
              <InfoFooter opacity={opacitySignal} />
              {/* Right Panel: Channel List */}
              <ChannelListView opacity={opacitySignal} />
            </Container>

            {/* Player Controls Overlay */}
            <PlayerControls opacity={opacitySignal} />
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
