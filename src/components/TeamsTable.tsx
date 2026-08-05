import "./TeamsTable.css";
import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import type { Team } from "../api/teamsTableService";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "center" | "right";
    className?: string;
  }
}

type Props = {
  rows: Team[];
  onRowClick?: (row: Team) => void;
  onTeamClick?: (teamId: number, teamName: string) => void;
};

type TeamGridRow = Team & {
  gridId: number;
  games: number;
};

const columns: ColumnDef<TeamGridRow>[] = [
  { accessorKey: "Season", header: "Сезон", size: 80 },
  { accessorKey: "SeasonName", header: "Турнир", size: 160 },
  { accessorKey: "TeamName", header: "Команда", size: 120 },
  { accessorKey: "TeamTerritory", header: "Город", size: 110 },
  {
    accessorKey: "LeagueRank",
    header: "Ранг",
    size: 55,
    meta: { align: "center" },
  },
  {
    accessorKey: "Place",
    header: "Место",
    size: 80,
    meta: {
      align: "center",
      className: "nowrap-column",
    },
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
    accessorKey: "draws",
    header: "Н",
    size: 45,
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
];

export default function TeamsTable({ rows, onRowClick, onTeamClick }: Props) {
  const data = useMemo<TeamGridRow[]>(
    () =>
      rows.map((row, index) => ({
        ...row,
        gridId: index,
        games: row.wins + row.winsET + row.draws + row.lossesET + row.losses,
      })),
    [rows],
  );

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: rows.length || 1, // Все по умолчанию
  });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination,
      sorting,
      columnFilters,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
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
              >
                {row.getVisibleCells().map((cell) => {
                  const align = cell.column.columnDef.meta?.align;
                  const isTeamCell = cell.column.id === "TeamName";

                  return (
                    <td
                      key={cell.id}
                      title={String(cell.getValue() ?? "")}
                      className={
                        isTeamCell
                          ? "clickable-team"
                          : cell.column.columnDef.meta?.className
                      }
                      onClick={(e) => {
                        if (!isTeamCell) {
                          return; // пусть сработает onRowClick у <tr>
                        }

                        e.stopPropagation(); // только TeamName/TeamTerritory

                        onTeamClick?.(
                          row.original.TeamID,
                          row.original.TeamName,
                        );
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
