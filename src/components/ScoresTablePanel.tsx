import "./ScoresTablePanel.css";
import { useEffect, useState } from "react";
import { getScores, type ScoreRow } from "../api/scoresService";
import { getScoreClass } from "../utils/scoreColor";

type Props = {
  teamId: number | null;
  seasonId: number | null;
};

function formatDate(value: string): string {
  if (!value || value.length !== 8) return value;

  return `${value.slice(6, 8)}.${value.slice(4, 6)}.${value.slice(0, 4)}`;
}

export default function ScoresTablePanel({ teamId, seasonId }: Props) {
  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!teamId || !seasonId) {
      setRows([]);
      return;
    }

    setLoading(true);
    setError("");

    getScores(teamId, seasonId)
      .then(setRows)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [teamId, seasonId]);

  if (!teamId) {
    return <div className="scores-table-content">Выберите команду</div>;
  }

  if (!seasonId) {
    return <div className="scores-table-content">Выберите сезон</div>;
  }

  if (loading) {
    return <div className="scores-table-content">Загрузка...</div>;
  }

  if (error) {
    return <div className="scores-table-content">Ошибка: {error}</div>;
  }

  return (
    <div className="scores-table-content">
      <table className="scores-table">
        <colgroup>
          <col className="scores-col-date" />
          <col className="scores-col-team" />
          <col className="scores-col-team" />
          <col className="scores-col-score" />
        </colgroup>

        <thead>
          <tr>
            <th className="date-cell">Дата</th>
            <th className="team-name-cell">Команда 1</th>
            <th className="team-name-cell">Команда 2</th>
            <th className="score-cell-header">Счет</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.date}-${row.teamId1}-${row.teamId2}-${index}`}>
              <td className="date-cell">{formatDate(row.date)}</td>

              <td className="team-name-cell">{row.teamName1}</td>

              <td className="team-name-cell">{row.teamName2}</td>

              <td
                className={`score-cell ${getScoreClass(
                  row.score,
                  row.teamId1 === teamId ? "left" : "right",
                )}`}
              >
                {row.score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
