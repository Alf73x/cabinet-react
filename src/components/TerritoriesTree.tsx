import { useEffect, useRef, useState } from "react";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import type { TerritoryItem } from "../api/territoriesService";
import {
  getTerritories,
  searchTerritories,
  getTerritoryPath,
} from "../api/territoriesService";

export type MuiTreeItem = {
  // формат, который нужен RichTreeView
  id: string;
  label: string;
  children?: MuiTreeItem[];
};

type Props = {
  items: MuiTreeItem[]; // Данные дерева
  filterText: string; // Текст фильтра. Если он пустой — показываем дерево. Если не пустой — показываем результаты поиска
  loading: boolean;
  expandedItems: string[]; // Список раскрытых узлов дерева. Например: ["1", "15", "27"] = раскрыты узлы с id 1, 15, 27
  loadedIds: Set<string>; // Список узлов, дети которых уже были загружены с сервера. Например (["0", "1", "15"]). "0" — искусственный корень
  setItems: React.Dispatch<React.SetStateAction<MuiTreeItem[]>>; // Функция для изменения items
  setExpandedItems: React.Dispatch<React.SetStateAction<string[]>>;
  setLoadedIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  selectedItem: string | null;
  onSelectedItemChange: (id: string | null) => void;
  onItemClick: (id: string) => void;
};

function toTerritory(item: TerritoryItem): MuiTreeItem {
  // Преобразование server item → tree item
  return {
    id: item.ID.toString(),
    label: item.Name,
    children: item.HasChildren
      ? [
          // Если у территории есть дети, мы временно добавляем фейкового ребёнка. Когда пользователь раскроет узел, этот фейковый ребёнок заменится настоящими детьми
          {
            id: `loading-${item.ID}`,
            label: "Загрузка...",
          },
        ]
      : undefined,
  };
}

function addChildren( // Функция ищет узел parentId и заменяет ему children
  items: MuiTreeItem[],
  parentId: string,
  children: MuiTreeItem[],
): MuiTreeItem[] {
  return items.map((item) => {
    // map создаёт новый массив, потому что в React нельзя напрямую менять старый массив. Нужно создать новый массив
    if (item.id === parentId) {
      // Если нашли нужный узел, возвращаем новый объект. "...item" копирует старый объект, а children заменяет детей
      return {
        ...item,
        children,
      };
    }

    if (item.children) {
      // Если у текущего узла есть дети, ищем внутри них
      return {
        ...item,
        children: addChildren(item.children, parentId, children), // Рекурсивный обход дерева
      };
    }

    return item;
  });
}

function scrollToTreeItem(id: string) {
  const element = document.querySelector(
    `[role="treeitem"][id$="-${id}"]`,
  ) as HTMLElement | null;

  const container = document.querySelector(
    ".sidebar-tree",
  ) as HTMLElement | null;

  if (!element || !container) return;

  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  container.scrollTop +=
    elementRect.top -
    containerRect.top -
    container.clientHeight / 2 +
    element.clientHeight / 2;
}

export default function TerritoriesTree({
  // Сам компонент, получает props и внутри использует их как локальные переменные.
  items,
  filterText,
  loading,
  setItems,
  expandedItems,
  setExpandedItems,
  loadedIds,
  setLoadedIds,
  selectedItem,
  onSelectedItemChange,
  onItemClick,
}: Props) {
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set()); // Какие узлы сейчас загружаются. Например: Set(["15", "22"]) значит дети узлов 15 и 22 сейчас грузятся.
  const [searchLoading, setSearchLoading] = useState(false); // Флаг поиска. true — поиск идёт; false — поиск завершён.
  const [searchItems, setSearchItems] = useState<TerritoryItem[]>([]); // Результаты поиска.
  const [searchStarted, setSearchStarted] = useState(false);
  const lastSearchTextRef = useRef("");
  const initialSelectedItemRef = useRef(selectedItem);
  const restoreStartedRef = useRef(false);

  // Первый useEffect — загрузка корня дерева. При первом показе компонента нужно загрузить корневые территории.
  useEffect(() => {
    if (loadedIds.has("0")) {
      // Если корень уже загружен, ничего не делаем. "0" используется как искусственный id корня.
      return;
    }

    async function loadRoot() {
      try {
        const data = await getTerritories(0); // Просим сервер вернуть корневые территории.
        setItems(data.map(toTerritory)); // Преобразуем данные сервера в формат дерева
        setLoadedIds((prev) => new Set(prev).add("0")); // и отмечаем корень как загруженный
      } catch (err) {
        console.error(err);
      }
    }

    loadRoot();
  }, [loadedIds, setItems, setLoadedIds]);

  // Второй useEffect: поиск
  useEffect(() => {
    let cancelled = false; //  Зачем cancelled: 1. пользователь ввёл Моск; 2. запрос ушёл; 3. пользователь быстро ввёл Москва; 4. старый запрос может вернуться позже ново

    const text = filterText.trim();

    if (text === lastSearchTextRef.current && searchItems.length > 0) {
      setSearchStarted(true);
      return;
    }

    if (text === "") {
      setSearchItems([]);
      setSearchStarted(false);
      return;
    }

    const timer = setTimeout(async () => {
      // debounce -> запрос отправится только если пользователь перестал печатать на 300 мс.
      try {
        setSearchLoading(true);
        setSearchStarted(false);

        const data = await searchTerritories(text);

        if (!cancelled) {
          setSearchItems(data);
          lastSearchTextRef.current = text;
          setSearchStarted(true);
        }
      } catch (err) {
        console.error(err);

        if (!cancelled) {
          setSearchItems([]);
          setSearchStarted(true);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      //  огда filterText меняется, React вызывает cleanup, то есть старый эффект становится отменённым.
      cancelled = true;
      clearTimeout(timer);
    };
  }, [filterText]);

  useEffect(() => {
    async function restorePathOnFirstLoad() {
      if (restoreStartedRef.current) return;
      if (!loadedIds.has("0")) return;

      const initialSelectedItem = initialSelectedItemRef.current;

      if (!initialSelectedItem) return;

      restoreStartedRef.current = true;

      const path = await getTerritoryPath(Number(initialSelectedItem));
      const ids = path.map(String);
      const parentIds = ids.slice(0, -1);

      for (const parentId of parentIds) {
        await loadChildren(parentId);
      }

      setExpandedItems(parentIds);
      onSelectedItemChange?.(initialSelectedItem);

      setTimeout(() => {
        scrollToTreeItem(initialSelectedItem);
      }, 700);
    }

    restorePathOnFirstLoad();
  }, [loadedIds.has("0")]);

  // Загружаем детей конкретного узла
  async function loadChildren(itemId: string) {
    if (loadedIds.has(itemId) || loadingIds.has(itemId)) {
      // Если дети уже загружены — не грузим повторно
      // Если дети уже сейчас грузятся — тоже не грузим повторно.
      return;
    }

    setLoadingIds((prev) => new Set(prev).add(itemId)); // Добавляем узел в список загружаемых

    try {
      const data = await getTerritories(Number(itemId)); // Вызываем REST
      const children = data.map(toTerritory);

      setItems((prev) => addChildren(prev, itemId, children)); // Вставили детей в дерево
      setLoadedIds((prev) => new Set(prev).add(itemId)); // Отметили узел как загруженный
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingIds((prev) => {
        // В конце удаляем из loadingIds
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  }

  // Функция вызывается, когда пользователь раскрывает или закрывает узлы дерева.
  async function handleExpandedItemsChange(
    _event: React.SyntheticEvent | null,
    itemIds: string[], // itemIds — новый список раскрытых узлов.
  ) {
    const newlyExpanded = itemIds.filter((id) => !expandedItems.includes(id)); // Вычисляется новый раскрытый узел. Например раньше было: ["1"], стало: ["1", "15"]. Значит новый раскрытый узел: 15

    setExpandedItems(itemIds); // Обновляется состояние раскрытых узлов

    await Promise.all(newlyExpanded.map((id) => loadChildren(id))); // И для новых раскрытых узлов загружаются дети. Promise.all позволяет грузить несколько узлов параллельно.
  }

  // Рендеринг

  if (items.length === 0) {
    // Если дерево ещё пустое — показываем загрузку.
    return <div>Загрузка...</div>;
  }

  // Если  идёт поиск:
  if (filterText.trim() !== "") {
    if (loading) {
      return <div>Загрузка...</div>;
    }

    if (searchLoading || !searchStarted) {
      return null;
    }

    if (searchItems.length === 0) {
      return <div>Ничего не найдено</div>;
    }

    return (
      <div>
        {searchItems.map((item) => (
          <div
            key={item.ID}
            className="tree-filter-item"
            onClick={() => {
              const id = item.ID.toString();

              onSelectedItemChange(id);
              onItemClick(id);
            }}
          >
            {item.Name}
          </div>
        ))}
      </div>
    );
  }

  // Если фильтра нет, тогда показывается дерево:
  return (
    <RichTreeView
      items={items}
      expandedItems={expandedItems}
      selectedItems={selectedItem ?? ""}
      onSelectedItemsChange={(_event, itemId) => {
        if (typeof itemId !== "string") return;
        if (itemId.startsWith("loading-")) return;

        onSelectedItemChange?.(itemId);
      }}
      onExpandedItemsChange={handleExpandedItemsChange}
      expansionTrigger="iconContainer"
      onItemClick={(event, id) => {
        const target = event.target as HTMLElement;

        if (target.closest(".MuiTreeItem-iconContainer")) {
          return;
        }

        if (typeof id !== "string") return;
        if (id.startsWith("loading-")) return;

        onSelectedItemChange?.(id);
        onItemClick(id);
      }}
      aria-label="Territories tree"
    />
  );
}

/*
Вся логика кратко:

Компонент открылся
↓
Загрузили корень getTerritories(0)
↓
Показали дерево
↓
Пользователь раскрыл узел
↓
Загрузили детей getTerritories(id)
↓
Заменили "Загрузка..." на реальные элементы

Поиск:
Пользователь ввёл текст
↓
Ждём 300 мс
↓
Вызываем searchTerritories(text)
↓
Показываем плоский список найденных территорий
↓
Пользователь очистил фильтр
↓
Снова показываем дерево
*/
