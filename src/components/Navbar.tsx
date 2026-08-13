import { useState } from "react";

import "../App.css";
import "../styles/opponent-comparison.css";

import { useNavigate } from "react-router-dom";

import "../styles/navbar.css";
import "../styles/sports-menu.css";

import type { SportItem } from "../api/sportsService";
import LoginDialog from "./LoginDialog";
import { clearAuth, getLoginName } from "../api/authService";

import SCLogo from "./SCLogo";

type Props = {
  sports?: SportItem[];
  selectedSports?: number[];
  onToggleSport?: (id: number) => void;
  pageTitle?: string;
  showTools?: boolean;
  showUser?: boolean;
  onLogoClick?: () => void;
};

export default function Navbar({
  sports,
  selectedSports,
  onToggleSport,
  pageTitle,
  showTools = true,
  showUser = true,
  onLogoClick,
}: Props) {
  const navigate = useNavigate();

  const [loginDialogOpen, setLoginDialogOpen] = useState(false);

  const [loginName, setLoginName] = useState<string | null>(() =>
    getLoginName(),
  );

  const isAuthenticated = loginName !== null;

  const handleLogout = () => {
    clearAuth();
    setLoginName(null);

    navigate("/");
  };

  return (
    <>
      <header className="navbar">
        <button type="button" className="logo" onClick={onLogoClick}>
          <SCLogo className="navbar-logo-icon" />
          <span className="navbar-logo-text">SportCabinet</span>
        </button>
        {pageTitle && <div className="navbar-page-title">{pageTitle}</div>}
        <nav>
          {sports && selectedSports && onToggleSport && (
            <div className="sport-dropdown">
              <button type="button" className="sport-menu-button">
                Спорт ▾
              </button>

              <div className="sport-dropdown-content">
                {sports.map((sport) => (
                  <label key={sport.ID} className="sport-dropdown-item">
                    <input
                      type="checkbox"
                      checked={selectedSports.includes(sport.ID)}
                      onChange={() => onToggleSport(sport.ID)}
                    />

                    {sport.Name}
                  </label>
                ))}
              </div>
            </div>
          )}

          {showTools && (
            <div className="navbar-dropdown">
              <button type="button" className="navbar-menu-button">
                Инструменты ▾
              </button>

              <div className="navbar-dropdown-content">
                <button
                  type="button"
                  /* disabled={!isAuthenticated} RT:later */
                  title={isAuthenticated ? undefined : "Требуется авторизация"}
                  onClick={() =>
                    window.open(
                      "/opponent-comparison",
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                >
                  Сравнение соперников
                </button>

                <button
                  type="button"
                  /* disabled={!isAuthenticated}  RT:later*/
                  className="navbar-menu-item"
                  onClick={() => {
                    window.open(
                      "/summary-tables",
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                >
                  Сводные таблицы
                </button>

                <div className="navbar-menu-separator" />

                <button
                  type="button"
                  className="navbar-menu-item"
                  onClick={() => navigate("/sources")}
                >
                  Источники
                </button>
              </div>
            </div>
          )}

          {showUser && (
            <>
              {isAuthenticated ? (
                <div className="navbar-dropdown">
                  <button type="button" className="navbar-menu-button">
                    {loginName} ▾
                  </button>

                  <div className="navbar-dropdown-content navbar-dropdown-content--right">
                    <button type="button" onClick={handleLogout}>
                      Выйти
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  className="navbar-menu-button"
                  onClick={() => setLoginDialogOpen(true)}
                >
                  Войти
                </button>
              )}
            </>
          )}
        </nav>
      </header>

      <LoginDialog
        open={loginDialogOpen}
        onClose={() => setLoginDialogOpen(false)}
        onLoginSuccess={(name) => setLoginName(name)}
      />
    </>
  );
}
