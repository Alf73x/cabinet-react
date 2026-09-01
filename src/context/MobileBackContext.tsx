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


  /*
   * true означает:
   *
   * history.back() был вызван кнопкой X.
   *
   * Поэтому следующий popstate не должен
   * повторно вызывать CloseButton handler.
   */
  const ignoreNextPopStateRef = useRef(false);


  const register = useCallback(
    (
      id: string,
      handler: BackHandler,
    ) => {
      /*
       * Последний зарегистрированный handler
       * считаем актуальным.
       */
      handlersRef.current.delete(id);
      handlersRef.current.set(id, handler);


      if (window.innerWidth > MOBILE_WIDTH) {
        return;
      }


      /*
       * Если history entry для этого CloseButton
       * уже существует, новую не создаём.
       *
       * В частности, это защищает от повторного
       * useEffect в React StrictMode.
       */
      if (
        window.history.state
          ?.sportCabinetMobileBackId === id
      ) {
        return;
      }


      /*
       * Добавляем служебную history entry.
       *
       * Android Back / edge swipe удалит её,
       * после чего возникнет popstate.
       */
      window.history.pushState(
        {
          ...window.history.state,

          sportCabinetMobileBack: true,
          sportCabinetMobileBackId: id,
        },
        "",
        window.location.href,
      );
    },
    [],
  );


  const unregister = useCallback(
    (id: string) => {
      handlersRef.current.delete(id);
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
       * history-механизм не нужен.
       */
      if (window.innerWidth > MOBILE_WIDTH) {
        handler();
        return;
      }


      /*
       * ВАЖНО:
       *
       * X закрывает экран СРАЗУ.
       *
       * Мы больше не ждём popstate,
       * чтобы выполнить handler.
       */
      handler();


      /*
       * Если сейчас находимся на нашей
       * служебной history entry,
       * удаляем её через history.back().
       *
       * Возникший после этого popstate
       * нужно проигнорировать, потому что
       * handler уже был выполнен выше.
       */
      if (
        window.history.state
          ?.sportCabinetMobileBackId === id
      ) {
        ignoreNextPopStateRef.current = true;

        window.history.back();
      }
    },
    [],
  );


  useEffect(() => {
    function handlePopState() {
      if (window.innerWidth > MOBILE_WIDTH) {
        return;
      }


      /*
       * history.back() был вызван кнопкой X.
       *
       * Экран уже закрыт непосредственно
       * в requestClose(), поэтому ничего
       * повторно не делаем.
       */
      if (ignoreNextPopStateRef.current) {
        ignoreNextPopStateRef.current = false;
        return;
      }


      /*
       * Здесь мы пришли именно от системного
       * Back / Android edge swipe.
       *
       * Последний зарегистрированный
       * CloseButton считаем верхним экраном.
       */
      const handlers = Array.from(
        handlersRef.current.entries(),
      );


      if (handlers.length === 0) {
        return;
      }


      const [, handler] =
        handlers[handlers.length - 1];


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