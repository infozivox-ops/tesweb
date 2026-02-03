import type { Member } from "@/types/domain";

export const MemberBadge = ({ member }: { member: Member }) => (
  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700">
    <span>{member.avatar}</span>
    <span className="font-medium">{member.displayName}</span>
  </div>
);
