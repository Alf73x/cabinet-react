import "../components/TeamsTable.css";
import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";

export type TeamHistoryItem = {
  ID: number;
  Name: string;
  SeasonID: number;
  Season: string;
  SeasonName: string;
  LeagueRank: string;
  Place: string;
  StageIndex: number;
  Result: string;
  games: number;
  wins: number;
  winsET: number;
  draws: number;
  lossesET: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
};

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "center" | "right";
    className?: string;
  }
}

type Props = {
  rows: TeamHistoryItem[];
  onRowClick?: (row: TeamHistoryItem) => void;
  onTournamentClick?: (row: TeamHistoryItem) => void;
};

type GridRow = TeamHistoryItem & {
  gridId: number;
  goalDiff: number;
};

const columns: ColumnDef<GridRow>[] = [
  {
    accessorKey: "Season",
    header: "Сезон",
    size: 70,
    meta: { className: "sticky-season" },
  },
  { accessorKey: "Name", header: "Команда", size: 150 },
  { accessorKey: "SeasonName", header: "Турнир", size: 260 },
  {
    accessorKey: "LeagueRank",
    header: "Ранг",
    size: 55,
    meta: { align: "center" },

    filterFn: (row, columnId, filterValue) => {
      const filter = String(filterValue ?? "").trim();

      if (!filter) {
        return true;
      }

      const ranks = filter
        .split(",")
        .map((value) => Number(value.trim()))
        .filter((value) => !Number.isNaN(value));

      return ranks.includes(Number(row.getValue(columnId)));
    },
  },
  {
    accessorKey: "Place",
    header: "Место",
    size: 140,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "games",
    header: "И",
    size: 45,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "wins",
    header: "В",
    size: 45,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "winsET",
    header: "В*",
    size: 50,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "draws",
    header: "Н",
    size: 45,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "lossesET",
    header: "П*",
    size: 50,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "losses",
    header: "П",
    size: 45,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "goalsFor",
    header: "З",
    size: 50,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "goalsAgainst",
    header: "ПР",
    size: 50,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "goalDiff",
    header: "+/-",
    size: 55,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
];

export default function TeamHistoryTable({
  rows,
  onRowClick,
  onTournamentClick,
}: Props) {
  const data = useMemo<GridRow[]>(
    () =>
      rows.map((row, index) => ({
        ...row,
        gridId: index,

        games:
          row.games > 0
            ? row.games
            : row.wins + row.winsET + row.draws + row.lossesET + row.losses,

        goalDiff: row.goalsFor - row.goalsAgainst,
      })),
    [rows],
  );

  const [sorting, setSorting] = useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="teams-table-wrap">
      <div className="teams-table-scroll">
        <table className="teams-table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const align = header.column.columnDef.meta?.align;
                  const sorted = header.column.getIsSorted();

                  return (
                    <th
                      key={header.id}
                      className={header.column.columnDef.meta?.className}
                      style={{
                        width: header.getSize(),
                        textAlign: align ?? "left",
                      }}
                    >
                      <div
                        onClick={header.column.getToggleSortingHandler()}
                        style={{
                          cursor: header.column.getCanSort()
                            ? "pointer"
                            : "default",
                          userSelect: "none",
                        }}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}

                        {sorted === "asc" && " ▲"}
                        {sorted === "desc" && " ▼"}
                      </div>

                      {header.column.getCanFilter() && (
                        <input
                          className="teams-column-filter"
                          value={
                            (header.column.getFilterValue() ?? "") as string
                          }
                          onChange={(e) =>
                            header.column.setFilterValue(e.target.value)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.original.gridId}
                onClick={() => onRowClick?.(row.original)}
                style={{ cursor: "pointer" }}
              >
                {row.getVisibleCells().map((cell) => {
                  const align = cell.column.columnDef.meta?.align;
                  const isTournamentCell = cell.column.id === "SeasonName";

                  return (
                    <td
                      key={cell.id}
                      title={String(cell.getValue() ?? "")}
                      /* className={cell.column.columnDef.meta?.className} */
                      className={
                        isTournamentCell
                          ? "clickable-team"
                          : cell.column.columnDef.meta?.className
                      }
                      onClick={(e) => {
                        if (!isTournamentCell) {
                          return; // let the row click open ScoresTablePanel
                        }
                        e.stopPropagation();
                        onTournamentClick?.(row.original);
                      }}
                      style={{
                        width: cell.column.getSize(),
                        textAlign: align ?? "left",
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
