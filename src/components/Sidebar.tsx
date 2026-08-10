import "./Sidebar.css";
import { useEffect, useRef, useState } from "react";
import {
  getSeasonNames,
  getSeasons,
  getSeasonRootId,
  type SeasonItem,
} from "../api/seasonService";
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

  seasonNames: string[];
  setSeasonNames: React.Dispatch<React.SetStateAction<string[]>>;

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
  seasonNames,
  setSeasonNames,
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

  const [loadedSeasonNames, setLoadedSeasonNames] = useState<Set<string>>(
    new Set(),
  );

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

    const item = seasons.find((x) => x.id.toString() === id);

    if (item) {
      // Для восстановления после F5 достаточно знать сезон выбранного турнира
      localStorage.setItem("season-selected-parent", item.season);
    }

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

        const data = await getSeasonNames(selectedSports); // Загружаем только список сезонов

        setSeasonNames(data);
        setSeasons([]); // Турниры пока не загружаем
        setSeasonsLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Ошибка загрузки");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [
    view,
    seasonsLoaded,
    selectedSports,
    setSeasonNames,
    setSeasons,
    setSeasonsLoaded,
  ]);

  const selectedSportsKey = [...selectedSports].sort((a, b) => a - b).join(",");

  const previousSportsKey = useRef(selectedSportsKey);

  useEffect(() => {
    if (previousSportsKey.current === selectedSportsKey) {
      return;
    }

    previousSportsKey.current = selectedSportsKey;

    setLoadedSeasonNames(new Set()); // Сезоны для нового набора спортов ещё не загружены
    setSeasons([]); // Удаляем турниры старого набора спортов
    setSeasonsLoaded(false);
  }, [selectedSportsKey, setSeasons, setSeasonsLoaded]);

  async function loadSeason(season: string) {
    // Если этот сезон уже загружен — повторный запрос не нужен
    if (loadedSeasonNames.has(season)) {
      return;
    }

    try {
      setError("");

      const data = await getSeasons(selectedSports, season); // Загружаем только выбранный сезон

      setSeasons((prev) => [
        ...prev.filter((item) => item.season !== season), // Убираем старые данные этого сезона
        ...data, // Добавляем загруженный сезон
      ]);

      setLoadedSeasonNames((prev) => {
        const next = new Set(prev);
        next.add(season); // Запоминаем, что сезон уже загружен
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки сезона");
    }
  }

  useEffect(() => {
    if (!seasonsLoaded) {
      return; // Сначала должен загрузиться список названий сезонов
    }

    for (const id of seasonExpandedItems) {
      if (!id.startsWith("season-")) {
        continue; // Нас интересуют только корневые узлы сезонов
      }

      const season = id.substring("season-".length);

      if (!seasonNames.includes(season)) {
        continue; // Такого сезона нет для текущего выбранного спорта
      }

      if (!loadedSeasonNames.has(season)) {
        void loadSeason(season); // Загружаем турниры сохранённого раскрытого сезона
      }
    }
  }, [seasonsLoaded, seasonNames, seasonExpandedItems]);

  async function handleSeasonNodeClick(season: string) {
    // Если сезон ещё не загружен — сначала загружаем его
    if (!loadedSeasonNames.has(season)) {
      await loadSeason(season);
    }

    // Раскрываем сезон
    const seasonId = `season-${season}`;

    if (!seasonExpandedItems.includes(seasonId)) {
      setSeasonExpandedItems([...seasonExpandedItems, seasonId]);
    }
  }

  function getSeasonExpandedPath(selectedId: string): string[] {
    const selected = seasons.find((x) => x.id.toString() === selectedId);

    if (!selected) {
      return [];
    }

    const path: string[] = [`season-${selected.season}`];

    let current = selected;

    while (true) {
      const rootId = getSeasonRootId(current.options_1);

      if (rootId === null) {
        break;
      }

      const parent = seasons.find((x) => x.id === rootId);

      if (!parent) {
        break;
      }

      // Вставляем родителя после узла сезона,
      // сохраняя порядок от верхнего уровня к нижнему
      path.splice(1, 0, parent.id.toString());

      current = parent;
    }

    return path;
  }

  useEffect(() => {
    if (!seasonSelectedItem) {
      return;
    }

    // После F5 сначала загружается только выбранный сезон.
    // Пока выбранного турнира в seasons нет — путь построить невозможно.
    const selected = seasons.find(
      (x) => x.id.toString() === seasonSelectedItem,
    );

    if (!selected) {
      return;
    }

    // Теперь весь сезон загружен, поэтому можно восстановить
    // всю цепочку Root=XYZ любой глубины.
    const path = getSeasonExpandedPath(seasonSelectedItem);

    if (path.length === 0) {
      return;
    }

    setSeasonExpandedItems((prev) => {
      const next = new Set(prev);

      path.forEach((id) => next.add(id));

      return Array.from(next);
    });
  }, [seasons, seasonSelectedItem, setSeasonExpandedItems]);

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
              seasonNames={seasonNames}
              sports={sports}
              selectedSports={selectedSports}
              filterText={seasonFilter}
              expandedItems={seasonExpandedItems}
              selectedItem={seasonSelectedItem}
              onExpandedItemsChange={(ids) => {
                setSeasonExpandedItems(ids);

                // Ищем вновь раскрытые узлы сезонов
                for (const id of ids) {
                  if (!id.startsWith("season-")) {
                    continue;
                  }

                  const season = id.substring("season-".length);

                  if (!loadedSeasonNames.has(season)) {
                    void loadSeason(season);
                  }
                }
              }}
              onSelectedItemChange={setSeasonSelectedItem}
              onItemClick={handleSeasonClick}
              onSeasonClick={handleSeasonNodeClick}
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
