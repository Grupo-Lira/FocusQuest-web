const STAR_HOVER_STYLE = {
  width: 80,
  height: 80,
  top: "-20px",
  left: "-20px",
  transform: "scale(0.2)",
} as const;

export function StarHover() {
  return (
    <div
      className="absolute z-0 bg-[#FFDDBD] opacity-30 rounded-full star-hover"
      style={STAR_HOVER_STYLE}
    />
  );
}
