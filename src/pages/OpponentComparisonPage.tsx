import { useEffect, useState } from "react";

import "../styles/opponent-comparison.css";

import Navbar from "../components/Navbar";
import TeamComboBox from "../components/TeamComboBox";
import SportComparisonResult from "../components/SportComparisonResult";

import {
  getOpponentOptions,
  getComparison,
  type OpponentOption,
  type CompetitionFilter,
  type OpponentComparisonResponse,
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

  const [leagueRanks, setLeagueRanks] = useState<number[]>([]);
  const [leagueMenuOpen, setLeagueMenuOpen] = useState(false);

  const [comparisonResult, setComparisonResult] =
    useState<OpponentComparisonResponse | null>(null);

  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [comparisonError, setComparisonError] = useState("");

  useEffect(() => {
    setTeam1(null);
    setTeam2(null);

    setComparisonResult(null);
    setComparisonError("");

    if (sportsLoading) {
      return;
    }

    if (selectedSports.length === 0) {
      setOptions([]);
      setOptionsError("");
      setOptionsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadOptions(): Promise<void> {
      try {
        setOptionsLoading(true);
        setOptionsError("");

        const items = await getOpponentOptions(selectedSports);

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

  const competitionFilterOptions: Array<[CompetitionFilter, string]> = [
    ["all", "Все матчи"],
    ["cup", "Кубок"],
    ["championship", "Чемпионат"],
    ["other", "Прочее"],
  ];

  const leagueRankOptions = [1, 2, 3, 4, 5, 6];

  const leagueRanksLabel =
    leagueRanks.length === 0 ? "Все лиги" : leagueRanks.join(", ");

  const isSameOpponent =
    team1 !== null &&
    team2 !== null &&
    team1.id === team2.id &&
    team1.type === team2.type;

  const canCompare = team1 !== null && team2 !== null && !isSameOpponent;

  function handleCompetitionFilterChange(value: CompetitionFilter): void {
    setCompetitionFilter(value);
    setFilterMenuOpen(false);

    if (value !== "championship") {
      setLeagueRanks([]);
      setLeagueMenuOpen(false);
    }
  }

  function handleLeagueRankToggle(rank: number): void {
    setLeagueRanks((current) => {
      if (current.includes(rank)) {
        return current.filter((item) => item !== rank);
      }

      return [...current, rank].sort((a, b) => a - b);
    });
  }

  async function handleCompare(): Promise<void> {
    if (!team1 || !team2 || isSameOpponent) {
      return;
    }

    setFilterMenuOpen(false);
    setLeagueMenuOpen(false);

    try {
      setComparisonLoading(true);
      setComparisonError("");
      setComparisonResult(null);

      const result = await getComparison(
        team1,
        team2,
        competitionFilter,
        selectedSports,
        leagueRanks,
      );

      setComparisonResult(result);
    } catch (err) {
      console.error("Comparison failed:", err);

      setComparisonResult(null);

      setComparisonError(
        err instanceof Error ? err.message : "Не удалось выполнить сравнение",
      );
    } finally {
      setComparisonLoading(false);
    }
  }

  function handleSwapTeams(): void {
    const oldTeam1 = team1;

    setTeam1(team2);
    setTeam2(oldTeam1);
  }

  return (
    <div className="app">
      <Navbar pageTitle="Сравнение соперников" />

       <main className="opponent-comparison-page comparison-page">
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
              onClick={() => {
                setFilterMenuOpen((current) => !current);
                setLeagueMenuOpen(false);
              }}
            >
              {competitionFilterLabels[competitionFilter]}

              <span className="comparison-filter-arrow">▾</span>
            </button>

            {filterMenuOpen && (
              <div className="comparison-filter-popup">
                {competitionFilterOptions.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className="comparison-filter-item"
                    onClick={() => handleCompetitionFilterChange(value)}
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

          {competitionFilter === "championship" && (
            <div className="comparison-league-dropdown">
              <button
                type="button"
                className="comparison-league-trigger"
                onClick={() => {
                  setLeagueMenuOpen((current) => !current);
                  setFilterMenuOpen(false);
                }}
              >
                <span className="comparison-league-title">Лига:</span>

                <span className="comparison-league-value">
                  {leagueRanksLabel}
                </span>

                <span className="comparison-filter-arrow">▾</span>
              </button>

              {leagueMenuOpen && (
                <div className="comparison-league-popup">
                  <button
                    type="button"
                    className="comparison-league-item"
                    onClick={() => setLeagueRanks([])}
                  >
                    <span className="comparison-league-check">
                      {leagueRanks.length === 0 ? "✓" : ""}
                    </span>
                    Все лиги
                  </button>

                  {leagueRankOptions.map((rank) => (
                    <button
                      key={rank}
                      type="button"
                      className="comparison-league-item"
                      onClick={() => handleLeagueRankToggle(rank)}
                    >
                      <span className="comparison-league-check">
                        {leagueRanks.includes(rank) ? "✓" : ""}
                      </span>
                      Лига {rank}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            className="comparison-start-button"
            onClick={handleCompare}
            disabled={!canCompare || comparisonLoading}
          >
            <span>▶</span>

            {comparisonLoading ? "Сравнение..." : "Сравнить"}
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
          {comparisonLoading && (
            <div className="comparison-hint">Выполняется сравнение...</div>
          )}

          {comparisonError && (
            <div className="comparison-error">
              Ошибка сравнения: {comparisonError}
            </div>
          )}

          {!comparisonLoading && !comparisonError && (
            <SportComparisonResult result={comparisonResult} />
          )}
        </section>
      </main>
    </div>
  );
}
