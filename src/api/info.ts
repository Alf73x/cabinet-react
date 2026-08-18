import { apiGet } from "./api";

export const INFO_TYPE_SEASON = 1;
export const INFO_TYPE_TEAM = 2;

export type SeasonInfo = {
  points: string;
  rankingDistribution: string;
};

export type TeamInfo = {
  id: number;
  name: string;
  dateFrom: string;
  dateTo: string;
};

export type TeamsInfo = {
  teams: TeamInfo[];
};

export type InfoResponse = {
  status: string;
  info: SeasonInfo | TeamsInfo;
};

export async function getInfo(
  idType: number,
  id: number,
): Promise<InfoResponse> {
  let url: string;

  switch (idType) {
    case INFO_TYPE_SEASON:
      url = `/season_info?id=${id}`;
      break;

    case INFO_TYPE_TEAM:
      url = `/team_info?id=${id}`;
      break;

    default:
      throw new Error(`Unknown info type: ${idType}`);
  }

  return await apiGet<InfoResponse>(url);
}