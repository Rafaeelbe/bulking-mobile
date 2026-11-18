export type FoodUnit = "GRAM" | "MILLILITER" | "UNIT";

export interface Food {
  id: number;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbohydrate: number;
  fat: number;
  referenceQuantity: number;
  referenceUnit: FoodUnit;
}

export interface MealFood {
  id: number;
  foodId: number;
  foodName: string;
  quantity: number;
  referenceUnit: FoodUnit;
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
}

export interface Meal {
  id: number;
  userId: number;
  name: string;
  date: string;
  mealType: string;
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  foods: MealFood[];
}

export interface DailySummary {
  userId: number;
  date: string;
  calories: number;
  carbohydrate: number;
  protein: number;
  fat: number;
  meals: Meal[];
}
