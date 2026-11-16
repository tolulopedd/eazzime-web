-- Update standard welcome messages while preserving custom administrator copy.
alter table public.sales_settings alter column welcome
  set default 'Hi, I’m Davine an Eazzime AI assistant. What would you like to ask, build or improve on?';
update public.sales_settings
set welcome = 'Hi, I’m Davine an Eazzime AI assistant. What would you like to ask, build or improve on?', updated_at = now()
where welcome in (
  'Hi, I’m EazziMe’s AI assistant. What would you like to build or improve?',
  'Hi, I’m Davine @Eazzime, your AI assistant. What would you like to build or improve?'
);
