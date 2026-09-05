import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";

export function IconButton({
  icon: Icon,
  label,
  onPress,
  danger = false,
  disabled = false,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <View style={s.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        disabled={disabled}
        aria-disabled={disabled}
        onPress={onPress}
        onHoverIn={() => setHover(true)}
        onHoverOut={() => setHover(false)}
        style={({ pressed }) => [s.button, (pressed || disabled) && s.dimmed]}
      >
        <Icon size={21} color={danger ? "#ad3e49" : "#242a27"} />
      </Pressable>
      {hover && (
        <View style={s.tooltip}>
          <Text style={s.tooltipText}>{label}</Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { position: "relative", zIndex: 5 },
  button: {
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  dimmed: { opacity: 0.5 },
  tooltip: {
    pointerEvents: "none",
    position: "absolute",
    top: 44,
    right: 0,
    backgroundColor: "#242a27",
    padding: 8,
    borderRadius: 4,
    minWidth: 90,
  },
  tooltipText: { fontSize: 11, color: "#fff", textAlign: "center" },
});
