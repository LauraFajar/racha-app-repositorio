import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('home');

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <Auth />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
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
              onClick={() => setActiveTab('chat')}
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
      case 'achievements':
        return <Achievements />;
      case 'chat':
        return (
          <div className="h-[calc(100vh-140px)] flex flex-col">
            <div className="bg-gradient-to-br from-brand-500 to-red-600 rounded-t-3xl p-6 shadow-lg text-white shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2">
                Coach IA
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-medium">BETA</span>
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-10 transition-all">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2" onClick={() => setActiveTab('home')}>
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
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-slate-200 pb-safe z-20">
        <div className="max-w-md mx-auto flex justify-around items-center h-16">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center gap-1 relative transition-colors ${activeTab === 'home' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {activeTab === 'home' && <div className="absolute -top-1 w-8 h-1 bg-brand-600 rounded-full" />}
            <Flame className={`w-6 h-6 ${activeTab === 'home' ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-bold">Racha</span>
          </button>

          <button
            onClick={() => setActiveTab('achievements')}
            className={`flex flex-col items-center gap-1 relative transition-colors ${activeTab === 'achievements' ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            {activeTab === 'achievements' && <div className="absolute -top-1 w-8 h-1 bg-brand-600 rounded-full" />}
            <Trophy className="w-6 h-6" />
            <span className="text-[10px] font-medium">Logros</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
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
