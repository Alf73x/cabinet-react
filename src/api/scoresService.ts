import { apiGet } from "./api";

export type ScoreRow = {
  teamName1: string;
  teamId1: number;
  teamName2: string;
  teamId2: number;
  score: string;
  date: string;
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
