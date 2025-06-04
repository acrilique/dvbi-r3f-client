import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Landing } from "./components/Landing.js";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Landing />
  </StrictMode>,
);
