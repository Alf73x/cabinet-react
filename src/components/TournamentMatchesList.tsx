import "./Tournament.css";

import { useMemo, useState } from "react";

import type { TournamentMatrix } from "../api/tournamentService";

import { getScoreColor } from "../utils/scoreColor";

type MatchListItem = {
  teamId: number;
  opponentId: number;
  score: string;
  order: number;
  color?: string;
  tour?: number;
  date?: string;
};

type Props = {
  data: TournamentMatrix;
};

export default function TournamentMatchesList({ data }: Props) {
  const teams = data?.teams ?? [];
  const matches = (data?.matches ?? []) as MatchListItem[];

  const [team1Filter, setTeam1Filter] =
    useState<number | "all">("all");

  const [team2Filter, setTeam2Filter] =
    useState<number | "all">("all");

  const teamsById = useMemo(() => {
    return new Map(
      teams.map((team) => [team.id, team.name]),
    );
  }, [teams]);

  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) =>
      a.name.localeCompare(b.name, "ru", {
        sensitivity: "base",
      }),
    );
  }, [teams]);

  const sortedMatches = useMemo(() => {
    return [...matches]
      .filter((match) => {
        const hasTeam1 =
          team1Filter === "all" ||
          match.teamId === team1Filter ||
          match.opponentId === team1Filter;

        const hasTeam2 =
          team2Filter === "all" ||
          match.teamId === team2Filter ||
          match.opponentId === team2Filter;

        return hasTeam1 && hasTeam2;
      })
      .sort((a, b) => {
        const tourA = a.tour ?? 0;
        const tourB = b.tour ?? 0;

        if (tourA !== tourB) {
          return tourA - tourB;
        }

        return (a.date ?? "").localeCompare(
          b.date ?? "",
        );
      });
  }, [matches, team1Filter, team2Filter]);

  function formatDate(date: string) {
    const parts = date.split(".");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  if (matches.length === 0) {
    return null;
  }

  return (
    <div className="matches-list">
      <div className="matches-list-header">
        <div className="matches-filters">
          <select
            value={team1Filter}
            onChange={(event) =>
              setTeam1Filter(
                event.target.value === "all"
                  ? "all"
                  : Number(event.target.value),
              )
            }
          >
            <option value="all">
              Команда 1
            </option>

            {sortedTeams.map((team) => (
              <option
                key={team.id}
                value={team.id}
              >
                {team.name}
              </option>
            ))}
          </select>

          <select
            value={team2Filter}
            onChange={(event) =>
              setTeam2Filter(
                event.target.value === "all"
                  ? "all"
                  : Number(event.target.value),
              )
            }
          >
            <option value="all">
              Команда 2
            </option>

            {sortedTeams.map((team) => (
              <option
                key={team.id}
                value={team.id}
              >
                {team.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {sortedMatches.length === 0 && (
        <div className="matches-empty">
          Матчи по выбранным фильтрам не найдены
        </div>
      )}

      {sortedMatches.map((match, index) => {
        const teamName =
          teamsById.get(match.teamId) ??
          String(match.teamId);

        const opponentName =
          teamsById.get(match.opponentId) ??
          String(match.opponentId);

        const scoreColor =
          getScoreColor(match.score);

        return (
          <div
            key={`${match.teamId}-${match.opponentId}-${match.tour}-${index}`}
            className="match-row"
          >
            <span className="match-date">
              {formatDate(match.date ?? "")}
            </span>

            <span className="match-tour">
              {match.tour && match.tour > 0
                ? `${match.tour} тур`
                : ""}
            </span>

            <span className="match-team">
              {teamName}
            </span>

            <span
              className="match-score"
              style={{
                backgroundColor:
                  scoreColor ?? "transparent",
              }}
            >
              {match.score}
            </span>

            <span className="match-team">
              {opponentName}
            </span>
          </div>
        );
      })}
    </div>
  );
}