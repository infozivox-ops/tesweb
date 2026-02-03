import { generateId, generateJoinCode } from "@/lib/id";
import { sanitizeIban } from "@/lib/validation";
import type {
  AllowancePlan,
  Expense,
  Family,
  FamilyWalletState,
  Member,
  MemberRole,
  Settlement,
} from "@/types/domain";

const now = () => Date.now();

export const createFamily = (
  state: FamilyWalletState,
  name: string,
  currency: Family["currency"],
  description?: string
) => {
  const joinCode = generateJoinCode(new Set(state.families.map((family) => family.joinCode)));
  const family: Family = {
    id: generateId("family"),
    name,
    currency,
    joinCode,
    createdAt: now(),
    description,
  };
  const adminMember: Member = {
    id: generateId("member"),
    familyId: family.id,
    displayName: "Aile Yöneticisi",
    role: "parent",
    iban: null,
    avatar: "👩‍💼",
    createdAt: now(),
    isActive: true,
  };

  return {
    ...state,
    families: [...state.families, family],
    members: [...state.members, adminMember],
    audit: [
      ...state.audit,
      {
        id: generateId("audit"),
        familyId: family.id,
        type: "FAMILY_CREATED",
        actorMemberId: adminMember.id,
        timestamp: now(),
        meta: { name: family.name, currency: family.currency },
      },
    ],
    session: {
      activeFamilyId: family.id,
      activeMemberId: adminMember.id,
    },
  };
};

export const joinFamily = (
  state: FamilyWalletState,
  joinCode: string,
  memberInfo: {
    displayName: string;
    role: MemberRole;
    avatar: string;
  }
) => {
  const family = state.families.find((item) => item.joinCode === joinCode);
  if (!family) {
    throw new Error("Aile bulunamadı.");
  }
  const member: Member = {
    id: generateId("member"),
    familyId: family.id,
    displayName: memberInfo.displayName,
    role: memberInfo.role,
    iban: null,
    avatar: memberInfo.avatar,
    createdAt: now(),
    isActive: true,
  };
  return {
    ...state,
    members: [...state.members, member],
    audit: [
      ...state.audit,
      {
        id: generateId("audit"),
        familyId: family.id,
        type: "MEMBER_JOINED",
        actorMemberId: member.id,
        timestamp: now(),
        meta: { displayName: member.displayName, role: member.role },
      },
    ],
    session: {
      activeFamilyId: family.id,
      activeMemberId: member.id,
    },
  };
};

export const updateMemberIban = (
  state: FamilyWalletState,
  memberId: string,
  iban: string
) => {
  const sanitized = sanitizeIban(iban);
  return {
    ...state,
    members: state.members.map((member) =>
      member.id === memberId ? { ...member, iban: sanitized } : member
    ),
    audit: [
      ...state.audit,
      {
        id: generateId("audit"),
        familyId: state.session.activeFamilyId ?? "",
        type: "IBAN_UPDATED",
        actorMemberId: memberId,
        timestamp: now(),
        meta: { iban: sanitized },
      },
    ],
  };
};

export const createAllowancePlan = (
  state: FamilyWalletState,
  plan: Omit<AllowancePlan, "id" | "startDate" | "isPaused">
) => {
  const newPlan: AllowancePlan = {
    ...plan,
    id: generateId("allowance"),
    startDate: now(),
    isPaused: false,
  };
  return {
    ...state,
    allowancePlans: [...state.allowancePlans, newPlan],
    audit: [
      ...state.audit,
      {
        id: generateId("audit"),
        familyId: plan.familyId,
        type: "ALLOWANCE_CREATED",
        actorMemberId: state.session.activeMemberId,
        timestamp: now(),
        meta: { amount: plan.amount, frequency: plan.frequency },
      },
    ],
  };
};

export const addExpense = (
  state: FamilyWalletState,
  expense: Omit<Expense, "id" | "date">
) => {
  const newExpense: Expense = {
    ...expense,
    id: generateId("expense"),
    date: now(),
  };
  return {
    ...state,
    expenses: [...state.expenses, newExpense],
    audit: [
      ...state.audit,
      {
        id: generateId("audit"),
        familyId: expense.familyId,
        type: "EXPENSE_ADDED",
        actorMemberId: expense.paidByMemberId,
        timestamp: now(),
        meta: { title: expense.title, amount: expense.amount },
      },
    ],
  };
};

export const markSettlementPaid = (
  state: FamilyWalletState,
  settlementId: string
) => {
  const settlement = state.settlements.find((item) => item.id === settlementId);
  if (!settlement) {
    return state;
  }
  const updated: Settlement = { ...settlement, status: "marked_paid" };
  return {
    ...state,
    settlements: state.settlements.map((item) =>
      item.id === settlementId ? updated : item
    ),
    audit: [
      ...state.audit,
      {
        id: generateId("audit"),
        familyId: settlement.familyId,
        type: "SETTLEMENT_MARKED",
        actorMemberId: settlement.fromMemberId,
        timestamp: now(),
        meta: { amount: settlement.amount, to: settlement.toMemberId },
      },
    ],
  };
};

export const addSettlement = (
  state: FamilyWalletState,
  settlement: Omit<Settlement, "id" | "date" | "status">
) => {
  const newSettlement: Settlement = {
    ...settlement,
    id: generateId("settlement"),
    date: now(),
    status: "pending",
  };
  return {
    ...state,
    settlements: [...state.settlements, newSettlement],
  };
};

export const generateMonthlyAllowances = (
  state: FamilyWalletState,
  familyId: string
) => {
  const plans = state.allowancePlans.filter(
    (plan) => plan.familyId === familyId && plan.frequency !== "one_time"
  );
  if (plans.length === 0) {
    return state;
  }
  const events = plans.map((plan) => ({
    id: generateId("audit"),
    familyId: plan.familyId,
    type: "ALLOWANCE_CREATED" as const,
    actorMemberId: state.session.activeMemberId,
    timestamp: now(),
    meta: {
      amount: plan.amount,
      frequency: plan.frequency,
      memberId: plan.memberId,
    },
  }));
  return {
    ...state,
    audit: [...state.audit, ...events],
  };
};

export const setSession = (
  state: FamilyWalletState,
  familyId?: string,
  memberId?: string
) => ({
  ...state,
  session: {
    activeFamilyId: familyId,
    activeMemberId: memberId,
  },
});

export const importState = (
  state: FamilyWalletState,
  nextState: FamilyWalletState
) => ({
  ...state,
  ...nextState,
});

export const resetToEmpty = (state: FamilyWalletState) => ({
  ...state,
  families: [],
  members: [],
  allowancePlans: [],
  expenses: [],
  settlements: [],
  audit: [],
  session: {},
});

export const replaceState = (_state: FamilyWalletState, next: FamilyWalletState) => next;
