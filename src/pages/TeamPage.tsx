import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./TeamPage.css";
import { Group, Panel, Separator } from "react-resizable-panels";

import { getTeam, type TeamInfo } from "../api/teamService";

import Navbar from "../components/Navbar";
import ScoresTablePanel from "../components/ScoresTablePanel";
import TeamHistoryTable, {
  type TeamHistoryItem,
} from "../components/TeamHistoryTable";
import LoadingPanel from "../components/LoadingPanel";
import InfoButton from "../components/InfoButton";
import {INFO_TYPE_TEAM} from "../api/info.ts";


const MOBILE_WIDTH = 768;

export default function TeamPage() {
  const { teamId } = useParams<{ teamId: string }>();

  const [isMobile, setIsMobile] = useState(window.innerWidth <= MOBILE_WIDTH);

  const [rows, setRows] = useState<TeamHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRow, setSelectedRow] = useState<TeamHistoryItem | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);

  useEffect(() => {
    const id = Number(teamId);

    if (!teamId || !Number.isInteger(id) || id <= 0) {
      setError("Некорректный ID команды");
      setRows([]);
      setTeamInfo(null);
      return;
    }

    async function loadTeam() {
      try {
        setLoading(true);
        setError("");
        setSelectedRow(null);

        const data = await getTeam(id);

        setTeamInfo(data.team);
        setRows(data.list ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Неизвестная ошибка");

        setRows([]);
        setTeamInfo(null);
      } finally {
        setLoading(false);
      }
    }

    void loadTeam();
  }, [teamId]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_WIDTH);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function openTournament(row: TeamHistoryItem) {
    const item = {
      type: "season",
      id: String(row.SeasonID),
    };

    localStorage.setItem("active-main-item", JSON.stringify(item));

    localStorage.setItem("season-selected-item", String(row.SeasonID));

    window.location.href = "/";
  }

  function renderScores(row: TeamHistoryItem) {
    return (
      <div className="scores-table-panel">
        <div className="scores-header">
          <div className="scores-header-title">
            {row.Season} - {row.SeasonName}
          </div>

          <button
            type="button"
            className="close-scores-btn"
            onClick={() => setSelectedRow(null)}
            aria-label="Закрыть список матчей"
          >
            ✕
          </button>
        </div>

        <ScoresTablePanel teamId={row.ID} seasonId={row.SeasonID} />
      </div>
    );
  }

  function handleClose() {
    window.close();
  }

  return (
    <div className="app team-page">
      <Navbar />

      <main className="content team-page-content">
        <div className="team-page-title-row">
          <h2 className="team-page-title">{teamInfo?.name  ?? ""}</h2>
         
         <InfoButton idType={INFO_TYPE_TEAM} id={Number(teamId)} />
         
          <button
            type="button"
            className="team-page-close"
            onClick={handleClose}
            aria-label="Закрыть"
          >
            ✕
          </button>
        </div>

        {loading && <LoadingPanel />}

        {error && <div>Ошибка: {error}</div>}

        {!loading && !error && rows.length === 0 && <div>Нет данных</div>}

        {!loading && !error && rows.length > 0 && (
          <div className="team-page-body">
            {selectedRow && isMobile ? (
              <div className="mobile-scores-full">
                {renderScores(selectedRow)}
              </div>
            ) : (
              <div className="territory-tables">
                {selectedRow ? (
                  <Group orientation="horizontal">
                    <Panel defaultSize={65} minSize={30}>
                      <div className="teams-table-panel">
                        <TeamHistoryTable
                          rows={rows}
                          onRowClick={setSelectedRow}
                          onTournamentClick={openTournament}
                        />
                      </div>
                    </Panel>

                    <Separator className="resize-handle" />

                    <Panel defaultSize={35} minSize={20}>
                      {renderScores(selectedRow)}
                    </Panel>
                  </Group>
                ) : (
                  <div className="teams-table-panel">
                    <TeamHistoryTable
                      rows={rows}
                      onRowClick={setSelectedRow}
                      onTournamentClick={openTournament}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
