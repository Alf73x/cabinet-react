import "./Tournament.css";
import { Fragment, useState } from "react";
import Tooltip from "@mui/material/Tooltip";
import type {
  TournamentMatrix,
  TournamentPoints,
} from "../api/tournamentService";
import {
  getScoreBackground,
  getScoreBackgroundClass,
} from "../utils/scoreColor";
import { reverseScore, compactScore } from "../utils/score";
import { stageIndexToText } from "../utils/cupstages";
import { placeToText } from "../utils/place";
import { getRoundStandingColor } from "../utils/resultIndex";
import {
  getSportTableIndexColor,
  tableResultToText,
} from "../utils/resultIndex";

type Props = {
  data: TournamentMatrix;
  roundStandings?: string;
  tableFormat: number;
  resultOf: number;
  points: TournamentPoints;
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

const COL_PLACE = 40;
const COL_STAGE = 115;
const COL_TEAM = 180;
const COL_RESULT = 64;
const COL_ROUND = 28;
const COL_STAT = 40;

const MOBILE_COL_PLACE = 34;
const MOBILE_COL_TEAM = 130;
const MOBILE_COL_RESULT = 56;

function parseRoundStandings(value?: string) {
  if (!value) {
    return {
      rounds: [] as number[],
      placesByTeamId: new Map<number, number[]>(),
    };
  }

  const rows = value
    .split(";")
    .map((row) => row.trim())
    .filter(Boolean);

  const rounds = rows[0].split(",").map(Number).slice(1);

  const placesByTeamId = new Map<number, number[]>();

  for (const row of rows.slice(1)) {
    const values = row.split(",").map(Number);
    placesByTeamId.set(values[0], values.slice(1));
  }

  return { rounds, placesByTeamId };
}

export default function TournamentMatrixTable({
  data,
  roundStandings,
  tableFormat,
  resultOf,
  points,
  onTeamClick,
}: Props) {
  const teams = data?.teams ?? [];
  const matches = data?.matches ?? [];

  const showAwayMatches = data.showAwayMatches ?? true;

  const viewMode = data.viewMode ?? "full";

  const showRoundStandings = viewMode === "table2score";

  const { rounds, placesByTeamId } = parseRoundStandings(roundStandings);

  const showResults =
    !showRoundStandings &&
    viewMode !== "table1" &&
    ((data as any).showResults ?? true);

  const showHomeStats =
    viewMode === "full" && ((data as any).showHomeStats ?? true);

  const showAwayStats =
    viewMode === "full" && ((data as any).showAwayStats ?? true);

  const showWinsOt = tableFormat === 5;
  const showDraws = points.draw !== 0;
  const showLossesOt = tableFormat === 5;

  const showStage = resultOf > 0;

  const [openTooltip, setOpenTooltip] = useState<string | null>(null);

  const [hoverCell, setHoverCell] = useState<{
    rowId: number;
    colId: number;
  } | null>(null);

  const isMobile = window.innerWidth <= 700;

  const colPlace = isMobile ? MOBILE_COL_PLACE : COL_PLACE;

  const colTeam = isMobile ? MOBILE_COL_TEAM : COL_TEAM;

  const colResult = isMobile ? MOBILE_COL_RESULT : COL_RESULT;

  const teamsById = new Map(teams.map((t) => [t.id, t.name]));

  const statFields = BASE_STAT_FIELDS.filter((x) => {
    if (x.field === "points" && resultOf > 0) return false;
    if (x.field === "otWins") return showWinsOt;
    if (x.field === "draws") return showDraws;
    if (x.field === "otLosses") return showLossesOt;

    return true;
  });

  const visibleColumnTeams = teams.filter((opponent) => {
    if (!showResults) {
      return false;
    }

    return matches.some((m) => {
      if (m.opponentId === opponent.id) {
        return true;
      }

      return showAwayMatches && m.teamId === opponent.id;
    });
  });

  const showResultBand = showResults && visibleColumnTeams.length > 0;

  function cx(...classes: Array<string | false | null | undefined>) {
    return classes.filter(Boolean).join(" ");
  }

  function getMatches(teamId: number, opponentId: number) {
    return matches
      .filter((m) => {
        if (m.teamId === teamId && m.opponentId === opponentId) {
          return true;
        }

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

  function renderStatHeader(section?: "home" | "away") {
    return statFields.map((item, index) => (
      <th
        key={item.field}
        className={cx(
          "col-num",
          section === "home" && "home-stat",
          index === 0 && "band-start",
          index === statFields.length - 1 && "band-end",
        )}
      >
        {item.title}
      </th>
    ));
  }

  function renderStatCells(team: any, section?: "home" | "away") {
    const source = section ? team[section] : team;

    return statFields.map((item, index) => (
      <td
        key={`${section ?? "total"}-${item.field}`}
        className={cx(
          "col-num",
          section === "home" && "home-stat",
          index === 0 && "band-start",
          index === statFields.length - 1 && "band-end",
        )}
      >
        {source?.[item.field] ?? ""}
      </td>
    ));
  }

  const fixedColumnsWidth = colPlace + (showStage ? COL_STAGE : 0) + colTeam;

  const resultColumnsWidth = showResultBand
    ? visibleColumnTeams.length * colResult
    : 0;

  const roundColumnsWidth = showRoundStandings ? rounds.length * COL_ROUND : 0;

  const statBlocksCount = 1 + (showHomeStats ? 1 : 0) + (showAwayStats ? 1 : 0);

  const statColumnsWidth = statFields.length * COL_STAT * statBlocksCount;

  const tableWidth =
    fixedColumnsWidth +
    resultColumnsWidth +
    roundColumnsWidth +
    statColumnsWidth;

  if (teams.length === 0) {
    return <div>Нет данных</div>;
  }

  return (
    <div className="table-scroll">
      <table
        className={cx("scores-table", showStage && "scores-table-with-stage")}
        style={{
          width: `${tableWidth}px`,
          minWidth: `${tableWidth}px`,
          tableLayout: "fixed",
        }}
      >
        <colgroup>
          <col
            style={{
              width: `${colPlace}px`,
            }}
          />

          {showStage && (
            <col
              style={{
                width: `${COL_STAGE}px`,
              }}
            />
          )}

          <col
            style={{
              width: `${colTeam}px`,
            }}
          />

          {showResultBand &&
            visibleColumnTeams.map((team) => (
              <col
                key={`result-col-${team.id}`}
                style={{
                  width: `${colResult}px`,
                }}
              />
            ))}

          {showRoundStandings &&
            rounds.map((round) => (
              <col
                key={`round-col-${round}`}
                style={{
                  width: `${COL_ROUND}px`,
                }}
              />
            ))}

          {statFields.map((item) => (
            <col
              key={`total-col-${item.field}`}
              style={{
                width: `${COL_STAT}px`,
              }}
            />
          ))}

          {showHomeStats &&
            statFields.map((item) => (
              <col
                key={`home-col-${item.field}`}
                style={{
                  width: `${COL_STAT}px`,
                }}
              />
            ))}

          {showAwayStats &&
            statFields.map((item) => (
              <col
                key={`away-col-${item.field}`}
                style={{
                  width: `${COL_STAT}px`,
                }}
              />
            ))}
        </colgroup>

        <thead>
          <tr>
            <th
              className="band-header sticky-team-band"
              colSpan={showStage ? 3 : 2}
            >
              Команда
            </th>

            {showResultBand && (
              <th className="band-header" colSpan={visibleColumnTeams.length}>
                Результаты
              </th>
            )}

            {showRoundStandings && rounds.length > 0 && (
              <th className="band-header" colSpan={rounds.length}>
                Потуровая таблица
              </th>
            )}

            <th className="band-header" colSpan={statFields.length}>
              Всего
            </th>

            {showHomeStats && (
              <th className="band-header home-stat" colSpan={statFields.length}>
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

            {showStage && <th className="stage-col">Стадия</th>}

            <th className="team-col sticky-col-2">Название</th>

            {showResultBand &&
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
                  <Tooltip
                    title={team.name}
                    arrow
                    placement="top"
                    disableInteractive
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

            {showRoundStandings &&
              rounds.map((round, index) => (
                <th
                  key={round}
                  className={cx(
                    "round-standing-header",
                    index === 0 && "band-start",
                    index === rounds.length - 1 && "band-end",
                  )}
                >
                  {round}
                </th>
              ))}

            {renderStatHeader()}

            {showHomeStats && renderStatHeader("home")}

            {showAwayStats && renderStatHeader("away")}
          </tr>
        </thead>

        <tbody>
          {teams.map((team) => {
            const resultIndex = team.resultIndex ?? 0;

            const resultIndex2 = team.resultIndex2 ?? 0;

            const placeColor = getSportTableIndexColor(
              resultIndex2 > 0 ? resultIndex2 : resultIndex,
              "transparent",
            );

            const placeHint = [
              resultIndex > 0 ? tableResultToText(resultIndex) : "",
              resultIndex2 > 0 ? tableResultToText(resultIndex2) : "",
            ]
              .filter(Boolean)
              .join("; ");

            const placeTooltipColor =
              placeColor === "transparent" ? "#ffffff" : placeColor;

            return (
              <Fragment key={team.id}>
                <tr>
                  <td
                    className={cx(
                      "col-num sticky-col-1",
                      hoverCell?.rowId === team.id && "matrix-highlight",
                    )}
                    style={{
                      backgroundColor:
                        placeColor === "transparent" ? "#ffffff" : placeColor,
                    }}
                  >
                    <Tooltip
                      title={placeHint}
                      arrow
                      placement="top"
                      disableHoverListener={!placeHint}
                      slotProps={{
                        tooltip: {
                          sx: {
                            bgcolor: placeTooltipColor,
                            color: "#000",
                            border: "1px solid #d0d0d0",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            fontSize: "12px",
                            lineHeight: 1.5,
                            p: "4px 8px",
                          },
                        },
                        arrow: {
                          sx: {
                            color: placeTooltipColor,
                          },
                        },
                      }}
                    >
                      <div className="place-cell-tooltip">
                        {placeToText(team.place)}
                      </div>
                    </Tooltip>
                  </td>

                  {showStage && (
                    <td className="stage-col">
                      {stageIndexToText(team.stageIndex)}
                    </td>
                  )}

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

                  {showResultBand &&
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
                          colIndex === visibleColumnTeams.length - 1 &&
                            "band-end",
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
                              const side =
                                m.teamId === team.id ? "left" : "right";

                              const tooltipId = `${team.id}-${opponent.id}-${index}`;

                              const scoreBackgroundClass =
                                getScoreBackgroundClass(m.score, side);

                              const scoreBackground = getScoreBackground(
                                m.score,
                                side,
                              );

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
                                        bgcolor: scoreBackground,
                                        color: "#000000",
                                        border: "1px solid #d0d0d0",
                                        boxShadow:
                                          "0 4px 12px rgba(0,0,0,0.15)",
                                        p: "2px 6px",
                                        fontSize: "12px",
                                        lineHeight: 1.6,
                                        minHeight: "unset",
                                      },
                                    },
                                    arrow: {
                                      sx: {
                                        color: scoreBackground,
                                      },
                                    },
                                  }}
                                >
                                  <div
                                    className={`score-cell ${scoreBackgroundClass}`}
                                    onClick={() =>
                                      setOpenTooltip(
                                        openTooltip === tooltipId
                                          ? null
                                          : tooltipId,
                                      )
                                    }
                                    onMouseLeave={() => setOpenTooltip(null)}
                                  >
                                    {visibleScore}
                                  </div>
                                </Tooltip>
                              );
                            })}
                      </td>
                    ))}

                  {showRoundStandings &&
                    rounds.map((round, index) => {
                      const teamPlaces = placesByTeamId.get(team.id);

                      const roundPlace = teamPlaces?.[index] ?? 0;

                      return (
                        <td
                          key={`${team.id}-${round}`}
                          className={cx(
                            "round-standing-cell",
                            index === 0 && "band-start",
                            index === rounds.length - 1 && "band-end",
                          )}
                          style={{
                            backgroundColor: getRoundStandingColor(roundPlace),
                          }}
                        >
                          {roundPlace === 0 ? "" : Math.abs(roundPlace)}
                        </td>
                      );
                    })}

                  {renderStatCells(team)}

                  {showHomeStats && renderStatCells(team, "home")}

                  {showAwayStats && renderStatCells(team, "away")}
                </tr>

                <tr className="matrix-team-gap" aria-hidden="true">
                  <td colSpan={100} />
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
