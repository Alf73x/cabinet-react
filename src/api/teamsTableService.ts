import { apiGet } from "./api";

export interface Team {
  ID: number;
  SportID: number;
  Season: string;
  SeasonName: string;
  TeamName: string;
  TeamTerritory: string;
  TeamID: number;
  GroupID: number;
  LeagueRank: number;
  Place: number;
  StageIndex: number;
  Result: string;
  Games: number;
  Wins: number;
  WinsET: number;
  Draws: number;
  LossesET: number;
  Losses: number;
  Goals_For: number;
  Goals_Against: number;
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