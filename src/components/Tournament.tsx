import { useEffect, useState } from "react";
import {
  getTournament,
  type TournamentResponse,
} from "../api/tournamentService";
import TournamentMatrixTable from "./TournamentMatrixTable";
import TournamentCupTable from "./TournamentCupTable";
import TournamentPlainTextView from "./TournamentPlainTextView";
import TournamentMatchesList from "./TournamentMatchesList";
import LoadingPanel from "./LoadingPanel";
import BackButton from "./BackButton";
import InfoButton from "./InfoButton";
import {INFO_TYPE_SEASON} from "../api/info.ts";


type Props = {
  tournamentId: number;
  title?: string;
  selectedTeamId?: number;
  onBack?: () => void;
  onTeamClick?: (team: { teamId: number; teamName: string }) => void;
};

const tournamentCache = new Map<number, TournamentResponse>();
const VIEW_MODE_KEY = "tournament_view_mode";
const SHOW_AWAY_MATCHES_KEY = "tournament_show_away_matches";

type ExtraTextProps = {
  infoText?: string;
  commentText?: string;
};

function TournamentExtraText({ infoText, commentText }: ExtraTextProps) {
  const hasInfo = !!infoText?.trim();
  const hasComment = !!commentText?.trim();

  if (!hasInfo && !hasComment) {
    return null;
  }

  return (
    <div className="tournament-extra-texts">
      {hasInfo && (
        <div className="tournament-extra-text">
          <div className="tournament-extra-content">{infoText}</div>
        </div>
      )}

      {hasComment && (
        <div className="tournament-extra-text">
          <div className="tournament-extra-content tournament-comment">
            <span className="tournament-comment-icon">⚠</span>
            <span>{commentText}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Tournament({
  tournamentId,
  title,
  selectedTeamId,
  onBack,
  onTeamClick,
}: Props) {
  const [data, setData] = useState<TournamentResponse | null>(
    () => tournamentCache.get(tournamentId) ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem(VIEW_MODE_KEY) ?? "full";
  });

  const [showAwayMatches, setShowAwayMatches] = useState(() => {
    return localStorage.getItem(SHOW_AWAY_MATCHES_KEY) !== "false";
  });

  const [viewMenuOpen, setViewMenuOpen] = useState(false);

  function handleViewModeChange(value: string) {
    setViewMode(value);
    localStorage.setItem(VIEW_MODE_KEY, value);
    setViewMenuOpen(false);
  }

  function handleShowAwayMatchesChange(value: boolean) {
    setShowAwayMatches(value);
    localStorage.setItem(SHOW_AWAY_MATCHES_KEY, String(value));
    setViewMenuOpen(false);
  }

  function getViewModeText() {
    switch (viewMode) {
      case "short":
        return "Сокращенный вид";
      case "table2score":
        return "Потуровая таблица";
      case "table1":
        return "Таблица, стиль 1";
      case "full":
      default:
        return "Полный вид";
    }
  }

  function renderTournamentHeader() {
    return (
      <div className="tournament-header">
        <div className="tournament-title-row">
          {onBack && <BackButton className="mobile-only" onClick={onBack} />}

          <h2>{title || "Турнир"}</h2>

          <InfoButton idType={INFO_TYPE_SEASON} id={tournamentId} />
        </div>
      </div>
    );
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

  if (loading) {
    return <LoadingPanel />;
  }
  if (error) return <div>Ошибка: {error}</div>;
  if (!data) return null;

  if (data.datatype === 1) {
    const showViewPopup = data.resultOf === -1;

    return (
      <>
        <div className="tournament-header">
          <div className="tournament-title-row">
            {onBack && <BackButton className="mobile-only" onClick={onBack} />}

            <h2>{title || "Турнир"}</h2>

            <InfoButton idType={INFO_TYPE_SEASON} id={tournamentId} />
          </div>

          {showViewPopup && (
            <div className="view-popup">
              <button
                className="view-popup-button"
                onClick={() => setViewMenuOpen((x) => !x)}
              >
                {getViewModeText()} /{" "}
                {showAwayMatches ? "Все матчи" : "Домашние"} ▾
              </button>

              {viewMenuOpen && (
                <div className="view-popup-menu">
                  <button onClick={() => handleViewModeChange("full")}>
                    {viewMode === "full" ? "✓ " : ""}Полный вид
                  </button>

                  <button onClick={() => handleViewModeChange("short")}>
                    {viewMode === "short" ? "✓ " : ""}Сокращенный вид
                  </button>

                  <button onClick={() => handleViewModeChange("table2score")}>
                    {viewMode === "table2score" ? "✓ " : ""}
                    Потуровая таблица
                  </button>

                  <button onClick={() => handleViewModeChange("table1")}>
                    {viewMode === "table1" ? "✓ " : ""}Таблица, стиль 1
                  </button>

                  <div className="view-popup-separator" />

                  <button onClick={() => handleShowAwayMatchesChange(true)}>
                    {showAwayMatches ? "✓ " : ""}Все матчи
                  </button>

                  <button onClick={() => handleShowAwayMatchesChange(false)}>
                    {!showAwayMatches ? "✓ " : ""}Домашние матчи
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="matrix-wrapper">
          <TournamentMatrixTable
            data={{
              ...data.list[0],
              viewMode,
              showAwayMatches,
            }}
            roundStandings={data.roundStandings}
            tableFormat={data.tableFormat}
            resultOf={data.resultOf}
            points={data.points}
            onTeamClick={onTeamClick}
          />
        </div>

        <TournamentExtraText
          infoText={data.infoText}
          commentText={data.commentText}
        />

        <div className="matches-wrapper">
          <TournamentMatchesList
            data={{
              ...data.list[0],
              showAwayMatches,
            }}
          />
        </div>
      </>
    );
  }

  if (data.datatype === 2) {
    return (
      <>
        {renderTournamentHeader()}

        <div className="cup-scroll-wrapper">
          <TournamentCupTable
            rows={data.list}
            selectedTeamId={selectedTeamId}
          />
        </div>

        <TournamentExtraText
          infoText={data.infoText}
          commentText={data.commentText}
        />
      </>
    );
  }
  if (data.datatype === 3) {
    return (
      <>
        {renderTournamentHeader()}

        <TournamentPlainTextView rows={data.list} />

        <TournamentExtraText
          infoText={data.infoText}
          commentText={data.commentText}
        />
      </>
    );
  }
  return <div>Неизвестный тип данных</div>;
}
