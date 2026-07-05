import "./Tournament.css";
import type { TournamentMatrix } from "../api/tournamentService";

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

  const teamsById = new Map(teams.map((t) => [t.id, t.name]));

  const sortedMatches = [...matches].sort((a, b) => {
    const tourA = a.tour ?? 0;
    const tourB = b.tour ?? 0;

    if (tourA !== tourB) return tourA - tourB;

    return (a.date ?? "").localeCompare(b.date ?? "");
  });

  function formatDate(date: string) {
    // "2012.10.17" -> "17.10.2012"
    const parts = date.split(".");
    if (parts.length !== 3) return date;

    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  return (
    <div className="matches-list">
      <h3>Матчи</h3>

      {sortedMatches.map((m, index) => {
        const teamName = teamsById.get(m.teamId) ?? String(m.teamId);
        const opponentName =
          teamsById.get(m.opponentId) ?? String(m.opponentId);

        return (
          <div
            key={`${m.teamId}-${m.opponentId}-${m.tour}-${index}`}
            className="match-row"
          >
            <span className="match-date">{formatDate(m.date ?? "")}</span>
            <span className="match-tour">{m.tour ?? ""} тур</span>

            <span className="match-team">{teamName}</span>

            <span
              className="match-score"
              style={{ backgroundColor: m.color ?? "transparent" }}
            >
              {m.score}
            </span>

            <span className="match-team">{opponentName}</span>
          </div>
        );
      })}
    </div>
  );
}
