import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import type { SeasonItem } from "../api/seasonService";

type Props = {
  // Компонент сам не хранит состояние. Всё состояние приходит снаружи
  seasons: SeasonItem[];
  filterText: string;
  expandedItems: string[]; // список раскрытых узлов дерева
  selectedItem: string | null; // выбранный элемент
  onExpandedItemsChange: (ids: string[]) => void;
  onSelectedItemChange: (id: string | null) => void;
  onItemClick: (id: string) => void;
};

type TreeItem = {
  // Формат, который нужен RichTreeView.
  id: string; 
  label: string;
  children?: TreeItem[];
};

function buildSeasonsTree(data: SeasonItem[]): TreeItem[] {
  const map = new Map<string, SeasonItem[]>(); // Создаётся Map. Она группирует записи по сезону

  data.forEach((item) => {
    // Цикл группировки
    const season = item.Season || "Без сезона"; // Берём сезон. Если item.Season пустой, используем "Без сезона"
    if (!map.has(season)) map.set(season, []); // Если такого сезона ещё нет — создаём пустой массив
    map.get(season)!.push(item); // Добавляем запись в массив этого сезона
  });

  return Array.from(map.entries()).map(([season, rows]) => ({
    // Возврат дерева
    // map.entries() возвращает пары: ["2023/2024", [...записи...]], ["2024/2025", [...записи...]]
    // Array.from(...) превращает это в массив.
    // Потом .map(...) превращает каждую группу в узел дерева.
    id: `season-${season}`, // Родительский узел. Префикс season- нужен, чтобы потом отличать: season-2024/2025 от обычного ID записи: 15
    label: season,
    children: rows.map((row) => ({
      // Дочерние элементы. Каждая запись сезона становится дочерним элементом
      id: row.ID.toString(), // row.ID.toString() нужен потому, что RichTreeView работает с id как со строками
      label: row.Name,
    })),
  }));
}

// Ищем детей по id. Если узел не найден, или у него нет детей — возвращаем null
function findFirstChildId(items: TreeItem[], parentId: string): string | null {
  const node = items.find((x) => x.id === parentId);

  if (!node || !node.children || node.children.length === 0) {
    return null;
  }

  return node.children[0].id;
}

// Компонент
export default function SeasonsTree({
  seasons,
  filterText,
  expandedItems,
  selectedItem,
  onExpandedItemsChange,
  onSelectedItemChange,
  onItemClick,
}: Props) {
  const items = buildSeasonsTree(seasons); // Из плоского массива seasons строим дерево.

  const searchText = filterText.trim().toLowerCase(); // Подготовка текста поиска

  const filteredItems = searchText // Фильтрация. Если строка поиска есть — показываем только те родительские сезоны, где label содержит текст поиска.
    ? items.filter((item) => item.label.toLowerCase().includes(searchText))
    : items;

  return (
    <RichTreeView
      items={filteredItems}
      expandedItems={expandedItems} // Какие узлы раскрыты
      selectedItems={selectedItem} // Какой элемент выбран
      expansionTrigger="iconContainer"
      onExpandedItemsChange={(_, ids) => onExpandedItemsChange(ids)}
      onItemClick={(event, id) => {
        const target = event.target as HTMLElement;

        // Click on expand arrow => only expand/collapse, do not change main
        if (target.closest(".MuiTreeItem-iconContainer")) {
          return;
        }

        // Выбор элемента
        if (typeof id !== "string") {
          // Проверка нужна потому, что MUI может вернуть не только строку, например null
          return;
        }

        onSelectedItemChange(id);

        if (id.startsWith("season-")) {
          // Проверяем: это родительский узел сезона?
          const firstChildId = findFirstChildId(filteredItems, id);// Находим первую дочернюю запись внутри этого сезона


          if (firstChildId) {
            onItemClick(firstChildId);
          }

          return;
        }
        // Если кликнули по дочернему элементу
        onItemClick(id);
      }}
      aria-label="Seasons tree"  // Это подпись для доступности. Например, для screen reader.
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
     запись
     запись
4. Фильтрует дерево по названию сезона.
5. Показывает дерево через RichTreeView.
6. При клике на сезон выбирает первую запись внутри сезона.
7. При клике на запись вызывает onItemClick(id).

Главное: SeasonsTree — это controlled component.
Он сам не хранит expandedItems и selectedItem, а получает их от родителя.
*/
