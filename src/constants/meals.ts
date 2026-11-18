const MEAL_DISPLAY_NAMES: Record<string, string> = {
  CAFE_DA_MANHA: "Café da manhã",
  ALMOCO: "Almoço",
  LANCHE_DA_TARDE: "Lanche da tarde",
  JANTAR: "Jantar",
};

export function getMealDisplayName(mealType: string) {
  return MEAL_DISPLAY_NAMES[mealType] ?? mealType;
}
