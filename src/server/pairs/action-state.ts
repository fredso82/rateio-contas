export type PairActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialPairActionState: PairActionState = {
  status: "idle",
};
