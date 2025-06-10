import React, { useEffect } from "react";
import { Container, Text, Input } from "@react-three/uikit";
import { useAppStore } from "../store/store";
import { AvailableServiceListEntry } from "../store/types";

const SettingsViewComponent: React.FC = () => {
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
  const languageSettings = useAppStore((state) => state.languageSettings);
  const updateLanguageSetting = useAppStore(
    (state) => state.updateLanguageSetting,
  );
  const lowLatencySettings = useAppStore((state) => state.lowLatencySettings);
  const updateLowLatencySetting = useAppStore(
    (state) => state.updateLowLatencySetting,
  );
  const activePage = useAppStore((state) => state.activeSettingsPage);
  const setActiveSettingsPage = useAppStore(
    (state) => state.setActiveSettingsPage,
  );

  useEffect(() => {
    if (activePage && availableServiceLists.length === 0) {
      discoverAvailableServiceLists().catch((error) => {
        console.error("Error discovering service lists:", error);
      });
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
        onClick={() => setActiveSettingsPage("serviceListSelection")}
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
        onClick={() => setActiveSettingsPage("language")}
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(80,80,80)"
        hover={{ backgroundColor: "rgb(100,100,100)" }}
        cursor="pointer"
      >
        <Text color="white">Language Settings</Text>
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
        onClick={() => setActiveSettingsPage("lowLatency")}
        padding={10}
        borderRadius={5}
        backgroundColor="rgb(80,80,80)"
        hover={{ backgroundColor: "rgb(100,100,100)" }}
        cursor="pointer"
      >
        <Text color="white">Low Latency Settings</Text>
      </Container>
      <Container
        onClick={() => setActiveSettingsPage("none")}
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

  // the plan here is to allow the selection of a default language from
  // a set of supported langs using ISO 639-1 codes.
  // Options: audioLanguage, subtitleLanguage, uiLanguage, accessibleAudio
  const renderLanguageSettingsPage = () => (
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
          Language Settings
        </Text>
        <Container
          onClick={() => setActiveSettingsPage("main")}
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

      {/* Audio Language */}
      <Container
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text color="white">Default Audio Language:</Text>
        <Input
          width={200}
          padding={8}
          borderRadius={5}
          backgroundColor="rgb(60,60,60)"
          color="white"
          value={languageSettings.audioLanguage || ""}
          onValueChange={(value) =>
            updateLanguageSetting("audioLanguage", value)
          }
        />
      </Container>

      {/* Subtitle Language */}
      <Container
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text color="white">Default Subtitle Language:</Text>
        <Input
          width={200}
          padding={8}
          borderRadius={5}
          backgroundColor="rgb(60,60,60)"
          color="white"
          value={languageSettings.subtitleLanguage || ""}
          onValueChange={(value) =>
            updateLanguageSetting("subtitleLanguage", value)
          }
        />
      </Container>

      {/* UI Language */}
      {/* Accessible Audio */}
    </Container>
  );

  const renderLowLatencySettingsPage = () => (
    <Container
      flexDirection="column"
      gap={15}
      padding={20}
      borderRadius={10}
      backgroundColor="rgb(40,40,40)"
      backgroundOpacity={0.9}
      width={400} // Give it a defined width
    >
      <Container
        flexDirection="row"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
      >
        <Text fontSize={24} color="white">
          Low Latency Settings
        </Text>
        <Container
          onClick={() => setActiveSettingsPage("main")}
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

      {/* Target Latency */}
      <Container
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text color="white" marginRight={10}>
          Target latency (s):
        </Text>
        <Input
          width={100}
          padding={8}
          borderRadius={5}
          backgroundColor="rgb(60,60,60)"
          color="white"
          value={lowLatencySettings.liveDelay.toString()}
          onValueChange={(value) => {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              updateLowLatencySetting("liveDelay", numValue);
            }
          }}
        />
      </Container>

      {/* Maximum Drift */}
      <Container
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text color="white" marginRight={10}>
          Maximum drift (s):
        </Text>
        <Input
          width={100}
          padding={8}
          borderRadius={5}
          backgroundColor="rgb(60,60,60)"
          color="white"
          value={lowLatencySettings.liveCatchupMaxDrift.toString()}
          onValueChange={(value) => {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              updateLowLatencySetting("liveCatchupMaxDrift", numValue);
            }
          }}
        />
      </Container>

      {/* Catch-up Playback Rate */}
      <Container
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text color="white" marginRight={10}>
          Min catch-up rate:
        </Text>
        <Input
          width={100}
          padding={8}
          borderRadius={5}
          backgroundColor="rgb(60,60,60)"
          color="white"
          value={lowLatencySettings.liveCatchupPlaybackRate.min.toString()}
          onValueChange={(value) => {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              updateLowLatencySetting("liveCatchupPlaybackRate", {
                ...lowLatencySettings.liveCatchupPlaybackRate,
                min: numValue,
              });
            }
          }}
        />
      </Container>
      <Container
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Text color="white" marginRight={10}>
          Max catch-up rate:
        </Text>
        <Input
          width={100}
          padding={8}
          borderRadius={5}
          backgroundColor="rgb(60,60,60)"
          color="white"
          value={lowLatencySettings.liveCatchupPlaybackRate.max.toString()}
          onValueChange={(value) => {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
              updateLowLatencySetting("liveCatchupPlaybackRate", {
                ...lowLatencySettings.liveCatchupPlaybackRate,
                max: numValue,
              });
            }
          }}
        />
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
          onClick={() => setActiveSettingsPage("main")}
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
                setActiveSettingsPage("none");
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
          onClick={() => setActiveSettingsPage("main")}
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
      pageContent = renderLanguageSettingsPage();
      break;
    case "parentalControls":
      pageContent = renderPlaceholderPage("Parental Controls");
      break;
    case "lowLatency":
      pageContent = renderLowLatencySettingsPage();
      break;
    case "main":
      pageContent = renderMainPage();
      break;
    default:
  }

  if (activePage === "none") {
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
      renderOrder={3}
      zIndexOffset={3}
      pointerEventsOrder={3}
    >
      {pageContent}
    </Container>
  );
};

export const SettingsView = React.memo(SettingsViewComponent);
