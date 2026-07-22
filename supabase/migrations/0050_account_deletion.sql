-- Exclusão de conta para conformidade de lojas. O histórico financeiro e de
-- segurança é mantido de forma anonimizada quando houver obrigação legal.
alter table public.profiles
  add column if not exists account_deleted_at timestamptz;

create index if not exists profiles_account_deleted_at_idx
  on public.profiles (account_deleted_at)
  where account_deleted_at is not null;

notify pgrst, 'reload schema';
