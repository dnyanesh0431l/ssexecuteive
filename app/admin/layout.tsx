// app/admin/layout.tsx
import type { Metadata } from "next";
import { AdminShell } from "../components/admin/AdminShell";
import { ToastProvider } from "../components/ui/Toast";

export const metadata: Metadata = {
  title: "Admin — SS Executive",
  description: "Management console for SS Executive.",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
    </ToastProvider>
  );
}