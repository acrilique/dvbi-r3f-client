import { Canvas } from "@react-three/fiber"
import { Fullscreen, Text, Container } from "@react-three/uikit"

export function Landing() {
  return (
    <>
      <Canvas>
        <Fullscreen
          backgroundColor={"black"}
          padding={20}
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Container
            width="80%"
            maxWidth={800}
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            gap={20}
          >
            <Container
              flexGrow={1.5}
              flexDirection="column"
              padding={10}
            >
              <Text fontSize={24} color="white" fontWeight="bold" marginBottom={15}>
                Add DVB-I RefApp to your Home screen:
              </Text>
              <Container flexDirection="column" paddingLeft={20}>
                <Text color="white" fontSize={18} marginBottom={8}> - Tap the menu icon</Text>
                <Text color="white" fontSize={18}> - Tap Add to homescreen.</Text>
              </Container>
            </Container>
          </Container>
        </Fullscreen>
      </Canvas>
    </>
  )
}
