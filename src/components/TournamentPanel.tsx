import { useEffect, useState } from "react";
import {
  getTournament,
  type TournamentResponse,
} from "../api/tournamentService";
import TournamentMatrixTable from "./TournamentMatrixTable";
import TournamentCupTable from "./TournamentCupTable";
import TournamentPlainTextView from "./TournamentPlainTextView";

type Props = {
  tournamentId: number;
  title?: string;
};

const tournamentCache = new Map<number, TournamentResponse>();
const SHOW_AWAY_MATCHES_KEY = "tournament_show_away_matches";

export default function TournamentPanel({ tournamentId, title }: Props) {
  const [data, setData] = useState<TournamentResponse | null>(
    () => tournamentCache.get(tournamentId) ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showAwayMatches, setShowAwayMatches] = useState(() => {
    return localStorage.getItem(SHOW_AWAY_MATCHES_KEY) !== "false";
  });
  function handleShowAwayMatchesChange(value: boolean) {
    setShowAwayMatches(value);
    localStorage.setItem(SHOW_AWAY_MATCHES_KEY, String(value));
  }

  useEffect(() => {
    const cachedData = tournamentCache.get(tournamentId);

    if (cachedData) {
      setData(cachedData);
      setLoading(false);
      setError("");
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError("");

    getTournament(tournamentId)
      .then((response) => {
        if (cancelled) return;

        tournamentCache.set(tournamentId, response);
        setData(response);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [tournamentId]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!data) return null;

  if (data.datatype === 1) {
    return (
      <>
        <div className="tournament-header">
          <h2>{title || "Турнир"}</h2>

          <div className="match-switch">
            <button
              className={showAwayMatches ? "active" : ""}
              onClick={() => handleShowAwayMatchesChange(true)}
            >
              Все матчи
            </button>

            <button
              className={!showAwayMatches ? "active" : ""}
              onClick={() => handleShowAwayMatchesChange(false)}
            >
              Домашние матчи
            </button>
          </div>
        </div>

        <TournamentMatrixTable
          data={{
            ...data.list[0],
            showAwayMatches,
          }}
        />
      </>
    );
  }

  if (data.datatype === 2) {
    return <TournamentCupTable rows={data.list} />;
  }

  if (data.datatype === 3) {
    return <TournamentPlainTextView rows={data.list} />;
  }

  return <div>Неизвестный тип данных</div>;
}
