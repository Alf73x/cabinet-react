import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeItem, type TreeItemProps } from "@mui/x-tree-view/TreeItem";
import { useTreeItemModel } from "@mui/x-tree-view/hooks";

import { getSeasonRootId, type SeasonItem } from "../api/seasonService";

import type { SportItem } from "../api/sportsService";

type Props = {
  // Компонент сам не хранит состояние. Всё состояние приходит снаружи
  seasons: SeasonItem[];
  seasonNames: string[];
  sports: SportItem[];
  selectedSports: number[];

  filterText: string;
  expandedItems: string[]; // Список раскрытых узлов дерева
  selectedItem: string | null; // Выбранный элемент

  onExpandedItemsChange: (ids: string[]) => void;
  onSelectedItemChange: (id: string | null) => void;
  onItemClick: (id: string) => void;
  onSeasonClick: (season: string) => Promise<void>;
};

type TreeItem = {
  // Формат, который нужен RichTreeView
  id: string;
  label: string;
  iconIndex?: number; // Дополнительная иконка турнира
  leagueRank?: number;
  children?: TreeItem[];
};

function SeasonTreeIcon({ iconIndex }: { iconIndex: number }) {
  // Дополнительная иконка турнира
  // Стрелка раскрытия дерева остаётся стандартной MUI и не меняется

  return (
    <span
      className={`season-tree-icon season-tree-icon-${iconIndex}`}
      aria-hidden="true"
    />
  );
}

function sportLeagueRankToShortText(rank: number): string {
  const fullText = sportLeagueRankToText(rank);

  if (!fullText) {
    return "";
  }

  return fullText
    .replace(/(\d+)\.\s*Чемпионат/, "$1")
    .replace(/(\d+)\.\s*Плей-офф/, "по $1")
    .replace(/(\d+)\.\s*Матчи плей-офф/, "мпо $1")
    .replace("Международный", "М")
    .replace("Кубковый турнир", "Кт")
    .replace("Кубок", "К")
    .replace("Турнир", "Т")
    .replace("Товарищеский", "Тов")
    .replace("Предсезонный", "Пред")
    .replace(/\s+/g, " ")
    .trim();
}
function sportLeagueRankToText(rank: number): string {
  const kSeasonsNoRank = -1000;
  const kSeasonsRankCup = 0;
  const kSeasonsRankCupTournament = 250;

  const kSeasonsRankMin = 1;
  const kSeasonsRankMax = 9;

  const kSeasonsPlayoffDelta = 10;

  const kPlayoffMin = 11;
  const kPlayoffMax = 19;

  const kPlayoffMatchesMin = 21;
  const kPlayoffMatchesMax = 29;

  const kSeasonsRankInternationalMin = 51;
  const kSeasonsRankInternationalMax = 59;

  const kPlayoffInternationalMin = 61;
  const kPlayoffInternationalMax = 69;

  const kSeasonsRankFriendly = 1000;
  const kSeasonsRankPreSeason = 1001;
  const kRankTournament = 1100;

  if (rank === kSeasonsNoRank) {
    return "";
  }

  if (rank === kSeasonsRankCup) {
    return "Кубок";
  }

  if (rank === kSeasonsRankCupTournament) {
    return "Кубковый турнир";
  }

  if (rank >= kSeasonsRankMin && rank <= kSeasonsRankMax) {
    return `${rank}. Чемпионат`;
  }

  if (rank >= kPlayoffMin && rank <= kPlayoffMax) {
    return `${rank - kSeasonsPlayoffDelta}. Плей-офф`;
  }

  if (rank >= kPlayoffMatchesMin && rank <= kPlayoffMatchesMax) {
    return `${rank - kSeasonsPlayoffDelta * 2}. Матчи плей-офф`;
  }

  if (
    rank >= kSeasonsRankInternationalMin &&
    rank <= kSeasonsRankInternationalMax
  ) {
    return `Международный. ${
      rank - kSeasonsRankInternationalMin + 1
    }. Чемпионат`;
  }

  if (rank >= kPlayoffInternationalMin && rank <= kPlayoffInternationalMax) {
    return `Международный. ${
      rank - kSeasonsRankInternationalMin + 1 - kSeasonsPlayoffDelta
    }. Плей-офф`;
  }

  if (rank === kRankTournament) {
    return "Турнир";
  }

  if (rank === kSeasonsRankFriendly) {
    return "Товарищеский";
  }

  if (rank === kSeasonsRankPreSeason) {
    return "Предсезонный";
  }

  return `${rank}?`;
}

function CustomTreeItem(props: TreeItemProps) {
  // Получаем исходный объект TreeItem,
  // который был передан в RichTreeView через items

  const item = useTreeItemModel<TreeItem>(props.itemId);

  const rankText =
    item?.leagueRank !== undefined
      ? sportLeagueRankToText(item.leagueRank)
      : "";

  const rankShortText =
    item?.leagueRank !== undefined
      ? sportLeagueRankToShortText(item.leagueRank)
      : "";

  const label = (
    <span className="season-tree-label">
      {item?.iconIndex !== undefined && (
        <SeasonTreeIcon iconIndex={item.iconIndex} />
      )}

      <span className="season-tree-label-text">
        {item?.label ?? props.label}
      </span>

      {rankShortText && (
        <span className="season-rank-badge" title={rankText}>
          {rankShortText}
        </span>
      )}
    </span>
  );

  return <TreeItem {...props} label={label} />;
}

function buildSeasonsTree(
  seasonNames: string[],
  data: SeasonItem[],
  sports: SportItem[],
  showSportName: boolean,
): TreeItem[] {
  const sportsById = new Map<number, string>();

  sports.forEach((sport) => {
    sportsById.set(sport.ID, sport.Name);
  });

  const rowsBySeason = new Map<string, SeasonItem[]>();

  data.forEach((item) => {
    const season = item.season || "Без сезона";

    if (!rowsBySeason.has(season)) {
      rowsBySeason.set(season, []);
    }

    rowsBySeason.get(season)!.push(item);
  });

  return seasonNames.map((season) => {
    // Создаём узел каждого сезона даже если его турниры ещё не загружены

    const rows = rowsBySeason.get(season) ?? [];

    const nodesById = new Map<number, TreeItem>();

    rows.forEach((row) => {
      // Сначала создаём все узлы турниров

      const sportName = sportsById.get(row.sport_id);

      const label =
        showSportName && sportName ? `${sportName}. ${row.name}` : row.name;

      nodesById.set(row.id, {
        id: row.id.toString(),
        label,
        iconIndex: row.icon_index,
        leagueRank: row.league_rank,
        children: [],
      });
    });

    const rootItems: TreeItem[] = [];

    rows.forEach((row) => {
      // Второй проход: распределяем турниры по родительским узлам

      const node = nodesById.get(row.id);

      if (!node) {
        return;
      }

      const rootId = getSeasonRootId(row.options_1);

      const parentNode = rootId !== null ? nodesById.get(rootId) : undefined;

      if (parentNode && rootId !== row.id) {
        parentNode.children ??= [];
        parentNode.children.push(node);
      } else {
        rootItems.push(node);
      }
    });

    nodesById.forEach((node) => {
      // Удаляем пустые children

      if (node.children?.length === 0) {
        delete node.children;
      }
    });

    const children =
      rootItems.length > 0
        ? rootItems
        : [
            {
              id: `loading-${season}`,
              label: "Загрузка...",
            },
          ];

    return {
      id: `season-${season}`,
      label: season,
      children,
    };
  });
}

// Компонент
export default function SeasonsTree({
  seasons,
  seasonNames,
  sports,
  selectedSports,
  filterText,
  expandedItems,
  selectedItem,
  onExpandedItemsChange,
  onSelectedItemChange,
  onItemClick,
  onSeasonClick,
}: Props) {
  const items = buildSeasonsTree(
    // Из плоского массива seasons строим дерево

    seasonNames,
    seasons,
    sports,
    selectedSports.length > 1,
  );

  const searchText = filterText.trim().toLowerCase();

  const filteredItems = searchText
    ? items.filter((item) => item.label.toLowerCase().includes(searchText))
    : items;

  return (
    <RichTreeView
      items={filteredItems}
      sx={{
        "& .MuiTreeItem-label": {
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          fontWeight: 400,
          lineHeight: 1.25,
          minWidth: 0,
        },

        "& .season-tree-label": {
          display: "flex",
          alignItems: "center",
          width: "100%",
          minWidth: 0,

          fontFamily: "inherit",
          fontSize: "inherit",
          fontWeight: "inherit",
          lineHeight: "inherit",
        },

        "& .season-tree-label-text": {
          flex: 1,
          minWidth: 0,

          whiteSpace: "normal",
          overflowWrap: "break-word",

          fontFamily: "inherit",
          fontSize: "inherit",
          fontWeight: "inherit",
          lineHeight: 1.25,
        },

        "& .season-rank-badge": {
          flexShrink: 0,

          minWidth: "18px",
          height: "18px",
          marginLeft: "6px",
          padding: "0 4px",

          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",

          border: "1px solid #cbd5e1",
          borderRadius: "9px",

          backgroundColor: "#f1f5f9",
          color: "#475569",

          fontSize: "11px",
          fontWeight: 500,
          lineHeight: 1,
        },

        "@media (max-width: 768px)": {
          "& .MuiTreeItem-content": {
            minHeight: "38px",
            paddingTop: "3px",
            paddingBottom: "3px",
          },

          "& .MuiTreeItem-iconContainer": {
            width: "32px",
            minWidth: "32px",
            height: "32px",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },

          "& .MuiTreeItem-iconContainer svg": {
            fontSize: "22px",
          },
        },
      }}
      slots={{
        // Используем свой TreeItem только для добавления дополнительной иконки
        // Стандартная стрелка MUI остаётся без изменений

        item: CustomTreeItem,
      }}
      expandedItems={expandedItems}
      selectedItems={selectedItem}
      expansionTrigger="iconContainer"
      onExpandedItemsChange={(_, ids) => onExpandedItemsChange(ids)}
      onItemClick={async (event, id) => {
        const target = event.target as HTMLElement;

        // Click on expand arrow =>
        // only expand/collapse, do not change main

        if (target.closest(".MuiTreeItem-iconContainer")) {
          return;
        }

        // Выбор элемента

        if (typeof id !== "string") {
          return;
        }

        if (id.startsWith("season-")) {
          const season = id.substring("season-".length);

          await onSeasonClick(season);

          return;
        }

        if (id.startsWith("loading-")) {
          return;
        }

        // Если кликнули по турниру

        onSelectedItemChange(id);
        onItemClick(id);
      }}
      aria-label="Seasons tree"
    />
  );
}
