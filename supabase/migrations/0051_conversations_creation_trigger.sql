-- A migration 0019 deveria ter criado esse gatilho, mas o arquivo ficou
-- corrompido no repositorio (conteudo truncado) e nunca existiu de fato --
-- nenhum pedido tinha uma conversa criada, em nenhum momento da historia
-- do app. Esta migration cria o gatilho de verdade e faz o backfill dos
-- pedidos ja existentes que ficaram sem conversa por causa disso.
create or replace function public.create_order_conversation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.conversations (order_id) values (new.id)
    on conflict (order_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_order_created_conversation on public.orders;
create trigger on_order_created_conversation
  after insert on public.orders
  for each row execute function public.create_order_conversation();

insert into public.conversations (order_id)
select o.id from public.orders o
where not exists (select 1 from public.conversations c where c.order_id = o.id)
on conflict (order_id) do nothing;

notify pgrst, 'reload schema';
