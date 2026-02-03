"use client";

import { Button } from "@/components/Button";
import { useFamilyWallet } from "@/store/FamilyWalletStore";
import { resetState } from "@/lib/storage";

export const StorageAlert = () => {
  const { loadError, clearLoadError } = useFamilyWallet();
  if (!loadError) {
    return null;
  }
  const handleReset = () => {
    resetState();
    clearLoadError();
  };
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>{loadError} Güvenli sıfırlama önerilir.</span>
        <Button variant="secondary" onClick={handleReset}>
          Veriyi sıfırla
        </Button>
      </div>
    </div>
  );
};
