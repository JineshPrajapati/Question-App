import icons from "../../../icons";

export default function Icon({ name, size = 24, className = "" }) {
  const icon = icons[name];
  if (!icon) return null;

  // Extract original viewBox width/height
  const [, , vbWidth, vbHeight] = icon.viewBox.split(" ").map(Number);

  // Scale to fit into 24×24 box
  const scaleX = 24 / vbWidth;
  const scaleY = 24 / vbHeight;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24" // 👈 common viewBox for all icons
      fill="currentColor"
      className={`inline-block ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform={`scale(${scaleX} ${scaleY})`}>{icon.children}</g>
    </svg>
  );
}
