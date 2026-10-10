import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo" },
      { name: "description", content: "Visão geral da sua conta." },
      { property: "og:title", content: "Painel Administrativo" },
      { property: "og:description", content: "Visão geral da sua conta." },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const s = useAppState();
  return (
    <AppShell title={`Olá, ${s.user.name.split(" ")[0]}`}>
      <section className="card-panel">
        <h2 className="font-display text-lg font-semibold">Bem-vindo de volta</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Gerencie seu perfil, senha e o logo do sistema em <strong>Configurações</strong>.
        </p>
      </section>
    </AppShell>
  );
}
