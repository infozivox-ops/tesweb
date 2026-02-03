"use client";

import { Button } from "@/components/Button";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-2xl space-y-4 rounded-2xl border border-rose-200 bg-rose-50 p-6">
      <h2 className="text-lg font-semibold text-rose-700">
        Üzgünüz, bir hata oluştu.
      </h2>
      <p className="text-sm text-rose-600">{error.message}</p>
      <Button onClick={reset}>Tekrar dene</Button>
    </div>
  );
}
