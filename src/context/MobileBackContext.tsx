import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";


const MOBILE_WIDTH = 768;

type BackHandler = () => void;


type MobileBackContextValue = {
  register: (
    id: string,
    handler: BackHandler,
  ) => void;

  unregister: (id: string) => void;

  requestClose: (id: string) => void;
};


const MobileBackContext =
  createContext<MobileBackContextValue | null>(null);


type Props = {
  children: ReactNode;
};


export function MobileBackProvider({
  children,
}: Props) {
  const handlersRef = useRef<
    Map<string, BackHandler>
  >(new Map());

  const historyIdRef = useRef<string | null>(
    null,
  );


  const register = useCallback(
    (
      id: string,
      handler: BackHandler,
    ) => {
      handlersRef.current.delete(id);
      handlersRef.current.set(id, handler);

      if (window.innerWidth > MOBILE_WIDTH) {
        return;
      }

      /*
       * Если для текущего CloseButton history entry
       * уже создана — второй раз её не создаём.
       *
       * Это также важно для React StrictMode.
       */
      if (historyIdRef.current === id) {
        return;
      }

      window.history.pushState(
        {
          ...window.history.state,

          sportCabinetMobileBack: true,
          sportCabinetMobileBackId: id,
        },
        "",
        window.location.href,
      );

      historyIdRef.current = id;
    },
    [],
  );


  const unregister = useCallback(
    (id: string) => {
      handlersRef.current.delete(id);

      /*
       * Здесь history.back() специально
       * не вызываем.
       *
       * Если закрытие произошло через Back,
       * history уже была изменена браузером.
       */
      if (historyIdRef.current === id) {
        historyIdRef.current = null;
      }
    },
    [],
  );


  const requestClose = useCallback(
    (id: string) => {
      const handler =
        handlersRef.current.get(id);

      if (!handler) {
        return;
      }

      /*
       * Desktop:
       * никакая дополнительная history
       * нам не нужна.
       */
      if (window.innerWidth > MOBILE_WIDTH) {
        handler();
        return;
      }

      /*
       * Если мы сейчас на искусственной
       * history entry этого CloseButton,
       * двигаемся назад.
       *
       * handler будет вызван в popstate.
       */
      if (
        window.history.state
          ?.sportCabinetMobileBackId === id
      ) {
        window.history.back();
        return;
      }

      /*
       * На всякий случай, если history entry
       * уже отсутствует.
       */
      handlersRef.current.delete(id);

      if (historyIdRef.current === id) {
        historyIdRef.current = null;
      }

      handler();
    },
    [],
  );


  useEffect(() => {
    function handlePopState() {
      if (window.innerWidth > MOBILE_WIDTH) {
        return;
      }

      const handlers = Array.from(
        handlersRef.current.entries(),
      );

      if (handlers.length === 0) {
        historyIdRef.current = null;
        return;
      }

      /*
       * Последний зарегистрированный CloseButton
       * считаем верхним экраном.
       */
      const [id, handler] =
        handlers[handlers.length - 1];

      handlersRef.current.delete(id);

      if (historyIdRef.current === id) {
        historyIdRef.current = null;
      }

      handler();
    }


    window.addEventListener(
      "popstate",
      handlePopState,
    );

    return () => {
      window.removeEventListener(
        "popstate",
        handlePopState,
      );
    };
  }, []);


  return (
    <MobileBackContext.Provider
      value={{
        register,
        unregister,
        requestClose,
      }}
    >
      {children}
    </MobileBackContext.Provider>
  );
}


export function useMobileBack() {
  const context =
    useContext(MobileBackContext);

  if (!context) {
    throw new Error(
      "useMobileBack must be used inside MobileBackProvider",
    );
  }

  return context;
}