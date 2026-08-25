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

  const [servicesMenuOpen, setServicesMenuOpen] =
    useState(false);

  const [loginName, setLoginName] = useState<string | null>(() =>
    getLoginName(),
  );

  const isAuthenticated = loginName !== null;


  function closeServicesMenu() {
    setServicesMenuOpen(false);
  }


  function handleLogoClick() {
    closeServicesMenu();

    if (onLogoClick) {
      onLogoClick();
      return;
    }

    navigate("/");
  }


  function handleLogout() {
    closeServicesMenu();

    clearAuth();
    setLoginName(null);

    navigate("/");
  }


  function handleOpponentComparison() {
    closeServicesMenu();

    window.open(
      "/opponent-comparison",
      "_blank",
      "noopener,noreferrer",
    );
  }


  function handleSummaryTables() {
    closeServicesMenu();

    window.open(
      "/summary-tables",
      "_blank",
      "noopener,noreferrer",
    );
  }


  function handleAbout() {
    closeServicesMenu();

    navigate("/?home=1");
  }


  function handleSources() {
    closeServicesMenu();

    window.open(
      "/sources",
      "_blank",
      "noopener,noreferrer",
    );
  }


  function handleLogin() {
    closeServicesMenu();

    setLoginDialogOpen(true);
  }


  return (
    <>
      <header className="navbar">
        <button
          type="button"
          className="logo"
          onClick={handleLogoClick}
        >
          <SCLogo className="navbar-logo-icon" />

          <span className="navbar-logo-text">
            SportCabinet
          </span>
        </button>


        {pageTitle && (
          <div className="navbar-page-title">
            {pageTitle}
          </div>
        )}


        <nav>
          {sports && selectedSports && onToggleSport && (
            <div className="sport-dropdown">
              <button
                type="button"
                className="sport-menu-button"
              >
                Спорт ▾
              </button>

              <div className="sport-dropdown-content">
                {sports.map((sport) => (
                  <label
                    key={sport.ID}
                    className="sport-dropdown-item"
                  >
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
              <button
                type="button"
                className="navbar-menu-button navbar-services-text"
              >
                Сервисы ▾
              </button>


              <button
                type="button"
                className="navbar-services-hamburger"
                aria-label="Сервисы"
                aria-expanded={servicesMenuOpen}
                onClick={() =>
                  setServicesMenuOpen(
                    (current) => !current,
                  )
                }
              >
                <span />
                <span />
                <span />
              </button>


              <div
                className={
                  servicesMenuOpen
                    ? "navbar-dropdown-content navbar-dropdown-content-open"
                    : "navbar-dropdown-content"
                }
              >
                <button
                  type="button"
                  title={
                    isAuthenticated
                      ? undefined
                      : "Требуется авторизация"
                  }
                  onClick={handleOpponentComparison}
                >
                  Сравнение соперников
                </button>


                <button
                  type="button"
                  className="navbar-menu-item"
                  onClick={handleSummaryTables}
                >
                  Сводные таблицы
                </button>


                <div className="navbar-menu-separator" />


                <button
                  type="button"
                  className="navbar-menu-item"
                  onClick={handleAbout}
                >
                  О проекте
                </button>


                <button
                  type="button"
                  className="navbar-menu-item"
                  onClick={handleSources}
                >
                  Ссылки
                </button>


                {showUser && (
                  <>
                    {isAuthenticated ? (
                      <button
                        type="button"
                        className="navbar-menu-item"
                        onClick={handleLogout}
                      >
                        Выйти
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="navbar-menu-item"
                        onClick={handleLogin}
                      >
                        Войти
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>


      <LoginDialog
        open={loginDialogOpen}
        onClose={() =>
          setLoginDialogOpen(false)
        }
        onLoginSuccess={(name) =>
          setLoginName(name)
        }
      />
    </>
  );
}