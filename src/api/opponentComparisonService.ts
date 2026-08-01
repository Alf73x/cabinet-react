import { apiGet } from "./api";

export type OpponentOptionType = "territory" | "team";

export type CompetitionFilter = "all" | "cup" | "championship" | "other";

export interface OpponentCityDto {
  id: number;
  name: string;
}

export interface OpponentTeamDto {
  id: number;
  name: string;
  city_name: string;
  sport_id: number;
  sport_name: string;
}

interface OpponentOptionsResponse {
  status: string;
  error?: string;
  cities: OpponentCityDto[];
  teams: OpponentTeamDto[];
}

export interface OpponentOption {
  id: number;
  type: OpponentOptionType;
  label: string;

  cityName?: string;
  sportId?: number;
  sportName?: string;
}

const OPPONENT_OPTIONS_KEY = "opponent-options";

export async function getOpponentOptions(
  sportIDs: number[],
): Promise<OpponentOption[]> {
  const query = new URLSearchParams();

  if (sportIDs.length > 0) {
    query.set("sport_ids", sportIDs.join(","));
  }

  const url =
    "/opponent_options" + (query.size > 0 ? `?${query.toString()}` : "");

  const response = await apiGet<OpponentOptionsResponse>(url);

  if (response.status !== "OK") {
    throw new Error(response.error || "Failed to load opponent options");
  }

  const territories: OpponentOption[] = (response.cities ?? []).map((city) => ({
    id: city.id,
    type: "territory",
    label: city.name,
  }));

  const teams: OpponentOption[] = (response.teams ?? []).map((team) => ({
    id: team.id,
    type: "team",
    label: team.name,
    cityName: team.city_name,
    sportId: team.sport_id,
    sportName: team.sport_name,
  }));

  return [...territories, ...teams];
}

export function saveOpponentOptions(options: OpponentOption[]): void {
  localStorage.setItem(OPPONENT_OPTIONS_KEY, JSON.stringify(options));
}

export function getSavedOpponentOptions(): OpponentOption[] {
  const json = localStorage.getItem(OPPONENT_OPTIONS_KEY);

  if (!json) {
    return [];
  }

  try {
    const options = JSON.parse(json) as OpponentOption[];

    return Array.isArray(options) ? options : [];
  } catch {
    return [];
  }
}

export type OpponentComparisonResponse = unknown;

export async function getComparison(
  opponent1: OpponentOption,
  opponent2: OpponentOption,
  competitionFilter: CompetitionFilter,
  sportIds: number[],
): Promise<OpponentComparisonResponse> {
  const params = new URLSearchParams({
    opponent1Type: opponent1.type,
    opponent1Id: opponent1.id.toString(),

    opponent2Type: opponent2.type,
    opponent2Id: opponent2.id.toString(),

    competitionFilter,
    sport_ids: sportIds.join(","),
  });

  const url = `/opponent_comparison?${params.toString()}`;

  return apiGet<OpponentComparisonResponse>(url);
}