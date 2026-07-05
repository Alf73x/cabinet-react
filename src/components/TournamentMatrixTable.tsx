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

const BASE_STAT_FIELDS = [
  { title: "И", field: "games" },
  { title: "О", field: "points" },
  { title: "В", field: "wins" },
  { title: "В*", field: "otWins" },
  { title: "Н", field: "draws" },
  { title: "П*", field: "otLosses" },
  { title: "П", field: "losses" },
  { title: "З", field: "goalsFor" },
  { title: "П", field: "goalsAgainst" },
  { title: "+/-", field: "diff" },
];

export default function TournamentMatrixTable({ data, onTeamClick }: Props) {
  const teams = data?.teams ?? [];
  const matches = data?.matches ?? [];

  const showAwayMatches = data.showAwayMatches ?? true;

  const showResults = (data as any).showResults ?? true;
  const showHomeStats = (data as any).showHomeStats ?? true;
  const showAwayStats = (data as any).showAwayStats ?? true;

  const showWinsOt = (data as any).showWinsOt ?? false;
  const showDraws = (data as any).showDraws ?? true;
  const showLossesOt = (data as any).showLossesOt ?? false;

  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const [hoverCell, setHoverCell] = useState<{
    rowId: number;
    colId: number;
  } | null>(null);

  const teamsById = new Map(teams.map((t) => [t.id, t.name]));

  const statFields = BASE_STAT_FIELDS.filter((x) => {
    if (x.field === "otWins") return showWinsOt;
    if (x.field === "draws") return showDraws;
    if (x.field === "otLosses") return showLossesOt;
    return true;
  });

  const visibleColumnTeams = teams.filter((opponent) => {
    if (!showResults) return false;

    return matches.some((m) => {
      if (m.opponentId === opponent.id) return true;
      return showAwayMatches && m.teamId === opponent.id;
    });
  });

  function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
  }

  function stat(team: any, name: string) {
    return team[name] ?? "";
  }

  function statName(prefix: string, name: string) {
    if (!prefix) return name;
    return prefix + name.charAt(0).toUpperCase() + name.slice(1);
  }

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

  function renderStatHeader() {
    return statFields.map((item, index) => (
      <th
        key={item.field}
        className={cx(
          "col-num",
          index === 0 && "band-start",
          index === statFields.length - 1 && "band-end",
        )}
      >
        {item.title}
      </th>
    ));
  }

  function renderStatCells(team: any, prefix: string) {
    return statFields.map((item, index) => (
      <td
        key={`${prefix}-${item.field}`}
        className={cx(
          "col-num",
          index === 0 && "band-start",
          index === statFields.length - 1 && "band-end",
        )}
      >
        {stat(team, statName(prefix, item.field))}
      </td>
    ));
  }

  if (teams.length === 0) {
    return <div>Нет данных</div>;
  }

  return (
    <div className="table-scroll">
      <table className="scores-table">
        <thead>
          <tr>
            <th className="band-header" colSpan={2}>
              Команда
            </th>

            {showResults && (
              <th className="band-header" colSpan={visibleColumnTeams.length}>
                Результаты
              </th>
            )}

            <th className="band-header" colSpan={statFields.length}>
              Всего
            </th>

            {showHomeStats && (
              <th className="band-header" colSpan={statFields.length}>
                Дома
              </th>
            )}

            {showAwayStats && (
              <th className="band-header" colSpan={statFields.length}>
                На выезде
              </th>
            )}
          </tr>

          <tr>
            <th className="col-num sticky-col-1">М</th>
            <th className="team-col sticky-col-2">Название</th>

            {showResults &&
              visibleColumnTeams.map((team, index) => (
                <th
                  key={team.id}
                  className={cx(
                    "result-header",
                    hoverCell?.colId === team.id && "matrix-highlight",
                    index === 0 && "band-start",
                    index === visibleColumnTeams.length - 1 && "band-end",
                  )}
                >
                  <Tooltip title={team.name} arrow placement="top" disableInteractive>
                    <span style={{ cursor: "default" }}>{team.place}</span>
                  </Tooltip>
                </th>
              ))}

            {renderStatHeader()}
            {showHomeStats && renderStatHeader()}
            {showAwayStats && renderStatHeader()}
          </tr>
        </thead>

        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td
                className={cx(
                  "col-num sticky-col-1",
                  hoverCell?.rowId === team.id && "matrix-highlight",
                )}
              >
                {team.place}
              </td>

              <td
                className={cx(
                  "team-col sticky-col-2",
                  hoverCell?.rowId === team.id && "matrix-highlight",
                )}
                onClick={() =>
                  onTeamClick?.({
                    teamId: team.id,
                    teamName: team.name,
                  })
                }
              >
                {team.name}
              </td>

              {showResults &&
                visibleColumnTeams.map((opponent, colIndex) => (
                  <td
                    key={opponent.id}
                    className={cx(
                      "result-col",
                      team.id === opponent.id && "matrix-diagonal",
                      (hoverCell?.rowId === team.id ||
                        hoverCell?.colId === opponent.id) &&
                        "matrix-highlight",
                      colIndex === 0 && "band-start",
                      colIndex === visibleColumnTeams.length - 1 && "band-end",
                    )}
                    onMouseEnter={() =>
                      setHoverCell({
                        rowId: team.id,
                        colId: opponent.id,
                      })
                    }
                    onMouseLeave={() => setHoverCell(null)}
                  >
                    {team.id === opponent.id
                      ? null
                      : getMatches(team.id, opponent.id).map((m, index) => {
                          const side = m.teamId === team.id ? "left" : "right";
                          const tooltipId = `${team.id}-${opponent.id}-${index}`;

                          const scoreColor = getScoreColor(m.score, side);
                          const tooltipColor =
                            scoreColor === "transparent"
                              ? "#ffffff"
                              : scoreColor;

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
                                className="score-cell"
                                onClick={() =>
                                  setOpenTooltip(
                                    openTooltip === tooltipId
                                      ? null
                                      : tooltipId,
                                  )
                                }
                                onMouseLeave={() => setOpenTooltip(null)}
                                style={{ backgroundColor: scoreColor }}
                              >
                                {visibleScore}
                              </div>
                            </Tooltip>
                          );
                        })}
                  </td>
                ))}

              {renderStatCells(team, "")}
              {showHomeStats && renderStatCells(team, "home")}
              {showAwayStats && renderStatCells(team, "away")}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}