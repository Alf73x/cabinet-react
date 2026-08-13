import "./LoadingPanel.css";

type Props = {
  text?: string;
};

export default function LoadingPanel({
  text = "Загрузка...",
}: Props) {
  return (
    <div className="loading-panel">
      <div className="loading-panel-spinner" />
      <div className="loading-panel-text">{text}</div>
    </div>
  );
}