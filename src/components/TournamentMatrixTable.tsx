import "./Tournament.css";

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
    <div className="table-scroll">
      <table className="scores-table">
        <thead>
          <tr>
            <th className="col-num">М</th>
            <th className="team-col">Команда</th>
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
            <th className="col-num">И</th>
            <th className="col-num">О</th>
          </tr>
        </thead>

        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td className="col-num">{team.place}</td>
              <td className="team-col">{team.name}</td>

              {teams.map((opponent) => (
                <td
                  key={opponent.id}
                  style={
                    team.id === opponent.id
                      ? { backgroundColor: "#F7F7F7" }
                      : undefined
                  }
                >
                  {team.id === opponent.id
                    ? null
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
                          {m.teamId === team.id
                            ? compactScore(m.score)
                            : compactScore(reverseScore(m.score))}
                        </div>
                      ))}
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
