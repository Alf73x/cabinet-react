import "./TeamsTable.css";

import { useMemo, useRef, useState } from "react";

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

import { useVirtualizer } from "@tanstack/react-virtual";

import type { Team } from "../api/teamsTableService";
import type { SportItem } from "../api/sportsService";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "center" | "right";
    className?: string;
  }
}

type Props = {
  rows: Team[];
  sports: SportItem[];
  selectedSports: number[];
  onRowClick?: (row: Team) => void;
  onTeamClick?: (teamId: number, teamName: string) => void;
};

type TeamGridRow = Team & {
  gridId: number;
  games: number;
};

export default function TeamsTable({
  rows,
  sports,
  selectedSports,
  onRowClick,
  onTeamClick,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const data = useMemo<TeamGridRow[]>(
    () =>
      rows.map((row, index) => ({
        ...row,
        gridId: index,
        games: row.wins + row.winsET + row.draws + row.lossesET + row.losses,
      })),
    [rows],
  );

  const sportsById = useMemo(
    () => new Map(sports.map((sport) => [sport.ID, sport.Name])),
    [sports],
  );

  const columns = useMemo<ColumnDef<TeamGridRow>[]>(() => {
    const result: ColumnDef<TeamGridRow>[] = [
      {
        accessorKey: "Season",
        header: "Сезон",
        size: 80,
        meta: {
          className: "sticky-season",
        },
      },
    ];

    if (selectedSports.length > 1) {
      result.push({
        id: "Sport",
        header: "Спорт",
        size: 90,
        accessorFn: (row) => sportsById.get(row.SportID) ?? "",
      });
    }

    result.push(
      {
        accessorKey: "SeasonName",
        header: "Турнир",
        size: 160,
      },
      {
        accessorKey: "TeamName",
        header: "Команда",
        size: 120,
      },
      {
        accessorKey: "TeamTerritory",
        header: "Город",
        size: 110,
      },
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
        size: 80,
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
    );

    return result;
  }, [selectedSports.length, sportsById]);

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

  const tableRows = table.getRowModel().rows;

  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,

    getScrollElement: () => scrollRef.current,

    estimateSize: () => 31,

    overscan: 200,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();

  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;

  const paddingBottom =
    virtualRows.length > 0
      ? rowVirtualizer.getTotalSize() - virtualRows[virtualRows.length - 1].end
      : 0;

  return (
    <div className="teams-table-wrap">
      <div ref={scrollRef} className="teams-table-scroll">
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
            {paddingTop > 0 && (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length}
                  style={{
                    height: paddingTop,
                    padding: 0,
                    border: 0,
                  }}
                />
              </tr>
            )}

            {virtualRows.map((virtualRow) => {
              const row = tableRows[virtualRow.index];

              return (
                <tr
                  key={row.original.gridId}
                  ref={rowVirtualizer.measureElement}
                  data-index={virtualRow.index}
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
                            return;
                          }

                          e.stopPropagation();

                          onTeamClick?.(row.original.ID, row.original.TeamName);
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
              );
            })}

            {paddingBottom > 0 && (
              <tr>
                <td
                  colSpan={table.getVisibleLeafColumns().length}
                  style={{
                    height: paddingBottom,
                    padding: 0,
                    border: 0,
                  }}
                />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
