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