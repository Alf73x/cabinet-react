import { apiGet } from "./api";

interface ApiResponse<T> {
  status: string;
  list: T[];
}

export interface TerritoryItem {
  ID: number;
  Name: string;
  HasChildren: boolean;
  SortOrder: number;
}

export async function getTerritories(
  parentId: number,
): Promise<TerritoryItem[]> {
  const data = await apiGet<ApiResponse<TerritoryItem>>(
    `/territories/${parentId}`,
  );

return data.list.sort((a, b) => {
  if (a.SortOrder !== b.SortOrder) {
    return a.SortOrder - b.SortOrder;
  }

  return a.Name.localeCompare(b.Name, "ru", {
    sensitivity: "base",
  });
});
}

export async function searchTerritories(
  filter: string
): Promise<TerritoryItem[]> {
  const data = await apiGet<ApiResponse<TerritoryItem>>(
    `/territories/search?filter=${encodeURIComponent(filter)}`
  );

  return data.list.sort((a, b) =>
    a.SortOrder - b.SortOrder ||
    a.Name.localeCompare(b.Name, "ru", {
      sensitivity: "base",
    })
  );
}

export async function getTerritoryPath(id: number): Promise<number[]> {
  return apiGet<number[]>(`/territories/path?id=${id}`);
}