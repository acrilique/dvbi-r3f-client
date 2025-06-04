import React, { useCallback, useMemo } from "react";
import { Container, Text } from "@react-three/uikit";
import { Button } from "@react-three/uikit-apfel";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Captions,
  AudioWaveform,
} from "@react-three/uikit-lucide";
import { useAppStore } from "../store/store";
import type { AppState } from "../store/types";
import { Signal, computed } from "@preact/signals-react";

// Props for individual button components
interface ControlButtonProps {
  backgroundOpacity: Signal<number>;
  iconOpacity: Signal<number>;
}

const PlayPauseButtonComponent: React.FC<ControlButtonProps> = ({
  backgroundOpacity,
  iconOpacity,
}) => {
  const isPlaying = useAppStore((state: AppState) => state.isPlaying);
  const playerInstance = useAppStore((state: AppState) => state.playerInstance);
  const setGlobalError = useAppStore((state) => state.setGlobalError);

  const handlePlayPause = useCallback(() => {
    try {
      if (playerInstance) {
        if (isPlaying) {
          playerInstance.pause();
        } else {
          playerInstance.play();
        }
      }
    } catch (error) {
      console.error("Error toggling play/pause from component:", error);
      setGlobalError(
        "Failed to toggle play/pause. Content might be unavailable.",
      );
    }
  }, [isPlaying, playerInstance, setGlobalError]);

  return (
    <Button
      onClick={handlePlayPause}
      padding={10}
      borderRadius={5}
      backgroundColor="rgb(255,255,255)"
      backgroundOpacity={backgroundOpacity}
      hover={{ backgroundColor: "rgb(255,255,255)", backgroundOpacity: 0.3 }}
    >
      {isPlaying ? (
        <Pause opacity={iconOpacity} color="white" width={24} height={24} />
      ) : (
        <Play opacity={iconOpacity} color="white" width={24} height={24} />
      )}
    </Button>
  );
};
const PlayPauseButton = React.memo(PlayPauseButtonComponent);

const TimeDisplayComponent: React.FC = () => {
  const currentTime = useAppStore((state: AppState) => state.currentTime);
  const duration = useAppStore((state: AppState) => state.duration);

  return (
    <Container width={130} flexDirection="column" alignItems="center">
      <Text color="white" fontSize={16}>
        {new Date(currentTime * 1000).toISOString().substr(14, 5)} /{" "}
        {new Date(duration * 1000).toISOString().substr(14, 5)}
      </Text>
    </Container>
  );
};

const TimeDisplay = React.memo(TimeDisplayComponent);

const MuteToggleButtonComponent: React.FC<ControlButtonProps> = ({
  backgroundOpacity,
  iconOpacity,
}) => {
  const playerInstance = useAppStore((state: AppState) => state.playerInstance);
  const volume = useAppStore((state: AppState) => state.volume);
  const isMutedState = useAppStore((state: AppState) => state.isMuted);
  const setIsMuted = useAppStore((state) => state.setIsMuted);
  const setGlobalError = useAppStore((state) => state.setGlobalError);

  const visiblyMuted = useMemo(() => {
    const currentVolume = volume === undefined ? 1 : volume;
    const currentIsMuted = isMutedState === undefined ? false : isMutedState;
    return currentVolume === 0 || currentIsMuted;
  }, [volume, isMutedState]);

  const handleMuteToggle = useCallback(() => {
    if (playerInstance) {
      try {
        const newState = !playerInstance.isMuted();
        playerInstance.setMute(newState);
        setIsMuted(newState);
      } catch (error) {
        console.error("Error toggling mute from component:", error);
        setGlobalError("Failed to toggle mute. Content might be unavailable.");
      }
    }
  }, [playerInstance, setIsMuted, setGlobalError]);

  return (
    <Button
      onClick={handleMuteToggle}
      padding={10}
      borderRadius={5}
      backgroundColor="rgb(255,255,255)"
      backgroundOpacity={backgroundOpacity}
      hover={{ backgroundColor: "rgb(255,255,255)", backgroundOpacity: 0.3 }}
    >
      {visiblyMuted ? (
        <VolumeX
          onClick={handleMuteToggle}
          opacity={iconOpacity}
          color="white"
          width={24}
          height={24}
        />
      ) : (
        <Volume2
          onClick={handleMuteToggle}
          opacity={iconOpacity}
          color="white"
          width={24}
          height={24}
        />
      )}
    </Button>
  );
};
const MuteToggleButton = React.memo(MuteToggleButtonComponent);

// Memoized Audio Track Button
const AudioTrackButtonComponent: React.FC<ControlButtonProps> = ({
  backgroundOpacity,
  iconOpacity,
}) => (
  <Button
    // onClick={onClick}
    padding={10}
    borderRadius={5}
    backgroundColor="rgb(255,255,255)"
    backgroundOpacity={backgroundOpacity}
    hover={{ backgroundColor: "rgb(255,255,255)", backgroundOpacity: 0.3 }}
  >
    <AudioWaveform opacity={iconOpacity} color="white" width={24} height={24} />
  </Button>
);
const AudioTrackButton = React.memo(AudioTrackButtonComponent);

// Memoized Subtitle Track Button
const SubtitleTrackButtonComponent: React.FC<ControlButtonProps> = ({
  backgroundOpacity,
  iconOpacity,
}) => (
  <Button
    // onClick={}
    padding={10}
    borderRadius={5}
    backgroundColor="rgb(255,255,255)"
    backgroundOpacity={backgroundOpacity}
    hover={{ backgroundColor: "rgb(255,255,255)", backgroundOpacity: 0.3 }}
  >
    <Captions opacity={iconOpacity} color="white" width={24} height={24} />
  </Button>
);
const SubtitleTrackButton = React.memo(SubtitleTrackButtonComponent);

// Memoized Fullscreen Toggle Button
const FullscreenToggleButtonComponent: React.FC<ControlButtonProps> = ({
  backgroundOpacity,
  iconOpacity,
}) => {
  const playerInstance = useAppStore((state: AppState) => state.playerInstance);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (playerInstance) {
        try {
          const videoElement = playerInstance.getVideoElement();
          if (videoElement) {
            videoElement.requestFullscreen().catch((err: Error) => {
              console.error(
                `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
              );
            });
          }
        } catch (error) {
          console.error("Error getting video element:", error);
        }
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch((err: Error) => {
          console.error(
            `Error attempting to disable full-screen mode: ${err.message} (${err.name})`,
          );
        });
      }
    }
    console.log("Toggle Fullscreen action triggered");
  }, [playerInstance]);

  return (
    <Button
      onClick={handleToggleFullscreen}
      padding={10}
      borderRadius={5}
      backgroundColor="rgb(255,255,255)"
      backgroundOpacity={backgroundOpacity}
      hover={{ backgroundColor: "rgb(255,255,255)", backgroundOpacity: 0.3 }}
    >
      <Maximize opacity={iconOpacity} color="white" width={24} height={24} />
    </Button>
  );
};
const FullscreenToggleButton = React.memo(FullscreenToggleButtonComponent);

interface PlayerControlsProps {
  opacity: Signal<number>;
}

const PlayerControlsComponent: React.FC<PlayerControlsProps> = ({
  opacity,
}) => {
  const outerContainerOpacity = computed(() => opacity.value * 0.6);
  const buttonBackgroundOpacity = computed(() => opacity.value * 0.2);
  const iconsOpacity = computed(() => opacity.value * 1.0);

  return (
    <Container
      positionType="absolute"
      positionBottom={20}
      alignSelf={"center"}
      height={80}
      flexDirection="row"
      alignItems="center"
      justifyContent="space-around"
      paddingX={20}
      backgroundColor="rgb(0,0,0)"
      backgroundOpacity={outerContainerOpacity}
      borderRadius={10}
      gap={10}
      zIndexOffset={10}
    >
      <PlayPauseButton
        backgroundOpacity={buttonBackgroundOpacity}
        iconOpacity={iconsOpacity}
      />

      <TimeDisplay />

      <MuteToggleButton
        backgroundOpacity={buttonBackgroundOpacity}
        iconOpacity={iconsOpacity}
      />

      <AudioTrackButton
        backgroundOpacity={buttonBackgroundOpacity}
        iconOpacity={iconsOpacity}
      />

      <SubtitleTrackButton
        backgroundOpacity={buttonBackgroundOpacity}
        iconOpacity={iconsOpacity}
      />

      <FullscreenToggleButton
        backgroundOpacity={buttonBackgroundOpacity}
        iconOpacity={iconsOpacity}
      />
    </Container>
  );
};

export const PlayerControls = React.memo(PlayerControlsComponent);
