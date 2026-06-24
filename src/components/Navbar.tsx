import "../styles/navbar.css";
import "../styles/sports-menu.css";
import type { SportItem } from "../api/sportsService";

type Props = {
  sports?: SportItem[];
  selectedSports?: number[];
  onToggleSport?: (id: number) => void;
};

export default function Navbar({
  sports,
  selectedSports,
  onToggleSport,
}: Props) {
  return (
    <header className="navbar">
      <div className="logo">Cabinet</div>

      <nav>
        {sports && selectedSports && onToggleSport && (
          <div className="sport-dropdown">
            <button className="sport-menu-button">Спорт ▾</button>

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
        <a href="/">Users</a>
        <a href="/">Settings</a>
      </nav>
    </header>
  );
}
