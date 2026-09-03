import { Link } from "react-router-dom";

import "./Footer.css";

export default function Footer() {
  return (
    <footer className="app-footer">
      <Link className="footer-about" to="/?home=1">
        О проекте
      </Link>

      <span className="footer-about-separator">·</span>

      <Link to="/privacy">Политика конфиденциальности</Link>

      <span>·</span>

      <span>
        <span className="footer-contacts-label">Контакты: </span>

        <a href="mailto:sportcabinet@mail.ru">sportcabinet@mail.ru</a>
      </span>
    </footer>
  );
}
