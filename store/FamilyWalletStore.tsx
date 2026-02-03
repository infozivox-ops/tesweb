"use client";

import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { loadState, saveState } from "@/lib/storage";
import type { FamilyWalletState } from "@/types/domain";
import { getEmptyState } from "@/lib/storage";
import { reducer } from "@/store/reducer";

interface StoreContextValue {
  state: FamilyWalletState;
  setState: (next: FamilyWalletState) => void;
  loadError: string | null;
  clearLoadError: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export const FamilyWalletProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, dispatch] = useReducer(reducer, getEmptyState());
  const [loadError, setLoadError] = React.useState<string | null>(null);

  useEffect(() => {
    const { state: stored, error } = loadState();
    dispatch({ type: "LOAD_STATE", payload: stored });
    setLoadError(error);
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const value = useMemo(
    () => ({
      state,
      setState: (next: FamilyWalletState) => dispatch({ type: "SET_STATE", payload: next }),
      loadError,
      clearLoadError: () => setLoadError(null),
    }),
    [state, loadError]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useFamilyWallet = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("FamilyWalletProvider bulunamadı.");
  }
  return context;
};
