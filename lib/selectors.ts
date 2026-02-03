import type { FamilyWalletState } from "@/types/domain";

export const getActiveFamily = (state: FamilyWalletState) =>
  state.families.find((family) => family.id === state.session.activeFamilyId) ?? null;

export const getActiveMember = (state: FamilyWalletState) =>
  state.members.find((member) => member.id === state.session.activeMemberId) ?? null;

export const getFamilyMembers = (state: FamilyWalletState, familyId?: string) =>
  state.members.filter((member) => member.familyId === familyId);
