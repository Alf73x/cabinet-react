import { apiGet } from "./api";

export type ScoreRow = {
  TeamName1: string;
  TeamID1: number;
  TeamName2: string;
  TeamID2: number;
  Score: string;
  Date: string;
};

export type ScoresResponse = {
  status: string;
  list: ScoreRow[];
};

export async function getScores(
  teamId: number,
  seasonId: number,
): Promise<ScoreRow[]> {
  const url = `/team_matches?team_id=${teamId}&season_id=${seasonId}`;

  const data = await apiGet<ScoresResponse>(url);

  return data.list ?? [];
}
