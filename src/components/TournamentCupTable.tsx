import type { TournamentCupMatch } from "../api/tournamentService";
import { getScoreColor } from "../utils/scoreColor";

type Props = {
  rows: TournamentCupMatch[];
};

function formatDate(value: string) {
  if (!value || value.length !== 8) return value;
  return `${value.slice(6, 8)}.${value.slice(4, 6)}.${value.slice(0, 4)}`;
}

export default function TournamentCupTable({ rows }: Props) {
  return (
    <table className="scores-table">
      <thead>
        <tr>
          <th>Стадия</th>
          <th>Дата</th>
          <th>Команда 1</th>
          <th>Команда 2</th>
          <th>Счёт</th>
        </tr>
      </thead>

      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            <td>{row.stage}</td>
            <td>{formatDate(row.Date)}</td>
            <td>{row.TeamName1}</td>
            <td>{row.TeamName2}</td>
            <td
              style={{
                backgroundColor: getScoreColor(row.Score),
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              {row.Score}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
