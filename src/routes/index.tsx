import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — Painel" },
      { name: "description", content: "Acesse o painel administrativo com seu e-mail e senha." },
      { property: "og:title", content: "Entrar — Painel" },
      { property: "og:description", content: "Acesse o painel administrativo com seu e-mail e senha." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) {
          setErr(error.message.includes("Invalid login") ? "E-mail ou senha incorretos" : error.message);
        } else {
          navigate({ to: "/admin", replace: true });
          return;
        }
      } else {
        if (password.length < 6) {
          setErr("A senha precisa ter pelo menos 6 caracteres");
        } else {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { data: { name: name.trim() }, emailRedirectTo: window.location.origin },
          });
          if (error) {
            setErr(error.message.includes("already registered") ? "Este e-mail já está cadastrado" : error.message);
          } else if (data.session) {
            navigate({ to: "/admin", replace: true });
            return;
          } else {
            setInfo("Conta criada! Verifique seu e-mail para confirmar e depois volte aqui para entrar.");
          }
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-bg grid min-h-screen place-items-center px-5">
      <form onSubmit={submit} className="glass w-full max-w-sm rounded-3xl p-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center text-center">
          <Logo size={64} />
          <h1 className="mt-6 font-display text-2xl font-bold">
            {mode === "signin" ? "Bem-vindo de volta" : "Criar conta"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Entre para acessar o painel" : "Use seu e-mail e uma senha"}
          </p>
        </div>
        <div className="mt-8 space-y-4">
          {mode === "signup" && (
            <label className="block">
              <span className="field-label">Nome</span>
              <input className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Seu nome" />
            </label>
          )}
          <label className="block">
            <span className="field-label">E-mail</span>
            <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" placeholder="voce@exemplo.com" />
          </label>
          <label className="block">
            <span className="field-label">Senha</span>
            <div className="relative">
              <input className="field pr-16" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "signin" ? "current-password" : "new-password"} placeholder="••••••" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground">
                {show ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </label>
          {err && <p className="text-sm text-destructive">{err}</p>}
          {info && <p className="text-sm text-primary">{info}</p>}
          <button className="btn-primary w-full" disabled={busy}>
            {busy ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
          <button
            type="button"
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setErr("");
              setInfo("");
            }}
          >
            {mode === "signin" ? "Não tem conta? Criar uma" : "Já tem conta? Entrar"}
          </button>
        </div>
      </form>
    </div>
  );
}
