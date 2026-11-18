import { Tabs } from "expo-router";
import {
  Apple,
  House,
  NotebookText,
  Plus,
  UserRound,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAddFoodSheet } from "@/components/add-food-sheet";

const COLORS = {
  primary: "#F97316",
  text: "#1E293B",
  muted: "#94A3B8",
  background: "#FFFFFF",
  border: "#E2E8F0",
};

function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { open } = useAddFoodSheet();

  const tabs = [
    { name: "index", label: "Início", icon: House },
    { name: "diary", label: "Diário", icon: NotebookText },
    { name: "food", label: "Alimentos", icon: Apple },
    { name: "profile", label: "Perfil", icon: UserRound },
  ];

  return (
    <View
      style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 10) }]}
    >
      {tabs.slice(0, 2).map((tab) => {
        const focused = state.routes[state.index]?.name === tab.name;
        const Icon = tab.icon;

        return (
          <Pressable
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name)}
          >
            <Icon size={21} color={focused ? COLORS.primary : COLORS.muted} />
            <Text style={[styles.tabLabel, focused && styles.activeLabel]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}

      <Pressable
        style={styles.addButton}
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel="Adicionar alimento"
      >
        <Plus size={30} color="#FFFFFF" strokeWidth={2.5} />
      </Pressable>

      {tabs.slice(2).map((tab) => {
        const focused = state.routes[state.index]?.name === tab.name;
        const Icon = tab.icon;

        return (
          <Pressable
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name)}
          >
            <Icon size={21} color={focused ? COLORS.primary : COLORS.muted} />
            <Text style={[styles.tabLabel, focused && styles.activeLabel]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function AppTabs() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="diary" />
      <Tabs.Screen name="food" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 75,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 9,
    paddingHorizontal: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    color: COLORS.muted,
    fontWeight: "500",
  },
  activeLabel: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  addButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -35,
    elevation: 6,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
});
