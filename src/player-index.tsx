import { StrictMode, useRef, useEffect, RefObject } from "react";
import { createRoot } from "react-dom/client";
import { Player } from "./components/Player";
import { Canvas } from "@react-three/fiber";
import { useAppStore } from "./store/store";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setCanvasRef = useAppStore((state) => state.setCanvasRef);

  useEffect(() => {
    if (canvasRef.current) {
      setCanvasRef(canvasRef as RefObject<HTMLCanvasElement>);
    }
  }, [setCanvasRef]);

  return (
    <Canvas ref={canvasRef} gl={{ localClippingEnabled: true }}>
      <Player />
    </Canvas>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
