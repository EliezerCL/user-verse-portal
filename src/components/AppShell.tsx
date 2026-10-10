import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { logout, useAppState } from "@/lib/store";
import { Logo } from "./Logo";

export function AppShell({ title, children }: { title: string; children: ReactNode }) {
  const s = useAppState();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready && !s.loggedIn) navigate({ to: "/", replace: true });
  }, [ready, s.loggedIn, navigate]);
  if (!ready || !s.loggedIn) return null;

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
            {s.user.photo ? (
              <img src={s.user.photo} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-primary" />
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-sm font-semibold">
                {s.user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button onClick={() => { logout(); navigate({ to: "/", replace: true }); }} className="btn-ghost">Sair</button>
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
