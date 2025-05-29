import { Canvas } from "@react-three/fiber"
import { XR, createXRStore } from '@react-three/xr'
import { Fullscreen, Container, Text, Image, Video } from "@react-three/uikit"
import { Suspense } from "react"

// Mock data for channel list
const mockChannels = [
  { id: 1, name: "Channel 1", logo: "/images/icons-128.png" },
  { id: 2, name: "Channel 2", logo: "/images/icons-128.png" },
  { id: 3, name: "Channel 3", logo: "/images/icons-128.png" },
  { id: 4, name: "Channel 4", logo: "/images/icons-128.png" },
  { id: 5, name: "Channel 5", logo: "/images/icons-128.png" },
];

const store = createXRStore({})
export function Player() {
  // Placeholder for selected channel, EPG data, etc.
  // const [selectedChannel, setSelectedChannel] = useState(mockChannels[0]);

  return (
    <>
      <div style={{
        display: "flex",
        flexDirection: "row",
        gap: "1rem",
        position: 'absolute',
        zIndex: 10000,
        background: 'black',
        borderRadius: '0.5rem',
        border: 'none',
        fontWeight: 'bold',
        color: 'white',
        cursor: 'pointer',
        fontSize: '1.5rem',
        bottom: '1rem',
        left: '50%',
        boxShadow: '0px 0px 20px rgba(0,0,0,1)',
        transform: 'translate(-50%, 0)',
      }}>
        <button
          style={{ cursor: "pointer", padding: '1rem 2rem', fontSize: "1rem", background: "none", color: "white", border: "none" }}
          onClick={() => store.enterAR()}
        >
          Enter AR
        </button>
        <button
          style={{ cursor: "pointer", padding: '1rem 2rem', fontSize: "1rem", background: "none", color: "white", border: "none" }}
          onClick={() => store.enterVR()}
        >
          Enter VR
        </button>
      </div>
      <Canvas>
        <XR store={store}>
          <ambientLight intensity={Math.PI / 2} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
          <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />

          <Suspense>
            <Fullscreen backgroundColor="rgba(0,0,0,0.5)">
              {/* Background Video Player */}
              <Video
                src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" // Placeholder video
                width="100%"
                height="100%"
                autoplay
                muted // Autoplay often requires muted
                positionType="absolute" // To be in the background
                zIndexOffset={-1} // Ensure it's behind the UI overlay
              />

              {/* UI Overlay */}
              <Container
                positionType="absolute"
                inset={0}
                flexDirection="row" // Main layout: Info/Buttons on left, Channel list on right
                padding={20}
                gap={20}
              >
                {/* Left Panel: Info & Buttons */}
                <Container
                  width="60%" // Takes up 60% of the space
                  height="100%"
                  flexDirection="column"
                  justifyContent="space-between" // Pushes logo to top, info/buttons to bottom
                  backgroundColor="rgba(50,50,50,0.3)"
                  borderRadius={10}
                  padding={15}
                >
                  {/* Header: Logo */}
                  <Container alignItems="flex-start">
                    <Image src="/images/logo_dvbi_sofia.png" height={50} keepAspectRatio />
                  </Container>

                  {/* Footer: Channel Info & Buttons */}
                  <Container flexDirection="column" gap={10}>
                    <Text fontSize={20} color="white">Now Playing: Placeholder Program</Text>
                    <Text fontSize={16} color="lightgray">on Channel X</Text>
                    <Container flexDirection="row" gap={10} marginTop={10}>
                      <Container paddingX={15} paddingY={8} borderRadius={5} backgroundColor="rgba(0,152,244,0.7)" hover={{backgroundColor:"rgba(0,152,244,1)"}} cursor="pointer">
                        <Text color="white">EPG</Text>
                      </Container>
                      <Container paddingX={15} paddingY={8} borderRadius={5} backgroundColor="rgba(100,100,100,0.7)" hover={{backgroundColor:"rgba(120,120,120,1)"}} cursor="pointer">
                        <Text color="white">Settings</Text>
                      </Container>
                    </Container>
                  </Container>
                </Container>

                {/* Right Panel: Channel List */}
                <Container
                  width="40%" // Takes up 40% of the space
                  height="100%"
                  flexDirection="column"
                  backgroundColor="rgba(30,30,30,0.5)"
                  borderRadius={10}
                  padding={15}
                  overflow="scroll" // Make this area scrollable
                  gap={10}
                >
                  <Text fontSize={22} color="white" marginBottom={10}>Channels</Text>
                  {mockChannels.map((channel) => (
                    <Container
                      key={channel.id}
                      flexDirection="row"
                      alignItems="center"
                      padding={10}
                      borderRadius={5}
                      backgroundColor="rgba(80,80,80,0.5)"
                      hover={{ backgroundColor: "rgba(100,100,100,0.7)"}}
                      cursor="pointer"
                      // onClick={() => setSelectedChannel(channel)}
                      gap={10}
                    >
                      <Image src={channel.logo} height={30} width={30} keepAspectRatio />
                      <Text color="white" fontSize={18}>{channel.name}</Text>
                    </Container>
                  ))}
                </Container>
              </Container>
            </Fullscreen>
          </Suspense>
        </XR>
      </Canvas>
    </>
  )
}
