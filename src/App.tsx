import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MainPage from "./pages/MainPage";
import OpponentComparisonPage from "./pages/OpponentComparisonPage";
import TeamPage from "./pages/TeamPage";
import SummaryTablesPage from "./pages/SummaryTablesPage";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<HomePage />} />        
        
        <Route path="/" element={<MainPage />} />

        <Route
          path="/opponent-comparison"
          element={<OpponentComparisonPage />}
        />

        <Route path="/summary-tables" element={<SummaryTablesPage />} />

        <Route path="/team/:teamId" element={<TeamPage />} />
      </Routes>
    </BrowserRouter>
  );
}
