"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useFamilyWallet } from "@/store/FamilyWalletStore";
import { demoSeed } from "@/lib/seed";
import { resetState } from "@/lib/storage";
import { validateState } from "@/lib/validation";
import { getEmptyState } from "@/lib/storage";
import { useToast } from "@/components/ToastProvider";

export default function SettingsPage() {
  const { state, setState } = useFamilyWallet();
  const { notify } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const handleSeed = () => {
    setState(demoSeed);
    notify("Demo verisi yüklendi.", "success");
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "family-wallet-export.json";
    link.click();
    URL.revokeObjectURL(url);
    notify("Dışa aktarma hazır.", "success");
  };

  const handleImport = async () => {
    setImportError(null);
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setImportError("Dosya seçilmedi.");
      return;
    }
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as unknown;
      const result = validateState(parsed);
      if (!result.success) {
        setImportError("Geçersiz veri formatı.");
        return;
      }
      setState(result.data);
      notify("İçe aktarıldı.", "success");
    } catch (error) {
      setImportError("Dosya okunamadı.");
    }
  };

  const handleReset = () => {
    resetState();
    setState(getEmptyState());
    notify("Veriler sıfırlandı.", "success");
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Demo yönetimi</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleSeed}>Demo verisi yükle</Button>
          <Button variant="secondary" onClick={handleExport}>
            Dışa aktar
          </Button>
          <Button variant="secondary" onClick={handleReset}>
            Sıfırla
          </Button>
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-lg font-semibold">JSON içe aktar</h3>
        <input ref={fileInputRef} type="file" accept="application/json" />
        {importError ? <p className="text-sm text-rose-600">{importError}</p> : null}
        <Button variant="secondary" onClick={handleImport}>
          İçe aktar
        </Button>
      </Card>
    </div>
  );
}
