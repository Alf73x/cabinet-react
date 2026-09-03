import { useEffect } from "react";
import AppLayout from "./components/AppLayout";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import HomePage from "./pages/HomePage";
import MainPage from "./pages/MainPage";
import OpponentComparisonPage from "./pages/OpponentComparisonPage";
import TeamPage from "./pages/TeamPage";
import SummaryTablesPage from "./pages/SummaryTablesPage";
import SourcesPage from "./pages/SourcesPage";

function CanonicalUrl() {
  const location = useLocation();

  useEffect(() => {
    const url = `https://sportcabinet.ru${location.pathname}`;

    let canonical = document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );

    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }

    canonical.href = url;

    let ogUrl = document.querySelector<HTMLMetaElement>(
      'meta[property="og:url"]',
    );

    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }

    ogUrl.content = url;
  }, [location.pathname]);

  return null;
}

function HomePageRoute() {
  const navigate = useNavigate();

  return <HomePage onClose={() => navigate("/")} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <CanonicalUrl />

      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/home" element={<HomePageRoute />} />

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
