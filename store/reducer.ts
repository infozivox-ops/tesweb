import type { FamilyWalletState } from "@/types/domain";

export type Action =
  | { type: "LOAD_STATE"; payload: FamilyWalletState }
  | { type: "SET_STATE"; payload: FamilyWalletState };

export const reducer = (
  state: FamilyWalletState,
  action: Action
): FamilyWalletState => {
  switch (action.type) {
    case "LOAD_STATE":
      return action.payload;
    case "SET_STATE":
      return action.payload;
    default:
      return state;
  }
};
