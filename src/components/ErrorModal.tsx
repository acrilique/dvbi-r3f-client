import React from "react";
import { Container, Text } from "@react-three/uikit";
import { useAppStore } from "../store/store";

const ErrorModalComponent: React.FC = () => {
  const globalError = useAppStore((state) => state.globalError);
  const clearGlobalError = useAppStore((state) => state.clearGlobalError);

  if (!globalError) {
    return null;
  }

  return (
    <Container
      positionType="absolute"
      inset={0}
      alignItems="center"
      justifyContent="center"
      backgroundColor="rgb(0,0,0)"
      backgroundOpacity={0.8}
      renderOrder={4}
      zIndexOffset={4}
      pointerEventsOrder={4}
    >
      <Container
        alignSelf="center"
        flexDirection="column"
        gap={20}
        padding={30}
        borderRadius={10}
        backgroundColor="rgb(80,80,80)"
        width={500}
      >
        <Text fontSize={30} color="red" textAlign="center">
          Error
        </Text>
        <Text
          fontSize={18}
          color="white"
          textAlign="center"
          wordBreak={"break-all"}
        >
          {globalError}
        </Text>
        <Container
          onClick={() => {
            clearGlobalError();
          }}
          paddingX={20}
          paddingY={10}
          borderRadius={5}
          backgroundColor="rgb(0,122,204)"
          hover={{ backgroundColor: "rgb(0,152,244)" }}
          cursor="pointer"
          alignSelf="center"
          marginTop={20}
        >
          <Text color="white" fontSize={18}>
            Dismiss
          </Text>
        </Container>
      </Container>
    </Container>
  );
};

export const ErrorModal = React.memo(ErrorModalComponent);
