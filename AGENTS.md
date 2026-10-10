<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# AGENTS.md

## Regras do projeto

- Autenticação via Lovable Cloud (Supabase Auth) com e-mail/senha; o antigo login local (localStorage em `src/lib/store.ts`) foi removido — não reintroduzir estado de sessão em localStorage.
- Dados de perfil ficam na tabela `public.profiles` (linha por usuário, criada por trigger no cadastro); o logo global fica em `public.app_settings` linha id=1 e é lido publicamente (a tela de login é anônima).
- Foto de perfil e logo são salvos como data URL (base64, reduzidos no cliente via `src/lib/media.ts`) porque o workspace bloqueia buckets públicos de storage.
- Rotas protegidas ficam sob `src/routes/_authenticated/` (gate `ssr: false` em `route.tsx`); a tela de login é pública em `src/routes/index.tsx`.
- Mudança de senha usa `supabase.auth.updateUser({ password, current_password })`; o Cloud exige a senha atual (require_current_password ativo).
