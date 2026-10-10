import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { readFile, setState, useAppState } from "@/lib/store";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações da Conta" },
      { name: "description", content: "Gerencie seu perfil, segurança e personalização." },
      { property: "og:title", content: "Configurações da Conta" },
      { property: "og:description", content: "Gerencie seu perfil, segurança e personalização." },
    ],
  }),
  component: SettingsPage,
});

const CATEGORIES = [
  { id: "perfil", label: "Perfil", icon: "👤", description: "Foto, nome, e-mail e usuário" },
  { id: "seguranca", label: "Segurança", icon: "🔒", description: "Alterar sua senha" },
  { id: "personalizacao", label: "Personalização", icon: "🎨", description: "Logo do sistema" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

function SettingsPage() {
  const s = useAppState();
  const [category, setCategory] = useState<CategoryId>("perfil");

  return (
    <AppShell title="Configurações">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="card-panel flex gap-2 overflow-x-auto p-2 lg:flex-col lg:overflow-visible lg:p-3">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                category === c.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
              }`}
            >
              <span aria-hidden className="text-lg">{c.icon}</span>
              <span>
                <span className="block text-sm font-semibold">{c.label}</span>
                <span className={`hidden text-xs lg:block ${category === c.id ? "opacity-80" : "text-muted-foreground"}`}>
                  {c.description}
                </span>
              </span>
            </button>
          ))}
        </nav>

        <div>
          {category === "perfil" && <PerfilSection />}
          {category === "seguranca" && <SegurancaSection />}
          {category === "personalizacao" && <PersonalizacaoSection />}
        </div>
      </div>
    </AppShell>
  );
}

function PerfilSection() {
  const s = useAppState();
  const [form, setForm] = useState(s.user);
  const [msg, setMsg] = useState("");
  useEffect(() => setForm(s.user), [s.user]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username.trim()) return setMsg("Usuário não pode ficar vazio");
    setState({ user: { ...form, password: s.user.password } });
    setMsg("Perfil salvo!");
    setTimeout(() => setMsg(""), 2500);
  }

  return (
    <form onSubmit={save} className="card-panel grid gap-8 md:grid-cols-[200px_1fr]">
      <div className="flex flex-col items-center gap-3">
        {form.photo ? (
          <img src={form.photo} alt="" className="h-36 w-36 rounded-full object-cover ring-4 ring-primary" />
        ) : (
          <div className="grid h-36 w-36 place-items-center rounded-full bg-secondary font-display text-5xl">
            {form.name.charAt(0).toUpperCase()}
          </div>
        )}
        <label className="btn-ghost cursor-pointer">
          Alterar foto
          <input type="file" accept="image/*" hidden onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setForm({ ...form, photo: await readFile(f) });
          }} />
        </label>
      </div>
      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Dados pessoais</h2>
        {([["name", "Nome"], ["email", "E-mail"], ["username", "Usuário"]] as const).map(([k, l]) => (
          <label key={k} className="block">
            <span className="field-label">{l}</span>
            <input className="field" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          </label>
        ))}
        <div className="flex items-center gap-4 pt-2">
          <button className="btn-primary">Salvar</button>
          {msg && <span className="text-sm text-primary">{msg}</span>}
        </div>
      </div>
    </form>
  );
}

function SegurancaSection() {
  const s = useAppState();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMsg("");
    if (current !== s.user.password) return setError("Senha atual incorreta");
    if (next.length < 4) return setError("A nova senha precisa ter pelo menos 4 caracteres");
    if (next !== confirm) return setError("A confirmação não confere com a nova senha");
    setState({ user: { ...s.user, password: next } });
    setCurrent("");
    setNext("");
    setConfirm("");
    setMsg("Senha alterada com sucesso!");
    setTimeout(() => setMsg(""), 2500);
  }

  return (
    <form onSubmit={save} className="card-panel space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold">Alterar senha</h2>
        <p className="text-sm text-muted-foreground">Use no mínimo 4 caracteres. Evite senhas óbvias.</p>
      </div>
      <label className="block">
        <span className="field-label">Senha atual</span>
        <input className="field" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
      </label>
      <label className="block">
        <span className="field-label">Nova senha</span>
        <input className="field" type="password" value={next} onChange={(e) => setNext(e.target.value)} />
      </label>
      <label className="block">
        <span className="field-label">Confirmar nova senha</span>
        <input className="field" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </label>
      <div className="flex items-center gap-4 pt-2">
        <button className="btn-primary">Atualizar senha</button>
        {msg && <span className="text-sm text-primary">{msg}</span>}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </form>
  );
}

function PersonalizacaoSection() {
  const s = useAppState();
  return (
    <section className="card-panel">
      <h2 className="font-display text-lg font-semibold">Logo do sistema</h2>
      <p className="text-sm text-muted-foreground">Aparece na tela de login e no topo do painel.</p>
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <div className="grid h-28 w-28 place-items-center rounded-2xl bg-secondary p-3"><Logo size={72} /></div>
        <div className="flex gap-3">
          <label className="btn-primary cursor-pointer">
            Enviar novo logo
            <input type="file" accept="image/*" hidden onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setState({ logo: await readFile(f) });
            }} />
          </label>
          {s.logo && <button className="btn-ghost" onClick={() => setState({ logo: null })}>Restaurar padrão</button>}
        </div>
      </div>
    </section>
  );
}
