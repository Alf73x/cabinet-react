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

            <div className="sources-placeholder">
              Источники будут добавлены позже.
            </div>
          </section>

          <section className="sources-section">
            <h3>Хоккей</h3>

            <div className="sources-placeholder">
              Источники будут добавлены позже.
            </div>
          </section>

          <section className="sources-section">
            <h3>Мини-футбол</h3>

            <div className="sources-placeholder">
              Источники будут добавлены позже.
            </div>
          </section>

          <section className="sources-section">
            <h3>Другие материалы</h3>

            <div className="sources-placeholder">
              Архивы, книги, публикации и другие материалы.
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}