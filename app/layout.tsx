import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/AppShell";
import { FamilyWalletProvider } from "@/store/FamilyWalletStore";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "Aile Cüzdanı",
  description: "Aile hesabı yönetimi için demo web uygulaması",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="font-sans">
        <FamilyWalletProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </FamilyWalletProvider>
      </body>
    </html>
  );
}
