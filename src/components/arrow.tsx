export default function Arrow({
  direction = "diagonal",
}: {
  direction?: "diagonal" | "right" | "left" | "up" | "down";
}) {
  const paths = {
    diagonal: "M5 19 19 5M5 5h14v14",
    right: "M4 12h16M14 6l6 6-6 6",
    left: "M20 12H4m6-6-6 6 6 6",
    up: "M12 20V4m-6 6 6-6 6 6",
    down: "M12 4v16m-6-6 6 6 6-6",
  };
  return (
    <svg
      className="arrow-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[direction]} />
    </svg>
  );
}
