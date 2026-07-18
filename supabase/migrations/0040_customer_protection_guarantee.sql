-- Proteção BICOJÁ: a taxa é exibida e cobrada do cliente; o valor do
-- serviço fica em garantia antes de poder ser sacado pelo prestador.
alter table public.platform_settings
  add column if not exists customer_protection_fee_pct numeric(5,2) not null default 8.00 check (customer_protection_fee_pct between 0 and 100),
  add column if not exists customer_protection_fee_min numeric(10,2) not null default 0 check (customer_protection_fee_min >= 0),
  add column if not exists provider_guarantee_days integer not null default 7 check (provider_guarantee_days between 0 and 90),
  add column if not exists auto_completion_hours integer not null default 48 check (auto_completion_hours between 1 and 720);

alter table public.orders
  add column if not exists customer_protection_fee numeric(10,2) not null default 0 check (customer_protection_fee >= 0),
  add column if not exists guarantee_until timestamptz,
  add column if not exists guarantee_status text not null default 'nao_aplicavel'
    check (guarantee_status in ('nao_aplicavel', 'em_garantia', 'liberada', 'congelada', 'reembolsada')),
  add column if not exists client_confirmation_at timestamptz;

alter table public.wallet_transactions drop constraint if exists wallet_transactions_status_check;
alter table public.wallet_transactions add constraint wallet_transactions_status_check
  check (status in ('pendente', 'em_garantia', 'disponivel', 'reservado', 'pago', 'congelado', 'reembolsado'));

create or replace function public.create_checkout_order(p_proposal_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_proposal public.proposals%rowtype; v_request public.service_requests%rowtype;
  v_fee_pct numeric; v_fee_min numeric; v_price numeric; v_fee numeric; v_order_id uuid;
begin
  select * into v_proposal from public.proposals where id = p_proposal_id;
  if not found or v_proposal.status <> 'pendente' then raise exception 'Proposta indisponivel.'; end if;
  select * into v_request from public.service_requests where id = v_proposal.request_id for update;
  if not found or v_request.client_id <> auth.uid() or v_request.status <> 'aberto' then raise exception 'Solicitacao indisponivel para contratacao.'; end if;
  select coalesce(overrides.service_fee_pct, settings.customer_protection_fee_pct, settings.default_service_fee_pct), settings.customer_protection_fee_min
    into v_fee_pct, v_fee_min from public.platform_settings settings
    left join public.provider_fee_overrides overrides on overrides.provider_id = v_proposal.provider_id where settings.id = true;
  v_fee_pct := coalesce(v_fee_pct, 8); v_fee_min := coalesce(v_fee_min, 0);
  v_price := case when v_proposal.pricing_type = 'range' then v_proposal.price_max else v_proposal.price end;
  v_fee := greatest(round(v_price * v_fee_pct / 100, 2), v_fee_min);
  select id into v_order_id from public.orders where proposal_id = v_proposal.id and client_id = auth.uid() and status = 'aguardando_pagamento' and payment_status = 'pendente';
  if v_order_id is not null then return v_order_id; end if;
  insert into public.orders (request_id, proposal_id, client_id, provider_id, price, platform_fee, customer_protection_fee, total, pricing_type, quoted_price_min, quoted_price_max, duration_minutes, final_price, status, payment_status)
  values (v_request.id, v_proposal.id, auth.uid(), v_proposal.provider_id, v_price, v_fee, v_fee, v_price + v_fee, v_proposal.pricing_type, v_proposal.price_min, v_proposal.price_max, v_proposal.duration_minutes, v_price, 'aguardando_pagamento', 'pendente') returning id into v_order_id;
  return v_order_id;
end; $$;

create or replace function public.handle_order_wallet_status()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_days integer; v_until timestamptz;
begin
  if new.status = 'fotos_enviadas' and old.status is distinct from 'fotos_enviadas' then
    insert into public.wallet_transactions (provider_id, order_id, type, amount, status)
    select new.provider_id, new.id, 'credito_pendente', new.final_price, 'pendente'
    where not exists (select 1 from public.wallet_transactions where order_id = new.id);
  elsif new.status = 'concluido' and old.status is distinct from 'concluido' then
    select provider_guarantee_days into v_days from public.platform_settings where id = true;
    v_until := now() + make_interval(days => coalesce(v_days, 7));
    update public.wallet_transactions set type = 'credito_pendente', amount = new.final_price, status = 'em_garantia', available_at = v_until where order_id = new.id and status in ('pendente', 'congelado');
    insert into public.wallet_transactions (provider_id, order_id, type, amount, status, available_at)
      select new.provider_id, new.id, 'credito_pendente', new.final_price, 'em_garantia', v_until
      where not exists (select 1 from public.wallet_transactions where order_id = new.id);
    update public.orders set guarantee_until = v_until, guarantee_status = 'em_garantia', client_confirmation_at = now() where id = new.id;
    update public.provider_profiles set jobs_count = jobs_count + 1 where profile_id = new.provider_id;
  elsif new.status = 'em_disputa' and old.status is distinct from 'em_disputa' then
    update public.wallet_transactions set status = 'congelado' where order_id = new.id and status in ('pendente', 'em_garantia');
    update public.orders set guarantee_status = 'congelada' where id = new.id;
  end if;
  return new;
end; $$;

create or replace function public.release_due_guarantee_wallet_transactions()
returns integer language plpgsql security definer set search_path = public as $$
declare v_count integer;
begin
  with released as (
    update public.wallet_transactions set status = 'disponivel', type = 'credito_liberado'
    where status = 'em_garantia' and available_at <= now() returning order_id
  ) update public.orders set guarantee_status = 'liberada' where id in (select order_id from released);
  get diagnostics v_count = row_count; return v_count;
end; $$;
grant execute on function public.release_due_guarantee_wallet_transactions() to authenticated;

create or replace function public.request_provider_payout()
returns uuid language plpgsql security definer set search_path = public as $$
declare v_destination public.provider_payout_destinations%rowtype; v_amount numeric; v_request_id uuid;
begin
  perform public.release_due_guarantee_wallet_transactions();
  select * into v_destination from public.provider_payout_destinations where provider_id = auth.uid() for update;
  if not found or v_destination.status <> 'verificado' then raise exception 'Cadastre uma chave Pix validada pela equipe antes de solicitar saque.'; end if;
  if exists (select 1 from public.payout_requests where provider_id = auth.uid() and status in ('solicitado', 'aprovado')) then raise exception 'Ja existe uma solicitacao de saque em analise.'; end if;
  perform 1 from public.wallet_transactions where provider_id = auth.uid() and status = 'disponivel' for update;
  select coalesce(sum(amount), 0) into v_amount from public.wallet_transactions where provider_id = auth.uid() and status = 'disponivel';
  if v_amount <= 0 then raise exception 'Nao ha saldo disponivel para saque.'; end if;
  update public.wallet_transactions set status = 'reservado' where provider_id = auth.uid() and status = 'disponivel';
  insert into public.payout_requests (provider_id, amount, destination_snapshot) values (auth.uid(), v_amount, jsonb_build_object('method', v_destination.method, 'pix_key', v_destination.pix_key, 'pix_key_type', v_destination.pix_key_type, 'holder_name', v_destination.holder_name)) returning id into v_request_id;
  return v_request_id;
end; $$;

create or replace function public.resolve_protection_dispute(p_order_id uuid, p_resolution text, p_refund_amount numeric default 0, p_note text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_order public.orders%rowtype; v_refund numeric := greatest(coalesce(p_refund_amount, 0), 0);
begin
  if not public.is_admin(auth.uid()) then raise exception 'Operacao administrativa.'; end if;
  select * into v_order from public.orders where id = p_order_id for update;
  if not found or v_order.status <> 'em_disputa' then raise exception 'Disputa nao encontrada.'; end if;
  if p_resolution not in ('liberar', 'reembolso_parcial', 'reembolso_total') then raise exception 'Resolucao invalida.'; end if;
  if p_resolution = 'liberar' then
    update public.wallet_transactions set status = 'disponivel', type = 'credito_liberado', available_at = now() where order_id = v_order.id and status = 'congelado';
    update public.orders set status = 'concluido', guarantee_status = 'liberada' where id = v_order.id;
  elsif p_resolution = 'reembolso_parcial' then
    if v_refund <= 0 or v_refund >= v_order.final_price then raise exception 'Informe um reembolso parcial valido.'; end if;
    update public.wallet_transactions set amount = v_order.final_price - v_refund, status = 'disponivel', type = 'credito_liberado', available_at = now() where order_id = v_order.id and status = 'congelado';
    update public.orders set status = 'concluido', guarantee_status = 'reembolsada', refund_due = v_refund, refund_status = 'pendente' where id = v_order.id;
  else
    update public.wallet_transactions set status = 'reembolsado' where order_id = v_order.id and status = 'congelado';
    update public.orders set status = 'cancelado', guarantee_status = 'reembolsada', refund_due = v_order.total, refund_status = 'pendente' where id = v_order.id;
  end if;
  insert into public.order_status_events(order_id, status, note) values (v_order.id, (select status from public.orders where id=v_order.id), concat('[Admin - protecao] ', coalesce(p_note, p_resolution)));
  return v_order.id;
end; $$;
grant execute on function public.resolve_protection_dispute(uuid, text, numeric, text) to authenticated;

-- Mantém a garantia utilizável após a confirmação: o cliente pode abrir uma
-- disputa enquanto o prazo ainda estiver ativo.
create or replace function public.transition_order(p_order_id uuid, p_next_status text, p_final_price numeric default null, p_note text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_order public.orders%rowtype; v_is_provider boolean; v_is_client boolean; v_refund numeric := 0;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Pedido nao encontrado.'; end if;
  v_is_provider := v_order.provider_id = auth.uid(); v_is_client := v_order.client_id = auth.uid();
  if not v_is_provider and not v_is_client then raise exception 'Sem permissao para este pedido.'; end if;
  if p_next_status = 'a_caminho' and v_is_provider and v_order.status = 'aceito' and v_order.payment_status = 'confirmado' then null;
  elsif p_next_status = 'executando' and v_is_provider and v_order.status = 'a_caminho' then null;
  elsif p_next_status = 'fotos_enviadas' and v_is_provider and v_order.status = 'executando' then
    if p_final_price is null or p_final_price < v_order.quoted_price_min or p_final_price > v_order.quoted_price_max then raise exception 'Valor final fora da faixa aprovada.'; end if;
    if not exists (select 1 from public.order_photos where order_id = v_order.id and kind = 'depois') then raise exception 'Envie ao menos uma foto final antes de concluir.'; end if;
    v_refund := greatest(v_order.price - p_final_price, 0);
  elsif p_next_status = 'concluido' and v_is_client and v_order.status in ('fotos_enviadas', 'aguardando_confirmacao') then
    if not exists (select 1 from public.order_photos where order_id = v_order.id and kind = 'depois') then raise exception 'Nao ha fotos finais para confirmar.'; end if;
  elsif p_next_status = 'em_disputa' and v_is_client and (v_order.status in ('aceito', 'a_caminho', 'executando', 'fotos_enviadas', 'aguardando_confirmacao') or (v_order.status = 'concluido' and v_order.guarantee_until > now())) then
    if coalesce(length(trim(p_note)), 0) < 10 then raise exception 'Descreva o problema com pelo menos 10 caracteres.'; end if;
    insert into public.trust_reports(order_id, reporter_id, reported_user_id, category, description, source) values (v_order.id, auth.uid(), v_order.provider_id, 'conduta', trim(p_note), 'manual');
  elsif p_next_status = 'cancelado' and v_is_client and v_order.status = 'aguardando_pagamento' then null;
  else raise exception 'Transicao de status nao permitida.'; end if;
  update public.orders set status=p_next_status, final_price=coalesce(p_final_price, final_price), refund_due=case when p_next_status='fotos_enviadas' then v_refund else refund_due end, refund_status=case when p_next_status='fotos_enviadas' and v_refund>0 then 'pendente' else refund_status end, completed_at=case when p_next_status='concluido' then now() else completed_at end, final_amount_approved_at=case when p_next_status='concluido' then now() else final_amount_approved_at end, cancellation_reason=case when p_next_status='cancelado' then p_note else cancellation_reason end where id=v_order.id;
  insert into public.order_status_events(order_id,status,note) values(v_order.id,p_next_status,nullif(trim(coalesce(p_note,'')),''));
  return v_order.id;
end; $$;

do $$ begin
  perform cron.unschedule('release-wallet-guarantees');
exception when others then null; end $$;
select cron.schedule('release-wallet-guarantees', '15 * * * *', $$select public.release_due_guarantee_wallet_transactions();$$);
notify pgrst, 'reload schema';
