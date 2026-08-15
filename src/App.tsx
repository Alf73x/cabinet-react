import AppLayout from "./components/AppLayout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import MainPage from "./pages/MainPage";
import OpponentComparisonPage from "./pages/OpponentComparisonPage";
import TeamPage from "./pages/TeamPage";
import SummaryTablesPage from "./pages/SummaryTablesPage";
import SourcesPage from "./pages/SourcesPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<HomePage />} />

          <Route path="/" element={<MainPage />} />

          <Route
            path="/opponent-comparison"
            element={<OpponentComparisonPage />}
          />

          <Route path="/summary-tables" element={<SummaryTablesPage />} />

          <Route path="/team/:teamId" element={<TeamPage />} />

          <Route path="/sources" element={<SourcesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
