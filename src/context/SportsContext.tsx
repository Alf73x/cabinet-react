import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import type {
  Dispatch,
  ReactNode,
  SetStateAction,
} from "react";

import {
  getSports,
  type SportItem,
} from "../api/sportsService";

export const SPORTS_STORAGE_KEY = "selected-sports";

type SportsContextValue = {
  sports: SportItem[];
  sportsLoading: boolean;

  selectedSports: number[];

  setSelectedSports: Dispatch<
    SetStateAction<number[]>
  >;

  toggleSport: (id: number) => void;
};

const SportsContext =
  createContext<SportsContextValue | null>(null);

function readSavedSports(): number[] | null {
  const saved = localStorage.getItem(
    SPORTS_STORAGE_KEY,
  );

  if (saved === null) {
    return null;
  }

  try {
    const values: unknown = JSON.parse(saved);

    if (!Array.isArray(values)) {
      return null;
    }

    return values.filter(
      (value): value is number =>
        typeof value === "number" &&
        Number.isInteger(value),
    );
  } catch {
    return null;
  }
}

type SportsProviderProps = {
  children: ReactNode;
};

export function SportsProvider({
  children,
}: SportsProviderProps) {
  const [sports, setSports] =
    useState<SportItem[]>([]);

  const [sportsLoading, setSportsLoading] =
    useState(true);

  const [
    selectedSports,
    setSelectedSportsState,
  ] = useState<number[]>(() => {
    return readSavedSports() ?? [];
  });

  const setSelectedSports: Dispatch<
    SetStateAction<number[]>
  > = useCallback((value) => {
    setSelectedSportsState((current) => {
      const next =
        typeof value === "function"
          ? value(current)
          : value;

      localStorage.setItem(
        SPORTS_STORAGE_KEY,
        JSON.stringify(next),
      );

      return next;
    });
  }, []);

  /*
   * Загружаем список видов спорта.
   * Provider работает на любой странице приложения.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadSports() {
      try {
        setSportsLoading(true);

        const items = await getSports();

        if (cancelled) {
          return;
        }

        setSports(items);

        const savedSports = readSavedSports();

        const validIds = new Set(
          items.map((sport) => sport.ID),
        );

        const actualIds =
          savedSports?.filter(
            (id) => validIds.has(id),
          ) ?? [];

        /*
         * При первом запуске или при сохранённом []
         * выбираем все виды спорта.
         */
        if (actualIds.length === 0) {
          const allIds = items.map(
            (sport) => sport.ID,
          );

          console.log(
            "SportsContext: selecting all sports",
            allIds,
          );

          setSelectedSports(allIds);
        } else {
          console.log(
            "SportsContext: restoring sports",
            actualIds,
          );

          setSelectedSports(actualIds);
        }
      } catch (error) {
        console.error(
          "Failed to load sports:",
          error,
        );

        if (!cancelled) {
          setSports([]);
        }
      } finally {
        if (!cancelled) {
          setSportsLoading(false);
        }
      }
    }

    void loadSports();

    return () => {
      cancelled = true;
    };
  }, [setSelectedSports]);

  /*
   * Синхронизация между вкладками.
   */
  useEffect(() => {
    const handleStorage = (
      event: StorageEvent,
    ) => {
      if (event.key !== SPORTS_STORAGE_KEY) {
        return;
      }

      const savedSports =
        readSavedSports() ?? [];

      setSelectedSportsState(savedSports);
    };

    window.addEventListener(
      "storage",
      handleStorage,
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage,
      );
    };
  }, []);

  const toggleSport = useCallback(
    (id: number) => {
      setSelectedSports((current) =>
        current.includes(id)
          ? current.filter(
              (sportId) => sportId !== id,
            )
          : [...current, id],
      );
    },
    [setSelectedSports],
  );

  return (
    <SportsContext.Provider
      value={{
        sports,
        sportsLoading,
        selectedSports,
        setSelectedSports,
        toggleSport,
      }}
    >
      {children}
    </SportsContext.Provider>
  );
}

export function useSports(): SportsContextValue {
  const context = useContext(SportsContext);

  if (context === null) {
    throw new Error(
      "useSports must be used inside SportsProvider",
    );
  }

  return context;
}