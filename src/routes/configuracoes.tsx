import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { readFile, setState, useAppState } from "@/lib/store";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações da Conta" },
      { name: "description", content: "Altere sua foto, dados e senha." },
      { property: "og:title", content: "Configurações da Conta" },
      { property: "og:description", content: "Altere sua foto, dados e senha." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const s = useAppState();
  const [form, setForm] = useState(s.user);
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  useEffect(() => setForm(s.user), [s.user]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username.trim()) return setMsg("Usuário não pode ficar vazio");
    setState({ user: { ...form, password: pw ? pw : s.user.password } });
    setPw("");
    setMsg("Alterações salvas!");
    setTimeout(() => setMsg(""), 2500);
  }

  return (
    <AppShell title="Configurações">
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
          {([["name", "Nome"], ["email", "E-mail"], ["username", "Usuário"]] as const).map(([k, l]) => (
            <label key={k} className="block">
              <span className="field-label">{l}</span>
              <input className="field" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </label>
          ))}
          <label className="block">
            <span className="field-label">Nova senha (deixe em branco para manter)</span>
            <input className="field" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
          </label>
          <div className="flex items-center gap-4 pt-2">
            <button className="btn-primary">Salvar</button>
            {msg && <span className="text-sm text-primary">{msg}</span>}
          </div>
        </div>
      </form>
    </AppShell>
  );
}
