import { apiGet } from "./api";

interface ApiResponse<T> {
  status: string;
  list: T[];
}

export interface SeasonItem {
  id: number;
  season: string;
  prefix: string;
  name: string;
  sport_id: number;
  group_id: number;
  league_rank: number;
  sort_order: number;
  points: string;
  options_1: string;
  options_2: string;
  icon_index: number;
}

export function getSeasonRootId(
  options1: string | null | undefined,
): number | null {
  if (!options1) {
    return null;
  }
  const match = options1.match(/(?:^|[;,]\s*)Root\s*=\s*(\d+)/i);
  if (!match) {
    return null;
  }
  const rootId = Number(match[1]);
  return Number.isInteger(rootId) && rootId > 0 ? rootId : null;
}

export async function getSeasons(
  selectedSports: number[],
): Promise<SeasonItem[]> {
  /*const data = await apiGet<ApiResponse<SeasonItem>>("/seasons"); */
  const sportIdsParam = selectedSports.join(",");

  const url =
    sportIdsParam.length > 0
      ? `/seasons?sport_ids=${encodeURIComponent(sportIdsParam)}`
      : "/seasons";

  const data = await apiGet<ApiResponse<SeasonItem>>(url);
  return data.list;
}
