export type Currency = "TRY" | "USD" | "EUR";
export type MemberRole = "parent" | "child" | "member";
export type AllowanceFrequency = "one_time" | "weekly" | "monthly";
export type SplitMethod = "equal" | "custom";
export type SettlementStatus = "marked_paid" | "pending";
export type AuditType =
  | "FAMILY_CREATED"
  | "MEMBER_JOINED"
  | "IBAN_UPDATED"
  | "ALLOWANCE_CREATED"
  | "EXPENSE_ADDED"
  | "SETTLEMENT_MARKED";

export interface Family {
  id: string;
  name: string;
  currency: Currency;
  joinCode: string;
  createdAt: number;
  description?: string;
}

export interface Member {
  id: string;
  familyId: string;
  displayName: string;
  role: MemberRole;
  iban: string | null;
  avatar: string;
  createdAt: number;
  isActive: boolean;
}

export interface AllowancePlan {
  id: string;
  familyId: string;
  memberId: string;
  amount: number;
  frequency: AllowanceFrequency;
  startDate: number;
  note?: string;
  isPaused: boolean;
}

export interface ExpenseParticipant {
  memberId: string;
  shareAmount: number;
}

export interface Expense {
  id: string;
  familyId: string;
  title: string;
  amount: number;
  paidByMemberId: string;
  splitMethod: SplitMethod;
  participants: ExpenseParticipant[];
  date: number;
  note?: string;
}

export interface Settlement {
  id: string;
  familyId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  date: number;
  status: SettlementStatus;
  note?: string;
}

export interface AuditEvent {
  id: string;
  familyId: string;
  type: AuditType;
  actorMemberId?: string;
  timestamp: number;
  meta: Record<string, unknown>;
}

export interface SessionState {
  activeFamilyId?: string;
  activeMemberId?: string;
}

export interface FamilyWalletState {
  families: Family[];
  members: Member[];
  allowancePlans: AllowancePlan[];
  expenses: Expense[];
  settlements: Settlement[];
  audit: AuditEvent[];
  session: SessionState;
}

export interface MemberBalance {
  memberId: string;
  totalOwed: number;
  totalOwesToYou: number;
  netBalance: number;
}

export interface FamilyBalanceSummary {
  familyId: string;
  balances: MemberBalance[];
}

export interface SettlementSuggestion {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
}
