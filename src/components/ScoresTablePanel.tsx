import "./ScoresTablePanel.css";
import { useEffect, useState } from "react";
import { getScores, type ScoreRow } from "../api/scoresService";
import { getScoreColor } from "../utils/scoreColor";

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
        <thead>
          <tr>
            <th>Дата</th>
            <th>Команда 1</th>
            <th>Команда 2</th>
            <th>Счет</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.Date}-${row.TeamID1}-${row.TeamID2}-${index}`}>
              <td>{formatDate(row.Date)}</td>
              <td>{row.TeamName1}</td>
              <td>{row.TeamName2}</td>
              <td
                className="score-cell"
                style={{
                  backgroundColor: getScoreColor(
                    row.Score,
                    row.TeamID1 === teamId ? "left" : "right",
                  ),
                }}
              >
                {row.Score}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
