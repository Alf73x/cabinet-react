import BackButton from "../components/BackButton";
import "./HomePage.css";

type Props = {
  onBack?: () => void;
};

export default function HomePage({ onBack }: Props) {
  return (
    <div className="home-page">
      <div className="page-title-row">
        {onBack && <BackButton className="mobile-only" onClick={onBack} />}

        <h2>Главная страница</h2>
      </div>

      <div className="home-page-content">
        <section className="home-section">
          <h3>Добро пожаловать в SportCabinet!</h3>

          <p>
            SportCabinet — место для тех, кто интересуется историей
            отечественного спорта.
          </p>

          <p>
            Проект содержит информацию о результатах команд мастеров советского
            и российского периодов с возможностью просмотра данных в разрезе
            команд и территорий. Сейчас основная часть проекта посвящена футболу
            и хоккею: результатам соревнований, турнирным таблицам и статистике
            за разные годы.
          </p>

          <p>
            Также в SportCabinet уже представлены некоторые данные по
            мини-футболу. В дальнейшем этот раздел будет расширяться и
            дополняться.
          </p>
        </section>

        <section className="home-section">
          <h3>Источники данных</h3>

          <p>
            Данные собраны из открытых источников. Полный список использованных
            материалов и ресурсов доступен на странице{" "}
            <a href="/sources">«Источники»</a>.
          </p>
        </section>

        <section className="home-section">
          <h3>Нужна ваша помощь</h3>

          <p>
            В исторических данных встречаются неточности, недочёты, противоречия
            и пробелы. Если у вас есть дополнительная информация, архивные
            материалы или вы заметили ошибку, буду благодарен за помощь в
            уточнении и проверке данных.
          </p>

          <p>
            Степень заполненности турниров отмечена видом звёздочки рядом с
            названием турнира.
          </p>

          <div className="home-completeness">
            <div className="home-completeness-row">
              <span className="home-star home-star-complete">★</span>
              <span>Информация по турниру практически полная.</span>
            </div>

            <div className="home-completeness-row">
              <span className="home-star home-star-partial">☆</span>
              <span>По турниру отсутствует часть информации.</span>
            </div>

            <div className="home-completeness-row">
              <span className="home-star home-star-incomplete">★</span>
              <span>
                По турниру отсутствует значительная часть информации. Помощь в
                поиске данных особенно важна.
              </span>
            </div>
          </div>

          <p className="home-contact">
            Буду благодарен за любую помощь в дополнении и проверке данных.
            Материалы, исправления и ссылки можно присылать на{" "}
            <a href="mailto:sportcabinet@mail.ru">sportcabinet@mail.ru</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
