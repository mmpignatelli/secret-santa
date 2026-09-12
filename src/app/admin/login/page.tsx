import type { Metadata } from "next";
import AdminLoginForm from "./AdminLoginForm";

export const metadata: Metadata = {
  title: "Sorting Master — Marques Family Secret Santa",
};

export default function AdminLoginPage() {
  return (
    <main className="flex-1 bg-red-50/40 px-4 py-16">
      <AdminLoginForm />
    </main>
  );
}
