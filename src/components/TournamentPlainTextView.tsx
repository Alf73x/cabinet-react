import type { TournamentPlainText } from "../api/tournamentService";

type Props = {
  rows: TournamentPlainText[];
};

export default function TournamentPlainTextView({ rows }: Props) {
  return (
    <pre
      style={{
        margin: 0,
        padding: "10px",
        whiteSpace: "pre",
        overflow: "auto",
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: "12px",
        lineHeight: "14px",
      }}
    >
      {rows.map((x) => x.plainText).join("\n\n")}
    </pre>
  );
}