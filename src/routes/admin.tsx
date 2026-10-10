import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Logo } from "@/components/Logo";
import { readFile, setState, useAppState } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo" },
      { name: "description", content: "Gerencie a identidade visual do sistema." },
      { property: "og:title", content: "Painel Administrativo" },
      { property: "og:description", content: "Gerencie a identidade visual do sistema." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const s = useAppState();
  return (
    <AppShell title={`Olá, ${s.user.name.split(" ")[0]}`}>
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
    </AppShell>
  );
}
