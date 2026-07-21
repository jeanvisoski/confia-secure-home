-- Depois da contratação, a solicitação deixa de estar "aberta". O prestador
-- escolhido ainda precisa ver os detalhes, endereço e fotos do trabalho.

create policy "prestador vê solicitação contratada"
  on public.service_requests for select
  using (
    exists (
      select 1
      from public.orders o
      where o.request_id = service_requests.id
        and o.provider_id = auth.uid()
    )
  );

create policy "prestador vê endereço de pedido contratado"
  on public.addresses for select
  using (
    exists (
      select 1
      from public.service_requests r
      join public.orders o on o.request_id = r.id
      where r.address_id = addresses.id
        and o.provider_id = auth.uid()
    )
  );

create policy "prestador vê fotos de solicitação contratada"
  on public.request_photos for select
  using (
    exists (
      select 1
      from public.orders o
      where o.request_id = request_photos.request_id
        and o.provider_id = auth.uid()
    )
  );
