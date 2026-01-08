-- Tabla de hábitos del usuario
CREATE TABLE IF NOT EXISTS habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#ea580c',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para habits
CREATE POLICY "Users can view own habits"
  ON habits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own habits"
  ON habits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own habits"
  ON habits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own habits"
  ON habits FOR DELETE
  USING (auth.uid() = user_id);

-- Índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS habits_user_id_idx ON habits(user_id);

-- Tabla de check-ins por hábito (reemplaza exercise_logs)
CREATE TABLE IF NOT EXISTS habit_check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  check_in_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(habit_id, check_in_date)
);

-- Habilitar RLS
ALTER TABLE habit_check_ins ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para habit_check_ins
CREATE POLICY "Users can view own check-ins"
  ON habit_check_ins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own check-ins"
  ON habit_check_ins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own check-ins"
  ON habit_check_ins FOR DELETE
  USING (auth.uid() = user_id);

-- Índices
CREATE INDEX IF NOT EXISTS habit_check_ins_habit_id_idx ON habit_check_ins(habit_id);
CREATE INDEX IF NOT EXISTS habit_check_ins_user_id_idx ON habit_check_ins(user_id);
CREATE INDEX IF NOT EXISTS habit_check_ins_date_idx ON habit_check_ins(check_in_date);

-- Función para calcular racha de un hábito
CREATE OR REPLACE FUNCTION calculate_habit_streak(p_habit_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak_count INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  check_exists BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS(
      SELECT 1 FROM habit_check_ins 
      WHERE habit_id = p_habit_id 
      AND check_in_date = check_date
    ) INTO check_exists;
    
    IF NOT check_exists THEN
      EXIT;
    END IF;
    
    streak_count := streak_count + 1;
    check_date := check_date - INTERVAL '1 day';
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql;
