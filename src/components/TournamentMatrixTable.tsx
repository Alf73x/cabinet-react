import "./Tournament.css";
import { useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import type { TournamentMatrix } from "../api/tournamentService";
import { getScoreColor } from "../utils/scoreColor";
import { reverseScore, compactScore } from "../utils/score";

type Props = {
  data: TournamentMatrix;
  onTeamClick?: (team: { teamId: number; teamName: string }) => void;
};

export default function TournamentMatrixTable({ data, onTeamClick }: Props) {
  const teams = data?.teams ?? [];
  const matches = data?.matches ?? [];
  const showAwayMatches = data.showAwayMatches ?? true;
  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const [hoverCell, setHoverCell] = useState<{
    rowId: number;
    colId: number;
  } | null>(null);

  const teamsById = new Map(teams.map((t) => [t.id, t.name]));

  function getMatches(teamId: number, opponentId: number) {
    return matches
      .filter((m) => {
        if (m.teamId === teamId && m.opponentId === opponentId) return true;

        return (
          showAwayMatches && m.teamId === opponentId && m.opponentId === teamId
        );
      })
      .sort((a, b) => a.order - b.order);
  }

  function getMatchHint(m: any) {
    const teamName = teamsById.get(m.teamId) ?? "";
    const opponentName = teamsById.get(m.opponentId) ?? "";

    return (
      <div className="match-tooltip">
        <div>{m.date}</div>
        <div>
          {teamName} - {opponentName}
        </div>
        <div>{m.score}</div>
      </div>
    );
  }

  if (teams.length === 0) {
    return <div>Нет данных</div>;
  }

  return (
    <div className="table-scroll">
      <table className="scores-table">
        <thead>
          <tr>
            <th className="col-num">М</th>
            <th className="team-col">Команда</th>

            {teams.map((team) => (
              <th
                key={team.id}
                className={
                  hoverCell?.colId === team.id ? "matrix-highlight" : ""
                }
                style={{ textAlign: "center" }}
              >
                <Tooltip
                  title={team.name}
                  arrow
                  placement="top"
                  disableInteractive
                  slotProps={{
                    tooltip: {
                      sx: {
                        bgcolor: "#ffffff",
                        color: "#000000",
                        border: "1px solid #d0d0d0",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                        fontSize: "12px",
                        p: "2px 6px",
                      },
                    },
                    arrow: {
                      sx: {
                        color: "#ffffff",
                      },
                    },
                  }}
                >
                  <span
                    style={{
                      cursor: "default",
                    }}
                  >
                    {team.place}
                  </span>
                </Tooltip>
              </th>
            ))}

            <th className="col-num">И</th>
            <th className="col-num">О</th>
          </tr>
        </thead>

        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td
                className={`col-num ${
                  hoverCell?.rowId === team.id ? "matrix-highlight" : ""
                }`}
              >
                {team.place}
              </td>
              <td
                className={`team-col ${
                  hoverCell?.rowId === team.id ? "matrix-highlight" : ""
                }`}
                onClick={() =>
                  onTeamClick?.({
                    teamId: team.id,
                    teamName: team.name,
                  })
                }
                // style={{
                //   cursor: "pointer",
                // }}
              >
                {team.name}
              </td>

              {teams.map((opponent) => (
                <td
                  key={opponent.id}
                  className={
                    hoverCell?.rowId === team.id ||
                    hoverCell?.colId === opponent.id
                      ? "matrix-highlight"
                      : ""
                  }
                  onMouseEnter={() =>
                    setHoverCell({
                      rowId: team.id,
                      colId: opponent.id,
                    })
                  }
                  onMouseLeave={() => setHoverCell(null)}
                  style={
                    team.id === opponent.id
                      ? { backgroundColor: "#f7f7f7" }
                      : undefined
                  }
                >
                  {team.id === opponent.id
                    ? null
                    : getMatches(team.id, opponent.id).map((m, index) => {
                        const side = m.teamId === team.id ? "left" : "right";
                        const tooltipId = `${team.id}-${opponent.id}-${index}`;

                        const scoreColor = getScoreColor(m.score, side);
                        const tooltipColor =
                          scoreColor === "transparent" ? "#ffffff" : scoreColor;

                        const visibleScore =
                          m.teamId === team.id
                            ? compactScore(m.score)
                            : compactScore(reverseScore(m.score));

                        return (
                          <Tooltip
                            key={tooltipId}
                            open={openTooltip === tooltipId}
                            onClose={() => setOpenTooltip(null)}
                            disableHoverListener
                            disableFocusListener
                            disableTouchListener
                            title={getMatchHint(m)}
                            arrow
                            placement="top"
                            slotProps={{
                              tooltip: {
                                sx: {
                                  bgcolor: tooltipColor,
                                  color: "#000000",
                                  border: "1px solid #d0d0d0",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                  p: "2px 6px",
                                  fontSize: "12px",
                                  lineHeight: 1.6,
                                  minHeight: "unset",
                                },
                              },
                              arrow: {
                                sx: {
                                  color: tooltipColor,
                                },
                              },
                            }}
                          >
                            <div
                              onClick={() =>
                                setOpenTooltip(
                                  openTooltip === tooltipId ? null : tooltipId,
                                )
                              }
                              onMouseLeave={() => setOpenTooltip(null)}
                              style={{
                                backgroundColor: scoreColor,
                                textAlign: "center",
                                cursor: "pointer",
                              }}
                            >
                              {visibleScore}
                            </div>
                          </Tooltip>
                        );
                      })}
                </td>
              ))}

              <td className="col-num">{team.games}</td>
              <td className="col-num">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
