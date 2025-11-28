export type Cadence = "Daily" | "Weekly" | "Monthly";
export type UnitCategory = "Quantity" | "Time";

export interface HabitFormState {
  name: string;
  description: string;
  cadence: Cadence;
  startDate: string;
  timeOfDay: string;
  reminder: string;
  goalAmount: string;
  goalUnit: string;
  goalUnitCategory: UnitCategory;
}
