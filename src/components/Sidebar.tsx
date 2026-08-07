import "./Sidebar.css";
import { useEffect, useRef, useState } from "react";
import { getSeasons, type SeasonItem } from "../api/seasonService";

import SeasonsTree from "./SeasonsTree";
import TerritoriesTree from "./TerritoriesTree";
import type { MuiTreeItem } from "./TerritoriesTree";

import type { SportItem } from "../api/sportsService";

type ViewMode = "seasons" | "tree";

type SelectedItem = {
  type: "season" | "territory";
  id: string;
};

type Props = {
  onOpenMain: () => void;
  onItemSelected: (item: SelectedItem) => void;
  seasonFilter: string;
  setSeasonFilter: React.Dispatch<React.SetStateAction<string>>;

  territoryFilter: string;
  setTerritoryFilter: React.Dispatch<React.SetStateAction<string>>;

  seasons: SeasonItem[];
  setSeasons: React.Dispatch<React.SetStateAction<SeasonItem[]>>;
  seasonsLoaded: boolean;
  setSeasonsLoaded: React.Dispatch<React.SetStateAction<boolean>>;

  seasonExpandedItems: string[];
  setSeasonExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;

  seasonSelectedItem: string | null;
  setSeasonSelectedItem: React.Dispatch<React.SetStateAction<string | null>>;

  territoryItems: MuiTreeItem[];
  setTerritoryItems: React.Dispatch<React.SetStateAction<MuiTreeItem[]>>;

  territoryExpandedItems: string[];
  setTerritoryExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;

  territoryLoadedIds: Set<string>;
  setTerritoryLoadedIds: React.Dispatch<React.SetStateAction<Set<string>>>;

  territorySelectedItem: string | null;
  setTerritorySelectedItem: React.Dispatch<React.SetStateAction<string | null>>;

  selectedSports: number[];
  sports: SportItem[];
};

function getSavedView(): ViewMode {
  const saved = localStorage.getItem("viewMode");

  return saved === "tree" || saved === "seasons" ? saved : "seasons";
}

export default function Sidebar({
  onOpenMain,
  onItemSelected,

  seasonFilter,
  setSeasonFilter,
  territoryFilter,
  setTerritoryFilter,

  seasons,
  setSeasons,
  seasonsLoaded,
  setSeasonsLoaded,

  seasonExpandedItems,
  setSeasonExpandedItems,
  seasonSelectedItem,
  setSeasonSelectedItem,

  territoryItems,
  setTerritoryItems,
  territoryExpandedItems,
  setTerritoryExpandedItems,
  territoryLoadedIds,
  setTerritoryLoadedIds,
  territorySelectedItem,
  setTerritorySelectedItem,

  selectedSports,
  sports,
}: Props) {
  const [view, setViewState] = useState<ViewMode>(getSavedView);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filterText = view === "seasons" ? seasonFilter : territoryFilter;

  function setFilterText(value: string) {
    if (view === "seasons") {
      setSeasonFilter(value);
    } else {
      setTerritoryFilter(value);
    }
  }

  function setView(value: ViewMode) {
    setViewState(value);
    localStorage.setItem("viewMode", value);
  }

  function handleSeasonClick(id: string) {
    setSeasonSelectedItem(id);

    onItemSelected({
      type: "season",
      id,
    });

    onOpenMain();
  }

  function handleTerritoryClick(id: string) {
    setTerritorySelectedItem(id);

    onItemSelected({
      type: "territory",
      id,
    });

    onOpenMain();
  }

  useEffect(() => {
    async function loadData() {
      if (view !== "seasons" || seasonsLoaded) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getSeasons(selectedSports);

        setSeasons(data);
        setSeasonsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [view, seasonsLoaded, selectedSports, setSeasons, setSeasonsLoaded]);

  const selectedSportsKey = [...selectedSports].sort((a, b) => a - b).join(",");

  const previousSportsKey = useRef(selectedSportsKey);

  useEffect(() => {
    if (previousSportsKey.current === selectedSportsKey) {
      return;
    }

    previousSportsKey.current = selectedSportsKey;
    setSeasonsLoaded(false);
  }, [selectedSportsKey, setSeasonsLoaded]);

  useEffect(() => {
    async function loadData() {
      if (view !== "seasons" || seasonsLoaded) {
        return;
      }

      try {
        setLoading(true);
        setError("");

        const sportIds = selectedSportsKey
          ? selectedSportsKey.split(",").map(Number)
          : [];

        const data = await getSeasons(sportIds);

        setSeasons(data);
        setSeasonsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [view, seasonsLoaded, selectedSportsKey, setSeasons, setSeasonsLoaded]);

  return (
    <aside className="sidebar">
      <div className="toggle">
        <button
          className={view === "seasons" ? "active" : ""}
          onClick={() => setView("seasons")}
        >
          Сезоны
        </button>

        <button
          className={view === "tree" ? "active" : ""}
          onClick={() => setView("tree")}
        >
          Территории
        </button>
      </div>

      <input
        className="tree-filter"
        type="text"
        placeholder={
          view === "seasons" ? "Фильтр турниров..." : "Фильтр территорий..."
        }
        value={filterText}
        onChange={(e) => setFilterText(e.target.value)}
      />

      {error && <div>{error}</div>}

      {loading && view === "seasons" && !seasonsLoaded && (
        <div>Загрузка...</div>
      )}

      <div className="sidebar-tree">
        <div
          style={{
            display: view === "seasons" ? "block" : "none",
            height: "100%",
          }}
        >
          {!loading && !error && (
            <SeasonsTree
              seasons={seasons}
              sports={sports}
              selectedSports={selectedSports}
              filterText={seasonFilter}
              expandedItems={seasonExpandedItems}
              selectedItem={seasonSelectedItem}
              onExpandedItemsChange={setSeasonExpandedItems}
              onSelectedItemChange={setSeasonSelectedItem}
              onItemClick={handleSeasonClick}
            />
          )}
        </div>

        <div
          style={{
            display: view === "tree" ? "block" : "none",
            height: "100%",
          }}
        >
          <TerritoriesTree
            items={territoryItems}
            filterText={territoryFilter}
            loading={
              territoryItems.length === 0 && !territoryLoadedIds.has("0")
            }
            setItems={setTerritoryItems}
            expandedItems={territoryExpandedItems}
            setExpandedItems={setTerritoryExpandedItems}
            loadedIds={territoryLoadedIds}
            setLoadedIds={setTerritoryLoadedIds}
            selectedItem={territorySelectedItem}
            onSelectedItemChange={setTerritorySelectedItem}
            onItemClick={handleTerritoryClick}
          />
        </div>
      </div>
    </aside>
  );
}
