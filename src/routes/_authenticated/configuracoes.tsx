import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { Lock, Palette, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { saveLogo, saveProfile, useLogo, useProfile, type Profile } from "@/lib/cloudData";
import { readImage } from "@/lib/media";

export const Route = createFileRoute("/_authenticated/configuracoes")({
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
  { id: "perfil", label: "Perfil", icon: User, description: "Foto, nome e usuário" },
  { id: "seguranca", label: "Segurança", icon: Lock, description: "Alterar sua senha" },
  { id: "personalizacao", label: "Personalização", icon: Palette, description: "Logo do sistema" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

function SettingsPage() {
  const [category, setCategory] = useState<CategoryId>("perfil");
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setUserEmail(data.session?.user.email ?? null);
    });
  }, []);

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
          {category === "perfil" && <PerfilSection userId={userId} userEmail={userEmail} />}
          {category === "seguranca" && <SegurancaSection />}
          {category === "personalizacao" && <PersonalizacaoSection />}
        </div>
      </div>
    </AppShell>
  );
}

function PerfilSection({ userId, userEmail }: { userId: string | null; userEmail: string | null }) {
  const profile = useProfile();
  const [form, setForm] = useState<Partial<Profile> | null>(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (profile && form === null) setForm({ name: profile.name, username: profile.username, photo: profile.photo });
  }, [profile, form]);

  if (!userId || !form) return <div className="card-panel text-sm text-muted-foreground">Carregando...</div>;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!form!.name?.trim()) return setError("O nome não pode ficar vazio");
    try {
      await saveProfile(userId!, {
        name: form!.name,
        username: form!.username ?? "",
        photo: form!.photo ?? null,
      });
      setMsg("Perfil salvo!");
      setTimeout(() => setMsg(""), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    }
  }

  return (
    <form onSubmit={save} className="card-panel grid gap-8 md:grid-cols-[200px_1fr]">
      <div className="flex flex-col items-center gap-3">
        {form.photo ? (
          <img src={form.photo} alt="" className="h-36 w-36 rounded-full object-cover ring-4 ring-primary" />
        ) : (
          <div className="grid h-36 w-36 place-items-center rounded-full bg-secondary font-display text-5xl">
            {(form.name || "?").charAt(0).toUpperCase()}
          </div>
        )}
        <label className="btn-ghost cursor-pointer">
          Alterar foto
          <input type="file" accept="image/*" hidden onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setForm({ ...form, photo: await readImage(f, 512, "image/jpeg") });
          }} />
        </label>
        {form.photo && (
          <button type="button" className="btn-ghost" onClick={() => setForm({ ...form, photo: null })}>
            Remover foto
          </button>
        )}
      </div>
      <div className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Dados pessoais</h2>
        <label className="block">
          <span className="field-label">E-mail (não editável)</span>
          <input className="field opacity-60" value={userEmail ?? ""} readOnly />
        </label>
        <label className="block">
          <span className="field-label">Nome</span>
          <input className="field" value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="block">
          <span className="field-label">Usuário</span>
          <input className="field" value={form.username ?? ""} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </label>
        <div className="flex items-center gap-4 pt-2">
          <button className="btn-primary">Salvar</button>
          {msg && <span className="text-sm text-primary">{msg}</span>}
          {error && <span className="text-sm text-destructive">{error}</span>}
        </div>
      </div>
    </form>
  );
}

function SegurancaSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMsg("");
    if (next.length < 6) return setError("A nova senha precisa ter pelo menos 6 caracteres");
    if (next !== confirm) return setError("A confirmação não confere com a nova senha");
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password: next,
      current_password: current,
    });
    setBusy(false);
    if (updateError) {
      setError(updateError.message.includes("Current password")
        ? "Senha atual incorreta"
        : updateError.message);
      return;
    }
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
        <p className="text-sm text-muted-foreground">Use no mínimo 6 caracteres. Evite senhas óbvias.</p>
      </div>
      <label className="block">
        <span className="field-label">Senha atual</span>
        <input className="field" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
      </label>
      <label className="block">
        <span className="field-label">Nova senha</span>
        <input className="field" type="password" value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
      </label>
      <label className="block">
        <span className="field-label">Confirmar nova senha</span>
        <input className="field" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
      </label>
      <div className="flex items-center gap-4 pt-2">
        <button className="btn-primary" disabled={busy}>Atualizar senha</button>
        {msg && <span className="text-sm text-primary">{msg}</span>}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </form>
  );
}

function PersonalizacaoSection() {
  const logo = useLogo();
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function upload(file: File) {
    setError("");
    setMsg("");
    try {
      await saveLogo(await readImage(file, 256, "image/png"));
      setMsg("Logo atualizado!");
      setTimeout(() => setMsg(""), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar o logo");
    }
  }

  return (
    <section className="card-panel">
      <h2 className="font-display text-lg font-semibold">Logo do sistema</h2>
      <p className="text-sm text-muted-foreground">Aparece na tela de login e no topo do painel, em qualquer aparelho.</p>
      <div className="mt-6 flex flex-wrap items-center gap-6">
        <div className="grid h-28 w-28 place-items-center rounded-2xl bg-secondary p-3"><Logo size={72} /></div>
        <div className="flex flex-wrap gap-3">
          <label className="btn-primary cursor-pointer">
            Enviar novo logo
            <input type="file" accept="image/*" hidden onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) await upload(f);
            }} />
          </label>
          {logo && (
            <button className="btn-ghost" onClick={() => saveLogo(null)}>Restaurar padrão</button>
          )}
        </div>
        <div className="w-full flex items-center gap-4">
          {msg && <span className="text-sm text-primary">{msg}</span>}
          {error && <span className="text-sm text-destructive">{error}</span>}
        </div>
      </div>
    </section>
  );
}
