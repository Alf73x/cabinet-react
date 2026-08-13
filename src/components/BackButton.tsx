import "./BackButton.css";

type Props = {
  onClick: () => void;
  className?: string;
};

export default function BackButton({
  onClick,
  className = "",
}: Props) {
  return (
    <button
      type="button"
      className={`back-button ${className}`}
      onClick={onClick}
      title="Назад"
      aria-label="Назад"
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M15 18l-6-6 6-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}