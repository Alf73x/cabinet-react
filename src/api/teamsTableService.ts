import { apiGet } from "./api";

export interface Team {
  ID: number;
  SeasonID: number;
  SportID: number;
  Season: string;
  SeasonName: string;
  TeamName: string;
  TeamTerritory: string;
  GroupID: number;
  LeagueRank: number;
  Place: number;
  StageIndex: number;
  Result: string;
  games: number;
  wins: number;
  winsET: number;
  draws: number;
  lossesET: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  WinnerID: number;
  Options: string;
}

interface TeamsResponse {
  status: string;
  list: Team[];
}

export async function getTeams(
  territoryId: string,
  selectedSports: number[],
): Promise<Team[]> {
  const sportIds = selectedSports.join(",");
  const url = `/teams?sport_ids=${sportIds}&territory_id=${territoryId}`;
  const data = await apiGet<TeamsResponse>(url);
  return data.list ?? [];
}