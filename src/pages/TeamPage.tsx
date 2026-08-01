import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Group,
  Panel,
  Separator,
} from "react-resizable-panels";

import { getTeam, type TeamInfo } from "../api/teamService";

import Navbar from "../components/Navbar";
import ScoresTablePanel from "../components/ScoresTablePanel";
import TeamHistoryTable, {
  type TeamHistoryItem,
} from "../components/TeamHistoryTable";

export default function TeamPage() {
  const { teamId } = useParams<{ teamId: string }>();

  const [rows, setRows] = useState<TeamHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRow, setSelectedRow] =
    useState<TeamHistoryItem | null>(null);
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
        setError(
          err instanceof Error
            ? err.message
            : "Неизвестная ошибка",
        );

        setRows([]);
        setTeamInfo(null);
      } finally {
        setLoading(false);
      }
    }

    void loadTeam();
  }, [teamId]);

  function openTournament(row: TeamHistoryItem) {
    const item = {
      type: "season",
      id: String(row.SeasonID),
    };

    localStorage.setItem(
      "active-main-item",
      JSON.stringify(item),
    );

    localStorage.setItem(
      "season-selected-item",
      String(row.SeasonID),
    );

    window.location.href = "/";
  }

  return (
    <div className="app">
      <Navbar />

      <main className="content">
        <h2>{teamInfo?.name ?? ""}</h2>

        {loading && <div>Загрузка...</div>}

        {error && (
          <div>
            Ошибка: {error}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div>Нет данных</div>
        )}

        {!loading && !error && rows.length > 0 && (
          <div style={{ flex: 1, minHeight: 0 }}>
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
                    <div className="scores-table-panel">
                      <div className="scores-header">
                        <div className="scores-header-title">
                          {selectedRow.Season}
                          {" - "}
                          {selectedRow.SeasonName}
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

                      <ScoresTablePanel
                        teamId={selectedRow.ID}
                        seasonId={selectedRow.SeasonID}
                      />
                    </div>
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
          </div>
        )}
      </main>
    </div>
  );
}