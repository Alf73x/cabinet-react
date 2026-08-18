import { useState } from "react";

import {
  getInfo,
  INFO_TYPE_SEASON,
  INFO_TYPE_TEAM,
  type SeasonInfo,
  type TeamsInfo,
} from "../api/info";

import InfoDialog from "./InfoDialog";

import "./InfoButton.css";

type Props = {
  idType: number;
  id: number;
  className?: string;
};

export default function InfoButton({
  idType,
  id,
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [seasonInfo, setSeasonInfo] = useState<SeasonInfo | null>(null);
  const [teamsInfo, setTeamsInfo] = useState<TeamsInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);

      const data = await getInfo(idType, id);

      if (idType === INFO_TYPE_SEASON) {
        setTitle("Информация о турнире");
        setSeasonInfo(data.info as SeasonInfo);
        setTeamsInfo(null);
      }

      if (idType === INFO_TYPE_TEAM) {
        setTitle("История команды");
        setTeamsInfo(data.info as TeamsInfo);
        setSeasonInfo(null);
      }

      setOpen(true);
    } catch (err) {
      console.error("Failed to load info:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={`info-button ${className}`}
        onClick={handleClick}
        disabled={loading}
        title="Информация"
      >
        ⓘ
      </button>

      <InfoDialog
        open={open}
        title={title}
        seasonInfo={seasonInfo}
        teamsInfo={teamsInfo}
        onClose={() => setOpen(false)}
      />
    </>
  );
}