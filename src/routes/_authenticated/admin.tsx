import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useProfile } from "@/lib/cloudData";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Painel" },
      { name: "description", content: "Visão geral da sua conta." },
      { property: "og:title", content: "Painel" },
      { property: "og:description", content: "Visão geral da sua conta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const profile = useProfile();
  const first = profile?.name?.trim().split(" ")[0];

  return (
    <AppShell title={first ? `Olá, ${first}` : "Painel"}>
      <section className="card-panel">
        <h2 className="font-display text-lg font-semibold">Bem-vindo de volta</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Gerencie seu perfil, senha e o logo do sistema em <strong>Configurações</strong>.
        </p>
      </section>
    </AppShell>
  );
}
