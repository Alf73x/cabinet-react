import type { TournamentPlainText } from "../api/tournamentService";

type Props = {
  rows: TournamentPlainText[];
};

export default function TournamentPlainTextView({ rows }: Props) {
  return (
    <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
      {rows.map((x) => x.plaintext).join("\n\n")}
    </pre>
  );
}