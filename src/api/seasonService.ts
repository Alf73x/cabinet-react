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

interface ApiSeasonNamesResponse {
  status: string;
  list: string[];
}

export async function getSeasonNames(
  selectedSports: number[],
): Promise<string[]> {
  const sportIdsParam = selectedSports.join(",");

  const url =
    sportIdsParam.length > 0
      ? `/seasons?names=1&sport_ids=${encodeURIComponent(sportIdsParam)}`
      : "/seasons?names=1";

  const data = await apiGet<ApiSeasonNamesResponse>(url);

  return data.list;
}

export async function getSeasons(
  selectedSports: number[],
  seasonFilter: string = "",
): Promise<SeasonItem[]> {
  const params = new URLSearchParams();

  // Передаём выбранные виды спорта
  if (selectedSports.length > 0) {
    params.set("sport_ids", selectedSports.join(","));
  }

  // Если указан сезон — REST вернёт только турниры этого сезона
  if (seasonFilter) {
    params.set("season_filter", seasonFilter);
  }

  const query = params.toString();

  const url = query ? `/seasons?${query}` : "/seasons";

  const data = await apiGet<ApiResponse<SeasonItem>>(url);

  return data.list ?? [];
}
