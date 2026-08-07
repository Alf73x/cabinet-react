import { useEffect } from "react";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import {
  TreeItem,
  type TreeItemProps,
} from "@mui/x-tree-view/TreeItem";
import { useTreeItemModel } from "@mui/x-tree-view/hooks";

import {
  getSeasonRootId,
  type SeasonItem,
} from "../api/seasonService";

import type { SportItem } from "../api/sportsService";

type Props = {
  // Компонент сам не хранит состояние. Всё состояние приходит снаружи
  seasons: SeasonItem[];
  sports: SportItem[];
  selectedSports: number[];

  filterText: string;
  expandedItems: string[]; // Список раскрытых узлов дерева
  selectedItem: string | null; // Выбранный элемент

  onExpandedItemsChange: (ids: string[]) => void;
  onSelectedItemChange: (id: string | null) => void;
  onItemClick: (id: string) => void;
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

  return (
    <TreeItem
      {...props}
      label={label}
    />
  );
}

function buildSeasonsTree(
  data: SeasonItem[],
  sports: SportItem[],
  showSportName: boolean,
): TreeItem[] {
  const map = new Map<string, SeasonItem[]>(); // Создаётся Map. Она группирует записи по сезону

  const sportsById = new Map<number, string>(); // Создаём Map для быстрого поиска названия спорта по ID

  sports.forEach((sport) => {
    sportsById.set(sport.ID, sport.Name); // Например: 1 -> "Хоккей", 2 -> "Футбол"
  });

  data.forEach((item) => {
    // Цикл группировки по сезону

    const season = item.season || "Без сезона"; // Берём сезон. Если item.season пустой, используем "Без сезона"

    if (!map.has(season)) {
      map.set(season, []); // Если такого сезона ещё нет — создаём пустой массив
    }

    map.get(season)!.push(item); // Добавляем запись в массив этого сезона
  });

  return Array.from(map.entries()).map(([season, rows]) => {
    // Для каждого сезона создаём отдельное дерево турниров

    const nodesById = new Map<number, TreeItem>(); // Здесь будут все узлы турниров этого сезона по их ID

    rows.forEach((row) => {
      // Сначала создаём все узлы турниров
      // Это важно, потому что дочерний турнир может находиться в массиве раньше родительского

      const sportName = sportsById.get(row.sport_id); // Находим название спорта текущего турнира

      const label =
        showSportName && sportName
          ? `${sportName}. ${row.name}` // Если выбрано несколько видов спорта — добавляем название спорта
          : row.name; // Если выбран только один спорт — оставляем старое название

      nodesById.set(row.id, {
        id: row.id.toString(), // RichTreeView работает с id как со строками
        label: label, // Название турнира с названием спорта или без него
        iconIndex: row.icon_index, // Индекс дополнительной иконки из class_season.icon_index
        children: [],
      });
    });

    const rootItems: TreeItem[] = []; // Здесь будут турниры верхнего уровня внутри сезона

    rows.forEach((row) => {
      // Второй проход: распределяем турниры по родительским узлам

      const node = nodesById.get(row.id); // Получаем ранее созданный узел текущего турнира

      if (!node) {
        return; // Защитная проверка. В нормальной ситуации такого быть не должно
      }

      const rootId = getSeasonRootId(row.options_1); // Читаем Root=XYZ из options_1

      const parentNode =
        rootId !== null
          ? nodesById.get(rootId)
          : undefined; // Ищем родительский турнир по ID

      if (parentNode && rootId !== row.id) {
        // Родитель найден, и запись не ссылается сама на себя

        parentNode.children ??= []; // На всякий случай создаём массив children
        parentNode.children.push(node); // Добавляем текущий турнир как дочерний
      } else {
        // Root не указан, родитель не найден или Root указывает на саму запись

        rootItems.push(node); // Показываем турнир на обычном уровне внутри сезона
      }
    });

    nodesById.forEach((node) => {
      // Удаляем пустые children
      // Иначе RichTreeView может считать обычный элемент родительским узлом

      if (node.children?.length === 0) {
        delete node.children;
      }
    });

    return {
      // Возвращаем родительский узел сезона

      id: `season-${season}`, // Префикс season- отличает сезон от ID турнира
      label: season, // Название сезона

      // Для самого сезона iconIndex не задаём
      // Поэтому дополнительная иконка будет только у турниров

      children: rootItems, // Турниры верхнего уровня и их вложенные элементы
    };
  });
}

function findTreeItem(
  items: TreeItem[],
  itemId: string,
): TreeItem | null {
  for (const item of items) {
    if (item.id === itemId) {
      return item; // Нужный узел найден
    }

    if (item.children) {
      // Продолжаем поиск во вложенных элементах

      const foundItem = findTreeItem(
        item.children,
        itemId,
      );

      if (foundItem) {
        return foundItem;
      }
    }
  }

  return null; // Узел с таким ID не найден
}

function findFirstLeafId(item: TreeItem): string {
  if (!item.children || item.children.length === 0) {
    return item.id; // Это конечный турнир
  }

  return findFirstLeafId(item.children[0]); // Продолжаем идти по первому ребёнку
}

// Ищем детей по id.
// Если узел не найден, или у него нет детей — возвращаем null
function findFirstChildId(
  items: TreeItem[],
  parentId: string,
): string | null {
  const node = findTreeItem(items, parentId); // Ищем узел во всём дереве

  if (!node || !node.children || node.children.length === 0) {
    return null; // Узел не найден или не имеет детей
  }

  return findFirstLeafId(node.children[0]); // Ищем первый конечный турнир
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

      const parentId = findParentId(
        item.children,
        childId,
      );

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
  sports,
  selectedSports,
  filterText,
  expandedItems,
  selectedItem,
  onExpandedItemsChange,
  onSelectedItemChange,
  onItemClick,
}: Props) {
  const items = buildSeasonsTree(
    // Из плоского массива seasons строим дерево

    seasons,
    sports,
    selectedSports.length > 1,
  );

  const searchText = filterText.trim().toLowerCase(); // Подготовка текста поиска

  const filteredItems = searchText
    // Фильтрация.
    // Если строка поиска есть — показываем только те родительские сезоны,
    // где label содержит текст поиска

    ? items.filter((item) =>
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
      onItemClick={(event, id) => {
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

        onSelectedItemChange(id);

        if (id.startsWith("season-")) {
          // Проверяем: это родительский узел сезона?

          const firstChildId =
            findFirstChildId(
              filteredItems,
              id,
            ); // Находим первую дочернюю запись внутри этого сезона

          if (firstChildId) {
            onItemClick(firstChildId);
          }

          return;
        }

        // Если кликнули по турниру

        onItemClick(id);
      }}
      aria-label="Seasons tree" // Это подпись для доступности. Например, для screen reader
    />
  );
}

/*
Главная логика простыми словами

Компонент делает так:

1. Получает плоский список сезонов.
2. Группирует записи по Season.
3. Делает дерево:

   сезон
     турнир
       дочерний турнир через Root=XYZ

4. Если выбрано больше одного спорта:
   добавляет к названию турнира название спорта.

   Например:
   Хоккей. КХЛ
   Футбол. Премьер лига

5. Если у турнира задан icon_index:
   сохраняет его в TreeItem.

6. CustomTreeItem показывает:

   стандартная стрелка MUI
   дополнительная иконка
   название турнира

7. Стандартная стрелка MUI остаётся и продолжает
   отвечать только за expand/collapse.

8. При клике на сезон выбирает первый конечный турнир внутри сезона.

9. При клике на турнир вызывает onItemClick(id).

Главное: SeasonsTree — это controlled component.
Он сам не хранит expandedItems и selectedItem,
а получает их от родителя.
*/