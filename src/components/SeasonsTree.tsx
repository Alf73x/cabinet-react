import { useEffect } from "react";
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

function CustomTreeItem(props: TreeItemProps) {
  // Получаем исходный объект TreeItem, который был передан в RichTreeView через items
  const item = useTreeItemModel<TreeItem>(props.itemId);

  const label = (
    <span className="season-tree-label">
      {item?.iconIndex !== undefined && (
        <SeasonTreeIcon iconIndex={item.iconIndex} />
      )}

      <span className="season-tree-label-text">
        {item?.label ?? props.label}
      </span>
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
  const sportsById = new Map<number, string>(); // Создаём Map для быстрого поиска названия спорта по ID

  sports.forEach((sport) => {
    sportsById.set(sport.ID, sport.Name); // Например: 1 -> "Хоккей", 2 -> "Футбол"
  });

  const rowsBySeason = new Map<string, SeasonItem[]>(); // Группируем уже загруженные турниры по сезону

  data.forEach((item) => {
    const season = item.season || "Без сезона";

    if (!rowsBySeason.has(season)) {
      rowsBySeason.set(season, []);
    }

    rowsBySeason.get(season)!.push(item);
  });

  return seasonNames.map((season) => {
    // Создаём узел каждого сезона даже если его турниры ещё не загружены

    const rows = rowsBySeason.get(season) ?? []; // Получаем уже загруженные турниры этого сезона

    const nodesById = new Map<number, TreeItem>(); // Здесь будут все узлы турниров этого сезона по их ID

    rows.forEach((row) => {
      // Сначала создаём все узлы турниров

      const sportName = sportsById.get(row.sport_id); // Находим название спорта текущего турнира

      const label =
        showSportName && sportName
          ? `${sportName}. ${row.name}` // Если выбрано несколько видов спорта — добавляем название спорта
          : row.name; // Если выбран только один спорт — оставляем старое название

      nodesById.set(row.id, {
        id: row.id.toString(),
        label,
        iconIndex: row.icon_index,
        children: [],
      });
    });

    const rootItems: TreeItem[] = []; // Здесь будут турниры верхнего уровня внутри сезона

    rows.forEach((row) => {
      // Второй проход: распределяем турниры по родительским узлам

      const node = nodesById.get(row.id);

      if (!node) {
        return;
      }

      const rootId = getSeasonRootId(row.options_1); // Читаем Root=XYZ из options_1

      const parentNode =
        rootId !== null
          ? nodesById.get(rootId)
          : undefined;

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
        ? rootItems // Турниры сезона уже загружены
        : [
            {
              id: `loading-${season}`,
              label: "Загрузка...",
            },
          ]; // Турниры ещё не загружены — служебный элемент нужен, чтобы MUI показал стрелку

    return {
      id: `season-${season}`,
      label: season,
      children,
    };
  });
}

function findParentId(
  items: TreeItem[],
  childId: string,
): string | null {
  for (const item of items) {
    // Проверяем прямых детей текущего узла

    if (item.children?.some((child) => child.id === childId)) {
      return item.id; // Текущий узел является непосредственным родителем
    }

    if (item.children) {
      // Если у текущего узла есть дети — продолжаем поиск глубже

      const parentId = findParentId(item.children, childId);

      if (parentId) {
        return parentId; // Родитель найден во вложенном уровне
      }
    }
  }

  return null; // Элемент с таким ID не найден
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

  const searchText = filterText.trim().toLowerCase(); // Подготовка текста поиска

  const filteredItems = searchText
    ? // Фильтрация.
      // Если строка поиска есть — показываем только те родительские сезоны,
      // где label содержит текст поиска

      items.filter((item) =>
        item.label.toLowerCase().includes(searchText),
      )
    : items;

  const selectedParentId = selectedItem
    ? findParentId(items, selectedItem)
    : null;

  useEffect(() => {
    if (!selectedParentId) {
      return;
    }

    if (!expandedItems.includes(selectedParentId)) {
      onExpandedItemsChange([
        ...expandedItems,
        selectedParentId,
      ]);
    }
  }, [
    selectedParentId,
    expandedItems,
    onExpandedItemsChange,
  ]);

  return (
    <RichTreeView
      items={filteredItems}
      sx={{
        "& .MuiTreeItem-label": {
          fontFamily: "Arial, sans-serif",
          fontSize: "12px",
          fontWeight: 400,
          lineHeight: 1.25,
        },

        "& .season-tree-label": {
          fontFamily: "inherit",
          fontSize: "inherit",
          fontWeight: "inherit",
          lineHeight: "inherit",
        },

        "& .season-tree-label-text": {
          fontFamily: "inherit",
          fontSize: "inherit",
          fontWeight: "inherit",
          lineHeight: "inherit",
        },
      }}
      slots={{
        // Используем свой TreeItem только для добавления дополнительной иконки
        // Стандартная стрелка MUI остаётся без изменений

        item: CustomTreeItem,
      }}
      expandedItems={expandedItems} // Какие узлы раскрыты
      selectedItems={selectedItem} // Какой элемент выбран
      expansionTrigger="iconContainer" // Раскрытие только по стандартной стрелке MUI
      onExpandedItemsChange={(_, ids) =>
        onExpandedItemsChange(ids)
      }
      onItemClick={async (event, id) => {
        const target = event.target as HTMLElement;

        // Click on expand arrow =>
        // only expand/collapse, do not change main

        if (
          target.closest(
            ".MuiTreeItem-iconContainer",
          )
        ) {
          return;
        }

        // Выбор элемента

        if (typeof id !== "string") {
          // Проверка нужна потому, что MUI может вернуть
          // не только строку, например null

          return;
        }

        if (id.startsWith("season-")) {
          // Получаем название сезона из id вида season-2024-2025

          const season = id.substring(
            "season-".length,
          );

          // Если сезон ещё не был загружен — Sidebar сначала загрузит его
          // и раскроет соответствующий узел

          await onSeasonClick(season);

          return;
        }

        if (id.startsWith("loading-")) {
          // Служебный элемент "Загрузка..." никогда не должен открывать main

          return;
        }

        // Если кликнули по турниру

        onSelectedItemChange(id);
        onItemClick(id);
      }}
      aria-label="Seasons tree" // Это подпись для доступности. Например, для screen reader
    />
  );
}

/*
Главная логика простыми словами

Компонент делает так:

1. Получает список названий сезонов.

2. Получает уже загруженные турниры.

3. Делает дерево:

   сезон
     турнир
       дочерний турнир через Root=XYZ

4. Незагруженный сезон временно имеет дочерний элемент:

   Загрузка...

   Это нужно, чтобы RichTreeView показывал стрелку раскрытия.

5. При раскрытии сезона Sidebar загружает только турниры этого сезона.

6. Если выбрано больше одного спорта:
   добавляет к названию турнира название спорта.

   Например:
   Хоккей. КХЛ
   Футбол. Премьер лига

7. Если у турнира задан icon_index:
   сохраняет его в TreeItem.

8. CustomTreeItem показывает:

   стандартная стрелка MUI
   дополнительная иконка
   название турнира

9. Стандартная стрелка MUI остаётся и продолжает
   отвечать только за expand/collapse.

10. При клике на незагруженный сезон:
    сначала вызывается onSeasonClick(season).

11. Служебный элемент loading-* никогда не передаётся
    в onItemClick.

12. При клике на реальный турнир:
    вызывается onItemClick(id).

Главное: SeasonsTree — это controlled component.
Он сам не хранит expandedItems и selectedItem,
а получает их от родителя.
*/