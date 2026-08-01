import { useEffect, useState } from "react";

import "../styles/opponent-comparison.css";

import Navbar from "../components/Navbar";
import TeamComboBox from "../components/TeamComboBox";

import {
  getOpponentOptions,
  getComparison,
  type OpponentOption,
  type CompetitionFilter,
} from "../api/opponentComparisonService";

import { useSports } from "../context/SportsContext";

export default function OpponentComparisonPage() {
  const { selectedSports, sportsLoading } = useSports();

  const [options, setOptions] = useState<OpponentOption[]>([]);

  const [team1, setTeam1] = useState<OpponentOption | null>(null);

  const [team2, setTeam2] = useState<OpponentOption | null>(null);

  const [optionsLoading, setOptionsLoading] = useState(false);

  const [optionsError, setOptionsError] = useState("");

  const [competitionFilter, setCompetitionFilter] =
    useState<CompetitionFilter>("all");

  const [filterMenuOpen, setFilterMenuOpen] = useState(false);

  useEffect(() => {
    console.log("OpponentComparisonPage:", {
      selectedSports,
      sportsLoading,
    });

    setTeam1(null);
    setTeam2(null);

    if (sportsLoading) {
      console.log("Sports are still loading");
      return;
    }

    if (selectedSports.length === 0) {
      console.log("No selected sports");

      setOptions([]);
      setOptionsError("");
      setOptionsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadOptions() {
      try {
        setOptionsLoading(true);
        setOptionsError("");

        console.log("Calling getOpponentOptions:", selectedSports);

        const items = await getOpponentOptions(selectedSports);

        console.log("getOpponentOptions returned:", items.length, items);

        if (!cancelled) {
          setOptions(items);
        }
      } catch (err) {
        console.error("getOpponentOptions failed:", err);

        if (!cancelled) {
          setOptions([]);

          setOptionsError(
            err instanceof Error
              ? err.message
              : "Не удалось загрузить города и команды",
          );
        }
      } finally {
        if (!cancelled) {
          setOptionsLoading(false);
        }
      }
    }

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [selectedSports, sportsLoading]);

  const competitionFilterLabels: Record<CompetitionFilter, string> = {
    all: "Все матчи",
    cup: "Кубок",
    championship: "Чемпионат",
    other: "Прочее",
  };

  const isSameOpponent =
    team1 !== null &&
    team2 !== null &&
    team1.id === team2.id &&
    team1.type === team2.type;

  const canCompare = team1 !== null && team2 !== null && !isSameOpponent;

  async function handleCompare(): Promise<void> {
    if (!team1 || !team2 || isSameOpponent) {
      return;
    }

    try {
      const result = await getComparison(team1, team2, competitionFilter, selectedSports);

      console.log("Comparison result:", result);
    } catch (err) {
      console.error("Comparison failed:", err);
    }
  }
  
  const handleSwapTeams = () => {
    const oldTeam1 = team1;

    setTeam1(team2);
    setTeam2(oldTeam1);
  };

  return (
    <div className="app">
      <Navbar pageTitle="Сравнение соперников" />

      <main className="opponent-comparison-page">
        <section className="comparison-toolbar">
          <label className="comparison-field">
            <span>Соперник 1</span>

            <TeamComboBox
              items={options}
              value={team1}
              placeholder={
                optionsLoading ? "Загрузка..." : "Введите город или команду"
              }
              disabled={optionsLoading}
              onChange={setTeam1}
            />
          </label>

          <button
            type="button"
            className="comparison-swap-button"
            onClick={handleSwapTeams}
            disabled={team1 === null && team2 === null}
            title="Поменять команды местами"
          >
            ⇄
          </button>

          <label className="comparison-field">
            <span>Соперник 2</span>

            <TeamComboBox
              items={options}
              value={team2}
              placeholder={
                optionsLoading ? "Загрузка..." : "Введите город или команду"
              }
              disabled={optionsLoading}
              onChange={setTeam2}
            />
          </label>

          <div className="comparison-filter-dropdown">
            <button
              type="button"
              className="comparison-filter-trigger"
              onClick={() => setFilterMenuOpen((prev) => !prev)}
            >
              {competitionFilterLabels[competitionFilter]}

              <span className="comparison-filter-arrow">▾</span>
            </button>

            {filterMenuOpen && (
              <div className="comparison-filter-popup">
                {(
                  [
                    ["all", "Все матчи"],
                    ["cup", "Кубок"],
                    ["championship", "Чемпионат"],
                    ["other", "Прочее"],
                  ] as Array<[CompetitionFilter, string]>
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className="comparison-filter-item"
                    onClick={() => {
                      setCompetitionFilter(value);
                      setFilterMenuOpen(false);
                    }}
                  >
                    <span className="comparison-filter-check">
                      {competitionFilter === value ? "✓" : ""}
                    </span>

                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="comparison-start-button"
            onClick={handleCompare}
            disabled={!canCompare}
          >
            <span>▶</span>
            Сравнить
          </button>
        </section>

        {optionsError && (
          <div className="comparison-error">
            Ошибка загрузки: {optionsError}
          </div>
        )}

        {!optionsLoading && !optionsError && selectedSports.length === 0 && (
          <div className="comparison-hint">Не выбран ни один вид спорта.</div>
        )}

        {!optionsLoading &&
          !optionsError &&
          selectedSports.length > 0 &&
          options.length === 0 && (
            <div className="comparison-hint">Города и команды не найдены.</div>
          )}

        <section className="comparison-results">
          {/* Здесь позже будет таблица результатов. */}
        </section>
      </main>
    </div>
  );
}
