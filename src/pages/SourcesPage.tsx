import { useNavigate } from "react-router-dom";

import Navbar from "../components/Navbar";
import BackButton from "../components/BackButton";

import "./SourcesPage.css";

export default function SourcesPage() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <Navbar
        pageTitle="Источники"
        showTools={false}
        showUser={false}
        onLogoClick={() => navigate("/")}
      />

      <main className="sources-page">
        <div className="page-title-row">
          <BackButton onClick={() => navigate("/")} />

          <h2>Источники</h2>
        </div>

        <div className="sources-page-content">
          <p className="sources-intro">
            Для наполнения SportCabinet используются открытые интернет-ресурсы,
            архивные материалы, статистические сайты и публикации.
          </p>

          <p className="sources-intro">
            Список источников будет постепенно дополняться.
          </p>

          <section className="sources-section">
            <h3>Футбол</h3>

            <div className="sources-list">
              <a
                href="https://wildstat.ru"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">WildStat</span>
                <span className="source-description">
                  Футбольные результаты и статистика
                </span>
              </a>

              <a
                href="https://footballfakts.ru"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">FootballFacts</span>
                <span className="source-description">
                  Футбольная статистика и не только
                </span>
              </a>

              <a
                href="https://regional-football.ru/"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">
                  Региональный футбол России
                </span>
                <span className="source-description">
                  Региональный футбол России
                </span>
              </a>
            </div>
          </section>

          <section className="sources-section">
            <h3>Хоккей</h3>

            <div className="sources-list">
              <a
                href="https://ice-hockey-stat.com"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">Ice Hockey Stat</span>
                <span className="source-description">
                  Форум хоккейных статистиков им. Виктора Малеванного
                </span>
              </a>

              <a
                href="https://hockey1946.ru/index"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">Хоккей в цифрах</span>
                <span className="source-description">
                  Хоккейная статистика
                </span>
              </a>

              <a
                href="https://r-hockey.ru"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">R-Hockey</span>
                <span className="source-description">
                  Вся статистика хоккея
                </span>
              </a>

              <a
                href="https://nmhl.fhr.ru/"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">НМХЛ</span>
                <span className="source-description">
                  Официальный сайт НМХЛ
                </span>
              </a>

              <a
                href="https://тамбовхоккей.рф"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">ТамбовХоккей</span>
                <span className="source-description">
                  ТамбовХоккей
                </span>
              </a>
            </div>
          </section>

          <section className="sources-section">
            <h3>Мини-футбол</h3>

            <div className="sources-list">
              <a
                href="https://superliga.rfs.ru/"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">Суперлига</span>
                <span className="source-description">
                  Суперлига по футзалу
                </span>
              </a>

              <a
                href="https://ffsk.ru/"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">
                  Федерация футбола Ставропольского края
                </span>
                <span className="source-description">
                  Федерация футбола Ставропольского края
                </span>
              </a>

              <a
                href="https://www.rmfl.ru"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">
                  Городская лига мини-футбола Новосибирска
                </span>
                <span className="source-description">
                  Городская лига мини-футбола Новосибирска
                </span>
              </a>
            </div>
          </section>

          <section className="sources-section">
            <h3>Другие материалы</h3>

            <div className="sources-list">
              <a
                href="https://ru.wikipedia.org"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">Википедия</span>
                <span className="source-description">
                  Справочная информация
                </span>
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}