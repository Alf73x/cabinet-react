import { useMemo, useState } from "react";

import type { TournamentCupMatch } from "../api/tournamentService";
import { stageIndexToText } from "../utils/cupstages";
import { getScoreBackgroundClass } from "../utils/scoreColor";

type Props = {
  rows: TournamentCupMatch[];
  selectedTeamId?: number;
};

function formatDate(value: string) {
  if (!value || value.length !== 8) return value;

  return `${value.slice(6, 8)}.${value.slice(4, 6)}.${value.slice(0, 4)}`;
}

export default function TournamentCupTable({ rows }: Props) {
  const safeRows = rows ?? []; 

  const [filterTeamId, setFilterTeamId] = useState<number | null>(null);

  const teams = useMemo(() => {
    const map = new Map<number, string>();

    for (const row of safeRows) {
      map.set(row.teamId1, row.teamName1);
      map.set(row.teamId2, row.teamName2);
    }

    return Array.from(map.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "ru"));
  }, [safeRows]);

  const filteredRows = useMemo(() => {
    if (filterTeamId === null) {
      return safeRows;
    }

    return safeRows.filter(
      (row) => row.teamId1 === filterTeamId || row.teamId2 === filterTeamId,
    );
  }, [safeRows, filterTeamId]);

  return (
    <div className="cup-table-wrapper">
      <div className="cup-team-filter">
        <select
          value={filterTeamId ?? ""}
          onChange={(e) =>
            setFilterTeamId(
              e.target.value === "" ? null : Number(e.target.value),
            )
          }
        >
          <option value="">Все команды</option>

          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      <div className="cup-scroll-wrapper">
        <table className="scores-table cup-table">
          <colgroup>
            <col className="cup-col-stage" />
            <col className="cup-col-date" />
            <col className="cup-col-team" />
            <col className="cup-col-team" />
            <col className="cup-col-score" />
          </colgroup>

          <thead>
            <tr>
              <th className="cup-stage-cell">Стадия</th>
              <th className="cup-date-cell">Дата</th>
              <th className="cup-team-cell">Команда 1</th>
              <th className="cup-team-cell">Команда 2</th>
              <th className="cup-score-cell">Счёт</th>
            </tr>
          </thead>

          <tbody>
            {filteredRows.map((row, index) => {
              const side =
                filterTeamId === null
                  ? "left"
                  : row.teamId1 === filterTeamId
                    ? "left"
                    : row.teamId2 === filterTeamId
                      ? "right"
                      : null;
              return (
                <tr key={`${row.date}-${row.teamId1}-${row.teamId2}-${index}`}>
                  <td className="cup-stage-cell">
                    {stageIndexToText(row.stageIndex)}
                  </td>

                  <td className="cup-date-cell">{formatDate(row.date)}</td>

                  <td className="cup-team-cell">{row.teamName1}</td>

                  <td className="cup-team-cell">{row.teamName2}</td>

                  <td
                    className={`cup-score-cell ${
                      side ? getScoreBackgroundClass(row.score, side) : ""
                    }`}
                  >
                    {row.score}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
