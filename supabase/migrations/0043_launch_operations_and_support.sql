-- Recursos operacionais para o beta: suporte auditavel e monitoramento de falhas.
create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  subject text not null check (char_length(subject) between 3 and 120),
  message text not null check (char_length(message) between 5 and 4000),
  status text not null default 'aberto' check (status in ('aberto', 'em_analise', 'respondido', 'fechado')),
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.support_tickets enable row level security;
create policy "cliente le seus chamados" on public.support_tickets for select using (profile_id = auth.uid() or public.is_admin(auth.uid()));
create policy "cliente cria chamado" on public.support_tickets for insert with check (profile_id = auth.uid());
create policy "admin atualiza chamados" on public.support_tickets for update using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

create table if not exists public.app_error_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  source text not null check (source in ('mobile', 'admin', 'edge_function')),
  message text not null,
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
alter table public.app_error_events enable row level security;
create policy "usuario registra proprio erro" on public.app_error_events for insert with check (profile_id = auth.uid() or profile_id is null);
create policy "admin le erros" on public.app_error_events for select using (public.is_admin(auth.uid()));

create or replace function public.update_support_ticket_timestamp()
returns trigger language plpgsql set search_path = public as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists support_ticket_updated_at on public.support_tickets;
create trigger support_ticket_updated_at before update on public.support_tickets for each row execute function public.update_support_ticket_timestamp();
notify pgrst, 'reload schema';
