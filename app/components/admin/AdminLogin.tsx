// components/admin/AdminLogin.tsx
"use client";

import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { useAdminAuth } from "../../lib/hooks/useAdminAuth";
import { useState } from "react";

export function AdminLogin() {
  const { login } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch {
      setError("Invalid credentials. Please check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F6F6F6] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#B80A0B] text-[13px] font-bold text-white">
            SS
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-black">
              SS Executive
            </p>
            <p className="text-xs text-black/45">Admin Panel</p>
          </div>
        </div>

        <div className="rounded-lg border border-[#E5E5E5] bg-white p-6">
          <h1 className="text-base font-semibold tracking-tight text-black">
            Sign in
          </h1>
          <p className="mt-1 text-[13px] leading-6 text-black/50">
            Use your SS Executive administrator account.
          </p>

          <form onSubmit={onSubmit} className="mt-5 space-y-4">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="admin@ssexecutive.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            {error ? (
              <p className="rounded-md border border-[#B80A0B]/20 bg-[rgba(184,10,11,0.05)] px-3 py-2 text-xs leading-5 text-[#B80A0B]">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" loading={loading}>
              Sign in
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-black/40">
          © {new Date().getFullYear()} SS Executive. All rights reserved.
        </p>
      </div>
    </div>
  );
}
