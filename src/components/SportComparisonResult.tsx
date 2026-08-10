import { useEffect, useState } from "react";
import "./SportComparisonResult.css";

import {
  getComparisonMatches,
  type ComparisonMatch,
  type OpponentComparisonItem,
  type OpponentComparisonResponse,
} from "../api/opponentComparisonService";

type Props = {
  result: OpponentComparisonResponse | null;
  selectedSports: number[];
};

export default function SportComparisonResult({
  result,
  selectedSports,
}: Props) {
  const [selectedItem, setSelectedItem] =
    useState<OpponentComparisonItem | null>(null);

  const [matches, setMatches] = useState<ComparisonMatch[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState("");

  const showSportColumn = selectedSports.length > 1;

  useEffect(() => {
    setSelectedItem(null);
    setMatches([]);
    setMatchesError("");
    setMatchesLoading(false);
  }, [result]);

  if (!result) {
    return null;
  }

  const totals = result.data.totals.total;

  async function handleRowClick(item: OpponentComparisonItem): Promise<void> {
    setSelectedItem(item);
    setMatches([]);
    setMatchesError("");

    try {
      setMatchesLoading(true);

      const loadedMatches = await getComparisonMatches(
        item.team1_id,
        item.team2_id,
      );

      setMatches(loadedMatches);
    } catch (err) {
      console.error("getComparisonMatches failed:", err);

      setMatchesError(
        err instanceof Error ? err.message : "Не удалось загрузить матчи",
      );
    } finally {
      setMatchesLoading(false);
    }
  }

  function handleCloseMatches(): void {
    setSelectedItem(null);
    setMatches([]);
    setMatchesError("");
    setMatchesLoading(false);
  }

  function getScoreClass(match: ComparisonMatch, team1Id: number): string {
    const [g1, g2] = match.score.split(":").map(Number);

    const team1IsHome = match.teamId1 === team1Id;

    const scored = team1IsHome ? g1 : g2;
    const missed = team1IsHome ? g2 : g1;

    if (scored > missed) return "score-win";
    if (scored < missed) return "score-loss";
    return "score-draw";
  }

  return (
    <div
      className={
        selectedItem
          ? "comparison-result comparison-result--details-open"
          : "comparison-result"
      }
    >
      <div className="comparison-table-container">
        <table className="comparison-table">
          <colgroup>
            <col className="comparison-team-column" />
            <col className="comparison-team-column" />
            <col className="comparison-stat-column" />
            <col className="comparison-stat-column" />
            <col className="comparison-stat-column" />
            <col className="comparison-stat-column" />
            <col className="comparison-stat-column" />
            <col className="comparison-stat-column" />
            <col className="comparison-goals-column" />
          </colgroup>

          <thead>
            <tr>
              {showSportColumn && <th style={{ width: 90 }}>Спорт</th>}
              <th style={{ width: 260 }}>Команда 1</th>
              <th style={{ width: 260 }}>Команда 2</th>
              <th>И</th>
              <th>В</th>
              <th>ВО</th>
              <th>Н</th>
              <th>ПО</th>
              <th>П</th>
              <th>Мячи</th>
            </tr>
          </thead>

          <tbody>
            {result.data.list.map((item) => {
              const selected =
                selectedItem?.team1_id === item.team1_id &&
                selectedItem?.team2_id === item.team2_id;

              return (
                <tr
                  key={`${item.team1_id}-${item.team2_id}`}
                  className={selected ? "selected" : ""}
                  onClick={() => void handleRowClick(item)}
                >
                  {showSportColumn && <td>{item.sport_name}</td>}
                  <td>{item.team1}</td>
                  <td>{item.team2}</td>
                  <td>{item.total.games}</td>
                  <td>{item.total.wins}</td>
                  <td>{item.total.winsET}</td>
                  <td>{item.total.draws}</td>
                  <td>{item.total.lossesET}</td>
                  <td>{item.total.losses}</td>
                  <td>
                    {item.total.goalsFor}:{item.total.goalsAgainst}
                  </td>
                </tr>
              );
            })}

            <tr className="totals-row">
              {showSportColumn && <td />}
              <td>Итого</td>
              <td />
              <td>{totals.games}</td>
              <td>{totals.wins}</td>
              <td>{totals.winsET}</td>
              <td>{totals.draws}</td>
              <td>{totals.lossesET}</td>
              <td>{totals.losses}</td>
              <td>
                {totals.goalsFor}:{totals.goalsAgainst}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {selectedItem && (
        <aside className="comparison-matches-container">
          <div className="comparison-matches">
            <div className="comparison-matches-header">
              <h3>Матчи</h3>

              <button
                type="button"
                className="comparison-matches-close"
                onClick={handleCloseMatches}
                title="Закрыть"
              >
                ×
              </button>
            </div>

            <div className="comparison-match-teams">
              <div>{selectedItem.team1}</div>
              <div>{selectedItem.team2}</div>
            </div>

            {matchesLoading && (
              <div className="comparison-hint">Загрузка матчей...</div>
            )}

            {matchesError && (
              <div className="comparison-error">{matchesError}</div>
            )}

            {!matchesLoading && !matchesError && matches.length === 0 && (
              <div className="comparison-hint">Матчи не найдены.</div>
            )}
            {!matchesLoading && matches.length > 0 && (
              <table className="comparison-matches-table">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Команда 1</th>
                    <th>Команда 2</th>
                    <th>Счёт</th>
                  </tr>
                </thead>

                <tbody>
                  {matches.map((match, index) => (
                    <tr
                      key={`${match.teamId1}-${match.teamId2}-${match.date}-${index}`}
                    >
                      <td>{formatMatchDate(match.date)}</td>
                      <td>{match.teamName1}</td>
                      <td>{match.teamName2}</td>
                      <td
                        className={getScoreClass(match, selectedItem.team1_id)}
                      >
                        {match.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          opponent_comparison/matches?team1_id=1&team2_id=1116. (Причина: в
          заголовке CORS «Access-Control-Allow-Credentials» ожидалось «true»).
        </aside>
      )}
    </div>
  );
}

function formatMatchDate(value: string): string {
  if (!value) {
    return "";
  }

  if (/^\d{8}$/.test(value)) {
    return `${value.slice(6, 8)}.${value.slice(4, 6)}.${value.slice(0, 4)}`;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return `${value.slice(8, 10)}.${value.slice(5, 7)}.${value.slice(0, 4)}`;
  }

  return value;
}
