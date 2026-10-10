-- Perfis de usuário
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  username text not null default '',
  photo_url text,
  created_at timestamptz not null default now()
);

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- Cria o perfil automaticamente quando o usuário se cadastra
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Configurações globais (logo do sistema)
create table public.app_settings (
  id int primary key default 1 check (id = 1),
  logo_url text,
  updated_at timestamptz not null default now()
);

grant select on public.app_settings to anon, authenticated;
grant insert, update on public.app_settings to authenticated;
grant all on public.app_settings to service_role;
alter table public.app_settings enable row level security;

create policy "Anyone can view app settings"
  on public.app_settings for select
  using (true);

create policy "Authenticated can update app settings"
  on public.app_settings for update to authenticated
  using (true) with check (true);

insert into public.app_settings (id) values (1) on conflict (id) do nothing;

-- Acesso aos arquivos do bucket media (foto de perfil e logo)
create policy "Public read media files"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Authenticated upload media files"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'media');

create policy "Authenticated update media files"
  on storage.objects for update to authenticated
  using (bucket_id = 'media');

create policy "Authenticated delete media files"
  on storage.objects for delete to authenticated
  using (bucket_id = 'media');
