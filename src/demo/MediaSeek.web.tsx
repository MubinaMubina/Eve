import { MediaSeekProps } from "./MediaSeek.types";

export function MediaSeek({
  value,
  duration,
  disabled,
  onSeek,
}: MediaSeekProps) {
  return (
    <input
      aria-label="Video position"
      type="range"
      min={0}
      max={duration || 1}
      step="any"
      value={Math.min(value, duration || 1)}
      disabled={disabled}
      onChange={(event) => onSeek(event.currentTarget.valueAsNumber)}
      style={{
        flex: 1,
        minWidth: 0,
        height: 44,
        margin: 0,
        accentColor: "#17634b",
      }}
    />
  );
}
