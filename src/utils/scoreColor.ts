const scoreColorByResult = {
  win: "var(--score-win)",
  loss: "var(--score-loss)",
  winExtra: "var(--score-win-extra)",
  lossExtra: "var(--score-loss-extra)",
} as const;

type ScoreSide = "left" | "right";

function parseNumericScore(score: string): [number, number] | null {
  const cleanScore = score.trim().replace(/\*/g, "");
  const match = cleanScore.match(/^(\d+)\s*:\s*(\d+)$/);

  if (!match) {
    return null;
  }

  return [Number(match[1]), Number(match[2])];
}

function getLeftSideResult(score: string): "win" | "loss" | "draw" | null {
  const cleanScore = score.trim().replace(/\*/g, "");

  if (cleanScore === "+:-") return "win";
  if (cleanScore === "-:+") return "loss";
  if (cleanScore === "-:-" || cleanScore === "?:?") return null;

  const numericScore = parseNumericScore(cleanScore);

  if (!numericScore) {
    return null;
  }

  const [leftScore, rightScore] = numericScore;

  if (leftScore > rightScore) return "win";
  if (leftScore < rightScore) return "loss";

  return "draw";
}

export function getScoreColor(
  score: string,
  side: ScoreSide = "left",
): string {
  const leftResult = getLeftSideResult(score);

  if (!leftResult || leftResult === "draw") {
    return "transparent";
  }

  const result =
    side === "left"
      ? leftResult
      : leftResult === "win"
        ? "loss"
        : "win";
  const isExtraTime = score.includes("*");

  if (result === "win") {
    return isExtraTime ? scoreColorByResult.winExtra : scoreColorByResult.win;
  }

  return isExtraTime ? scoreColorByResult.lossExtra : scoreColorByResult.loss;
}

