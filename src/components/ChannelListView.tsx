import React from "react";
import { Container, Text } from "@react-three/uikit"; // Image might not be needed here anymore
import { ChannelRepresentation } from "../store/types";
import { ChannelListItem } from "./ChannelListItem";
import { Signal, computed } from "@preact/signals-react";

interface ChannelListViewProps {
  opacity: Signal<number>;
  channels: ChannelRepresentation[];
  selectedChannelId: string | null;
  isLoadingServiceList: boolean;
  onSelectChannel: (channelId: string) => void;
}

const ChannelListViewComponent: React.FC<ChannelListViewProps> = ({
  opacity,
  channels,
  selectedChannelId,
  isLoadingServiceList,
  onSelectChannel,
}) => {
  const containerOpacity = computed(() => {
    return opacity.value * 0.5;
  });

  return (
    <Container flexGrow={1} flexDirection="column" height="100%">
      <Container
        flexDirection="column"
        backgroundColor="rgb(30,30,30)"
        backgroundOpacity={containerOpacity}
        borderRadius={10}
        padding={15}
        overflow="scroll"
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
            isSelected={selectedChannelId === channel.id}
            onSelectChannel={onSelectChannel}
          />
        ))}
        {channels.length === 0 && !isLoadingServiceList && (
          <Text color="gray" fontSize={16}>
            No channels available in this service list.
          </Text>
        )}
      </Container>
    </Container>
  );
};

export const ChannelListView = React.memo(ChannelListViewComponent);
