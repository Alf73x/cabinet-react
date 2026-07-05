import "../components/TeamsTable.css";
import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
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
  Games: number;
  Wins: number;
  WinsET: number;
  Draws: number;
  LossesET: number;
  Losses: number;
  Goals_For: number;
  Goals_Against: number;
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
  GoalDiff: number;
};

const columns: ColumnDef<GridRow>[] = [
  { accessorKey: "Season", header: "Сезон", size: 70 },
  { accessorKey: "Name", header: "Команда", size: 150 },
  { accessorKey: "SeasonName", header: "Турнир", size: 260 },
  {
    accessorKey: "LeagueRank",
    header: "Ранг",
    size: 60,
    meta: { align: "center" },
  },
  {
    accessorKey: "Place",
    header: "Место",
    size: 140,
    meta: { align: "center", className: "nowrap-column" },
  },
  {
    accessorKey: "Games",
    header: "И",
    size: 45,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "Wins",
    header: "В",
    size: 45,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "WinsET",
    header: "ВО",
    size: 50,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "Draws",
    header: "Н",
    size: 45,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "LossesET",
    header: "ПО",
    size: 50,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "Losses",
    header: "П",
    size: 45,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "Goals_For",
    header: "З",
    size: 50,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "Goals_Against",
    header: "ПР",
    size: 50,
    meta: { align: "center" },
    enableColumnFilter: false,
  },
  {
    accessorKey: "GoalDiff",
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
        Games:
          row.Games ||
          row.Wins + row.WinsET + row.Draws + row.LossesET + row.Losses,
        GoalDiff: row.Goals_For - row.Goals_Against,
      })),
    [rows],
  );

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: rows.length || 1,
  });

  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const filteredRowsCount = table.getFilteredRowModel().rows.length;
  const isAllRows = table.getState().pagination.pageSize >= filteredRowsCount;

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

      <div className="teams-pagination">
        <button
          onClick={() => table.setPageIndex(0)}
          disabled={isAllRows || !table.getCanPreviousPage()}
        >
          {"<<"}
        </button>

        <button
          onClick={() => table.previousPage()}
          disabled={isAllRows || !table.getCanPreviousPage()}
        >
          {"<"}
        </button>

        <span>
          {isAllRows
            ? `Все: ${filteredRowsCount}`
            : `Страница ${
                table.getState().pagination.pageIndex + 1
              } из ${table.getPageCount()}`}
        </span>

        <button
          onClick={() => table.nextPage()}
          disabled={isAllRows || !table.getCanNextPage()}
        >
          {">"}
        </button>

        <button
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={isAllRows || !table.getCanNextPage()}
        >
          {">>"}
        </button>

        <select
          value={isAllRows ? "all" : table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageIndex(0);

            if (e.target.value === "all") {
              table.setPageSize(filteredRowsCount || 1);
            } else {
              table.setPageSize(Number(e.target.value));
            }
          }}
        >
          <option value="all">Все</option>
          {[25, 50, 100].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
