import { useEffect, useRef } from "react";

const MOBILE_WIDTH = 768;

export default function useMobileBack(
  onBack: (() => void) | undefined,
  enabled: boolean,
) {
  const onBackRef = useRef(onBack);

  useEffect(() => {
    onBackRef.current = onBack;
  }, [onBack]);

  useEffect(() => {
    if (!enabled || !onBack) {
      return;
    }

    if (window.innerWidth > MOBILE_WIDTH) {
      return;
    }

    window.history.pushState(
      {
        sportCabinetMobilePage: true,
      },
      "",
    );

    function handlePopState() {
      onBackRef.current?.();
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
  }, [enabled, onBack]);
}