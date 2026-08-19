import "./CloseButton.css";

type Props = {
  onClick: () => void;
  desktop?: boolean;
};

export default function CloseButton({
  onClick,
  desktop = false,
}: Props) {
  return (
    <button
      type="button"
      className={`close-button${desktop ? " close-button-desktop" : ""}`}
      onClick={onClick}
      aria-label="Закрыть"
    >
      ✕
    </button>
  );
}