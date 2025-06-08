import React from "react";
import { Container, Text } from "@react-three/uikit"; // Image might not be needed here anymore
import { ChannelListItem } from "./ChannelListItem";
import { Signal, computed } from "@preact/signals-react";
import { useAppStore } from "../store/store";

interface ChannelListViewProps {
  opacity: Signal<number>;
}

const ChannelListViewComponent: React.FC<ChannelListViewProps> = ({
  opacity,
}) => {
  const channels = useAppStore((state) => state.channels);

  const containerOpacity = computed(() => {
    return opacity.value * 0.6;
  });

  return (
    <Container flexGrow={1} flexDirection="column" height="100%">
      <Container
        flexDirection="column"
        backgroundColor="rgb(0, 0, 0)"
        backgroundOpacity={containerOpacity}
        borderRadius={10}
        padding={15}
        overflow="scroll"
        maxHeight="70%"
        gap={10}
      >
        <Text fontSize={22} color="white" marginBottom={10}>
          Channels
        </Text>
        {channels.map((channel) => (
          <ChannelListItem
            opacity={opacity}
            key={channel.id}
            channel={channel}
          />
        ))}
        {channels.length === 0 && (
          <Text color="gray" fontSize={16}>
            No channels available in this service list.
          </Text>
        )}
      </Container>
    </Container>
  );
};

export const ChannelListView = React.memo(ChannelListViewComponent);
