import type { TournamentCupMatch } from "../api/tournamentService";
import { stageIndexToText } from "../utils/cupstages";
import { getSportScoreType, ScoreType } from "../utils/score";

type Props = {
  rows: TournamentCupMatch[];
};

function formatDate(value: string) {
  if (!value || value.length !== 8) return value;
  return `${value.slice(6, 8)}.${value.slice(4, 6)}.${value.slice(0, 4)}`;
}

export default function TournamentCupTable({ rows }: Props) {
  const safeRows = rows ?? [];
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
        {safeRows.map((row, index) => {
          const scoreType = getSportScoreType(row.score);
          return (
            <tr key={index}>
              <td>{stageIndexToText(row.stageIndex)}</td>
              <td>{formatDate(row.date)}</td>

              <td
                className={
                  scoreType === ScoreType.Win ? "score-cell score-win" : ""
                }
              >
                {row.teamName1}
              </td>

              <td
                className={
                  scoreType === ScoreType.Loose ? "score-cell score-win" : ""
                }
              >
                {row.teamName2}
              </td>

              <td> {row.score} </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
