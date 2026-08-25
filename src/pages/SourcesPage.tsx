import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CloseButton from "../components/CloseButton";

import "./SourcesPage.css";

export default function SourcesPage() {
  const navigate = useNavigate();

  return (
    <div className="app">
      <Navbar
        pageTitle="Ссылки"
        showTools={false}
        showUser={false}
        onLogoClick={() => navigate("/")}
      />

      <main className="sources-page">
        <div className="page-title-row">
          <h2>Ссылки</h2>

          <CloseButton desktop onClick={() => window.close()} />
        </div>

        <div className="sources-page-content">
          <p className="sources-intro">
            Для наполнения SportCabinet используются открытые интернет-ресурсы,
            архивные материалы, статистические сайты и публикации. Интересные ресурсы и источники представлены ниже.
          </p>

          <section className="sources-section">
            <h3>Общее</h3>

            <div className="sources-list">
              <a
                href="https://yandex.ru/archive/catalog/9795c63e-cb01-4dff-b519-e984fe75ddf9/years"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">Советский спорт</span>
                <span className="source-description">
                  Архив газеты «Советский спорт»
                </span>
              </a>

              <a
                href="https://www.sport-express.ru/"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">Спорт-Экспресс</span>
                <span className="source-description">
                  Российская ежедневная газета о спорте
                </span>
              </a>

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

          <section className="sources-section">
            <h3>Футбол</h3>

            <div className="sources-list">
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
                href="https://regional-football.ru/"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">Региональный футбол России</span>
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
                <span className="source-description">Хоккейная статистика</span>
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
                  Тамбовский хоккей: от истоков до наших дней
                </span>
              </a>
            </div>
          </section>

          <section className="sources-section">
            <h3>Футзал</h3>

            <div className="sources-list">
              <a
                href="https://superliga.rfs.ru/"
                target="_blank"
                rel="noreferrer"
                className="source-item"
              >
                <span className="source-title">Суперлига</span>
                <span className="source-description">Суперлига по футзалу</span>
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
        </div>
      </main>
    </div>
  );
}
