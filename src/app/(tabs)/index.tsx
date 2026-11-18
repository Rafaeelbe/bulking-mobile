import { StatusBar } from "expo-status-bar";
import {
  Apple,
  Beef,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Coffee,
  Droplet,
  Flame,
  Moon,
  Pencil,
  Trash2,
  Utensils,
  Wheat,
} from "lucide-react-native";
import { useCallback, useEffect, useState, type ComponentType } from "react";
import { useFocusEffect } from "expo-router";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDailySummary } from "@/hooks/useDailySummary";
import { useAddFoodSheet } from "@/components/add-food-sheet";
import { getMealDisplayName } from "@/constants/meals";
import { apiDelete } from "@/services/api";

const COLORS = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  primary: "#F97316",
  primaryLight: "#FFF7ED",
  text: "#1E293B",
  secondary: "#64748B",
  muted: "#94A3B8",
  border: "#E2E8F0",
  protein: "#F97316",
  carbohydrate: "#3B82F6",
  fat: "#16A34A",
};

type IconComponent = ComponentType<{
  color?: string;
  size?: number;
  strokeWidth?: number;
}>;

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Bom dia!";
  if (hour >= 12 && hour < 18) return "Boa tarde!";

  return "Boa noite!";
}

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function MacroItem({
  name,
  value,
  icon: Icon,
  color,
  background,
}: {
  name: string;
  value: string;
  icon: IconComponent;
  color: string;
  background: string;
}) {
  return (
    <View style={styles.macroItem}>
      <View style={[styles.macroIcon, { backgroundColor: background }]}>
        <Icon size={17} color={color} strokeWidth={1.8} />
      </View>

      <Text style={styles.macroName}>{name}</Text>

      <Text style={styles.macroValue}>
        {value} <Text style={styles.macroUnit}>g</Text>
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const formattedDate = today.charAt(0).toUpperCase() + today.slice(1);
  const date = getLocalDate();

  const { summary, loading, error, reload } = useDailySummary(date);
  const { refreshKey, openForEdit } = useAddFoodSheet();
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);
  const [deletingFoodId, setDeletingFoodId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function deleteMealFood(mealFoodId: number) {
    if (deletingFoodId !== null) return;

    try {
      setDeletingFoodId(mealFoodId);
      setActionError(null);
      await apiDelete(`/meal-foods/${mealFoodId}`);
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Não foi possível excluir o alimento.");
    } finally {
      setDeletingFoodId(null);
    }
  }

  function confirmDelete(mealFoodId: number, foodName: string) {
    Alert.alert(
      "Excluir alimento",
      `Deseja excluir ${foodName} desta refeição?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: () => void deleteMealFood(mealFoodId) },
      ],
    );
  }

  useFocusEffect(useCallback(() => {
    reload();
  }, [reload]));

  useEffect(() => {
    if (refreshKey === 0) return;

    const timeout = setTimeout(() => void reload(), 0);
    return () => clearTimeout(timeout);
  }, [refreshKey, reload]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>B</Text>
            </View>

            <Text style={styles.brandName}>BULKING</Text>
          </View>

          <View style={styles.avatar}>
            <Text style={styles.avatarText}>U</Text>
          </View>
        </View>

        {/* Saudação */}
        <View style={styles.greeting}>
          <View style={styles.dateRow}>
            <CalendarDays size={13} color={COLORS.primary} />
            <Text style={styles.date}>{formattedDate}</Text>
          </View>

          <Text style={styles.greetingTitle}>{getGreeting()}</Text>

          <Text style={styles.subtitle}>
            Acompanhe sua alimentação de hoje.
          </Text>
        </View>

        {/* Resumo diário */}
        <View style={styles.nutritionSection}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.sectionLabel}>RESUMO DIÁRIO</Text>
              <Text style={styles.summaryTitle}>Consumo de hoje</Text>
            </View>

            <View style={styles.todayBadge}>
              <CalendarDays size={13} color={COLORS.primary} />
              <Text style={styles.todayText}>Hoje</Text>
            </View>
          </View>

          {/* Calorias */}
          <View style={styles.calorieCard}>
            <View style={styles.calorieIcon}>
              <Flame size={23} color="#FFFFFF" strokeWidth={2} />
            </View>

            <View>
              <Text style={styles.calorieLabel}>Calorias consumidas</Text>

              <View style={styles.calorieRow}>
                <Text style={styles.calorieValue}>
                  {summary
                    ? Math.round(summary.calories).toLocaleString("pt-BR")
                    : loading
                      ? "..."
                      : "0"}
                </Text>

                <Text style={styles.calorieUnit}>kcal</Text>
              </View>
            </View>
          </View>

          {/* Macronutrientes */}
          <View style={styles.macros}>
            <MacroItem
              name="Proteínas"
              value={summary ? summary.protein.toFixed(0) : "0"}
              icon={Beef}
              color={COLORS.protein}
              background="#FFF7ED"
            />

            <MacroItem
              name="Carboidratos"
              value={summary ? summary.carbohydrate.toFixed(0) : "0"}
              icon={Wheat}
              color={COLORS.carbohydrate}
              background="#EFF6FF"
            />

            <MacroItem
              name="Gorduras"
              value={summary ? summary.fat.toFixed(0) : "0"}
              icon={Droplet}
              color={COLORS.fat}
              background="#F0FDF4"
            />
          </View>

          {error && (
            <Text style={styles.errorText}>
              Não foi possível carregar o resumo nutricional.
            </Text>
          )}
        </View>

        {/* Refeições */}
        <View style={styles.mealsSection}>
          <View style={styles.mealsHeader}>
            <Text style={styles.sectionTitle}>Refeições de hoje</Text>
            <Text style={styles.viewAll}>Ver diário</Text>
          </View>

          {loading && (
            <Text style={styles.statusText}>Carregando refeições...</Text>
          )}

          {!loading && !error && summary?.meals.length === 0 && (
            <Text style={styles.statusText}>
              Nenhuma refeição registrada hoje.
            </Text>
          )}

          {!loading &&
            !error &&
            summary?.meals.map((meal) => {
              const mealVisuals = {
                CAFE_DA_MANHA: {
                  icon: Coffee,
                  background: "#FFF7ED",
                  iconColor: "#F97316",
                },
                ALMOCO: {
                  icon: Utensils,
                  background: "#EFF6FF",
                  iconColor: "#3B82F6",
                },
                LANCHE_DA_TARDE: {
                  icon: Apple,
                  background: "#FAF5FF",
                  iconColor: "#A855F7",
                },
                JANTAR: {
                  icon: Moon,
                  background: "#F0FDF4",
                  iconColor: "#16A34A",
                },
              };

              const visual =
                mealVisuals[meal.mealType as keyof typeof mealVisuals] ??
                mealVisuals.ALMOCO;

              const MealIcon = visual.icon;
              const isExpanded = expandedMeal === meal.id;

              return (
                <View key={meal.id} style={styles.mealCard}>
                  <Pressable
                    style={styles.mealHeader}
                    onPress={() => setExpandedMeal(isExpanded ? null : meal.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${getMealDisplayName(meal.mealType)}, ${
                      isExpanded ? "recolher" : "expandir"
                    } alimentos`}
                  >
                    <View
                      style={[
                        styles.mealIcon,
                        { backgroundColor: visual.background },
                      ]}
                    >
                      <MealIcon
                        size={21}
                        color={visual.iconColor}
                        strokeWidth={1.8}
                      />
                    </View>

                    <View style={styles.mealInfo}>
                      <Text style={styles.mealName}>{getMealDisplayName(meal.mealType)}</Text>

                      <Text style={styles.mealDescription}>
                        {Math.round(meal.calories)} kcal · P:{" "}
                        {meal.protein.toFixed(0)}g · C:{" "}
                        {meal.carbohydrate.toFixed(0)}g · G:{" "}
                        {meal.fat.toFixed(0)}g
                      </Text>
                    </View>

                    {isExpanded ? (
                      <ChevronUp size={19} color={COLORS.secondary} />
                    ) : (
                      <ChevronDown size={19} color={COLORS.secondary} />
                    )}
                  </Pressable>

                  {isExpanded && (
                    <View style={styles.foodsContainer}>
                      <View style={styles.foodsDivider} />

                      {meal.foods.length === 0 ? (
                        <Text style={styles.emptyFoods}>
                          Nenhum alimento registrado nesta refeição.
                        </Text>
                      ) : (
                        meal.foods.map((food) => {
                          const unit =
                            food.referenceUnit === "GRAM"
                              ? "g"
                              : food.referenceUnit === "MILLILITER"
                                ? "ml"
                                : "un.";

                          return (
                            <View key={food.id} style={styles.foodItem}>
                              <View style={styles.foodInfo}>
                                <Text style={styles.foodName}>
                                  {food.foodName}
                                </Text>

                                <Text style={styles.foodQuantity}>
                                  {food.quantity} {unit}
                                </Text>
                              </View>

                              <View style={styles.foodNutrition}>
                                <Text style={styles.foodCalories}>
                                  {Math.round(food.calories)} kcal
                                </Text>

                                <Text style={styles.foodMacros}>
                                  P: {food.protein.toFixed(1)}g · C:{" "}
                                  {food.carbohydrate.toFixed(1)}g · G:{" "}
                                  {food.fat.toFixed(1)}g
                                </Text>
                                <View style={styles.foodActions}>
                                  <Pressable onPress={() => openForEdit(meal, food)} style={styles.foodActionButton} accessibilityRole="button" accessibilityLabel={`Editar ${food.foodName}`}>
                                    <Pencil size={14} color={COLORS.secondary} />
                                  </Pressable>
                                  <Pressable onPress={() => confirmDelete(food.id, food.foodName)} style={styles.foodActionButton} disabled={deletingFoodId !== null} accessibilityRole="button" accessibilityLabel={`Excluir ${food.foodName}`}>
                                    {deletingFoodId === food.id ? <ActivityIndicator size="small" color="#DC2626" /> : <Trash2 size={14} color="#DC2626" />}
                                  </Pressable>
                                </View>
                              </View>
                            </View>
                          );
                        })
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          {actionError && <Text style={styles.errorText}>{actionError}</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandMarkText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  brandName: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: COLORS.secondary,
    fontSize: 16,
  },
  greeting: {
    marginTop: 34,
    gap: 6,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  date: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  greetingTitle: {
    color: COLORS.text,
    fontSize: 27,
    fontWeight: "700",
  },
  subtitle: {
    color: COLORS.secondary,
    fontSize: 14,
  },
  nutritionSection: {
    marginTop: 32,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#FFEDD5",
    gap: 12,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  summaryTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
  },
  todayBadge: {
    borderWidth: 1,
    borderColor: "#FED7AA",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  todayText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "600",
  },
  calorieCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 17,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  calorieIcon: {
    width: 42,
    height: 42,
    backgroundColor: COLORS.primary,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  calorieLabel: {
    color: "#9A3412",
    fontSize: 10,
  },
  calorieRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  calorieValue: {
    color: COLORS.primary,
    fontSize: 27,
    fontWeight: "800",
    letterSpacing: -1,
  },
  calorieUnit: {
    color: COLORS.secondary,
    fontSize: 10,
  },
  macros: {
    flexDirection: "row",
    gap: 7,
  },
  macroItem: {
    flex: 1,
    minWidth: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 9,
    gap: 6,
  },
  macroIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  macroName: {
    color: COLORS.secondary,
    fontSize: 10,
  },
  macroValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  macroUnit: {
    color: COLORS.secondary,
    fontSize: 9,
    fontWeight: "400",
  },
  mealsSection: {
    marginTop: 26,
    gap: 12,
  },
  mealsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },
  viewAll: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "600",
  },
  mealCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    padding: 10,
  },
  mealHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  mealIcon: {
    width: 48,
    height: 48,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  mealInfo: {
    flex: 1,
    gap: 4,
  },
  mealName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
  },
  mealDescription: {
    color: COLORS.muted,
    fontSize: 10,
  },
  foodsContainer: {
    paddingTop: 12,
  },
  foodsDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 4,
  },
  foodItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    gap: 8,
  },
  foodInfo: {
    flex: 1,
    gap: 4,
  },
  foodName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: "600",
  },
  foodQuantity: {
    color: COLORS.muted,
    fontSize: 11,
  },
  foodNutrition: {
    alignItems: "flex-end",
    gap: 4,
  },
  foodActions: {
    flexDirection: "row",
    gap: 6,
    marginTop: 3,
  },
  foodActionButton: {
    width: 27,
    height: 27,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  foodCalories: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  foodMacros: {
    color: COLORS.secondary,
    fontSize: 9,
  },
  emptyFoods: {
    color: COLORS.secondary,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 12,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12,
  },
  statusText: {
    color: COLORS.secondary,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 12,
  },
});
