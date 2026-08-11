const scoreClassByResult = {
  win: "score-win",
  loss: "score-loss",
  draw: "score-draw",
} as const;

type ScoreSide = "left" | "right";

function normalizeScore(score: string): string {
  return score
    .trim()
    .replace(/\*/g, "")
    .replace(/\s*[БбОо][Тт]?\s*$/g, "")
    .trim();
}

function parseNumericScore(score: string): [number, number] | null {
  const cleanScore = normalizeScore(score);
  const match = cleanScore.match(/^(\d+)\s*:\s*(\d+)$/);

  if (!match) {
    return null;
  }

  return [Number(match[1]), Number(match[2])];
}

function getLeftSideResult(
  score: string,
): "win" | "loss" | "draw" | null {
  const cleanScore = normalizeScore(score);

  if (cleanScore === "+:-") return "win";
  if (cleanScore === "-:+") return "loss";
  if (cleanScore === "-:-" || cleanScore === "?:?") return null;

  const matches = [...cleanScore.matchAll(/(\d+)\s*:\s*(\d+)/g)];

  if (matches.length === 0) {
    return null;
  }

  // Если есть дополнительный счёт:
  // 0:0 (пен. 2:4) -> используем 2:4
  // Иначе используется обычный счёт.
  const lastMatch = matches[matches.length - 1];

  const leftScore = Number(lastMatch[1]);
  const rightScore = Number(lastMatch[2]);

  if (leftScore > rightScore) return "win";
  if (leftScore < rightScore) return "loss";

  return "draw";
}

export function getScoreClass(
  score: string,
  side: ScoreSide = "left",
): string {
  const leftResult = getLeftSideResult(score);

  if (!leftResult) {
    return "";
  }

  if (leftResult === "draw") {
    return scoreClassByResult.draw;
  }

  const result =
    side === "left"
      ? leftResult
      : leftResult === "win"
        ? "loss"
        : "win";

  return scoreClassByResult[result];
}

export function getScoreBackground(
  score: string,
  side: ScoreSide = "left",
): string {
  const scoreClass = getScoreClass(score, side);

  switch (scoreClass) {
    case "score-win":
      return "var(--score-win-bg)";

    case "score-loss":
      return "var(--score-loss-bg)";

    case "score-draw":
      return "var(--score-draw-bg)";

    default:
      return "transparent";
  }
}


const scoreBgClassByResult = {
  win: "score-bg-win",
  loss: "score-bg-loss",
  draw: "score-bg-draw",
} as const;

export function getScoreBackgroundClass(
  score: string,
  side: ScoreSide = "left",
): string {
  const leftResult = getLeftSideResult(score);

  if (!leftResult) {
    return "";
  }

  if (leftResult === "draw") {
    return scoreBgClassByResult.draw;
  }

  const result =
    side === "left"
      ? leftResult
      : leftResult === "win"
        ? "loss"
        : "win";

  return scoreBgClassByResult[result];
}