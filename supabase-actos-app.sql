create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  zone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.acts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  offer text not null,
  need text not null,
  need_story text not null,
  zone text,
  availability text,
  purpose text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  act_id uuid not null references public.acts(id) on delete cascade,
  requester_id uuid not null references auth.users(id) on delete cascade,
  helper_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.acts enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

drop policy if exists "profiles own select" on public.profiles;
drop policy if exists "profiles own insert" on public.profiles;
drop policy if exists "profiles own update" on public.profiles;
drop policy if exists "acts own select" on public.acts;
drop policy if exists "acts own insert" on public.acts;
drop policy if exists "acts own update" on public.acts;
drop policy if exists "conversations participant select" on public.conversations;
drop policy if exists "messages participant select" on public.messages;
drop policy if exists "messages participant insert" on public.messages;

create policy "profiles own select"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "profiles own insert"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

create policy "profiles own update"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "acts own select"
on public.acts for select
to authenticated
using (user_id = auth.uid());

create policy "acts own insert"
on public.acts for insert
to authenticated
with check (user_id = auth.uid());

create policy "acts own update"
on public.acts for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "conversations participant select"
on public.conversations for select
to authenticated
using (requester_id = auth.uid() or helper_id = auth.uid());

create policy "messages participant select"
on public.messages for select
to authenticated
using (
  exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (c.requester_id = auth.uid() or c.helper_id = auth.uid())
  )
);

create policy "messages participant insert"
on public.messages for insert
to authenticated
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.conversations c
    where c.id = messages.conversation_id
      and (c.requester_id = auth.uid() or c.helper_id = auth.uid())
  )
);

create or replace function public.get_match_suggestions()
returns table (
  act_id uuid,
  display_name text,
  zone text,
  offer text,
  need text,
  need_story text,
  availability text,
  purpose text,
  score int
)
language sql
security definer
set search_path = public
as $$
  with my_act as (
    select *
    from public.acts
    where user_id = auth.uid()
      and status = 'active'
    order by updated_at desc
    limit 1
  )
  select
    a.id as act_id,
    p.display_name,
    coalesce(p.zone, a.zone) as zone,
    a.offer,
    a.need,
    a.need_story,
    a.availability,
    a.purpose,
    (
      case when a.offer = my_act.need then 3 else 0 end +
      case when a.need = my_act.offer then 3 else 0 end +
      case when a.purpose = my_act.purpose then 1 else 0 end +
      case when a.availability = my_act.availability or a.availability = 'flexible' or my_act.availability = 'flexible' then 1 else 0 end
    ) as score
  from public.acts a
  join public.profiles p on p.id = a.user_id
  cross join my_act
  where a.user_id <> auth.uid()
    and a.status = 'active'
    and (
      a.offer = my_act.need
      or a.need = my_act.offer
      or a.purpose = my_act.purpose
    )
  order by score desc, a.updated_at desc
  limit 12;
$$;

create or replace function public.create_conversation_for_match(match_act_id uuid)
returns table (conversation_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  my_act public.acts%rowtype;
  other_act public.acts%rowtype;
  existing_id uuid;
  new_id uuid;
begin
  select *
  into my_act
  from public.acts
  where user_id = auth.uid()
    and status = 'active'
  order by updated_at desc
  limit 1;

  if my_act.id is null then
    raise exception 'No active act found for current user';
  end if;

  select *
  into other_act
  from public.acts
  where id = match_act_id
    and status = 'active'
    and user_id <> auth.uid();

  if other_act.id is null then
    raise exception 'Match act not available';
  end if;

  if not (
    other_act.offer = my_act.need
    or other_act.need = my_act.offer
    or other_act.purpose = my_act.purpose
  ) then
    raise exception 'Acts are not compatible';
  end if;

  select id
  into existing_id
  from public.conversations
  where act_id = other_act.id
    and (
      (requester_id = auth.uid() and helper_id = other_act.user_id)
      or (requester_id = other_act.user_id and helper_id = auth.uid())
    )
  limit 1;

  if existing_id is not null then
    return query select existing_id;
    return;
  end if;

  insert into public.conversations (act_id, requester_id, helper_id)
  values (other_act.id, auth.uid(), other_act.user_id)
  returning id into new_id;

  return query select new_id;
end;
$$;

grant usage on schema public to authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update on public.acts to authenticated;
grant select on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;
grant execute on function public.get_match_suggestions() to authenticated;
grant execute on function public.create_conversation_for_match(uuid) to authenticated;
