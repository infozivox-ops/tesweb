"use client";

import { useMemo } from "react";
import { Card } from "@/components/Card";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { useFamilyWallet } from "@/store/FamilyWalletStore";
import { computeBalances } from "@/lib/calc";
import { formatCurrency } from "@/lib/format";
import { getActiveFamily, getActiveMember } from "@/lib/selectors";
import { setSession } from "@/store/actions";
import Link from "next/link";

export default function DashboardPage() {
  const { state, setState } = useFamilyWallet();
  const activeFamily = getActiveFamily(state);
  const activeMember = getActiveMember(state);

  const balances = useMemo(() => {
    if (!activeFamily) {
      return [];
    }
    return computeBalances(state, activeFamily.id);
  }, [state, activeFamily]);

  const totals = useMemo(() => {
    if (!activeFamily) {
      return { expenses: 0, allowances: 0, net: 0 };
    }
    const expenses = state.expenses
      .filter((expense) => expense.familyId === activeFamily.id)
      .reduce((sum, expense) => sum + expense.amount, 0);
    const allowances = state.allowancePlans
      .filter((plan) => plan.familyId === activeFamily.id)
      .reduce((sum, plan) => sum + plan.amount, 0);
    const net = balances.reduce((sum, balance) => sum + balance.netBalance, 0);
    return { expenses, allowances, net };
  }, [state, activeFamily, balances]);

  const handleFamilyChange = (familyId: string) => {
    const member = state.members.find((item) => item.familyId === familyId);
    const next = setSession(state, familyId, member?.id);
    setState(next);
  };

  if (!activeFamily) {
    return (
      <Card className="space-y-2">
        <h2 className="text-xl font-semibold">Henüz aktif aile yok</h2>
        <p className="text-sm text-slate-600">Yeni bir aile oluşturun veya katılın.</p>
        <div className="flex gap-3">
          <Link href="/create-family">
            <Button>Aile oluştur</Button>
          </Link>
          <Link href="/join">
            <Button variant="secondary">Koda katıl</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">{activeFamily.name}</h2>
          <p className="text-sm text-slate-600">Aktif üye: {activeMember?.displayName ?? "-"}</p>
          <p className="text-xs text-slate-500">Katılım kodu: {activeFamily.joinCode}</p>
        </div>
        <Select
          value={activeFamily.id}
          onChange={(event) => handleFamilyChange(event.target.value)}
        >
          {state.families.map((family) => (
            <option key={family.id} value={family.id}>
              {family.name} ({family.joinCode})
            </option>
          ))}
        </Select>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs uppercase text-slate-400">Toplam gider</p>
          <p className="text-2xl font-semibold">
            {formatCurrency(totals.expenses, activeFamily.currency)}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-slate-400">Toplam harçlık</p>
          <p className="text-2xl font-semibold">
            {formatCurrency(totals.allowances, activeFamily.currency)}
          </p>
        </Card>
        <Card>
          <p className="text-xs uppercase text-slate-400">Net denge</p>
          <p className="text-2xl font-semibold">
            {formatCurrency(totals.net, activeFamily.currency)}
          </p>
        </Card>
      </div>

      <Card className="space-y-4">
        <h3 className="text-lg font-semibold">Hızlı aksiyonlar</h3>
        <div className="flex flex-wrap gap-3">
          <Link href="/allowances">
            <Button variant="secondary">Harçlık ekle</Button>
          </Link>
          <Link href="/expenses">
            <Button variant="secondary">Gider ekle</Button>
          </Link>
          <Link href="/settlements">
            <Button variant="secondary">Bölüştür</Button>
          </Link>
          <Link href="/members">
            <Button variant="secondary">Üye ekle</Button>
          </Link>
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-lg font-semibold">Net durum özeti</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {balances.map((balance) => {
            const member = state.members.find((item) => item.id === balance.memberId);
            return (
              <div
                key={balance.memberId}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{member?.displayName ?? "-"}</p>
                  <p className="text-xs text-slate-500">{member?.role}</p>
                </div>
                <div className="text-right text-sm">
                  <p className={balance.netBalance >= 0 ? "text-emerald-600" : "text-rose-600"}>
                    {formatCurrency(balance.netBalance, activeFamily.currency)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Alacak: {formatCurrency(balance.totalOwesToYou, activeFamily.currency)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
