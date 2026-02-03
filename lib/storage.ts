import type { FamilyWalletState } from "@/types/domain";
import { validateState } from "@/lib/validation";

export const STORAGE_KEY = "family_wallet_state_v1";

const emptyState: FamilyWalletState = {
  families: [],
  members: [],
  allowancePlans: [],
  expenses: [],
  settlements: [],
  audit: [],
  session: {},
};

export const getEmptyState = () => structuredClone(emptyState);

export const loadState = () => {
  if (typeof window === "undefined") {
    return { state: getEmptyState(), error: null };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { state: getEmptyState(), error: null };
    }
    const parsed = JSON.parse(raw) as unknown;
    const result = validateState(parsed);
    if (result.success) {
      return { state: result.data, error: null };
    }
    return {
      state: getEmptyState(),
      error: "Veri bozuk görünüyor.",
    };
  } catch (error) {
    return { state: getEmptyState(), error: "Veri yüklenemedi." };
  }
};

export const saveState = (state: FamilyWalletState) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("LocalStorage kayıt hatası", error);
  }
};

export const resetState = () => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("LocalStorage temizleme hatası", error);
  }
};
