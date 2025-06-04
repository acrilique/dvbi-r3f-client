import React from "react";
import { Container, Text, Image } from "@react-three/uikit";
import { ChannelRepresentation } from "../store/types";
import { Signal, computed } from "@preact/signals-react";
import { useAppStore } from "../store/store";

interface ChannelListItemProps {
  opacity: Signal<number>;
  channel: ChannelRepresentation;
}

const ChannelListItemComponent: React.FC<ChannelListItemProps> = ({
  opacity,
  channel,
}) => {
  const selectedChannelId = useAppStore((state) => state.selectedChannelId);
  const selectChannel = useAppStore((state) => state.selectChannel);

  const isSelected = selectedChannelId === channel.id;

  const outerContainerOpacity = computed(() => {
    return opacity.value * (isSelected ? 0.7 : 0.5);
  });

  const hoverOuterContainerOpacity = computed(() => {
    return opacity.value * (isSelected ? 0.9 : 0.7);
  });

  const innerContainerOpacity = computed(() => {
    return opacity.value * 0.5;
  });

  return (
    <Container
      key={channel.id} // key is actually used by the parent map, but good to have it conceptually here
      flexDirection="row"
      alignItems="center"
      height={50}
      padding={10}
      borderRadius={5}
      backgroundColor={isSelected ? "rgb(0,152,244)" : "rgb(80,80,80)"}
      backgroundOpacity={outerContainerOpacity}
      hover={{
        backgroundColor: isSelected ? "rgb(0,152,244)" : "rgb(100,100,100)",
        backgroundOpacity: hoverOuterContainerOpacity,
      }}
      cursor="pointer"
      onClick={() => selectChannel(channel.id)}
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
          backgroundOpacity={innerContainerOpacity}
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
