type Props = {
  className?: string;
};

export default function SCLogo({ className = "" }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <text
        x="23"
        y="56"
        fontFamily="Arial Black, Arial, sans-serif"
        fontSize="48"
        fontWeight="900"
        fill="var(--sc-logo-c)"
      >
        C
      </text>

      <text
        x="2"
        y="38"
        fontFamily="Arial Black, Arial, sans-serif"
        fontSize="48"
        fontWeight="900"
        fill="var(--sc-logo-s)"
      >
        S
      </text>


    </svg>
  );
}