import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Flame, Dumbbell, MessageSquare, Trophy, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';

// Componentes
import StreakCounter from './components/StreakCounter';
import AICoach from './components/AICoach';
import Auth from './components/Auth';
import Achievements from './components/Achievements';

function App() {
  const [session, setSession] = useState(null);
  const [streak, setStreak] = useState(0);


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar la racha del usuario desde la base de datos
  useEffect(() => {
    if (session?.user) {
      loadUserStreak();
    }
  }, [session]);

  const loadUserStreak = async () => {
    let { data, error } = await supabase
      .from('profiles')
      .select('current_streak, last_activity_date, longest_streak')
      .eq('id', session.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error cargando racha:', error);
      return;
    }

    // Si no existe el perfil aún, esperar un momento (el trigger lo está creando)
    if (!data) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const { data: retryData } = await supabase
        .from('profiles')
        .select('current_streak, last_activity_date, longest_streak')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!retryData) {
        console.warn('Perfil aún no disponible');
        setStreak(0);
        return;
      }
      data = retryData;
    }

    // Verificar si la racha sigue activa
    const today = new Date().toISOString().split('T')[0];
    const lastActivity = data.last_activity_date;

    if (lastActivity) {
      const daysDiff = Math.floor(
        (new Date(today) - new Date(lastActivity)) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff > 1) {
        setStreak(0);
        await supabase
          .from('profiles')
          .update({ current_streak: 0 })
          .eq('id', session.user.id);
      } else {
        setStreak(data.current_streak || 0);
      }
    } else {
      setStreak(data.current_streak || 0);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = location.pathname === '/' ? 'home' : location.pathname.substring(1);

  if (!session) {
    return <Auth />;
  }

  const HomePage = () => (
    <>
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 text-center space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2" />
        <div>
          <h2 className="text-2xl font-bold text-slate-800">¡Hola, {session.user.email?.split('@')[0]}!</h2>
          <p className="text-slate-500">Mantén tu racha viva completando tu actividad de hoy.</p>
        </div>
        <div className="py-6">
          <StreakCounter streak={streak} setStreak={setStreak} />
        </div>
      </section>

      <div
        onClick={() => navigate('/chat')}
        className="mt-4 p-4 bg-brand-50 rounded-2xl flex items-center gap-3 cursor-pointer hover:bg-brand-100 transition-colors"
      >
        <div className="p-2 bg-brand-200 rounded-full text-brand-600">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-brand-800">Habla con tu Coach</p>
          <p className="text-xs text-brand-600">Necesitas motivación hoy?</p>
        </div>
      </div>
    </>
  );

  const ChatPage = () => (
    <div className="h-[calc(100vh-140px)] flex flex-col">
      <div className="bg-gradient-to-br from-brand-500 to-red-600 rounded-t-3xl p-6 shadow-lg text-white shrink-0">
        <h3 className="font-bold text-lg flex items-center gap-2">
          Coach IA <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">BETA</span>
        </h3>
        <p className="text-brand-100 text-sm">Consejos personalizados y motivación.</p>
      </div>
      <div className="flex-1 bg-white border-x border-b border-slate-200 rounded-b-3xl shadow-sm overflow-hidden relative">
        <div className="absolute inset-0">
          <AICoach currentStreak={streak} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-10 transition-all">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={() => navigate('/')}>
            <Dumbbell className="text-brand-600 w-6 h-6" />
            <h1 className="font-bold text-xl tracking-tight text-slate-800">Racha</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-orange-100 px-3 py-1 rounded-full text-brand-600 font-bold text-sm">
              <Flame className="w-4 h-4 fill-current" />
              <span>{streak}</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-24 px-4 max-w-md mx-auto space-y-6">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-safe z-20">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center gap-1 relative transition-colors ${activeTab === 'home' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {activeTab === 'home' && <div className="absolute -top-1 w-8 h-1 bg-brand-600 rounded-full" />}
            <Flame className={`w-6 h-6 ${activeTab === 'home' ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-bold">Racha</span>
          </button>

          <button
            onClick={() => navigate('/achievements')}
            className={`flex flex-col items-center gap-1 relative transition-colors ${activeTab === 'achievements' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {activeTab === 'achievements' && <div className="absolute -top-1 w-8 h-1 bg-brand-600 rounded-full" />}
            <Trophy className="w-6 h-6" />
            <span className="text-[10px] font-medium">Logros</span>
          </button>

          <button
            onClick={() => navigate('/chat')}
            className={`flex flex-col items-center gap-1 relative transition-colors ${activeTab === 'chat' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {activeTab === 'chat' && <div className="absolute -top-1 w-8 h-1 bg-brand-600 rounded-full" />}
            <MessageSquare className="w-6 h-6" />
            <span className="text-[10px] font-medium">Chat</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
