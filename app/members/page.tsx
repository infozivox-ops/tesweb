"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { Button } from "@/components/Button";
import { MemberBadge } from "@/components/MemberBadge";
import { useFamilyWallet } from "@/store/FamilyWalletStore";
import { getActiveFamily } from "@/lib/selectors";
import { joinFamily, updateMemberIban } from "@/store/actions";
import { ibanSchema } from "@/lib/validation";
import { useToast } from "@/components/ToastProvider";

const avatars = ["👩", "👨", "🧒", "👧", "🧑‍🎓", "👩‍💼", "🧑‍💻", "🧓"];

export default function MembersPage() {
  const { state, setState } = useFamilyWallet();
  const { notify } = useToast();
  const activeFamily = getActiveFamily(state);
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("member");
  const [avatar, setAvatar] = useState(avatars[0]);
  const [ibanInputs, setIbanInputs] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const members = useMemo(() => {
    if (!activeFamily) {
      return [];
    }
    return state.members.filter((member) => member.familyId === activeFamily.id);
  }, [state.members, activeFamily]);

  const handleAddMember = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!displayName.trim() || !activeFamily) {
      setError("Üye adı zorunlu.");
      return;
    }
    try {
      const next = joinFamily(state, activeFamily.joinCode, {
        displayName: displayName.trim(),
        role: role as "parent" | "child" | "member",
        avatar: avatar ?? "🙂",
      });
      setState(next);
      setDisplayName("");
      notify("Üye eklendi.", "success");
    } catch (error) {
      setError("Üye eklenemedi.");
    }
  };

  const handleIbanSave = (memberId: string) => {
    const value = ibanInputs[memberId] ?? "";
    const result = ibanSchema.safeParse(value);
    if (!result.success) {
      notify(result.error.issues[0]?.message ?? "IBAN hatalı.", "error");
      return;
    }
    const next = updateMemberIban(state, memberId, result.data);
    setState(next);
    notify("IBAN güncellendi.", "success");
  };

  if (!activeFamily) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Üye yönetimi için aktif aile seçin.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4">
        <h2 className="text-xl font-semibold">Üyeler</h2>
        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <MemberBadge key={member.id} member={member} />
          ))}
        </div>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-lg font-semibold">Üye ekle</h3>
        <form className="space-y-3" onSubmit={handleAddMember}>
          <Input
            placeholder="Ad Soyad"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            error={error && !displayName.trim() ? error : undefined}
          />
          <Select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="parent">Ebeveyn</option>
            <option value="child">Çocuk</option>
            <option value="member">Üye</option>
          </Select>
          <Select value={avatar} onChange={(event) => setAvatar(event.target.value)}>
            {avatars.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </Select>
          {error && displayName.trim() ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button type="submit" disabled={!displayName.trim()}>
            Üye ekle
          </Button>
        </form>
      </Card>

      <Card className="space-y-4">
        <h3 className="text-lg font-semibold">IBAN güncelle</h3>
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">{member.displayName}</p>
                <p className="text-xs text-slate-500">Mevcut: {member.iban ?? "-"}</p>
              </div>
              <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                <Input
                  placeholder="TR00..."
                  value={ibanInputs[member.id] ?? ""}
                  onChange={(event) =>
                    setIbanInputs((current) => ({
                      ...current,
                      [member.id]: event.target.value,
                    }))
                  }
                />
                <Button type="button" onClick={() => handleIbanSave(member.id)}>
                  Kaydet
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
