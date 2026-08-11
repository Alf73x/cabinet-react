import type { TournamentCupMatch } from "../api/tournamentService";
import { stageIndexToText } from "../utils/cupstages";

type Props = {
  rows: TournamentCupMatch[];
};

function formatDate(value: string) {
  if (!value || value.length !== 8) return value;

  return `${value.slice(6, 8)}.${value.slice(4, 6)}.${value.slice(0, 4)}`;
}

function getWinnerSide(score: string): "left" | "right" | null {
  const cleanScore = score.trim();

  if (cleanScore === "+:-") return "left";
  if (cleanScore === "-:+") return "right";

  const matches = [...cleanScore.matchAll(/(\d+)\s*:\s*(\d+)/g)];

  if (matches.length === 0) {
    return null;
  }

  // Используем последний счёт:
  // 1:1 (пен. 5:3) -> 5:3
  const last = matches[matches.length - 1];

  const left = Number(last[1]);
  const right = Number(last[2]);

  if (left > right) return "left";
  if (left < right) return "right";

  return null;
}

export default function TournamentCupTable({ rows }: Props) {
  const safeRows = rows ?? [];

  return (
    <table className="scores-table cup-table">
      <thead>
        <tr>
          <th>Стадия</th>
          <th>Дата</th>
          <th className="cup-team-cell">Команда 1</th>
          <th className="cup-team-cell">Команда 2</th>
          <th>Счёт</th>
        </tr>
      </thead>

      <tbody>
        {safeRows.map((row, index) => {
          const winnerSide = getWinnerSide(row.score);

          return (
            <tr key={index}>
              <td>{stageIndexToText(row.stageIndex)}</td>
              <td>{formatDate(row.date)}</td>

              <td
                className="cup-team-cell"
                style={{
                  backgroundColor:
                    winnerSide === "left" ? "var(--score-win-bg)" : undefined,
                }}
              >
                {row.teamName1}
              </td>

              <td
                className="cup-team-cell"
                style={{
                  backgroundColor:
                    winnerSide === "right" ? "var(--score-win-bg)" : undefined,
                }}
              >
                {row.teamName2}
              </td>

              <td>{row.score}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
