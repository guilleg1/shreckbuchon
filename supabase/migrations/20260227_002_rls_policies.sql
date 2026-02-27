begin;

alter table public.users enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;

-- users
create policy "users_select_own"
on public.users
for select
using (auth.uid() = id);

create policy "users_update_own"
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "users_insert_own"
on public.users
for insert
with check (auth.uid() = id);

-- orders
create policy "orders_select_own"
on public.orders
for select
using (auth.uid() = user_id);

create policy "orders_insert_own"
on public.orders
for insert
with check (auth.uid() = user_id);

-- order_items (lectura por dueño del pedido)
create policy "order_items_select_own"
on public.order_items
for select
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

-- payments (lectura por dueño del pedido)
create policy "payments_select_own"
on public.payments
for select
using (
  exists (
    select 1
    from public.orders o
    where o.id = payments.order_id
      and o.user_id = auth.uid()
  )
);

-- webhook_events: sin acceso cliente
create policy "webhook_events_no_client_access"
on public.webhook_events
for all
using (false)
with check (false);

commit;
