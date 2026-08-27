import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import "./SummaryTablesPage.css";

import MultiSelectDropdown from "../components/MultiSelectDropdown";
import SummaryTable from "../components/SummaryTable";
import LoadingPanel from "../components/LoadingPanel";
import CloseButton from "../components/CloseButton";

import {
  fallbackSummaryCategories,
  getSummaryCategories,
  getSummaryTable,
  summaryLeagues,
  type SummaryCategory,
  type SummaryTableData,
} from "../api/summaryTablesService";

import { useSports } from "../context/SportsContext";

export default function SummaryTablesPage() {
  const navigate = useNavigate();

  const { sports, selectedSports, toggleSport } = useSports();

  function handleClose() {
    if (window.innerWidth <= 768) {
      navigate("/");
      return;
    }

    window.close();
  }

  const [categories, setCategories] = useState<SummaryCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");

  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");

  const [selectedLeagueIds, setSelectedLeagueIds] = useState<number[]>([]);

  const [summaryData, setSummaryData] = useState<SummaryTableData | null>(null);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    setSelectedLeagueIds(summaryLeagues.map((league) => league.id));
  }, []);

  async function loadCategories(): Promise<void> {
    setCategoriesLoading(true);
    setCategoriesError("");

    try {
      const loadedCategories = await getSummaryCategories();

      setCategories(loadedCategories);

      if (loadedCategories.length > 0) {
        const firstCategory = loadedCategories[0];

        setSelectedCategory(firstCategory.id === 0 ? "" : firstCategory.name);
      }
    } catch (err) {
      console.error("getSummaryCategories failed:", err);

      setCategories(fallbackSummaryCategories);
      setSelectedCategory("");
      setCategoriesError("");
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function handleStart(): Promise<void> {
    setSummaryLoading(true);
    setSummaryError("");

    try {
      if (yearFrom !== "" && yearTo !== "" && yearFrom > yearTo) {
        throw new Error("Год «От» не может быть больше года «До»");
      }

      const sportIds = Array.from(selectedSports);

      const data = await getSummaryTable(
        selectedCategory,
        selectedLeagueIds,
        yearFrom,
        yearTo,
        sportIds,
      );

      setSummaryData(data);
    } catch (err) {
      console.error("getSummaryTable failed:", err);

      setSummaryError(
        err instanceof Error
          ? err.message
          : "Не удалось загрузить сводную таблицу",
      );
    } finally {
      setSummaryLoading(false);
    }
  }

  return (
    <div className="app">
      <Navbar
        pageTitle="Сводные таблицы"
        sports={sports}
        selectedSports={selectedSports}
        onToggleSport={toggleSport}
        showTools={false}
        showUser={false}
      />

      <main className="summary-tables-page">
        <section className="summary-toolbar">
          <label className="summary-filter">
            <span>Категория</span>

            <select
              value={selectedCategory}
              disabled={categoriesLoading || categories.length === 0}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categoriesLoading && <option value="">Загрузка...</option>}

              {!categoriesLoading && categories.length === 0 && (
                <option value="">Нет категорий</option>
              )}

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id === 0 ? "" : category.name}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <div className="summary-league-close-row">
            <label className="summary-filter summary-league-filter">
              <span>Лига</span>

              <MultiSelectDropdown
                items={summaryLeagues}
                selectedIds={selectedLeagueIds}
                onChange={setSelectedLeagueIds}
                allText="Всего"
              />
            </label>

            <CloseButton desktop onClick={handleClose} />




          </div>

          <label className="summary-filter summary-year-filter">
            <span>От</span>

            <input
              type="number"
              min={1800}
              max={2200}
              value={yearFrom}
              onChange={(e) => setYearFrom(e.target.value)}
            />
          </label>

          <label className="summary-filter summary-year-filter">
            <span>До</span>

            <input
              type="number"
              min={1800}
              max={2200}
              value={yearTo}
              onChange={(e) => setYearTo(e.target.value)}
            />
          </label>

          <button
            type="button"
            className="summary-start-button"
            disabled={
              categoriesLoading || categories.length === 0 || summaryLoading
            }
            onClick={() => void handleStart()}
          >
            {summaryLoading ? (
              "Загрузка..."
            ) : (
              <>
                <span className="summary-start-icon">▶ </span>
                Старт
              </>
            )}
          </button>
        </section>

        {categoriesError && (
          <div className="summary-error">{categoriesError}</div>
        )}

        <section className="summary-results">
          {summaryLoading && (
            <LoadingPanel text="Загрузка сводной таблицы..." />
          )}

          {!summaryLoading && summaryError && (
            <div className="summary-error">{summaryError}</div>
          )}

          {!summaryLoading && !summaryError && !summaryData && (
            <div className="summary-empty">
              Выберите параметры и нажмите «Старт».
            </div>
          )}

          {!summaryLoading && !summaryError && summaryData && (
            <>
              <h3 className="summary-title">{summaryData.title}</h3>

              <SummaryTable
                rows={summaryData.rows}
                sports={sports}
                selectedSports={selectedSports}
                onTeamClick={(teamId) =>
                  window.open(
                    `/team/${teamId}`,
                    "_blank",
                    "noopener,noreferrer",
                  )
                }
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
}
