import { apiGet } from "./api";

interface ApiResponse<T> {
  status: string;
  list: T[];
}

export interface SeasonItem {
  ID: number;
  Season: string;
  Prefix: string;
  Name: string;
  SportID: number;
  GroupID: number;
  LeagueRank: number;
  SortOrder: number;
  Points: string;
  Options1: string;
  Options2: string;
}

export async function getSeasons(selectedSports: number[]): Promise<SeasonItem[]> {
  /*const data = await apiGet<ApiResponse<SeasonItem>>("/seasons"); */
  const sportIdsParam = selectedSports.join(",");

  const url =
    sportIdsParam.length > 0
      ? `/seasons?sport_ids=${encodeURIComponent(sportIdsParam)}`
      : "/seasons";

  const data = await apiGet<ApiResponse<SeasonItem>>(url);
  return data.list;
}
