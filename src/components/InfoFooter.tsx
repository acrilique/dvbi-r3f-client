import React, { useCallback } from "react";
import { Container, Text } from "@react-three/uikit";
import { Signal, computed } from "@preact/signals-react";
import { useAppStore } from "../store/store";

interface InfoFooterComponentProps {
  opacity: Signal<number>;
}

const InfoFooterComponent: React.FC<InfoFooterComponentProps> = ({
  opacity,
}) => {
  const currentChannel = useAppStore(
    (state) =>
      state.channels.find((c) => c.id === state.selectedChannelId) || null,
  );
  const setActiveSettingsPage = useAppStore(
    (state) => state.setActiveSettingsPage,
  );

  const handleOpenSettings = useCallback(() => {
    setActiveSettingsPage("main");
  }, [setActiveSettingsPage]);

  const footerBackgroundOpacity = computed(() => {
    return opacity.value * 0.7;
  });

  return (
    <Container width="60%" height="100%" flexDirection="row" padding={15}>
      <Container
        flexDirection="column"
        gap={10}
        alignSelf={"flex-end"}
        backgroundColor="rgb(0,0,0)"
        backgroundOpacity={footerBackgroundOpacity}
        padding={20}
        borderRadius={10}
      >
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
            // onClick={handleOpenEpg}
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
  );
};

export const InfoFooter = React.memo(InfoFooterComponent);
