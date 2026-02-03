import { z } from "zod";
import type {
  AllowancePlan,
  AuditEvent,
  Currency,
  Expense,
  Family,
  FamilyWalletState,
  Member,
  Settlement,
} from "@/types/domain";

export const currencyOptions: Currency[] = ["TRY", "USD", "EUR"];

export const ibanSchema = z
  .string()
  .transform((value) => value.replace(/\s+/g, ""))
  .refine((value) => value.startsWith("TR"), {
    message: "IBAN 'TR' ile başlamalıdır.",
  })
  .refine((value) => /^TR\d{24}$/.test(value), {
    message: "IBAN formatı geçersiz. Örn: TR1234... (24 rakam)",
  });

const familySchema: z.ZodType<Family> = z.object({
  id: z.string(),
  name: z.string(),
  currency: z.enum(["TRY", "USD", "EUR"]),
  joinCode: z.string(),
  createdAt: z.number(),
  description: z.string().optional(),
});

const memberSchema: z.ZodType<Member> = z.object({
  id: z.string(),
  familyId: z.string(),
  displayName: z.string(),
  role: z.enum(["parent", "child", "member"]),
  iban: z.string().nullable(),
  avatar: z.string(),
  createdAt: z.number(),
  isActive: z.boolean(),
});

const allowanceSchema: z.ZodType<AllowancePlan> = z.object({
  id: z.string(),
  familyId: z.string(),
  memberId: z.string(),
  amount: z.number(),
  frequency: z.enum(["one_time", "weekly", "monthly"]),
  startDate: z.number(),
  note: z.string().optional(),
  isPaused: z.boolean(),
});

const expenseSchema: z.ZodType<Expense> = z.object({
  id: z.string(),
  familyId: z.string(),
  title: z.string(),
  amount: z.number(),
  paidByMemberId: z.string(),
  splitMethod: z.enum(["equal", "custom"]),
  participants: z.array(
    z.object({
      memberId: z.string(),
      shareAmount: z.number(),
    })
  ),
  date: z.number(),
  note: z.string().optional(),
});

const settlementSchema: z.ZodType<Settlement> = z.object({
  id: z.string(),
  familyId: z.string(),
  fromMemberId: z.string(),
  toMemberId: z.string(),
  amount: z.number(),
  date: z.number(),
  status: z.enum(["marked_paid", "pending"]),
  note: z.string().optional(),
});

const auditSchema: z.ZodType<AuditEvent> = z.object({
  id: z.string(),
  familyId: z.string(),
  type: z.enum([
    "FAMILY_CREATED",
    "MEMBER_JOINED",
    "IBAN_UPDATED",
    "ALLOWANCE_CREATED",
    "EXPENSE_ADDED",
    "SETTLEMENT_MARKED",
  ]),
  actorMemberId: z.string().optional(),
  timestamp: z.number(),
  meta: z.record(z.unknown()),
});

export const familyWalletSchema: z.ZodType<FamilyWalletState> = z.object({
  families: z.array(familySchema),
  members: z.array(memberSchema),
  allowancePlans: z.array(allowanceSchema),
  expenses: z.array(expenseSchema),
  settlements: z.array(settlementSchema),
  audit: z.array(auditSchema),
  session: z.object({
    activeFamilyId: z.string().optional(),
    activeMemberId: z.string().optional(),
  }),
});

export const validateState = (data: unknown) =>
  familyWalletSchema.safeParse(data);

export const sanitizeIban = (iban: string) => iban.replace(/\s+/g, "");
