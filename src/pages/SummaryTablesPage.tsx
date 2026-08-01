import Navbar from "../components/Navbar";

import "./SummaryTablesPage.css";

export default function SummaryTablesPage() {
  return (
    <div className="app">
      <Navbar pageTitle="Сводные таблицы" />

      <main className="summary-tables-page">
        {/* Здесь будет содержимое сводных таблиц */}
      </main>
    </div>
  );
}