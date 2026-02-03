"use client";

import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useFamilyWallet } from "@/store/FamilyWalletStore";
import { demoSeed } from "@/lib/seed";
import { useToast } from "@/components/ToastProvider";

export default function LandingPage() {
  const { setState } = useFamilyWallet();
  const { notify } = useToast();

  const handleSeed = () => {
    setState(demoSeed);
    notify("Demo verisi yüklendi.", "success");
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-600">
            Aile finansları
          </p>
          <h2 className="text-4xl font-semibold leading-tight">
            Aile Cüzdanı ile ortak bütçeyi, harçlığı ve giderleri tek ekranda yönetin.
          </h2>
          <p className="text-base text-slate-600">
            Bu demo uygulama tamamen tarayıcı üzerinde çalışır. Gerçek para transferi
            yoktur, veriler yalnızca yerel depolamada saklanır.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/create-family">
            <Button>Aile hesabı oluştur</Button>
          </Link>
          <Link href="/join">
            <Button variant="secondary">Koda katıl</Button>
          </Link>
          <Button variant="ghost" onClick={handleSeed}>
            Demo verisiyle başla
          </Button>
        </div>
      </div>
      <Card className="space-y-4">
        <h3 className="text-lg font-semibold">Öne çıkan özellikler</h3>
        <ul className="space-y-3 text-sm text-slate-600">
          <li>✅ Aile hesabı açma ve üyeleri davet etme</li>
          <li>✅ Harçlık planları ve manuel üretim</li>
          <li>✅ Ortak gider bölüştürme ve net denge</li>
          <li>✅ IBAN format kontrolü</li>
          <li>✅ Export/Import ve demo seed</li>
        </ul>
      </Card>
    </div>
  );
}
