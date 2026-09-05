import Slider from "@react-native-community/slider";
import { MediaSeekProps } from "./MediaSeek.types";

export function MediaSeek({
  value,
  duration,
  disabled,
  onSeek,
}: MediaSeekProps) {
  return (
    <Slider
      accessibilityLabel="Video position"
      style={{ flex: 1, height: 44 }}
      minimumValue={0}
      maximumValue={duration || 1}
      value={value}
      disabled={disabled}
      step={0.1}
      onValueChange={onSeek}
      minimumTrackTintColor="#17634b"
      maximumTrackTintColor="#d3ddd5"
      thumbTintColor="#17634b"
    />
  );
}
