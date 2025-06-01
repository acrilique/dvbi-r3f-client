import React from "react";
import { Container, Text } from "@react-three/uikit"; // Image might not be needed here anymore
import { ChannelRepresentation } from "../store/types";
import { ChannelListItem } from "./ChannelListItem";

interface ChannelListViewProps {
  channels: ChannelRepresentation[];
  selectedChannelId: string | null;
  isLoadingServiceList: boolean;
  onSelectChannel: (channelId: string) => void;
}

const ChannelListViewComponent: React.FC<ChannelListViewProps> = ({
  channels,
  selectedChannelId,
  isLoadingServiceList,
  onSelectChannel,
}) => {
  return (
    <Container
      width="40%" // Takes up 40% of the space
      height="100%"
      flexDirection="column"
      backgroundColor="rgb(30,30,30)"
      backgroundOpacity={0.5}
      borderRadius={10}
      padding={15}
      overflow="scroll" // Make this area scrollable
      gap={10}
    >
      <Text fontSize={22} color="white" marginBottom={10}>
        Channels
      </Text>
      {channels.map((channel) => (
        <ChannelListItem
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
  );
};

export const ChannelListView = React.memo(ChannelListViewComponent);
