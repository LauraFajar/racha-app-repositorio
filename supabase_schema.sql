-- Tabla de perfiles públicos (vinculada a usuarios autenticados)
create table public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  username text,
  avatar_url text,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_activity_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- Políticas de seguridad (RLS) para profiles
alter table public.profiles enable row level security;

create policy "Los perfiles son visibles por el usuario dueño"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Los usuarios pueden insertar su propio perfil"
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Los usuarios pueden actualizar su propio perfil"
  on public.profiles for update
  using ( auth.uid() = id );

-- Tabla de registro de actividad (Logs)
create table public.exercise_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_date date default current_date not null,
  activity_type text default 'general', -- 'cardio', 'pesos', etc.
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Políticas RLS para logs
alter table public.exercise_logs enable row level security;

create policy "Usuarios pueden ver sus propios logs"
  on public.exercise_logs for select
  using ( auth.uid() = user_id );

create policy "Usuarios pueden crear logs"
  on public.exercise_logs for insert
  with check ( auth.uid() = user_id );

-- Función para manejar nuevo usuario
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger que se dispara cuando un usuario se registra en Auth
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
