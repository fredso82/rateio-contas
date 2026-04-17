export type ExpenseActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialExpenseActionState: ExpenseActionState = {
  status: "idle",
};
