import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in — Marques Family Secret Santa",
};

export default function LoginPage() {
  return (
    <main className="flex-1 bg-red-50/40 px-4 py-12">
      <LoginForm />
    </main>
  );
}
