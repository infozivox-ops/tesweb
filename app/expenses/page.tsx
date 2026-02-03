"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { CurrencyInput } from "@/components/CurrencyInput";
import { useFamilyWallet } from "@/store/FamilyWalletStore";
import { addExpense } from "@/store/actions";
import { getActiveFamily } from "@/lib/selectors";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/components/ToastProvider";

export default function ExpensesPage() {
  const { state, setState } = useFamilyWallet();
  const { notify } = useToast();
  const activeFamily = getActiveFamily(state);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidByMemberId, setPaidByMemberId] = useState("");
  const [splitMethod, setSplitMethod] = useState("equal");
  const [participants, setParticipants] = useState<Record<string, string>>({});
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const members = useMemo(() => {
    if (!activeFamily) {
      return [];
    }
    return state.members.filter((member) => member.familyId === activeFamily.id);
  }, [state.members, activeFamily]);

  const expenses = useMemo(() => {
    if (!activeFamily) {
      return [];
    }
    return state.expenses.filter((expense) => expense.familyId === activeFamily.id);
  }, [state.expenses, activeFamily]);

  if (!activeFamily) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Gider eklemek için aktif aile seçin.</p>
      </Card>
    );
  }

  const toggleParticipant = (memberId: string) => {
    setParticipants((current) => {
      if (current[memberId] !== undefined) {
        const { [memberId]: _removed, ...rest } = current;
        return rest;
      }
      return { ...current, [memberId]: "" };
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const numericAmount = Number(amount);
    if (!title.trim() || !paidByMemberId || Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError("Başlık, ödeme yapan ve tutar zorunlu.");
      return;
    }
    const participantIds = Object.keys(participants);
    if (participantIds.length === 0) {
      setError("En az bir katılımcı seçin.");
      return;
    }
    let shares: { memberId: string; shareAmount: number }[] = [];
    if (splitMethod === "equal") {
      const share = numericAmount / participantIds.length;
      shares = participantIds.map((id) => ({ memberId: id, shareAmount: Number(share.toFixed(2)) }));
    } else {
      shares = participantIds.map((id) => ({
        memberId: id,
        shareAmount: Number(participants[id] || 0),
      }));
      const totalShares = shares.reduce((sum, item) => sum + item.shareAmount, 0);
      if (Math.abs(totalShares - numericAmount) > 0.5) {
        setError("Özel paylar toplamı tutarla eşleşmeli.");
        return;
      }
    }

    const next = addExpense(state, {
      familyId: activeFamily.id,
      title: title.trim(),
      amount: numericAmount,
      paidByMemberId,
      splitMethod: splitMethod as "equal" | "custom",
      participants: shares,
      note: note.trim() || undefined,
    });
    setState(next);
    setTitle("");
    setAmount("");
    setPaidByMemberId("");
    setParticipants({});
    setNote("");
    notify("Gider kaydedildi.", "success");
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Giderler</h2>
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <p className="text-sm text-slate-500">Henüz gider yok.</p>
          ) : (
            expenses.map((expense) => {
              const paidBy = members.find((member) => member.id === expense.paidByMemberId);
              return (
                <div
                  key={expense.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{expense.title}</p>
                    <p className="text-xs text-slate-500">Ödeyen: {paidBy?.displayName ?? "-"}</p>
                  </div>
                  <div className="text-sm font-semibold">
                    {formatCurrency(expense.amount, activeFamily.currency)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-lg font-semibold">Gider ekle</h3>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <Input
            placeholder="Gider başlığı"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <CurrencyInput value={amount} onChange={setAmount} />
          <Select value={paidByMemberId} onChange={(event) => setPaidByMemberId(event.target.value)}>
            <option value="">Ödeyen üye</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.displayName}
              </option>
            ))}
          </Select>
          <Select value={splitMethod} onChange={(event) => setSplitMethod(event.target.value)}>
            <option value="equal">Eşit böl</option>
            <option value="custom">Özel paylaşım</option>
          </Select>
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-700">Katılımcılar</p>
            <div className="grid gap-2 md:grid-cols-2">
              {members.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                >
                  <span>{member.displayName}</span>
                  <input
                    type="checkbox"
                    checked={participants[member.id] !== undefined}
                    onChange={() => toggleParticipant(member.id)}
                  />
                </label>
              ))}
            </div>
          </div>
          {splitMethod === "custom" && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Özel paylar</p>
              {Object.keys(participants).map((memberId) => {
                const member = members.find((item) => item.id === memberId);
                return (
                  <Input
                    key={memberId}
                    placeholder={`${member?.displayName ?? "Üye"} payı`}
                    value={participants[memberId] ?? ""}
                    onChange={(event) =>
                      setParticipants((current) => ({
                        ...current,
                        [memberId]: event.target.value.replace(/[^\d.]/g, ""),
                      }))
                    }
                  />
                );
              })}
            </div>
          )}
          <Input placeholder="Not" value={note} onChange={(event) => setNote(event.target.value)} />
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button type="submit">Gider ekle</Button>
        </form>
      </Card>
    </div>
  );
}
