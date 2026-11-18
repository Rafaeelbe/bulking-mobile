import AppTabs from "@/components/app-tabs";
import { AddFoodSheetProvider } from "@/components/add-food-sheet";

export default function TabsLayout() {
  return (
    <AddFoodSheetProvider>
      <AppTabs />
    </AddFoodSheetProvider>
  );
}
