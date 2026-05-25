import { apiGet } from "./api";

export interface SportItem {
  ID: number;
  Name: string;
  BaseOption: string;
}

interface SportsResponse {
  status: string;
  list: SportItem[];
}

export async function getSports(): Promise<SportItem[]> {
  const data = await apiGet<SportsResponse>("/sports");

  return data.list;
}