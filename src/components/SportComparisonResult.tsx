import { useEffect, useState } from "react";
import "./SportComparisonResult.css";

import type {
  OpponentComparisonResponse,
  OpponentComparisonItem,
} from "../api/opponentComparisonService";

type Props = {
  result: OpponentComparisonResponse | null;
};

export default function SportComparisonResult({ result }: Props) {
  const [selectedItem, setSelectedItem] =
    useState<OpponentComparisonItem | null>(null);

  useEffect(() => {
    setSelectedItem(null);
  }, [result]);

  if (!result) {
    return null;
  }

  const totals = result.data.totals.total;

  function handleRowClick(item: OpponentComparisonItem): void {
    setSelectedItem(item);
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
              <th>Команда 1</th>
              <th>Команда 2</th>
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
                  onClick={() => handleRowClick(item)}
                >
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
                onClick={() => setSelectedItem(null)}
                title="Закрыть"
              >
                ×
              </button>
            </div>

            <div className="comparison-match-teams">
              <div>{selectedItem.team1}</div>
              <div>{selectedItem.team2}</div>
            </div>

            <div className="comparison-match-ids">
              <div>team1_id: {selectedItem.team1_id}</div>
              <div>team2_id: {selectedItem.team2_id}</div>
            </div>

            {/* Здесь будет загрузка и список матчей */}
          </div>
        </aside>
      )}
    </div>
  );
}