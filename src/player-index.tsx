import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "./player.js";
import { Canvas } from "@react-three/fiber";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Canvas>
      <Player />
    </Canvas>
  </StrictMode>,
);
