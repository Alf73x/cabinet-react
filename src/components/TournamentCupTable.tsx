import type { TournamentCupMatch } from "../api/tournamentService";
import { getScoreColor } from "../utils/scoreColor";
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
        {rows.map((row, index) => {
          const scoreType = getSportScoreType(row.score);
          const scoreColor = getScoreColor("2:1");

          return (
            <tr key={index}>
              <td>{stageIndexToText(row.stageIndex)}</td>
              <td>{formatDate(row.date)}</td>

              <td
                style={{
                  backgroundColor:
                    scoreType === ScoreType.Win ? scoreColor : undefined,
                }}
              >
                {row.teamName1}
              </td>

              <td
                style={{
                  backgroundColor:
                    scoreType === ScoreType.Loose ? scoreColor : undefined,
                }}
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
