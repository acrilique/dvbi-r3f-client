import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "./components/Player";
import { Canvas } from "@react-three/fiber";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Canvas>
      <Player />
    </Canvas>
  </StrictMode>,
);
