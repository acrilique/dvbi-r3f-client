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
import type { AppState, MediaTrack } from "../store/types";
import { Signal, computed } from "@preact/signals-react";

// Props for individual button components
interface ControlButtonProps {
  backgroundOpacity: Signal<number>;
  hoverBackgroundOpacity: Signal<number>;
  iconOpacity: Signal<number>;
}

const PlayPauseButtonComponent: React.FC<ControlButtonProps> = ({
  backgroundOpacity,
  hoverBackgroundOpacity,
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
      hover={{ backgroundOpacity: hoverBackgroundOpacity }}
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
  hoverBackgroundOpacity,
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
      hover={{ backgroundOpacity: hoverBackgroundOpacity }}
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

interface TrackMenuProps {
  tracks: MediaTrack[];
  selectedTrackId: number | null;
  onSelectTrack: (id: number) => void;
  onClose: () => void;
  title: string;
}

const TrackMenu: React.FC<TrackMenuProps> = ({
  tracks,
  selectedTrackId,
  onSelectTrack,
  onClose,
  title,
}) => (
  <Container
    positionType="absolute"
    positionBottom={60} // Position above the button
    positionLeft={-100} // Center horizontally
    flexDirection="column"
    backgroundColor="rgba(40, 40, 40)"
    backgroundOpacity={0.95}
    borderRadius={10}
    padding={15}
    gap={10}
    width={250}
  >
    <Text fontSize={20} color="white" textAlign={"center"}>
      {title}
    </Text>
    <Container flexDirection="column" gap={5} alignItems={"center"}>
      {tracks.map((track) => (
        <Button
          key={track.id}
          onClick={() => onSelectTrack(track.id)}
          padding={10}
          borderRadius={5}
          backgroundColor={
            selectedTrackId === track.id ? "rgb(0,122,204)" : "rgb(60,60,60)"
          }
          hover={{ backgroundColor: "rgb(100,100,100)" }}
        >
          <Text color="white">
            {track.label} ({track.lang})
          </Text>
        </Button>
      ))}
      {tracks.length === 0 && (
        <Text height={24} color="gray">
          No tracks available.
        </Text>
      )}
    </Container>
  </Container>
);

// Memoized Audio Track Button
const AudioTrackButtonComponent: React.FC<ControlButtonProps> = ({
  backgroundOpacity,
  hoverBackgroundOpacity,
  iconOpacity,
}) => {
  const isVisible = useAppStore((state) => state.isAudioTrackMenuVisible);
  const tracks = useAppStore((state) => state.availableAudioTracks);
  const selectedId = useAppStore((state) => state.selectedAudioTrackId);
  const selectAudioTrack = useAppStore((state) => state.selectAudioTrack);
  const toggleAudioTrackMenu = useAppStore(
    (state) => state.toggleAudioTrackMenu,
  );

  return (
    <Container>
      {isVisible && (
        <TrackMenu
          title="Select Audio Track"
          tracks={tracks}
          selectedTrackId={selectedId}
          onSelectTrack={selectAudioTrack}
          onClose={toggleAudioTrackMenu}
        />
      )}
      <Button
        onClick={toggleAudioTrackMenu}
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(255,255,255)"
        backgroundOpacity={backgroundOpacity}
        hover={{ backgroundOpacity: hoverBackgroundOpacity }}
      >
        <AudioWaveform
          onClick={toggleAudioTrackMenu}
          opacity={iconOpacity}
          color="white"
          width={24}
          height={24}
        />
      </Button>
    </Container>
  );
};
const AudioTrackButton = React.memo(AudioTrackButtonComponent);

// Memoized Subtitle Track Button
const SubtitleTrackButtonComponent: React.FC<ControlButtonProps> = ({
  backgroundOpacity,
  hoverBackgroundOpacity,
  iconOpacity,
}) => {
  const isVisible = useAppStore((state) => state.isSubtitleTrackMenuVisible);
  const tracks = useAppStore((state) => state.availableSubtitleTracks);
  const selectedId = useAppStore((state) => state.selectedSubtitleTrackId);
  const selectSubtitleTrack = useAppStore((state) => state.selectSubtitleTrack);
  const toggleSubtitleTrackMenu = useAppStore(
    (state) => state.toggleSubtitleTrackMenu,
  );

  return (
    <Container>
      {isVisible && (
        <TrackMenu
          title="Select Subtitle"
          tracks={tracks}
          selectedTrackId={selectedId}
          onSelectTrack={selectSubtitleTrack}
          onClose={toggleSubtitleTrackMenu}
        />
      )}
      <Button
        onClick={toggleSubtitleTrackMenu}
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(255,255,255)"
        backgroundOpacity={backgroundOpacity}
        hover={{ backgroundOpacity: hoverBackgroundOpacity }}
      >
        <Captions
          onClick={toggleSubtitleTrackMenu}
          opacity={iconOpacity}
          color="white"
          width={24}
          height={24}
        />
      </Button>
    </Container>
  );
};
const SubtitleTrackButton = React.memo(SubtitleTrackButtonComponent);

// Memoized Fullscreen Toggle Button
const FullscreenToggleButtonComponent: React.FC<ControlButtonProps> = ({
  backgroundOpacity,
  hoverBackgroundOpacity,
  iconOpacity,
}) => {
  const canvasRef = useAppStore((state) => state.canvasRef);

  const handleFullscreenToggle = useCallback(() => {
    if (!canvasRef?.current) {
      return;
    }
    if (document.fullscreenElement !== canvasRef.current) {
      canvasRef.current
        .requestFullscreen()
        .catch((err) =>
          console.error("Error attempting to enable full-screen mode:", err),
        );
    } else {
      document
        .exitFullscreen()
        .catch((err) =>
          console.error("Error attempting to exit full-screen mode:", err),
        );
    }
  }, [canvasRef]);

  return (
    <Button
      onClick={handleFullscreenToggle}
      padding={10}
      borderRadius={5}
      backgroundColor="rgb(255,255,255)"
      backgroundOpacity={backgroundOpacity}
      hover={{ backgroundOpacity: hoverBackgroundOpacity }}
    >
      <Maximize
        onClick={handleFullscreenToggle}
        opacity={iconOpacity}
        color="white"
        width={24}
        height={24}
      />
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
  const hoverButtonBackgroundOpacity = computed(() => opacity.value * 0.3);
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
    >
      <PlayPauseButton
        backgroundOpacity={buttonBackgroundOpacity}
        hoverBackgroundOpacity={hoverButtonBackgroundOpacity}
        iconOpacity={iconsOpacity}
      />

      <TimeDisplay />

      <MuteToggleButton
        backgroundOpacity={buttonBackgroundOpacity}
        hoverBackgroundOpacity={hoverButtonBackgroundOpacity}
        iconOpacity={iconsOpacity}
      />

      <AudioTrackButton
        backgroundOpacity={buttonBackgroundOpacity}
        hoverBackgroundOpacity={hoverButtonBackgroundOpacity}
        iconOpacity={iconsOpacity}
      />

      <SubtitleTrackButton
        backgroundOpacity={buttonBackgroundOpacity}
        hoverBackgroundOpacity={hoverButtonBackgroundOpacity}
        iconOpacity={iconsOpacity}
      />

      <FullscreenToggleButton
        backgroundOpacity={buttonBackgroundOpacity}
        hoverBackgroundOpacity={hoverButtonBackgroundOpacity}
        iconOpacity={iconsOpacity}
      />
    </Container>
  );
};

export const PlayerControls = React.memo(PlayerControlsComponent);
