import {
  Apple,
  ArrowLeft,
  Check,
  Coffee,
  Moon,
  Search,
  Utensils,
  X,
} from "lucide-react-native";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getMealDisplayName } from "@/constants/meals";
import { useDailySummary } from "@/hooks/useDailySummary";
import { apiGet, apiPost, apiPut } from "@/services/api";
import type { Food, FoodUnit, Meal, MealFood } from "@/types/nutrition";

const COLORS = {
  surface: "#FFFFFF",
  primary: "#F97316",
  primaryLight: "#FFF7ED",
  text: "#1E293B",
  secondary: "#64748B",
  muted: "#94A3B8",
  border: "#E2E8F0",
  purple: "#A855F7",
  blue: "#3B82F6",
  green: "#16A34A",
};

type AddFoodSheetContextValue = {
  open: () => void;
  openForEdit: (meal: Meal, food: MealFood) => void;
  refreshKey: number;
};

const AddFoodSheetContext = createContext<AddFoodSheetContextValue | null>(null);

export function useAddFoodSheet() {
  const context = useContext(AddFoodSheetContext);

  if (!context) {
    throw new Error("useAddFoodSheet must be used inside AddFoodSheetProvider");
  }

  return context;
}

export function AddFoodSheetProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState<{ meal: Meal; food: MealFood } | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const open = useCallback(() => {
    setEditing(null);
    setVisible(true);
  }, []);
  const openForEdit = useCallback((meal: Meal, food: MealFood) => {
    setEditing({ meal, food });
    setVisible(true);
  }, []);

  return (
    <AddFoodSheetContext.Provider value={{ open, openForEdit, refreshKey }}>
      {children}
      <AddFoodSheet
        visible={visible}
        editing={editing}
        onClose={() => {
          setEditing(null);
          setVisible(false);
        }}
        onSaved={() => {
          setEditing(null);
          setVisible(false);
          setRefreshKey((value) => value + 1);
        }}
      />
    </AddFoodSheetContext.Provider>
  );
}

type AddFoodSheetProps = {
  visible: boolean;
  editing: { meal: Meal; food: MealFood } | null;
  onClose: () => void;
  onSaved: () => void;
};

type MealVisual = {
  description: string;
  icon: typeof Coffee;
  color: string;
  background: string;
};

const MEAL_VISUALS: Record<string, MealVisual> = {
  CAFE_DA_MANHA: {
    description: "Café da manhã",
    icon: Coffee,
    color: COLORS.primary,
    background: COLORS.primaryLight,
  },
  ALMOCO: {
    description: "Refeição principal",
    icon: Utensils,
    color: COLORS.blue,
    background: "#EFF6FF",
  },
  LANCHE_DA_TARDE: {
    description: "Lanche",
    icon: Apple,
    color: COLORS.purple,
    background: "#FAF5FF",
  },
  JANTAR: {
    description: "Refeição principal",
    icon: Moon,
    color: COLORS.green,
    background: "#F0FDF4",
  },
};

function getLocalDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function getUnitLabel(unit: FoodUnit) {
  if (unit === "MILLILITER") return "ml";
  if (unit === "UNIT") return "un.";
  return "g";
}

function getMealVisual(meal: Meal) {
  return MEAL_VISUALS[meal.mealType] ?? {
    description: "Refeição",
    icon: Utensils,
    color: COLORS.secondary,
    background: "#F1F5F9",
  };
}

function Progress({ step }: { step: number }) {
  return (
    <View style={styles.progressRow}>
      {[1, 2, 3].map((item) => (
        <View
          key={item}
          style={[styles.progressBar, item <= step && styles.progressBarActive]}
        />
      ))}
    </View>
  );
}

function StepHeader({
  step,
  title,
  onBack,
  onClose,
}: {
  step: number;
  title: string;
  onBack?: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <View style={styles.sheetHandle} />
      <View style={styles.stepHeader}>
        {onBack ? (
          <Pressable onPress={onBack} style={styles.headerButton} hitSlop={8}>
            <ArrowLeft size={19} color={COLORS.secondary} />
          </Pressable>
        ) : (
          <View style={styles.headerButtonPlaceholder} />
        )}
        <View style={styles.stepHeading}>
          <Text style={styles.stepLabel}>Etapa {step} de 3</Text>
          <Text style={styles.stepTitle}>{title}</Text>
        </View>
        <Pressable onPress={onClose} style={styles.headerButton} hitSlop={8}>
          <X size={19} color={COLORS.secondary} />
        </Pressable>
      </View>
      <Progress step={step} />
    </>
  );
}

export function AddFoodSheet({ visible, editing, onClose, onSaved }: AddFoodSheetProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { summary, loading: loadingMeals } = useDailySummary(getLocalDate());
  const [step, setStep] = useState(1);
  const [foods, setFoods] = useState<Food[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState("");
  const [search, setSearch] = useState("");
  const [loadingFoods, setLoadingFoods] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sheetAnimation] = useState(new Animated.Value(0));

  const loadFoodsForEdit = useCallback(async (foodId: number) => {
    try {
      setLoadingFoods(true);
      setError(null);
      const loadedFoods = await apiGet<Food[]>("/foods");
      setFoods(loadedFoods);
      const currentFood = loadedFoods.find((food) => food.id === foodId);
      if (currentFood) setSelectedFood(currentFood);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar alimentos.");
    } finally {
      setLoadingFoods(false);
    }
  }, []);

  useEffect(() => {
    if (!visible) return;

    Keyboard.dismiss();
    const resetTimeout = setTimeout(() => {
      setStep(editing ? 3 : 1);
      setSelectedMeal(editing?.meal ?? null);
      setSelectedFood(null);
      setQuantity(editing ? String(editing.food.quantity) : "");
      setSearch("");
      setError(null);
      if (editing) void loadFoodsForEdit(editing.food.foodId);
    }, 0);
    Animated.spring(sheetAnimation, {
      toValue: 1,
      useNativeDriver: true,
      damping: 22,
      stiffness: 220,
    }).start();

    return () => clearTimeout(resetTimeout);
  }, [editing, loadFoodsForEdit, sheetAnimation, visible]);

  const close = useCallback(() => {
    Keyboard.dismiss();
    Animated.timing(sheetAnimation, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) onClose();
    });
  }, [onClose, sheetAnimation]);

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

  function selectMeal(meal: Meal) {
    setSelectedMeal(meal);
    setStep(2);
    if (foods.length === 0) void loadFoods();
  }

  function selectFood(food: Food) {
    setSelectedFood(food);
    setStep(3);
  }

  async function saveFood() {
    const parsedQuantity = Number(quantity.replace(",", "."));

    if (!selectedMeal || !selectedFood || !Number.isFinite(parsedQuantity) || parsedQuantity < 1) {
      setError("Informe uma quantidade válida para adicionar o alimento.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const requestBody = {
        mealId: selectedMeal.id,
        foodId: selectedFood.id,
        quantity: parsedQuantity,
      };
      if (editing) {
        await apiPut(`/meal-foods/${editing.food.id}`, requestBody);
      } else {
        await apiPost("/meal-foods", requestBody);
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  const filteredFoods = useMemo(
    () => foods.filter((food) => food.name.toLowerCase().includes(search.trim().toLowerCase())),
    [foods, search],
  );

  const sheetTranslateY = sheetAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [height, 0],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={close} />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardContainer}
          pointerEvents="box-none"
        >
          <Animated.View
            style={[
              styles.sheet,
              {
                maxHeight: height * 0.86,
                paddingBottom: Math.max(insets.bottom, 16),
                transform: [{ translateY: sheetTranslateY }],
              },
            ]}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
                {step === 1 && (
                  <>
                    <StepHeader step={1} title="Selecione a refeição" onClose={close} />
                    <View style={styles.optionsList}>
                      {loadingMeals ? (
                        <ActivityIndicator color={COLORS.primary} />
                      ) : (
                        summary?.meals.map((meal) => {
                          const visual = getMealVisual(meal);
                          const Icon = visual.icon;
                          return (
                            <Pressable key={meal.id} style={styles.optionCard} onPress={() => selectMeal(meal)}>
                              <View style={[styles.optionIcon, { backgroundColor: visual.background }]}>
                                <Icon size={19} color={visual.color} strokeWidth={1.8} />
                              </View>
                              <View style={styles.optionCopy}>
                                <Text style={styles.optionTitle}>{getMealDisplayName(meal.mealType)}</Text>
                                <Text style={styles.optionDescription}>{visual.description}</Text>
                              </View>
                              <Text style={styles.optionChevron}>›</Text>
                            </Pressable>
                          );
                        })
                      )}
                    </View>
                  </>
                )}

                {step === 2 && (
                  <>
                    <StepHeader step={2} title="Selecione o alimento" onBack={() => setStep(1)} onClose={close} />
                    <View style={styles.searchBox}>
                      <Search size={17} color={COLORS.muted} />
                      <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Buscar alimento existente..."
                        placeholderTextColor={COLORS.muted}
                        style={styles.searchInput}
                        autoCorrect={false}
                        returnKeyType="search"
                      />
                    </View>
                    <Text style={styles.listLabel}>ALIMENTOS</Text>
                    {loadingFoods ? (
                      <ActivityIndicator color={COLORS.primary} style={styles.loader} />
                    ) : (
                      <View style={styles.optionsList}>
                        {filteredFoods.map((food) => (
                          <Pressable key={food.id} style={styles.foodCard} onPress={() => selectFood(food)}>
                            <View style={styles.foodInitial}>
                              <Text style={styles.foodInitialText}>{food.name.charAt(0).toUpperCase()}</Text>
                            </View>
                            <View style={styles.optionCopy}>
                              <Text style={styles.optionTitle}>{food.name}</Text>
                              <Text style={styles.optionDescription}>Quantidade em {getUnitLabel(food.referenceUnit)}</Text>
                            </View>
                            <Text style={styles.optionChevron}>›</Text>
                          </Pressable>
                        ))}
                      </View>
                    )}
                  </>
                )}

                {step === 3 && selectedMeal && selectedFood && (
                  <>
                    <StepHeader step={3} title="Informe a quantidade" onBack={() => setStep(2)} onClose={close} />
                    <View style={styles.summaryCard}>
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Refeição</Text>
                        <Text style={styles.summaryValue}>{getMealDisplayName(selectedMeal.mealType)}</Text>
                      </View>
                      <View style={styles.summaryDivider} />
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Alimento</Text>
                        <Text style={styles.summaryValue}>{selectedFood.name}</Text>
                      </View>
                    </View>
                    <View style={styles.quantityHeader}>
                      <Text style={styles.quantityLabel}>Quantidade</Text>
                      <Text style={styles.quantityReference}>Referência: {selectedFood.referenceQuantity} {getUnitLabel(selectedFood.referenceUnit)}</Text>
                    </View>
                    <View style={styles.quantityBox}>
                      <TextInput
                        value={quantity}
                        onChangeText={setQuantity}
                        placeholder="0"
                        placeholderTextColor="#CBD5E1"
                        keyboardType="decimal-pad"
                        style={styles.quantityInput}
                        selectTextOnFocus
                      />
                      <Text style={styles.quantityUnit}>{getUnitLabel(selectedFood.referenceUnit)}</Text>
                    </View>
                    <Pressable onPress={Keyboard.dismiss} style={styles.dismissKeyboard}>
                      <Text style={styles.dismissKeyboardText}>Ocultar teclado</Text>
                    </Pressable>
                    {error && <Text style={styles.errorText}>{error}</Text>}
                    <Pressable onPress={saveFood} disabled={saving} style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
                      {saving ? <ActivityIndicator color="#FFFFFF" /> : <><Check size={18} color="#FFFFFF" strokeWidth={2.5} /><Text style={styles.saveButtonText}>{editing ? "Salvar alterações" : "Adicionar à refeição"}</Text></>}
                    </Pressable>
                  </>
                )}
                {step === 3 && selectedMeal && !selectedFood && (
                  <>
                    <StepHeader step={3} title="Informe a quantidade" onClose={close} />
                    {loadingFoods ? <ActivityIndicator color={COLORS.primary} style={styles.loader} /> : error && <Text style={styles.errorText}>{error}</Text>}
                  </>
                )}
                {error && step !== 3 && <Text style={styles.errorText}>{error}</Text>}
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(15, 23, 42, 0.52)" },
  keyboardContainer: { flex: 1, justifyContent: "flex-end" },
  sheet: { backgroundColor: COLORS.surface, borderTopLeftRadius: 25, borderTopRightRadius: 25, overflow: "hidden" },
  sheetContent: { flexShrink: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  sheetHandle: { alignSelf: "center", width: 29, height: 4, borderRadius: 4, backgroundColor: "#CBD5E1", marginBottom: 12 },
  stepHeader: { flexDirection: "row", alignItems: "center", minHeight: 47 },
  headerButton: { width: 34, height: 34, borderRadius: 11, borderWidth: 1, borderColor: COLORS.border, alignItems: "center", justifyContent: "center" },
  headerButtonPlaceholder: { width: 34 },
  stepHeading: { flex: 1, paddingHorizontal: 10 },
  stepLabel: { color: COLORS.secondary, fontSize: 12, marginBottom: 3 },
  stepTitle: { color: COLORS.text, fontSize: 18, fontWeight: "500" },
  progressRow: { flexDirection: "row", gap: 5, marginTop: 12, marginBottom: 16 },
  progressBar: { flex: 1, height: 4, borderRadius: 4, backgroundColor: "#E2E8F0" },
  progressBarActive: { backgroundColor: COLORS.primary },
  optionsList: { gap: 8 },
  optionCard: { minHeight: 60, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 9, flexDirection: "row", alignItems: "center" },
  optionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  optionCopy: { flex: 1, paddingHorizontal: 12 },
  optionTitle: { color: COLORS.text, fontSize: 12, fontWeight: "700" },
  optionDescription: { color: COLORS.muted, fontSize: 10, marginTop: 4 },
  optionChevron: { color: "#CBD5E1", fontSize: 25, lineHeight: 25, paddingHorizontal: 5 },
  searchBox: { height: 43, borderWidth: 1, borderColor: "#FDBA74", borderRadius: 13, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, backgroundColor: COLORS.surface },
  searchInput: { flex: 1, color: COLORS.text, fontSize: 12, marginLeft: 8 },
  listLabel: { color: COLORS.secondary, fontSize: 9, fontWeight: "700", marginTop: 16, marginBottom: 8, letterSpacing: 0.5 },
  loader: { marginVertical: 24 },
  foodCard: { minHeight: 53, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 7, flexDirection: "row", alignItems: "center" },
  foodInitial: { width: 38, height: 38, borderRadius: 12, backgroundColor: COLORS.primaryLight, alignItems: "center", justifyContent: "center" },
  foodInitialText: { color: COLORS.primary, fontSize: 14, fontWeight: "700" },
  summaryCard: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 13, paddingHorizontal: 12, backgroundColor: "#F8FAFC" },
  summaryRow: { minHeight: 42, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  summaryLabel: { color: COLORS.muted, fontSize: 10 },
  summaryValue: { color: COLORS.text, fontSize: 11, fontWeight: "700", flexShrink: 1, textAlign: "right" },
  summaryDivider: { height: 1, backgroundColor: COLORS.border },
  quantityHeader: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 18, marginBottom: 7 },
  quantityLabel: { color: COLORS.text, fontSize: 13, fontWeight: "700" },
  quantityReference: { color: COLORS.muted, fontSize: 10 },
  quantityBox: { minHeight: 70, borderWidth: 1, borderColor: "#FDBA74", borderRadius: 14, paddingHorizontal: 12, flexDirection: "row", alignItems: "center" },
  quantityInput: { flex: 1, color: COLORS.text, fontSize: 23, fontWeight: "600" },
  quantityUnit: { color: COLORS.secondary, fontSize: 12, fontWeight: "600" },
  dismissKeyboard: { alignSelf: "flex-end", paddingVertical: 8 },
  dismissKeyboardText: { color: COLORS.secondary, fontSize: 11 },
  errorText: { color: "#DC2626", fontSize: 11, marginTop: 12 },
  saveButton: { minHeight: 50, borderRadius: 14, backgroundColor: COLORS.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 8 },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { color: COLORS.surface, fontSize: 13, fontWeight: "700" },
});
