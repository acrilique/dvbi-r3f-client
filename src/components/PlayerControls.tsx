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
import type { AppState } from "../store/types"; // For selecting parts of state & DashPlayerInstance

interface PlayerControlsProps {
  isVisible: boolean;
  onOpenAudioTrackMenu: () => void;
  onOpenSubtitleTrackMenu: () => void;
  onToggleFullscreen: () => void;
  // Add other necessary props, e.g., for fullscreen state if managed outside store
}

const PlayerControlsComponent: React.FC<PlayerControlsProps> = ({
  isVisible,
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
  const setPlayerVolume = useAppStore((state) => state.setPlayerVolume);
  const seekPlayerTo = useAppStore((state) => state.seekPlayerTo);

  const handlePlayPause = useCallback(() => {
    if (playerInstance) {
      if (isPlaying) {
        playerInstance.pause();
      } else {
        playerInstance.play();
      }
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

  if (!isVisible) {
    return null;
  }

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
      backgroundOpacity={0.6}
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
        backgroundOpacity={0.2}
        hover={{ backgroundColor: "rgb(255,255,255)", backgroundOpacity: 0.3 }}
      >
        {isPlaying ? (
          <Pause color="white" width={24} height={24} />
        ) : (
          <Play color="white" width={24} height={24} />
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
      <Container
        flexGrow={1}
        height={10}
        backgroundColor="rgb(255,255,255)"
        backgroundOpacity={0.3}
        borderRadius={5}
        marginX={10}
      >
        {/* Seek bar progress indicator would go here */}
      </Container>

      {/* Volume Control */}
      <Button
        onClick={handleMuteToggle}
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(255,255,255)"
        backgroundOpacity={0.2}
        hover={{ backgroundColor: "rgb(255,255,255)", backgroundOpacity: 0.3 }}
      >
        {isMuted ? (
          <VolumeX
            onClick={handleMuteToggle}
            color="white"
            width={24}
            height={24}
          />
        ) : (
          <Volume2
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
        backgroundOpacity={0.2}
        hover={{ backgroundColor: "rgb(255,255,255)", backgroundOpacity: 0.3 }}
      >
        <AudioWaveform color="white" width={24} height={24} />
      </Button>

      {/* Subtitle Track Selection */}
      <Button
        onClick={onOpenSubtitleTrackMenu}
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(255,255,255)"
        backgroundOpacity={0.2}
        hover={{ backgroundColor: "rgb(255,255,255)", backgroundOpacity: 0.3 }}
      >
        <Captions color="white" width={24} height={24} />
      </Button>

      {/* Fullscreen Toggle */}
      <Button
        onClick={onToggleFullscreen}
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(255,255,255)"
        backgroundOpacity={0.2}
        hover={{ backgroundColor: "rgb(255,255,255)", backgroundOpacity: 0.3 }}
      >
        {/* Assuming a state 'isFullscreen' would be passed or derived to toggle icon */}
        <Maximize color="white" width={24} height={24} />
      </Button>
    </Container>
  );
};

export const PlayerControls = React.memo(PlayerControlsComponent);
