-- Fotos e logo são salvos como imagem (base64) direto no banco
alter table public.profiles add column if not exists photo text;
alter table public.app_settings add column if not exists logo text;
comment on column public.profiles.photo_url is 'DEPRECATED: replaced by photo';
comment on column public.app_settings.logo_url is 'DEPRECATED: replaced by logo';

-- Bucket público foi bloqueado pelo workspace; remove políticas do storage
drop policy if exists "Public read media files" on storage.objects;
drop policy if exists "Authenticated upload media files" on storage.objects;
drop policy if exists "Authenticated update media files" on storage.objects;
drop policy if exists "Authenticated delete media files" on storage.objects;

-- Conta inicial: admin@exemplo.com / admin123
insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
)
select
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  'admin@exemplo.com', crypt('admin123', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"name":"Administrador","username":"admin"}'::jsonb,
  now(), now(), '', '', '', ''
where not exists (select 1 from auth.users where email = 'admin@exemplo.com');
