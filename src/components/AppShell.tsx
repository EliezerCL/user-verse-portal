import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/lib/cloudData";
import { Logo } from "./Logo";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const profile = useProfile();
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-3">
          <Logo size={36} />
          <nav className="flex gap-1 text-sm">
            <Link to="/admin" className="nav-link" activeProps={{ className: "nav-link-active" }}>Painel</Link>
            <Link to="/configuracoes" className="nav-link" activeProps={{ className: "nav-link-active" }}>Configurações</Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            {profile?.photo ? (
              <img src={profile.photo} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-primary" />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-semibold">
                {(profile?.name || "?").charAt(0).toUpperCase()}
              </div>
            )}
            <button onClick={signOut} className="btn-ghost">Sair</button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
