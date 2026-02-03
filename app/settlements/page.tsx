"use client";

import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { useFamilyWallet } from "@/store/FamilyWalletStore";
import { getActiveFamily } from "@/lib/selectors";
import { computeBalances, suggestSettlements } from "@/lib/calc";
import { formatCurrency } from "@/lib/format";
import { addSettlement, markSettlementPaid } from "@/store/actions";
import { useToast } from "@/components/ToastProvider";

export default function SettlementsPage() {
  const { state, setState } = useFamilyWallet();
  const { notify } = useToast();
  const activeFamily = getActiveFamily(state);

  if (!activeFamily) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Bölüştürme için aktif aile seçin.</p>
      </Card>
    );
  }

  const balances = computeBalances(state, activeFamily.id);
  const suggestions = suggestSettlements(balances);
  const settlements = state.settlements.filter((item) => item.familyId === activeFamily.id);

  const handleAddSettlement = (fromMemberId: string, toMemberId: string, amount: number) => {
    const next = addSettlement(state, {
      familyId: activeFamily.id,
      fromMemberId,
      toMemberId,
      amount,
      note: "Önerilen ödeme",
    });
    setState(next);
    notify("Ödeme kaydı eklendi.", "success");
  };

  const handleMarkPaid = (settlementId: string) => {
    const next = markSettlementPaid(state, settlementId);
    setState(next);
    notify("Ödeme işaretlendi.", "success");
  };

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Kim kime ödeyecek?</h2>
        {suggestions.length === 0 ? (
          <p className="text-sm text-slate-500">Yeni öneri yok.</p>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => {
              const fromMember = state.members.find(
                (member) => member.id === suggestion.fromMemberId
              );
              const toMember = state.members.find(
                (member) => member.id === suggestion.toMemberId
              );
              return (
                <div
                  key={`${suggestion.fromMemberId}-${suggestion.toMemberId}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-sm">
                    <span className="font-medium">{fromMember?.displayName ?? "-"}</span> →{" "}
                    <span className="font-medium">{toMember?.displayName ?? "-"}</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {formatCurrency(suggestion.amount, activeFamily.currency)}
                    </span>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        handleAddSettlement(
                          suggestion.fromMemberId,
                          suggestion.toMemberId,
                          suggestion.amount
                        )
                      }
                    >
                      Ödeme kaydı
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="space-y-4">
        <h3 className="text-lg font-semibold">Ödeme kayıtları</h3>
        {settlements.length === 0 ? (
          <p className="text-sm text-slate-500">Henüz kayıt yok.</p>
        ) : (
          <div className="space-y-3">
            {settlements.map((settlement) => {
              const fromMember = state.members.find(
                (member) => member.id === settlement.fromMemberId
              );
              const toMember = state.members.find(
                (member) => member.id === settlement.toMemberId
              );
              return (
                <div
                  key={settlement.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm">
                      {fromMember?.displayName ?? "-"} → {toMember?.displayName ?? "-"}
                    </p>
                    <p className="text-xs text-slate-500">Durum: {settlement.status}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {formatCurrency(settlement.amount, activeFamily.currency)}
                    </span>
                    {settlement.status !== "marked_paid" && (
                      <Button variant="secondary" onClick={() => handleMarkPaid(settlement.id)}>
                        Ödendi
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
