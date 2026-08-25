import {
  useEffect,
  useId,
  useRef,
} from "react";

import "./CloseButton.css";

import {
  useMobileBack,
} from "../context/MobileBackContext";


type Props = {
  onClick: () => void;
  desktop?: boolean;
};


export default function CloseButton({
  onClick,
  desktop = false,
}: Props) {
  const id = useId();

  const onClickRef = useRef(onClick);

  const {
    register,
    unregister,
    requestClose,
  } = useMobileBack();


  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);


  useEffect(() => {
    if (window.innerWidth > 768) {
      return;
    }

    register(
      id,
      () => {
        onClickRef.current();
      },
    );

    return () => {
      unregister(id);
    };
  }, [
    id,
    register,
    unregister,
  ]);


  function handleClick() {
    /*
     * На desktop CloseButton работает
     * как раньше.
     */
    if (window.innerWidth > 768) {
      onClickRef.current();
      return;
    }

    /*
     * На mobile закрываем через history.
     * Поэтому и X, и Android Back используют
     * один и тот же механизм.
     */
    requestClose(id);
  }


  return (
    <button
      type="button"
      className={
        desktop
          ? "close-button close-button-desktop"
          : "close-button"
      }
      onClick={handleClick}
      aria-label="Закрыть"
      title="Закрыть"
    >
      ✕
    </button>
  );
}