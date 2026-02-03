import type {
  FamilyWalletState,
  MemberBalance,
  SettlementSuggestion,
} from "@/types/domain";

const round2 = (value: number) => Math.round(value * 100) / 100;

export const computeBalances = (
  state: FamilyWalletState,
  familyId: string
): MemberBalance[] => {
  const members = state.members.filter((member) => member.familyId === familyId);
  const balances: Record<string, MemberBalance> = {};

  members.forEach((member) => {
    balances[member.id] = {
      memberId: member.id,
      totalOwed: 0,
      totalOwesToYou: 0,
      netBalance: 0,
    };
  });

  const expenses = state.expenses.filter((expense) => expense.familyId === familyId);
  expenses.forEach((expense) => {
    expense.participants.forEach((participant) => {
      if (participant.memberId === expense.paidByMemberId) {
        return;
      }
      const paidBalance = balances[expense.paidByMemberId];
      const participantBalance = balances[participant.memberId];
      if (!paidBalance || !participantBalance) {
        return;
      }
      paidBalance.totalOwesToYou += participant.shareAmount;
      participantBalance.totalOwed += participant.shareAmount;
    });
  });

  const settlements = state.settlements.filter(
    (settlement) => settlement.familyId === familyId
  );
  settlements.forEach((settlement) => {
    if (settlement.status !== "marked_paid") {
      return;
    }
    const fromBalance = balances[settlement.fromMemberId];
    const toBalance = balances[settlement.toMemberId];
    if (!fromBalance || !toBalance) {
      return;
    }
    fromBalance.totalOwed = Math.max(0, fromBalance.totalOwed - settlement.amount);
    toBalance.totalOwesToYou = Math.max(0, toBalance.totalOwesToYou - settlement.amount);
  });

  Object.values(balances).forEach((balance) => {
    balance.netBalance = round2(balance.totalOwesToYou - balance.totalOwed);
    balance.totalOwed = round2(balance.totalOwed);
    balance.totalOwesToYou = round2(balance.totalOwesToYou);
  });

  return Object.values(balances);
};

export const suggestSettlements = (
  balances: MemberBalance[]
): SettlementSuggestion[] => {
  const debtors = balances
    .filter((balance) => balance.netBalance < 0)
    .map((balance) => ({ ...balance }))
    .sort((a, b) => a.netBalance - b.netBalance);
  const creditors = balances
    .filter((balance) => balance.netBalance > 0)
    .map((balance) => ({ ...balance }))
    .sort((a, b) => b.netBalance - a.netBalance);

  const suggestions: SettlementSuggestion[] = [];

  let debtorIndex = 0;
  let creditorIndex = 0;

  while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
    const debtor = debtors[debtorIndex];
    const creditor = creditors[creditorIndex];
    if (!debtor || !creditor) {
      break;
    }
    const amount = Math.min(Math.abs(debtor.netBalance), creditor.netBalance);
    if (amount <= 0) {
      break;
    }
    suggestions.push({
      fromMemberId: debtor.memberId,
      toMemberId: creditor.memberId,
      amount: round2(amount),
    });
    debtor.netBalance = round2(debtor.netBalance + amount);
    creditor.netBalance = round2(creditor.netBalance - amount);

    if (Math.abs(debtor.netBalance) < 0.01) {
      debtorIndex += 1;
    }
    if (creditor.netBalance < 0.01) {
      creditorIndex += 1;
    }
  }

  return suggestions;
};
