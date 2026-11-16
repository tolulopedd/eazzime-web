-- Run once in the Supabase SQL editor, or with supabase db push.
create table public.sales_staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('admin','sales'))
);
create table public.sales_settings (
  id integer primary key check (id = 1),
  welcome text not null default 'Hi, I’m EazziMe’s AI assistant. What would you like to build or improve?',
  faqs text not null default '', knowledge text not null default '',
  updated_at timestamptz not null default now()
);
insert into public.sales_settings(id) values (1);
create table public.sales_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null, company text not null default '', email text not null unique,
  phone text not null default '', description text not null,
  service text not null default '', budget text not null default '', currency text not null default '',
  start_date text not null default '', timeline text not null default '',
  status text not null default 'New' check(status in ('New','Qualified','Consultation Scheduled','Proposal Sent','Negotiation','Won','Lost')),
  source text not null default 'website_chatbot', attribution jsonb not null default '{}',
  assigned_to uuid references public.sales_staff(user_id) on delete set null,
  summary text not null default '', summary_kind text not null default 'visitor',
  consent_version text not null, consent_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '180 days'
);
create index sales_leads_status on public.sales_leads(status,created_at desc);
create index sales_leads_assigned on public.sales_leads(assigned_to);
create index sales_leads_retention on public.sales_leads(expires_at);
create table public.sales_submissions (
  id uuid primary key, lead_id uuid not null references public.sales_leads(id) on delete cascade,
  created_at timestamptz not null default now(),
  details jsonb not null, messages jsonb not null default '[]',
  summary text not null, summary_kind text not null,
  booked_at timestamptz, booking_uid text,
  consent_version text not null
);
create table public.sales_notes (
  id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.sales_leads(id) on delete cascade,
  author_id uuid references public.sales_staff(user_id) on delete set null,
  body text not null, created_at timestamptz not null default now()
);
create table public.sales_outbox (
  id uuid primary key default gen_random_uuid(), lead_id uuid not null references public.sales_leads(id) on delete cascade,
  kind text not null check (kind in ('sales','acknowledgement')),
  sent_at timestamptz, first_attempt_at timestamptz, attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(), locked_until timestamptz,
  unique(lead_id,kind)
);
create table public.sales_booking_events (
  uid text primary key, submission_id uuid not null references public.sales_submissions(id) on delete cascade,
  created_at timestamptz not null default now()
);
-- All access goes through server handlers. No browser client may read or mutate these tables.
alter table public.sales_staff enable row level security;
alter table public.sales_settings enable row level security;
alter table public.sales_leads enable row level security;
alter table public.sales_submissions enable row level security;
alter table public.sales_notes enable row level security;
alter table public.sales_outbox enable row level security;
alter table public.sales_booking_events enable row level security;
revoke all on public.sales_staff, public.sales_settings, public.sales_leads, public.sales_submissions, public.sales_notes, public.sales_outbox, public.sales_booking_events from anon, authenticated;
grant all on public.sales_staff, public.sales_settings, public.sales_leads, public.sales_submissions, public.sales_notes, public.sales_outbox, public.sales_booking_events to service_role;

create function public.capture_sales_lead(p jsonb, retention_days integer default 180)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare lid uuid; sid uuid; fresh boolean := false; qualified boolean;
begin
  sid := (p->>'request_id')::uuid;
  -- Serializes retries of one request, including conflicting payload retries.
  perform pg_advisory_xact_lock(hashtextextended(sid::text,0));
  select lead_id into lid from sales_submissions where id = sid;
  if lid is not null then return jsonb_build_object('created',false,'replayed',true,'qualified',false,'submission_id',sid); end if;
  qualified := coalesce(p->>'service','') <> '' and coalesce(p->>'budget','') <> '' and coalesce(p->>'currency','') <> '' and coalesce(p->>'timeline','') <> '';
  insert into sales_leads(name,company,email,phone,description,service,budget,currency,start_date,timeline,status,attribution,summary,summary_kind,consent_version,expires_at)
  values(p->>'name',p->>'company',lower(p->>'email'),p->>'phone',p->>'description',p->>'service',p->>'budget',p->>'currency',p->>'startDate',p->>'timeline',case when qualified then 'Qualified' else 'New' end,p->'attribution',p->>'summary',p->>'summary_kind',p->>'consent_version',now()+make_interval(days=>greatest(1,least(retention_days,730))))
  on conflict(email) do nothing returning id into lid;
  fresh := lid is not null;
  if lid is null then select id into lid from sales_leads where email=lower(p->>'email'); end if;
  insert into sales_submissions(id,lead_id,details,messages,summary,summary_kind,consent_version)
  values(sid,lid,p-'messages'-'summary',p->'messages',p->>'summary',p->>'summary_kind',p->>'consent_version');
  if fresh then
    insert into sales_outbox(lead_id,kind) values(lid,'sales'),(lid,'acknowledgement');
  end if;
  return jsonb_build_object('created',fresh,'replayed',false,'qualified',fresh and qualified,'submission_id',sid);
end $$;

create function public.claim_sales_mail() returns setof public.sales_outbox
language sql security invoker set search_path = public as $$
  update sales_outbox set locked_until=now()+interval '5 minutes', attempts=attempts+1, first_attempt_at=coalesce(first_attempt_at,now()),
    next_attempt_at=now()+interval '15 minutes'
  where id in (select id from sales_outbox where sent_at is null and attempts < 6 and next_attempt_at <= now()
    and (first_attempt_at is null or first_attempt_at > now()-interval '20 hours')
    and (locked_until is null or locked_until < now()) order by next_attempt_at limit 10 for update skip locked)
  returning *;
$$;
create function public.confirm_sales_booking(sid uuid, booking_id text) returns boolean
language plpgsql security invoker set search_path = public as $$
declare lid uuid;
begin
  select lead_id into lid from sales_submissions where id=sid;
  if lid is null then return false; end if;
  insert into sales_booking_events(uid,submission_id) values(booking_id,sid) on conflict do nothing;
  if not found then return false; end if;
  update sales_submissions set booked_at=coalesce(booked_at,now()),booking_uid=booking_id where id=sid;
  update sales_leads set status='Consultation Scheduled' where id=lid and status in ('New','Qualified');
  return true;
end $$;
revoke all on function public.capture_sales_lead(jsonb,integer), public.claim_sales_mail(), public.confirm_sales_booking(uuid,text) from public,anon,authenticated;
grant execute on function public.capture_sales_lead(jsonb,integer), public.claim_sales_mail(), public.confirm_sales_booking(uuid,text) to service_role;

create function public.sales_metrics(staff_id uuid default null) returns jsonb
language sql security invoker set search_path=public as $$
  with scoped as (select * from sales_leads where staff_id is null or assigned_to=staff_id),
  groups as (
    select 'service' as dimension, coalesce(nullif(service,''),'Unspecified') as label, count(*) as total, count(*) filter(where status='Won') as won, count(*) filter(where status='Consultation Scheduled') as scheduled from scoped group by 2
    union all
    select 'campaign',coalesce(nullif(attribution->>'utm_campaign',''),'Unattributed'),count(*),count(*) filter(where status='Won'),count(*) filter(where status='Consultation Scheduled') from scoped group by 2
    union all
    select 'source',coalesce(nullif(attribution->>'utm_source',''),nullif(attribution->>'referrer',''),'Direct'),count(*),count(*) filter(where status='Won'),count(*) filter(where status='Consultation Scheduled') from scoped group by 2
  ) select jsonb_build_object('total',(select count(*) from scoped),'won',(select count(*) from scoped where status='Won'),'groups',coalesce((select jsonb_agg(to_jsonb(groups)) from groups),'[]'::jsonb));
$$;
revoke all on function public.sales_metrics(uuid) from public,anon,authenticated;
grant execute on function public.sales_metrics(uuid) to service_role;
