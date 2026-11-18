import { StyleSheet, Text, View } from "react-native";

export default function DiaryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil</Text>
      <Text style={styles.subtitle}>Suas informações aparecerão aqui.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 24,
    paddingTop: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1E293B",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#64748B",
  },
});
