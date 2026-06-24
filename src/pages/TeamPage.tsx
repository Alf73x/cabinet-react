import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Group, Panel, Separator } from "react-resizable-panels";
import { getTeam, type TeamInfo } from "../api/teamService";

import TeamHistoryTable, {
  type TeamHistoryItem,
} from "../components/TeamHistoryTable";
import ScoresTablePanel from "../components/ScoresTablePanel";
import Navbar from "../components/Navbar";

export default function TeamPage() {
  const { teamId } = useParams();

  const [rows, setRows] = useState<TeamHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRow, setSelectedRow] = useState<TeamHistoryItem | null>(null);
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);

  useEffect(() => {
    if (!teamId) return;

    async function loadTeam() {
      try {
        setLoading(true);
        setError("");
        setSelectedRow(null);

        const data = await getTeam(Number(teamId));

        setTeamInfo(data.team);
        setRows(data.list);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setRows([]);
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, [teamId]);

  return (
    <div className="app">
      <Navbar />

      <main className="content">
        <h2>{teamInfo?.name ?? ``}</h2>

        {loading && <div>Загрузка...</div>}
        {error && <div>Ошибка: {error}</div>}

        {!loading && !error && (
          <div style={{ flex: 1, minHeight: 0 }}>
            <div className="territory-tables">
              {selectedRow ? (
                <Group orientation="horizontal">
                  <Panel defaultSize={65} minSize={30}>
                    <div className="teams-table-panel">
                      <TeamHistoryTable
                        rows={rows}
                        onRowClick={setSelectedRow}
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
                          className="close-scores-btn"
                          onClick={() => setSelectedRow(null)}
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
                  <TeamHistoryTable rows={rows} onRowClick={setSelectedRow} />
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
