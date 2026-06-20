import { useEffect, useState } from "react";
import { Group, Panel, Separator } from "react-resizable-panels";
import "./App.css";
import "./styles/layout.css";
import "./styles/navbar.css";
import "./styles/sports-menu.css";
import "./styles/mobile.css";
import Sidebar from "./components/Sidebar";
import type { SeasonItem } from "./api/seasonService";
import type { MuiTreeItem } from "./components/TerritoriesTree";
import { getSports, type SportItem } from "./api/sportsService";
import TeamsTable from "./components/TeamsTable";
import { getTeams, type Team } from "./api/teamsTableService";
import ScoresTablePanel from "./components/ScoresTablePanel";
import TournamentPanel from "./components/TournamentPanel";

const MOBILE_WIDTH = 768;
const SPORTS_STORAGE_KEY = "selected-sports";
const TERRITORY_SELECTED_KEY = "territory-selected-item";
const ACTIVE_ITEM_KEY = "active-main-item";
const SEASON_SELECTED_KEY = "season-selected-item";

type SelectedItem = {
  type: "season" | "territory";
  id: string;
} | null;

function getSavedActiveItem(): SelectedItem {
  const saved = localStorage.getItem(ACTIVE_ITEM_KEY);

  if (saved) {
    try {
      const item = JSON.parse(saved) as SelectedItem;

      if (
        item &&
        (item.type === "season" || item.type === "territory") &&
        typeof item.id === "string"
      ) {
        return item;
      }
    } catch {
      localStorage.removeItem(ACTIVE_ITEM_KEY);
    }
  }

  const territoryId = localStorage.getItem(TERRITORY_SELECTED_KEY);

  if (territoryId) {
    return {
      type: "territory",
      id: territoryId,
    };
  }

  return null;
}

function App() {
  const [mobileMainOpen, setMobileMainOpen] = useState(false);
  const [selectedItem, setSelectedItem] =
    useState<SelectedItem>(getSavedActiveItem);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_WIDTH);

  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = Number(localStorage.getItem("sidebar-width"));
    console.log("LOAD:", saved);
    if (!saved || saved < 180 || saved > 600) {
      return 240;
    }

    return saved;
  });

  const [seasons, setSeasons] = useState<SeasonItem[]>([]);
  const [seasonsLoaded, setSeasonsLoaded] = useState(false);
  const [seasonExpandedItems, setSeasonExpandedItems] = useState<string[]>([]);
  const [seasonSelectedItem, setSeasonSelectedItem] = useState<string | null>(
    () => localStorage.getItem(SEASON_SELECTED_KEY),
  );
  const [seasonFilterText, setSeasonFilterText] = useState("");

  const [territoryItems, setTerritoryItems] = useState<MuiTreeItem[]>([]);
  const [territoryExpandedItems, setTerritoryExpandedItems] = useState<
    string[]
  >([]);
  const [territoryLoadedIds, setTerritoryLoadedIds] = useState<Set<string>>(
    new Set(),
  );
  const [territoryFilterText, setTerritoryFilterText] = useState("");
  const [territorySelectedItem, setTerritorySelectedItem] = useState<
    string | null
  >(() => {
    return localStorage.getItem(TERRITORY_SELECTED_KEY);
  });

  const [sports, setSports] = useState<SportItem[]>([]);
  const [selectedSports, setSelectedSports] = useState<number[]>(() => {
    const saved = localStorage.getItem(SPORTS_STORAGE_KEY);

    if (!saved) {
      return [];
    }

    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  });

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  const [selectedTeamRow, setSelectedTeamRow] = useState<Team | null>(null);
  useEffect(() => {
    setSelectedTeamRow(null);
  }, [territorySelectedItem]);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= MOBILE_WIDTH);
    }

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    getSports()
      .then((items) => {
        setSports(items);

        const saved = localStorage.getItem(SPORTS_STORAGE_KEY);

        if (!saved) {
          const allIds = items.map((x) => x.ID);
          setSelectedSports(allIds);
          localStorage.setItem(SPORTS_STORAGE_KEY, JSON.stringify(allIds));
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (territorySelectedItem) {
      localStorage.setItem(TERRITORY_SELECTED_KEY, territorySelectedItem);
    } else {
      localStorage.removeItem(TERRITORY_SELECTED_KEY);
    }
  }, [territorySelectedItem]);

  useEffect(() => {
    if (selectedItem) {
      localStorage.setItem(ACTIVE_ITEM_KEY, JSON.stringify(selectedItem));
    } else {
      localStorage.removeItem(ACTIVE_ITEM_KEY);
    }
  }, [selectedItem]);

  useEffect(() => {
    if (seasonSelectedItem) {
      localStorage.setItem(SEASON_SELECTED_KEY, seasonSelectedItem);
    } else {
      localStorage.removeItem(SEASON_SELECTED_KEY);
    }
  }, [seasonSelectedItem]);

  useEffect(() => {
    if (!territorySelectedItem || selectedSports.length === 0) {
      setTeams([]);
      return;
    }

    async function loadTeams(territoryId: string) {
      try {
        setTeamsLoading(true);

        const items = await getTeams(territoryId, selectedSports);
        setTeams(items);
      } catch (err) {
        console.error(err);
        setTeams([]);
      } finally {
        setTeamsLoading(false);
      }
    }

    loadTeams(territorySelectedItem);
  }, [territorySelectedItem, selectedSports]);

  const sidebar = (
    <Sidebar
      onOpenMain={() => setMobileMainOpen(true)}
      onItemSelected={setSelectedItem}
      seasonFilter={seasonFilterText}
      setSeasonFilter={setSeasonFilterText}
      territoryFilter={territoryFilterText}
      setTerritoryFilter={setTerritoryFilterText}
      seasons={seasons}
      setSeasons={setSeasons}
      seasonsLoaded={seasonsLoaded}
      setSeasonsLoaded={setSeasonsLoaded}
      seasonExpandedItems={seasonExpandedItems}
      setSeasonExpandedItems={setSeasonExpandedItems}
      seasonSelectedItem={seasonSelectedItem}
      setSeasonSelectedItem={setSeasonSelectedItem}
      territoryItems={territoryItems}
      setTerritoryItems={setTerritoryItems}
      territoryExpandedItems={territoryExpandedItems}
      setTerritoryExpandedItems={setTerritoryExpandedItems}
      territoryLoadedIds={territoryLoadedIds}
      setTerritoryLoadedIds={setTerritoryLoadedIds}
      territorySelectedItem={territorySelectedItem}
      setTerritorySelectedItem={setTerritorySelectedItem}
      selectedSports={selectedSports}
    />
  );

  function toggleSport(id: number) {
    setSelectedSports((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];

      localStorage.setItem(SPORTS_STORAGE_KEY, JSON.stringify(next));

      return next;
    });
  }

  function findTerritoryName(items: MuiTreeItem[], id: string | null): string {
    if (!id) return "";

    for (const item of items) {
      if (item.id === id) {
        return item.label;
      }

      if (item.children) {
        const found = findTerritoryName(item.children, id);
        if (found) return found;
      }
    }

    return "";
  }
  
  function findSeasonName(seasons: SeasonItem[], id: string | null): string {
    if (!id) return "";

    const season = seasons.find((x) => x.ID.toString() === id);



    return (season?.Season ?? "") + " " + (season?.Name ?? "");
  }

  const territoryTitle = findTerritoryName(
    territoryItems,
    territorySelectedItem,
  );

const seasonTitle =
  selectedItem?.type === "season"
    ? findSeasonName(seasons, selectedItem.id)
    : "";

  const mainContent = (
    <main className="content">
      <button
        className="close-main-btn"
        onClick={() => setMobileMainOpen(false)}
      >
        ← Назад
      </button>

      {!selectedItem && <h5>Главная страница</h5>}

      {selectedItem?.type === "season" && (
        <>
          <h2>{seasonTitle || "Турнир"}</h2>

          <TournamentPanel tournamentId={Number(selectedItem.id)} />
        </>
      )}
      {selectedItem?.type === "territory" && (
        <>
          <h2>{territoryTitle || "Территория"}</h2>
          {teamsLoading && <div>Загрузка...</div>}
          {!teamsLoading && teams.length === 0 && <div>Нет данных</div>}

          {!teamsLoading && teams.length > 0 && (
            <div style={{ flex: 1, minHeight: 0 }}>
              <div className="territory-tables">
                {selectedTeamRow ? (
                  <Group orientation="horizontal">
                    <Panel defaultSize={65} minSize={30}>
                      <div className="teams-table-panel">
                        <TeamsTable
                          rows={teams}
                          onRowClick={(row) => setSelectedTeamRow(row)}
                        />
                      </div>
                    </Panel>

                    <Separator className="resize-handle" />

                    <Panel defaultSize={35} minSize={20}>
                      <div className="scores-table-panel">
                        <div className="scores-header">
                          <div className="scores-header-title">
                            {selectedTeamRow.Season}
                            {" — "}
                            {selectedTeamRow.SeasonName}
                          </div>

                          <button
                            className="close-scores-btn"
                            onClick={() => setSelectedTeamRow(null)}
                          >
                            ✕
                          </button>
                        </div>
                        <ScoresTablePanel
                          teamId={selectedTeamRow.TeamID}
                          seasonId={selectedTeamRow.ID}
                        />
                      </div>
                    </Panel>
                  </Group>
                ) : (
                  <div className="teams-table-panel">
                    <TeamsTable
                      rows={teams}
                      onRowClick={(row) => setSelectedTeamRow(row)}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">Cabinet</div>

        <nav>
          <div className="sport-dropdown">
            <button className="sport-menu-button">Спорт ▾</button>

            <div className="sport-dropdown-content">
              {sports.map((sport) => (
                <label key={sport.ID} className="sport-dropdown-item">
                  <input
                    type="checkbox"
                    checked={selectedSports.includes(sport.ID)}
                    onChange={() => toggleSport(sport.ID)}
                  />
                  {sport.Name}
                </label>
              ))}
            </div>
          </div>

          <a href="/">Users</a>
          <a href="/">Settings</a>
        </nav>
      </header>

      <div className="layout">
        {isMobile ? (
          <div
            className={
              mobileMainOpen ? "mobile-pages main-open" : "mobile-pages"
            }
          >
            <div className="mobile-page">{sidebar}</div>

            <div className="mobile-page">{mainContent}</div>
          </div>
        ) : (
          <Group orientation="horizontal">
            <Panel
              id="sidebar"
              defaultSize={sidebarWidth}
              minSize={180}
              maxSize={600}
              onResize={(size) => {
                const value = size.inPixels;
                setSidebarWidth(value);
                localStorage.setItem("sidebar-width", value.toString());
              }}
            >
              {sidebar}
            </Panel>

            <Separator className="resize-handle" />

            <Panel id="main" minSize={400}>
              {mainContent}
            </Panel>
          </Group>
        )}
      </div>
    </div>
  );
}

export default App;
