export const SportResultType = {
  ScoreNormal: 0,
  ScoreOT: 1,
  ScoreB: 2,
  ScoreP: 3,
  ScoreEt: 4,
  ScoreAllExtra: 5,

  ScorePlusMinus: 10,
  ScoreMinusPlus: 11,
  ScoreMinusMinus: 12,

  ScoreWL: 14,
  ScoreLW: 15,
  ScoreDD: 16,
  ScoreQuestion: 17,
} as const;
export type SportResultType =
  (typeof SportResultType)[keyof typeof SportResultType];


export const SportKind = {
  None: 0,
  Hockey: 1,
  Football: 2,
  Minifootball: 3,
  Basketball: 4,
  Volleyball: 5,
} as const;
export type SportKind = (typeof SportKind)[keyof typeof SportKind];


export const ScoreType = {
  Win: 1,
  Loose: 2,
  WinET: 3,
  LooseET: 4,
  Draw: 5,
} as const;
export type ScoreType = (typeof ScoreType)[keyof typeof ScoreType];

export function reverseScore(score: string): string {
  if (score === "+:-") {
    return "-:+";
  }
  if (score === "-:+") {
    return "+:-";
  }

  // (\d+) Первая группа — одно или более чисел. Для: 2:3 получаем: m[1] = "2"
  // : Двоеточие.
  // (\d+) Вторая группа чисел. m[2] = "3"
  // (.*) Всё, что осталось после счёта. Например: 2:3 Б даст m[3] = " Б"

  const m = score.match(/^(\d+):(\d+)(.*)$/);

  if (!m) {
    return score;
  }

  return `${m[2]}:${m[1]}${m[3]}`;
}


export function compactScore(score: string): string {
  const upper = score.toUpperCase();

  if (
    upper.includes("ОТ") ||
    upper.includes("Б") ||
    upper.includes("П")
  ) {
    const m = score.match(/^(\d+:\d+)/);
    if (m) {
      return `${m[1]}*`;
    }
  }

  return score;
}



export type DecodedScore = {
  scored: number;
  missed: number;
  penaltyScored: number;
  penaltyMissed: number;
  resultType: SportResultType;
};

function strToIntDef(value: string, def: number): number {
  const n = Number.parseInt(value.trim(), 10);
  return Number.isNaN(n) ? def : n;
}

export function isIgnoreScore(score: string): boolean {
  const s = score.trim();

  return s === "" || s === "—" || s === "-" || s === "*";
}

export function decodeScore(
  sportKind: SportKind,
  score: string
): DecodedScore | null {
  let asScore = score.trim();

  if (isIgnoreScore(asScore)) return null;

  let penaltyScored = -1;
  let penaltyMissed = -1;

  if (asScore === "?") asScore = "?:?";
  if (asScore.indexOf(":") < 1) return null;

  if (asScore.endsWith(" *")) {
    asScore = asScore.slice(0, asScore.length - 2);
  }

  asScore = asScore.toLowerCase();

  switch (asScore) {
    case "-:-":
      return { scored: 0, missed: 0, penaltyScored, penaltyMissed, resultType: SportResultType.ScoreMinusMinus };
    case "+:-":
      return { scored: 0, missed: 0, penaltyScored, penaltyMissed, resultType: SportResultType.ScorePlusMinus };
    case "-:+":
      return { scored: 0, missed: 0, penaltyScored, penaltyMissed, resultType: SportResultType.ScoreMinusPlus };
    case "в:п":
    case "w:l":
      return { scored: 0, missed: 0, penaltyScored, penaltyMissed, resultType: SportResultType.ScoreWL };
    case "п:в":
    case "l:w":
      return { scored: 0, missed: 0, penaltyScored, penaltyMissed, resultType: SportResultType.ScoreLW };
    case "н:н":
    case "d:d":
      return { scored: 0, missed: 0, penaltyScored, penaltyMissed, resultType: SportResultType.ScoreDD };
    case "?:?":
      return { scored: 0, missed: 0, penaltyScored, penaltyMissed, resultType: SportResultType.ScoreQuestion };
  }

  const colonPos = asScore.indexOf(":");
  const s1 = asScore.slice(0, colonPos);
  const s2 = asScore.slice(colonPos + 1).toUpperCase();

  const scored = strToIntDef(s1, -1);
  if (scored === -1) return null;

  let missed = strToIntDef(s2, -1);

  if (missed !== -1) {
    return {
      scored,
      missed,
      penaltyScored,
      penaltyMissed,
      resultType: SportResultType.ScoreNormal,
    };
  }

  const penaltyMatch = s2.match(/^(\d+).*?([+-]?\d+):([+-]?\d+)/);

  if (penaltyMatch) {
    missed = strToIntDef(penaltyMatch[1], -1);
    penaltyScored = strToIntDef(penaltyMatch[2], -1);
    penaltyMissed = strToIntDef(penaltyMatch[3], -1);

    if (missed !== -1 && penaltyScored !== -1 && penaltyMissed !== -1) {
      let resultType: SportResultType;

      if (sportKind === SportKind.Hockey) {
        resultType = SportResultType.ScoreB;
      } else if (sportKind === SportKind.Football) {
        resultType = SportResultType.ScoreP;
      } else {
        resultType = SportResultType.ScoreAllExtra;
      }

      return {
        scored,
        missed,
        penaltyScored,
        penaltyMissed,
        resultType,
      };
    }
  }

  function extractMasked(
    mask: string,
    resultType: SportResultType
  ): DecodedScore | null {
    const pos = s2.indexOf(mask);

    if (pos >= 0) {
      const s = s2.slice(0, pos).trim();
      missed = strToIntDef(s, -1);

      if (missed !== -1) {
        return {
          scored,
          missed,
          penaltyScored,
          penaltyMissed,
          resultType,
        };
      }
    }

    return null;
  }

  return (
    extractMasked("Б", SportResultType.ScoreB) ??
    extractMasked("П", SportResultType.ScoreP) ??
    extractMasked("ОТ", SportResultType.ScoreOT) ??
    extractMasked("Д", SportResultType.ScoreEt) ??
    extractMasked("*", SportResultType.ScoreAllExtra) ??
    extractMasked("ET.", SportResultType.ScoreOT) ??
    extractMasked("Д.В.", SportResultType.ScoreOT)
  );
}

export function getSportScoreType(score: string): ScoreType {
  const decoded = decodeScore(SportKind.None, score);

  if (!decoded) return ScoreType.Draw;

  if (decoded.resultType === SportResultType.ScorePlusMinus) {
    return ScoreType.Win;
  }

  if (decoded.resultType === SportResultType.ScoreMinusPlus) {
    return ScoreType.Loose;
  }

  if (decoded.scored !== decoded.missed) {
    return decoded.scored > decoded.missed
      ? ScoreType.Win
      : ScoreType.Loose;
  }

  if (decoded.penaltyScored !== -1) {
    return decoded.penaltyScored > decoded.penaltyMissed
      ? ScoreType.Win
      : ScoreType.Loose;
  }

  return ScoreType.Draw;
}