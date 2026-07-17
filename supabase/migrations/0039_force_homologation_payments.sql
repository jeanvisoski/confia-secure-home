-- Ambiente de testes: qualquer checkout valido deve ser aprovado localmente.
-- Tambem repara bancos onde a migration 0033 ainda nao foi executada.
alter table public.platform_settings
  add column if not exists payment_mode text not null default 'homologacao'
    check (payment_mode in ('homologacao', 'sandbox', 'producao')),
  add column if not exists payment_gateway text not null default 'mercado_pago'
    check (payment_gateway in ('mercado_pago')),
  add column if not exists pix_enabled boolean not null default true,
  add column if not exists card_enabled boolean not null default true,
  add column if not exists app_url text;

insert into public.platform_settings (id, default_service_fee_pct, payment_mode, payment_gateway, pix_enabled, card_enabled)
values (true, 4.70, 'homologacao', 'mercado_pago', true, true)
on conflict (id) do update set
  payment_mode = 'homologacao',
  payment_gateway = 'mercado_pago',
  pix_enabled = true,
  card_enabled = true;

create or replace function public.confirm_order_payment(p_order_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then raise exception 'Pedido nao encontrado.'; end if;
  if v_order.client_id <> auth.uid() then raise exception 'Voce nao pode confirmar este pagamento.'; end if;
  if v_order.status <> 'aguardando_pagamento' or v_order.payment_status <> 'pendente' then
    raise exception 'Este checkout ja foi processado ou nao esta mais disponivel.';
  end if;
  perform 1 from public.service_requests where id = v_order.request_id and status = 'aberto' for update;
  if not found then raise exception 'Esta solicitacao ja foi contratada por outro prestador.'; end if;
  update public.orders set status = 'aceito', payment_status = 'confirmado' where id = v_order.id;
  update public.orders set status = 'cancelado', payment_status = 'cancelado'
    where request_id = v_order.request_id and id <> v_order.id
      and status = 'aguardando_pagamento' and payment_status = 'pendente';
  update public.proposals set status = case when id = v_order.proposal_id then 'aceita' else 'recusada' end
    where request_id = v_order.request_id and status = 'pendente';
  update public.service_requests set status = 'contratado' where id = v_order.request_id;
  return v_order.id;
end;
$$;

grant execute on function public.confirm_order_payment(uuid) to authenticated;
notify pgrst, 'reload schema';
