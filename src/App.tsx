import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainPage from "./pages/MainPage";
import TeamPage from "./pages/TeamPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/team/:teamId" element={<TeamPage />} />
      </Routes>
    </BrowserRouter>
  );
}