import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { login, useAppState } from "@/lib/store";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — Painel" },
      { name: "description", content: "Acesse o painel administrativo com seu usuário e senha." },
      { property: "og:title", content: "Entrar — Painel" },
      { property: "og:description", content: "Acesse o painel administrativo com seu usuário e senha." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const s = useAppState();
  const navigate = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (s.loggedIn) navigate({ to: "/admin", replace: true });
  }, [s.loggedIn, navigate]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (login(u, p)) navigate({ to: "/admin" });
    else setErr("Usuário ou senha incorretos");
  }

  return (
    <div className="login-bg grid min-h-screen place-items-center px-5">
      <form onSubmit={submit} className="glass w-full max-w-sm rounded-3xl p-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center">
          <Logo size={64} />
          <h1 className="mt-6 font-display text-2xl font-bold">Bem-vindo de volta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Entre para acessar o painel</p>
        </div>
        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="field-label">Usuário</span>
            <input className="field" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" placeholder="admin" />
          </label>
          <label className="block">
            <span className="field-label">Senha</span>
            <div className="relative">
              <input className="field pr-16" type={show ? "text" : "password"} value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" placeholder="••••••" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">
                {show ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </label>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button className="btn-primary w-full">Entrar</button>
        </div>
      </form>
    </div>
  );
}
