export type ProfileActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialProfileActionState: ProfileActionState = {
  status: "idle",
};
