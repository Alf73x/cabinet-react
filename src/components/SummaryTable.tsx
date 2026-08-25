import "./SummaryTable.css";

import { useMemo, useState } from "react";
import type { SportItem } from "../api/sportsService";

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

import type { SummaryTableRow } from "../api/summaryTablesService";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    align?: "left" | "center" | "right";
    className?: string;
  }
}

type Props = {
  rows: SummaryTableRow[];
  sports: SportItem[];
  selectedSports: number[];
  onTeamClick?: (teamId: number, teamName: string) => void;
};

export default function SummaryTable({
  rows,
  sports,
  selectedSports,
  onTeamClick,
}: Props) {
  const sportsById = useMemo(
    () => new Map(sports.map((sport) => [sport.ID, sport.Name])),
    [sports],
  );

  const columns = useMemo<ColumnDef<SummaryTableRow>[]>(() => {
    const result: ColumnDef<SummaryTableRow>[] = [
      {
        id: "rowNumber",
        header: "№",
        size: 45,
        meta: { align: "center" },
        enableColumnFilter: false,
        enableSorting: false,
        cell: ({ row }) => row.index + 1,
      },
    ];

    if (selectedSports.length > 1) {
      result.push({
        id: "sport",
        header: "Спорт",
        size: 90,
        accessorFn: (row) => sportsById.get(row.sportId) ?? "",
      });
    }

    result.push(
      {
        accessorKey: "teamName",
        header: "Команда",
        size: 220,
      },
      {
        accessorKey: "territoryName",
        header: "Город/Регион",
        size: 150,
      },
      {
        accessorKey: "countryName",
        header: "Страна",
        size: 120,
      },
      {
        accessorKey: "games",
        header: "Игры",
        size: 60,
        meta: { align: "center" },
        enableColumnFilter: false,
      },
      {
        accessorKey: "wins",
        header: "Победы",
        size: 70,
        meta: { align: "center" },
        enableColumnFilter: false,
      },
      {
        accessorKey: "winsET",
        header: "Победы*",
        size: 70,
        meta: { align: "center" },
        enableColumnFilter: false,
      },
      {
        accessorKey: "draws",
        header: "Ничьи",
        size: 65,
        meta: { align: "center" },
        enableColumnFilter: false,
      },
      {
        accessorKey: "lossesET",
        header: "Поражения*",
        size: 85,
        meta: { align: "center" },
        enableColumnFilter: false,
      },
      {
        accessorKey: "losses",
        header: "Поражения",
        size: 80,
        meta: { align: "center" },
        enableColumnFilter: false,
      },
      {
        accessorKey: "winPercent",
        header: "Победы %",
        size: 80,
        meta: { align: "center" },
        enableColumnFilter: false,
      },
      {
        accessorKey: "lossPercent",
        header: "Поражения %",
        size: 90,
        meta: { align: "center" },
        enableColumnFilter: false,
      },
      {
        accessorKey: "goalsFor",
        header: "Забито",
        size: 70,
        meta: { align: "center" },
        enableColumnFilter: false,
      },
      {
        accessorKey: "goalsAgainst",
        header: "Пропущено",
        size: 85,
        meta: { align: "center" },
        enableColumnFilter: false,
      },
      {
        accessorKey: "goalDiff",
        header: "+/-",
        size: 65,
        meta: { align: "center" },
        enableColumnFilter: false,
      },
    );

    return result;
  }, [selectedSports.length, sportsById]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data: rows,
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
    <div className="summary-table-wrap">
      <div className="summary-table-scroll">
        <table className="summary-table">
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
                          className="summary-column-filter"
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
              <tr key={`${row.original.teamId}-${row.id}`}>
                {row.getVisibleCells().map((cell) => {
                  const align = cell.column.columnDef.meta?.align;
                  const isTeamCell = cell.column.id === "teamName";

                  return (
                    <td
                      key={cell.id}
                      title={String(cell.getValue() ?? "")}
                      className={
                        isTeamCell
                          ? "clickable-team"
                          : cell.column.columnDef.meta?.className
                      }
                      onClick={() => {
                        if (!isTeamCell) {
                          return;
                        }

                        onTeamClick?.(
                          row.original.teamId,
                          row.original.teamName,
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
    </div>
  );
}