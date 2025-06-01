import React from "react";
import { Container, Text, Image } from "@react-three/uikit";
import { ChannelRepresentation } from "../store/types";

interface ChannelListItemProps {
  channel: ChannelRepresentation;
  isSelected: boolean;
  onSelectChannel: (channelId: string) => void;
}

const ChannelListItemComponent: React.FC<ChannelListItemProps> = ({
  channel,
  isSelected,
  onSelectChannel,
}) => {
  return (
    <Container
      key={channel.id} // key is actually used by the parent map, but good to have it conceptually here
      flexDirection="row"
      alignItems="center"
      padding={10}
      borderRadius={5}
      backgroundColor={isSelected ? "rgb(0,152,244)" : "rgb(80,80,80)"}
      backgroundOpacity={isSelected ? 0.7 : 0.5}
      hover={{
        backgroundColor: isSelected ? "rgb(0,152,244)" : "rgb(100,100,100)",
        backgroundOpacity: isSelected ? 0.9 : 0.7,
      }}
      cursor="pointer"
      onClick={() => onSelectChannel(channel.id)}
      gap={10}
    >
      {channel.image?.mediaUri && (
        <Image
          src={channel.image.mediaUri}
          height={30}
          width={30}
          keepAspectRatio
        />
      )}
      {!channel.image?.mediaUri && (
        <Container
          width={30}
          height={30}
          backgroundColor="rgb(120,120,120)"
          backgroundOpacity={0.5}
          borderRadius={5}
        />
      )}
      <Text color="white" fontSize={18}>
        {channel.titles[0]?.text || channel.id}
      </Text>
    </Container>
  );
};

export const ChannelListItem = React.memo(ChannelListItemComponent);
