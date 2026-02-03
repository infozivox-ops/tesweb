import { describe, expect, it } from "vitest";
import { computeBalances, suggestSettlements } from "@/lib/calc";
import type { FamilyWalletState } from "@/types/domain";

const baseState: FamilyWalletState = {
  families: [
    { id: "fam", name: "Test", currency: "TRY", joinCode: "FAM-TEST", createdAt: 0 },
  ],
  members: [
    {
      id: "m1",
      familyId: "fam",
      displayName: "A",
      role: "parent",
      iban: null,
      avatar: "🙂",
      createdAt: 0,
      isActive: true,
    },
    {
      id: "m2",
      familyId: "fam",
      displayName: "B",
      role: "member",
      iban: null,
      avatar: "🙂",
      createdAt: 0,
      isActive: true,
    },
  ],
  allowancePlans: [],
  expenses: [],
  settlements: [],
  audit: [],
  session: { activeFamilyId: "fam" },
};

describe("computeBalances", () => {
  it("computes balances from expenses", () => {
    const state: FamilyWalletState = {
      ...baseState,
      expenses: [
        {
          id: "e1",
          familyId: "fam",
          title: "Market",
          amount: 100,
          paidByMemberId: "m1",
          splitMethod: "equal",
          participants: [
            { memberId: "m1", shareAmount: 50 },
            { memberId: "m2", shareAmount: 50 },
          ],
          date: 0,
        },
      ],
    };
    const balances = computeBalances(state, "fam");
    const m1 = balances.find((item) => item.memberId === "m1");
    const m2 = balances.find((item) => item.memberId === "m2");
    expect(m1?.netBalance).toBe(50);
    expect(m2?.netBalance).toBe(-50);
  });

  it("applies paid settlements", () => {
    const state: FamilyWalletState = {
      ...baseState,
      expenses: [
        {
          id: "e1",
          familyId: "fam",
          title: "Market",
          amount: 100,
          paidByMemberId: "m1",
          splitMethod: "equal",
          participants: [
            { memberId: "m1", shareAmount: 50 },
            { memberId: "m2", shareAmount: 50 },
          ],
          date: 0,
        },
      ],
      settlements: [
        {
          id: "s1",
          familyId: "fam",
          fromMemberId: "m2",
          toMemberId: "m1",
          amount: 20,
          date: 0,
          status: "marked_paid",
        },
      ],
    };
    const balances = computeBalances(state, "fam");
    const m1 = balances.find((item) => item.memberId === "m1");
    const m2 = balances.find((item) => item.memberId === "m2");
    expect(m1?.netBalance).toBe(30);
    expect(m2?.netBalance).toBe(-30);
  });
});

describe("suggestSettlements", () => {
  it("creates settlement suggestions", () => {
    const suggestions = suggestSettlements([
      { memberId: "m1", totalOwed: 0, totalOwesToYou: 100, netBalance: 100 },
      { memberId: "m2", totalOwed: 100, totalOwesToYou: 0, netBalance: -100 },
    ]);
    expect(suggestions).toEqual([
      { fromMemberId: "m2", toMemberId: "m1", amount: 100 },
    ]);
  });
});
