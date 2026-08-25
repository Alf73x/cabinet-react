import "./styles/typography.css";
import "./styles/common.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { SportsProvider } from "./context/SportsContext";

import { MobileBackProvider } from "./context/MobileBackContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SportsProvider>
      <MobileBackProvider>
        <App />
      </MobileBackProvider>
    </SportsProvider>
  </StrictMode>,
);
