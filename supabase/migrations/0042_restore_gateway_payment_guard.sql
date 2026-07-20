-- A migration 0039 manteve a homologacao ativa durante os testes, mas a
-- versao dela da funcao de confirmacao removia a protecao de ambiente. Esta
-- versao garante que o navegador jamais consiga aprovar um pedido quando o
-- admin selecionar Sandbox ou Producao.
create or replace function public.confirm_order_payment(p_order_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mode text;
  v_order public.orders%rowtype;
begin
  select payment_mode into v_mode from public.platform_settings where id = true;
  if coalesce(v_mode, 'homologacao') <> 'homologacao' then
    raise exception 'A confirmacao simulada esta desativada. Conclua o pagamento pelo gateway.';
  end if;

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
