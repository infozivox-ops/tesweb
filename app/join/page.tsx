"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Select } from "@/components/Select";
import { useFamilyWallet } from "@/store/FamilyWalletStore";
import { joinFamily } from "@/store/actions";
import { useToast } from "@/components/ToastProvider";

const avatars = ["👩", "👨", "🧒", "👧", "🧑‍🎓", "👩‍💼", "🧑‍💻", "🧓"];

export default function JoinPage() {
  const { state, setState } = useFamilyWallet();
  const { notify } = useToast();
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("member");
  const [avatar, setAvatar] = useState(avatars[0]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!joinCode.trim() || !displayName.trim()) {
      setError("Katılım kodu ve isim zorunlu.");
      return;
    }
    try {
      const next = joinFamily(state, joinCode.trim().toUpperCase(), {
        displayName: displayName.trim(),
        role: role as "parent" | "child" | "member",
        avatar: avatar ?? "🙂",
      });
      setState(next);
      notify("Aileye katılım başarılı.", "success");
      router.push("/dashboard");
    } catch (error) {
      setError("Katılım kodu bulunamadı.");
    }
  };

  return (
    <Card className="max-w-xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Aileye katıl</h2>
        <p className="text-sm text-slate-600">Katılım kodu ile aile hesabına dahil olun.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          placeholder="FAM-XXXXXX"
          value={joinCode}
          onChange={(event) => setJoinCode(event.target.value)}
          error={error && !joinCode.trim() ? error : undefined}
        />
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
        {error && joinCode.trim() && displayName.trim() ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : null}
        <Button type="submit" disabled={!joinCode.trim() || !displayName.trim()}>
          Katıl
        </Button>
      </form>
    </Card>
  );
}
