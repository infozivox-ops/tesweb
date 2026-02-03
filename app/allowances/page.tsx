"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { CurrencyInput } from "@/components/CurrencyInput";
import { useFamilyWallet } from "@/store/FamilyWalletStore";
import { createAllowancePlan, generateMonthlyAllowances } from "@/store/actions";
import { getActiveFamily } from "@/lib/selectors";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/components/ToastProvider";

export default function AllowancesPage() {
  const { state, setState } = useFamilyWallet();
  const { notify } = useToast();
  const activeFamily = getActiveFamily(state);
  const [memberId, setMemberId] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!activeFamily) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Harçlık planları için aktif aile seçin.</p>
      </Card>
    );
  }

  const members = state.members.filter((member) => member.familyId === activeFamily.id);
  const plans = state.allowancePlans.filter((plan) => plan.familyId === activeFamily.id);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const numericAmount = Number(amount);
    if (!memberId || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError("Üye ve tutar zorunlu.");
      return;
    }
    const next = createAllowancePlan(state, {
      familyId: activeFamily.id,
      memberId,
      amount: numericAmount,
      frequency: frequency as "one_time" | "weekly" | "monthly",
      note: note.trim() || undefined,
    });
    setState(next);
    setMemberId("");
    setAmount("");
    setNote("");
    notify("Harçlık planı oluşturuldu.", "success");
  };

  const handleGenerate = () => {
    const next = generateMonthlyAllowances(state, activeFamily.id);
    setState(next);
    notify("Bu ay için harçlıklar işlendi.", "success");
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Harçlık Planları</h2>
          <Button variant="secondary" onClick={handleGenerate}>
            Bu ay üret
          </Button>
        </div>
        <div className="space-y-3">
          {plans.length === 0 ? (
            <p className="text-sm text-slate-500">Henüz plan yok.</p>
          ) : (
            plans.map((plan) => {
              const member = members.find((item) => item.id === plan.memberId);
              return (
                <div
                  key={plan.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{member?.displayName ?? "-"}</p>
                    <p className="text-xs text-slate-500">{plan.frequency}</p>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatCurrency(plan.amount, activeFamily.currency)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-lg font-semibold">Yeni harçlık planı</h3>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Select value={memberId} onChange={(event) => setMemberId(event.target.value)}>
            <option value="">Üye seçin</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.displayName}
              </option>
            ))}
          </Select>
          <CurrencyInput value={amount} onChange={setAmount} />
          <Select value={frequency} onChange={(event) => setFrequency(event.target.value)}>
            <option value="one_time">Tek seferlik</option>
            <option value="weekly">Haftalık</option>
            <option value="monthly">Aylık</option>
          </Select>
          <Input
            placeholder="Not (opsiyonel)"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button type="submit">Plan oluştur</Button>
        </form>
      </Card>
    </div>
  );
}
