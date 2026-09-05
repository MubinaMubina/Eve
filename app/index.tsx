import { StyleSheet, Text, View } from "react-native";
import { Preview } from "../src/demo/Preview";

export default function Index() {
  if (__DEV__ && process.env.EXPO_PUBLIC_DEMO_MODE === "true")
    return <Preview />;
  return (
    <View style={styles.page}>
      <Text style={styles.brand}>eve</Text>
      <Text style={styles.heading}>Not open yet.</Text>
      <Text style={styles.copy}>
        Membership is not available in this build.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fafbfa",
  },
  brand: {
    fontSize: 48,
    fontWeight: "700",
    color: "#17634b",
    letterSpacing: 0,
    marginBottom: 24,
  },
  heading: { fontSize: 24, fontWeight: "600", color: "#242a27" },
  copy: { fontSize: 16, color: "#606861", marginTop: 12, textAlign: "center" },
});
