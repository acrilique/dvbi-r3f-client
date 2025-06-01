import { useEffect } from "react";
import { Container, Text } from "@react-three/uikit";
import { useAppStore } from "../store/store";
import { AvailableServiceListEntry } from "../store/types";

interface SettingsViewProps {
  activePage: string | null;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export function SettingsView({
  activePage,
  onClose,
  onNavigate,
}: SettingsViewProps) {
  const fetchAndProcessServiceList = useAppStore(
    (state) => state.fetchAndProcessServiceList,
  );
  const serviceListInfo = useAppStore((state) => state.serviceListInfo);
  const availableServiceLists = useAppStore(
    (state) => state.availableServiceLists,
  );
  const discoverAvailableServiceLists = useAppStore(
    (state) => state.discoverAvailableServiceLists,
  );

  useEffect(() => {
    if (activePage && availableServiceLists.length === 0) {
      discoverAvailableServiceLists();
    }
  }, [activePage, availableServiceLists, discoverAvailableServiceLists]);

  const renderMainPage = () => (
    <Container
      flexDirection="column"
      gap={15}
      padding={20}
      borderRadius={10}
      backgroundColor="rgb(40,40,40)"
      backgroundOpacity={0.9}
    >
      <Text fontSize={24} color="white">
        Settings
      </Text>
      <Container
        onClick={() => onNavigate("serviceListSelection")}
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(80,80,80)"
        hover={{ backgroundColor: "rgb(100,100,100)" }}
        cursor="pointer"
      >
        <Text color="white">Select Service List</Text>
      </Container>
      {/* Placeholder buttons for other settings */}
      <Container
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(80,80,80)"
        cursor="not-allowed"
        backgroundOpacity={0.5}
      >
        <Text color="gray">Language Settings (TBD)</Text>
      </Container>
      <Container
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(80,80,80)"
        cursor="not-allowed"
        backgroundOpacity={0.5}
      >
        <Text color="gray">Parental Controls (TBD)</Text>
      </Container>
      <Container
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(80,80,80)"
        cursor="not-allowed"
        backgroundOpacity={0.5}
      >
        <Text color="gray">Low Latency Settings (TBD)</Text>
      </Container>
      <Container
        onClick={onClose}
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(120,0,0)"
        hover={{ backgroundColor: "rgb(150,0,0)" }}
        cursor="pointer"
        marginTop={20}
      >
        <Text color="white">Close</Text>
      </Container>
    </Container>
  );

  const renderServiceListSelectionPage = () => (
    <Container
      flexDirection="column"
      gap={15}
      padding={20}
      borderRadius={10}
      backgroundColor="rgb(40,40,40)"
      backgroundOpacity={0.9}
    >
      <Container
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
      >
        <Text fontSize={24} color="white">
          Select Service List
        </Text>
        <Container
          onClick={() => onNavigate("main")}
          padding={8}
          borderRadius={5}
          backgroundColor="rgb(80,80,80)"
          hover={{ backgroundColor: "rgb(100,100,100)" }}
          cursor="pointer"
        >
          <Text color="white" fontSize={14}>
            Back
          </Text>
        </Container>
      </Container>
      <Container
        flexDirection="column"
        gap={10}
        maxHeight={300}
        overflow="scroll"
      >
        {availableServiceLists.map((listEntry: AvailableServiceListEntry) => {
          const isActive = serviceListInfo?.identifier === listEntry.identifier;
          return (
            <Container
              key={listEntry.identifier}
              onClick={() => {
                void fetchAndProcessServiceList(listEntry.identifier);
                onClose(); // Close settings after selection
              }}
              padding={10}
              borderRadius={5}
              backgroundColor={isActive ? "rgb(0,122,204)" : "rgb(80,80,80)"}
              hover={{
                backgroundColor: isActive
                  ? "rgb(0,100,180)"
                  : "rgb(100,100,100)",
              }}
              cursor="pointer"
            >
              <Text color="white">{listEntry.name}</Text>
              {isActive && (
                <Text color="lightgreen" fontSize={12} marginLeft={10}>
                  (Active)
                </Text>
              )}
            </Container>
          );
        })}
        {availableServiceLists.length === 0 && (
          <Text color="gray">No service lists discovered.</Text>
        )}
      </Container>
    </Container>
  );

  const renderPlaceholderPage = (title: string) => (
    <Container
      flexDirection="column"
      gap={15}
      padding={20}
      borderRadius={10}
      backgroundColor="rgb(40,40,40)"
      backgroundOpacity={0.9}
    >
      <Container
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
      >
        <Text fontSize={24} color="white">
          {title}
        </Text>
        <Container
          onClick={() => onNavigate("main")}
          padding={8}
          borderRadius={5}
          backgroundColor="rgb(80,80,80)"
          hover={{ backgroundColor: "rgb(100,100,100)" }}
          cursor="pointer"
        >
          <Text color="white" fontSize={14}>
            Back
          </Text>
        </Container>
      </Container>
      <Text color="gray" marginTop={20}>
        Feature not yet implemented.
      </Text>
    </Container>
  );

  if (!activePage) {
    return null;
  }

  let pageContent;
  switch (activePage) {
    case "serviceListSelection":
      pageContent = renderServiceListSelectionPage();
      break;
    case "language":
      pageContent = renderPlaceholderPage("Language Settings");
      break;
    case "parentalControls":
      pageContent = renderPlaceholderPage("Parental Controls");
      break;
    case "lowLatency":
      pageContent = renderPlaceholderPage("Low Latency Settings");
      break;
    case "main":
      pageContent = renderMainPage();
      break;
    default:
  }

  return (
    <Container
      positionType="absolute"
      inset={0}
      alignItems="center"
      justifyContent="center"
      backgroundColor="rgb(0,0,0)"
      backgroundOpacity={0.8}
      zIndexOffset={10}
    >
      {pageContent}
    </Container>
  );
}
