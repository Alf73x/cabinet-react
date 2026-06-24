import { apiGet } from "./api";
import type { TeamHistoryItem } from "../components/TeamHistoryTable";

export type TeamInfo = {
  id: number;
  name: string;
};

export type TeamResponse = {
  status: string;
  team: TeamInfo;
  list: TeamHistoryItem[];
};

export async function getTeam(teamId: number): Promise<TeamResponse> {
  return apiGet<TeamResponse>(`/team?id=${teamId}`);
}