import { apiGet } from "./api";

export type SummaryCategory = {
  id: number;
  name: string;
};

type SummaryCategoriesResponse = {
  status: string;
  error?: string;
  data: SummaryCategory[];
};

export type SummaryLeague = {
  id: number;
  name: string;
};

export const summaryLeagues: SummaryLeague[] = [
  { id: 1, name: "Чемпионат 1" },
  { id: 2, name: "Чемпионат 2" },
  { id: 3, name: "Чемпионат 3" },
  { id: 4, name: "Чемпионат 4" },
  { id: 100, name: "Кубок" },
];

export const fallbackSummaryCategories: SummaryCategory[] = [
  { id: 0, name: "Всего" },
  { id: 1, name: "Россия" },
  { id: 2, name: "СССР" },
];

export type SummaryTableRow = {
  place: number;
  sportId: number;

  teamId: number;
  teamName: string;
  territoryName: string;
  countryName: string;
  favorite: boolean;

  games: number;
  wins: number;
  winsET: number;
  draws: number;
  lossesET: number;
  losses: number;

  winPercent: number;
  lossPercent: number;

  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
};

export type SummaryTableData = {
  title: string;
  rows: SummaryTableRow[];
};

type SummaryTableResponse = {
  status: string;
  error?: string;
  data: SummaryTableData;
};

export async function getSummaryCategories(): Promise<SummaryCategory[]> {
  const response = await apiGet<SummaryCategoriesResponse>(
    "/summary_tables/categories",
  );

  return response.data ?? [];
}

export async function getSummaryTable(
  category: string,
  leagueRanks: number[],
  yearFrom: string,
  yearTo: string,
  sportIds: number[],
): Promise<SummaryTableData> {
  const params = new URLSearchParams();

  if (category !== "") {
    params.set("category", category);
  }

  if (leagueRanks.length > 0) {
    params.set("league_ranks", leagueRanks.join(","));
  }

  if (yearFrom !== "") {
    params.set("year_from", yearFrom);
  }

  if (yearTo !== "") {
    params.set("year_to", yearTo);
  }

  if (sportIds.length > 0) {
    params.set("sport_ids", sportIds.join(","));
  }

  const response = await apiGet<SummaryTableResponse>(
    `/summary_tables?${params.toString()}`,
  );

  return response.data;
}