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
};

export default function TournamentPanel({ tournamentId }: Props) {
  const [data, setData] = useState<TournamentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    getTournament(tournamentId)
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [tournamentId]);

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка: {error}</div>;
  if (!data) return null;

  if (data.datatype === 1) {
    return <TournamentMatrixTable data={data.list[0]} />;
  }

  if (data.datatype === 2) {
    return <TournamentCupTable rows={data.list} />;
  }

  if (data.datatype === 3) {
    return <TournamentPlainTextView rows={data.list} />;
  }

  return <div>Неизвестный тип данных</div>;
}