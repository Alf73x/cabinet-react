import { createPortal } from "react-dom";

import { type SeasonInfo, type TeamsInfo } from "../api/info";

import "./InfoDialog.css";


type InfoDialogProps = {
  open: boolean;
  title: string;
  seasonInfo: SeasonInfo | null;
  teamsInfo: TeamsInfo | null;
  onClose: () => void;
};


function formatPoints(points?: string | null): string {
  if (!points) {
    return "";
  }

  const value = points.trim();

  if (!value || value === "0,0,1,0,0") {
    return "";
  }

  const sl = value.split(",").map((x) => x.trim());

  if (sl.length === 3) {
    return `Победа ${sl[0]}, Ничья ${sl[1]}, Поражение ${sl[2]}`;
  }

  if (sl.length === 4) {
    return `Победа ${sl[0]}, Победа* ${sl[1]}, Поражение* ${sl[2]}, Поражение ${sl[3]}`;
  }

  if (sl.length === 5) {
    return `Победа ${sl[0]}, Победа* ${sl[1]}, Ничья ${sl[2]}, Поражение* ${sl[3]}, Поражение ${sl[4]}`;
  }

  return "";
}


function formatRankingDistribution(value?: string | null): string[] {
  if (!value) {
    return [];
  }

  value = value.trim();

  if (!value || value.startsWith("-")) {
    return [];
  }

  const criteria: Record<string, string> = {
    R: "Отношение забитых и пропущенных",
    D: "Разница забитых и пропущенных всего",
    W: "Победы всего",
    G: "Забито всего",
    Wa: "Победы на выезде всего",
    Ga: "Забито на выезде всего",
    Wo: "Победы в овертайме всего",
    Wx: "Победы по буллитам всего",
    F: "Меньшее количество дисциплинарных очков",

    p: "Очки в личных встречах",
    d: "Разница забитых и пропущенных в личных встречах",
    w: "Победы в личных встречах",
    g: "Забито в личных встречах",
    wa: "Победы на выезде в личных встречах",
    ga: "Забито на выезде в личных встречах",

    "+": "Прочее",
    "*": "Прочее",
  };

  const noSequenceText =
    "Без последовательного расчёта; пересчитать все значения заново после определения места одной команды";

  function formatPart(part: string): string[] {
    const result: string[] = [];
    const noSequence = part.includes(":=");

    part = part.replace(":=", "");

    const items = part
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

    result.push("1. Очки");

    items.forEach((item, index) => {
      result.push(`${index + 2}. ${criteria[item] ?? item}`);
    });

    if (noSequence) {
      result.push("");
      result.push(noSequenceText);
    }

    return result;
  }

  if (value.startsWith("2:")) {
    const parts = value.substring(2).split(";");

    const result: string[] = [];

    if (parts[0]) {
      result.push("При равенстве очков у двух команд:");
      result.push(...formatPart(parts[0].trim()));
    }

    if (parts[1]) {
      result.push("");
      result.push("При равенстве очков у трёх и более команд:");
      result.push(...formatPart(parts[1].trim()));
    }

    return result;
  }

  return formatPart(value);
}


export default function InfoDialog({
  open,
  title,
  seasonInfo,
  teamsInfo,
  onClose,
}: InfoDialogProps) {
  if (!open) {
    return null;
  }

  const points = seasonInfo
    ? formatPoints(seasonInfo.points)
    : "";

  const rankingDistribution = seasonInfo
    ? formatRankingDistribution(seasonInfo.rankingDistribution)
    : [];

  return createPortal(
    <div
      className="info-dialog-overlay"
      onClick={onClose}
    >
      <div
        className="info-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="info-dialog-header">
          <h3>{title}</h3>

          <button
            type="button"
            className="info-dialog-close"
            onClick={onClose}
            title="Закрыть"
          >
            ×
          </button>
        </div>

        <div className="info-dialog-content">
          {teamsInfo && (
            <table className="info-team-table">
              <thead>
                <tr>
                  <th>Период</th>
                  <th>Название</th>
                </tr>
              </thead>

              <tbody>
                {teamsInfo.teams.map((item, index) => (
                  <tr key={`${item.id}-${item.dateFrom}-${index}`}>
                    <td>
                      {item.dateFrom}
                      {item.dateFrom && item.dateTo && " — "}
                      {item.dateTo}
                    </td>

                    <td>{item.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {seasonInfo && (
            <div className="info-season">
              {points && (
                <div className="season-info-block">
                  <b>Очки:</b> {points}
                </div>
              )}

              {rankingDistribution.length > 0 && (
                <div className="season-info-block">
                  <b>Распределение мест:</b>

                  {rankingDistribution.map((line, index) => (
                    <div key={index}>
                      {line || "\u00A0"}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}