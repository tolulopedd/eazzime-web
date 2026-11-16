-- Update the original welcome without overwriting custom administrator copy.
alter table public.sales_settings alter column welcome
  set default 'Hi, I’m Davine @Eazzime, your AI assistant. What would you like to build or improve?';
update public.sales_settings
set welcome = 'Hi, I’m Davine @Eazzime, your AI assistant. What would you like to build or improve?', updated_at = now()
where welcome = 'Hi, I’m EazziMe’s AI assistant. What would you like to build or improve?';
