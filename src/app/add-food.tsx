import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useDailySummary } from "@/hooks/useDailySummary";
import { apiGet, apiPost } from "@/services/api";
import type { Food, FoodUnit } from "@/types/nutrition";

const COLORS = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#1E293B",
  muted: "#64748B",
  secondary: "#64748B",
  primary: "#F97316",
  border: "#E2E8F0",
};

function getLocalDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function unitLabel(unit: FoodUnit) {
  if (unit === "MILLILITER") return "ml";
  if (unit === "UNIT") return "unidade(s)";
  return "g";
}

export default function AddFoodScreen() {
  const insets = useSafeAreaInsets();
  const date = getLocalDate();
  const { summary, loading: loadingMeals } = useDailySummary(date);
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedFoodId, setSelectedFoodId] = useState<number | null>(null);
  const [selectedMealId, setSelectedMealId] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("");
  const [search, setSearch] = useState("");
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFoods() {
      try {
        setLoadingFoods(true);
        setError(null);
        setFoods(await apiGet<Food[]>("/foods"));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar alimentos.");
      } finally {
        setLoadingFoods(false);
      }
    }

    loadFoods();
  }, []);

  const selectedFood = foods.find((food) => food.id === selectedFoodId);
  const filteredFoods = useMemo(
    () => foods.filter((food) => food.name.toLowerCase().includes(search.toLowerCase())),
    [foods, search],
  );

  async function handleSave() {
    const parsedQuantity = Number(quantity.replace(",", "."));

    if (!selectedFood || !selectedMealId || !Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      setError("Selecione o alimento e a refeição e informe uma quantidade válida.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await apiPost("/meal-foods", {
        mealId: selectedMealId,
        foodId: selectedFood.id,
        quantity: parsedQuantity,
      });
      router.back();
    } catch (err) {
      Alert.alert("Não foi possível salvar", err instanceof Error ? err.message : "Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
        >
          <ArrowLeft size={23} color={COLORS.text} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>Adicionar alimento</Text>

          <Text style={styles.subtitle}>
            Vamos registrar sua alimentação aqui.
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Alimento</Text>
      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar alimento"
        placeholderTextColor={COLORS.muted}
        style={styles.input}
      />

      {loadingFoods ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : (
        <View style={styles.optionsList}>
          {filteredFoods.map((food) => {
            const selected = food.id === selectedFoodId;
            return (
              <Pressable
                key={food.id}
                onPress={() => setSelectedFoodId(food.id)}
                style={[styles.option, selected && styles.selectedOption]}
              >
                <View>
                  <Text style={styles.optionName}>{food.name}</Text>
                  <Text style={styles.optionMeta}>
                    Referência: {food.referenceQuantity} {unitLabel(food.referenceUnit)}
                  </Text>
                </View>
                {selected && <Text style={styles.selectedMark}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      )}

      <Text style={styles.sectionTitle}>Quantidade</Text>
      <View style={styles.quantityRow}>
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          placeholder="Ex.: 100"
          placeholderTextColor={COLORS.muted}
          keyboardType="decimal-pad"
          style={[styles.input, styles.quantityInput]}
        />
        <Text style={styles.unitText}>{selectedFood ? unitLabel(selectedFood.referenceUnit) : "unidade"}</Text>
      </View>

      <Text style={styles.sectionTitle}>Refeição</Text>
      {loadingMeals ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : (
        <View style={styles.optionsList}>
          {summary?.meals.map((meal) => {
            const selected = meal.id === selectedMealId;
            return (
              <Pressable
                key={meal.id}
                onPress={() => setSelectedMealId(meal.id)}
                style={[styles.option, selected && styles.selectedOption]}
              >
                <Text style={styles.optionName}>{meal.name}</Text>
                {selected && <Text style={styles.selectedMark}>✓</Text>}
              </Pressable>
            );
          })}
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable onPress={handleSave} disabled={saving} style={styles.saveButton}>
        {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.saveButtonText}>Salvar registro</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 25,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 5,
    fontSize: 13,
    color: COLORS.muted,
  },
  sectionTitle: {
    marginTop: 26,
    marginBottom: 9,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "700",
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.text,
    fontSize: 14,
  },
  loader: {
    marginVertical: 18,
  },
  optionsList: {
    gap: 8,
  },
  option: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 13,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectedOption: {
    borderColor: COLORS.primary,
    backgroundColor: "#FFF7ED",
  },
  optionName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "600",
  },
  optionMeta: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3,
  },
  selectedMark: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "700",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  quantityInput: {
    flex: 1,
  },
  unitText: {
    color: COLORS.secondary,
    fontSize: 13,
    minWidth: 70,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
    marginTop: 24,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});
