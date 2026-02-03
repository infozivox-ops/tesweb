"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { useFamilyWallet } from "@/store/FamilyWalletStore";
import { createFamily } from "@/store/actions";
import { currencyOptions } from "@/lib/validation";
import { useToast } from "@/components/ToastProvider";

export default function CreateFamilyPage() {
  const { state, setState } = useFamilyWallet();
  const { notify } = useToast();
  const router = useRouter();
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("TRY");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Aile adı zorunlu.");
      return;
    }
    try {
      const next = createFamily(
        state,
        name.trim(),
        currency as "TRY" | "USD" | "EUR",
        description.trim() || undefined
      );
      setState(next);
      notify("Aile hesabı oluşturuldu.", "success");
      router.push("/dashboard");
    } catch (error) {
      setError("Aile oluşturulamadı.");
    }
  };

  return (
    <Card className="max-w-xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Aile hesabı oluştur</h2>
        <p className="text-sm text-slate-600">Aile adını ve para birimini belirleyin.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          placeholder="Aile adı"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={error && !name.trim() ? error : undefined}
        />
        <Select value={currency} onChange={(event) => setCurrency(event.target.value)}>
          {currencyOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
        <Input
          placeholder="Açıklama (opsiyonel)"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        {error && name.trim() ? <p className="text-sm text-rose-600">{error}</p> : null}
        <Button type="submit" disabled={!name.trim()}>
          Oluştur
        </Button>
      </form>
    </Card>
  );
}
