import type { TournamentMatrix } from "../api/tournamentService";
import { getScoreColor } from "../utils/scoreColor";
import { reverseScore, compactScore } from "../utils/score";

type Props = {
  data: TournamentMatrix;
};

export default function TournamentMatrixTable({ data }: Props) {
  const teams = data?.teams ?? [];
  const matches = data?.matches ?? [];
  const showAwayMatches = data.showAwayMatches ?? true;

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

  if (teams.length === 0) {
    return <div>Нет данных</div>;
  }

  return (
    <table className="scores-table">
      <thead>
        <tr>
          <th>М</th>
          <th>Команда</th>
          {teams.map((team) => (
            <th
              key={team.id}
              style={{
                textAlign: "center",
              }}
            >
              {team.place}
            </th>
          ))}
          <th>И</th>
          <th>О</th>
        </tr>
      </thead>

      <tbody>
        {teams.map((team) => (
          <tr key={team.id}>
            <td>{team.place}</td>
            <td>{team.name}</td>

            {teams.map((opponent) => (
              <td key={opponent.id}>
                {team.id === opponent.id
                  ? "—"
                  : getMatches(team.id, opponent.id).map((m, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: getScoreColor(
                            m.score,
                            m.teamId === team.id ? "left" : "right",
                          ),
                          textAlign: "center",
                        }}
                      >
                        {m.teamId === team.id ? compactScore(m.score) : compactScore(reverseScore(m.score))}
                      </div>
                    ))}
              </td>
            ))}

            <td>{team.games}</td>
            <td>{team.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
