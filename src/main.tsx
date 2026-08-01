import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { SportsProvider } from "./context/SportsContext";

createRoot(
  document.getElementById("root")!,
).render(
  <StrictMode>
    <SportsProvider>
      <App />
    </SportsProvider>
  </StrictMode>,
);