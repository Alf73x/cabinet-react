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
  { title: "В*", field: "otWins", optional: true },
  { title: "Н", field: "draws", optional: true },
  { title: "П*", field: "otLosses", optional: true },
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

  const statFields = BASE_STAT_FIELDS.filter((x) => {
    if (x.field === "otWins") return showWinsOt;
    if (x.field === "draws") return showDraws;
    if (x.field === "otLosses") return showLossesOt;
    return true;
  });

  const statColCount = statFields.length;

  const [openTooltip, setOpenTooltip] = useState<string | null>(null);
  const [hoverCell, setHoverCell] = useState<{
    rowId: number;
    colId: number;
  } | null>(null);

  const teamsById = new Map(teams.map((t) => [t.id, t.name]));

  const visibleColumnTeams = teams.filter((opponent) => {
    if (!showResults) return false;

    return matches.some((m) => {
      if (m.opponentId === opponent.id) return true;
      return showAwayMatches && m.teamId === opponent.id;
    });
  });

  const statBandCount = 1 + (showHomeStats ? 1 : 0) + (showAwayStats ? 1 : 0);

  const gridTemplateColumns = [
    "40px",
    "180px",
    showResults ? `repeat(${visibleColumnTeams.length}, 64px)` : "",
    `repeat(${statBandCount * statColCount}, 40px)`,
  ]
    .filter(Boolean)
    .join(" ");

  function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
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

  function stat(team: any, name: string) {
    if (team[name] !== undefined && team[name] !== null) return team[name];
    return "";
  }

  function statName(prefix: string, name: string) {
    if (!prefix) return name;
    return prefix + name.charAt(0).toUpperCase() + name.slice(1);
  }

  function renderStatHeader(prefix: string) {
    return statFields.map((item, index) => (
      <div
        key={`${prefix}-${item.field}`}
        className={cx(
          "matrix-cell matrix-header-cell col-num",
          index === 0 && "band-start",
          index === statFields.length - 1 && "band-end",
        )}
      >
        {item.title}
      </div>
    ));
  }

  function renderStatCells(team: any, prefix: string) {
    return statFields.map((item, index) => (
      <div
        key={`${prefix}-${item.field}`}
        className={cx(
          "matrix-cell col-num",
          index === 0 && "band-start",
          index === statFields.length - 1 && "band-end",
        )}
      >
        {stat(team, statName(prefix, item.field))}
      </div>
    ));
  }

  if (teams.length === 0) {
    return <div>Нет данных</div>;
  }

  return (
    <div className="table-scroll">
      <div className="matrix-grid" style={{ gridTemplateColumns }}>
        <div className="matrix-row matrix-band-row">
          <div
            className="matrix-cell band-header sticky-team-band"
            style={{ gridColumn: "span 2" }}
          >
            Команда
          </div>

          {showResults && (
            <div
              className="matrix-cell band-header"
              style={{ gridColumn: `span ${visibleColumnTeams.length}` }}
            >
              Результаты
            </div>
          )}

          <div
            className="matrix-cell band-header"
            style={{ gridColumn: `span ${statColCount}` }}
          >
            Всего
          </div>

          {showHomeStats && (
            <div
              className="matrix-cell band-header"
              style={{ gridColumn: `span ${statColCount}` }}
            >
              Дома
            </div>
          )}

          {showAwayStats && (
            <div
              className="matrix-cell band-header"
              style={{ gridColumn: `span ${statColCount}` }}
            >
              На выезде
            </div>
          )}
        </div>

        <div className="matrix-row matrix-header-row">
          <div className="matrix-cell matrix-header-cell col-num sticky-col-1">
            М
          </div>

          <div className="matrix-cell matrix-header-cell team-col sticky-col-2">
            Название
          </div>

          {showResults &&
            visibleColumnTeams.map((team, index) => (
              <div
                key={team.id}
                className={cx(
                  "matrix-cell matrix-header-cell result-col",
                  hoverCell?.colId === team.id && "matrix-highlight",
                  index === 0 && "band-start",
                  index === visibleColumnTeams.length - 1 && "band-end",
                )}
              >
                <Tooltip title={team.name} arrow placement="top" disableInteractive>
                  <span style={{ cursor: "default" }}>{team.place}</span>
                </Tooltip>
              </div>
            ))}

          {renderStatHeader("total")}
          {showHomeStats && renderStatHeader("home")}
          {showAwayStats && renderStatHeader("away")}
        </div>

        {teams.map((team) => (
          <div key={team.id} className="matrix-row matrix-body-row">
            <div
              className={cx(
                "matrix-cell col-num sticky-col-1",
                hoverCell?.rowId === team.id && "matrix-highlight",
              )}
            >
              {team.place}
            </div>

            <div
              className={cx(
                "matrix-cell team-col sticky-col-2",
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
            </div>

            {showResults &&
              visibleColumnTeams.map((opponent, colIndex) => (
                <div
                  key={opponent.id}
                  className={cx(
                    "matrix-cell result-col",
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
                              className="score-cell"
                              onClick={() =>
                                setOpenTooltip(
                                  openTooltip === tooltipId ? null : tooltipId,
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
                </div>
              ))}

            {renderStatCells(team, "")}
            {showHomeStats && renderStatCells(team, "home")}
            {showAwayStats && renderStatCells(team, "away")}
          </div>
        ))}
      </div>
    </div>
  );
}