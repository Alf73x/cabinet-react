import { useEffect, useState } from "react";
import { initYandexMetrika } from "../../utils/yandexMetrika";
import "./CookieConsent.css";
import { Link, useLocation } from "react-router-dom";

const CONSENT_KEY = "cookie-consent";

type Consent = "accepted" | "declined" | null;

export default function CookieConsent() {
  const location = useLocation();

  const [consent, setConsent] = useState<Consent>(() => {
    const value = localStorage.getItem(CONSENT_KEY);

    if (value === "accepted" || value === "declined") {
      return value;
    }

    return null;
  });

  useEffect(() => {
    if (consent === "accepted") {
      initYandexMetrika();
    }
  }, [consent]);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setConsent("accepted");
  };

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setConsent("declined");
  };

  if (consent !== null) {
    return null;
  }

  return (
    <div className="cookie-consent">
      <p>
        Мы используем файлы cookie для анализа посещаемости сайта.
        {location.pathname !== "/privacy" && (
          <>
            {" "}
            <Link to="/privacy">Подробнее</Link>
          </>
        )}
      </p>
      <div className="cookie-consent-actions">
        <button onClick={handleAccept}>Принять</button>

        <button onClick={handleDecline}>Отклонить</button>
      </div>
    </div>
  );
}
