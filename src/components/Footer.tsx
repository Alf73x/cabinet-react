import { useNavigate } from "react-router-dom";

import "./Footer.css";

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="app-footer">
<button type="button" onClick={() => navigate("/?home=1")}>
  О проекте
</button>

      <span>·</span>

      <span>
        Контакты: <a href="mailto:sportcabinet@mail.ru">sportcabinet@mail.ru</a>
      </span>
    </footer>
  );
}
