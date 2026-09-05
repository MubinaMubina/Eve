export type MediaSeekProps = {
  value: number;
  duration: number;
  disabled: boolean;
  onSeek: (seconds: number) => void;
};
