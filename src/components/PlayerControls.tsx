import React, { useCallback, useState } from "react";
import { Container, Text } from "@react-three/uikit";
import { Button } from "@react-three/uikit-apfel";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  // Minimize, // Assuming Minimize icon exists for fullscreen toggle
  Captions,
  AudioWaveform,
} from "@react-three/uikit-lucide";
import { useAppStore } from "../store/store";
import type { AppState } from "../store/types";
import { Signal, computed } from "@preact/signals-react";

interface PlayerControlsProps {
  opacity: Signal<number>;
  onOpenAudioTrackMenu: () => void;
  onOpenSubtitleTrackMenu: () => void;
  onToggleFullscreen: () => void;
  // Add other necessary props, e.g., for fullscreen state if managed outside store
}

const PlayerControlsComponent: React.FC<PlayerControlsProps> = ({
  opacity,
  onOpenAudioTrackMenu,
  onOpenSubtitleTrackMenu,
  onToggleFullscreen,
}) => {
  // Selectors for player state from Zustand
  const isPlaying = useAppStore((state: AppState) => state.isPlaying);
  const playerInstance = useAppStore((state: AppState) => state.playerInstance);
  const volume = useAppStore((state: AppState) => state.volume);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const currentTime = useAppStore((state: AppState) => state.currentTime);
  const duration = useAppStore((state: AppState) => state.duration);
  // const isSeeking = useAppStore((state: AppState) => state.isSeeking); // For seek bar visual feedback

  // Actions from Zustand
  const setGlobalError = useAppStore((state) => state.setGlobalError);
  const setPlayerVolume = useAppStore((state) => state.setPlayerVolume);
  const seekPlayerTo = useAppStore((state) => state.seekPlayerTo);

  const outerContainerOpacity = computed(() => {
    return opacity.value * 0.6;
  });

  const innerContainersOpacity = computed(() => {
    return opacity.value * 0.2;
  });

  const iconsOpacity = computed(() => {
    return opacity.value * 1.0;
  });

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
  }, [isPlaying, playerInstance]);

  const handleMuteToggle = useCallback(() => {
    if (playerInstance) {
      try {
        const newState = !playerInstance.isMuted();
        // Get current mute state directly from player and toggle it
        playerInstance.setMute(newState);
        setIsMuted(newState);
      } catch (error) {
        console.error("Error toggling mute from component:", error);
        // TODO: Handle error appropriately, e.g., notify user or set an error state
      }
    }
  }, [playerInstance]);

  // TODO: Implement volume change handler (e.g., for a slider)
  // const handleVolumeChange = useCallback((newVolume: number) => {
  //   setPlayerVolume(newVolume);
  // }, [setPlayerVolume]);

  // TODO: Implement seek handler (e.g., for a seek bar)
  // const handleSeek = useCallback((time: number) => {
  //   seekPlayerTo(time);
  // }, [seekPlayerTo]);

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
      zIndexOffset={10} // Ensure it's above the video
    >
      {/* Play/Pause Button */}
      <Button
        onClick={handlePlayPause}
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(255,255,255)"
        backgroundOpacity={innerContainersOpacity}
        hover={{ backgroundColor: "rgb(255,255,255)", backgroundOpacity: 0.3 }}
      >
        {isPlaying ? (
          <Pause opacity={iconsOpacity} color="white" width={24} height={24} />
        ) : (
          <Play opacity={iconsOpacity} color="white" width={24} height={24} />
        )}
      </Button>

      {/* Current Time / Duration */}
      <Container>
        <Text color="white" fontSize={16}>
          {new Date(currentTime * 1000).toISOString().substr(14, 5)} /{" "}
          {new Date(duration * 1000).toISOString().substr(14, 5)}
        </Text>
      </Container>

      {/* TODO: Seek Bar */}
      {/* <Container
        flexGrow={1}
        height={10}
        backgroundColor="rgb(255,255,255)"
        backgroundOpacity={0.3}
        borderRadius={5}
        marginX={10}
      >
      </Container> */}

      {/* Volume Control */}
      <Button
        onClick={handleMuteToggle}
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(255,255,255)"
        backgroundOpacity={innerContainersOpacity}
        hover={{ backgroundColor: "rgb(255,255,255)", backgroundOpacity: 0.3 }}
      >
        {isMuted ? (
          <VolumeX
            opacity={iconsOpacity}
            onClick={handleMuteToggle}
            color="white"
            width={24}
            height={24}
          />
        ) : (
          <Volume2
            opacity={iconsOpacity}
            onClick={handleMuteToggle}
            color="white"
            width={24}
            height={24}
          />
        )}
      </Button>
      {/* TODO: Volume Slider */}

      {/* Audio Track Selection */}
      <Button
        onClick={onOpenAudioTrackMenu}
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(255,255,255)"
        backgroundOpacity={innerContainersOpacity}
        hover={{ backgroundColor: "rgb(255,255,255)", backgroundOpacity: 0.3 }}
      >
        <AudioWaveform
          opacity={iconsOpacity}
          color="white"
          width={24}
          height={24}
        />
      </Button>

      {/* Subtitle Track Selection */}
      <Button
        onClick={onOpenSubtitleTrackMenu}
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(255,255,255)"
        backgroundOpacity={innerContainersOpacity}
        hover={{ backgroundColor: "rgb(255,255,255)", backgroundOpacity: 0.3 }}
      >
        <Captions opacity={iconsOpacity} color="white" width={24} height={24} />
      </Button>

      {/* Fullscreen Toggle */}
      <Button
        onClick={onToggleFullscreen}
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(255,255,255)"
        backgroundOpacity={innerContainersOpacity}
        hover={{ backgroundColor: "rgb(255,255,255)", backgroundOpacity: 0.3 }}
      >
        {/* Assuming a state 'isFullscreen' would be passed or derived to toggle icon */}
        <Maximize opacity={iconsOpacity} color="white" width={24} height={24} />
      </Button>
    </Container>
  );
};

export const PlayerControls = React.memo(PlayerControlsComponent);
