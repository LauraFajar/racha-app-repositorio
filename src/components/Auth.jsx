import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Flame, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', text: '' });

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMsg({ type: 'success', text: '¡Registro exitoso! Revisa tu correo para confirmar.' });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error) {
            setMsg({ type: 'error', text: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-brand-200/30 rounded-full blur-3xl" />
                <div className="absolute top-[40%] -right-[10%] w-[60%] h-[60%] bg-orange-200/20 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-brand-500 to-orange-400 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 mb-4">
                        <Flame className="w-8 h-8 text-white fill-current" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                        {isSignUp ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {isSignUp ? 'Empieza tu racha hoy mismo' : 'Continúa con tu progreso'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="email"
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all font-medium text-slate-700"
                                placeholder="hola@ejemplo.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 ml-1">Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                            <input
                                type="password"
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 transition-all font-medium text-slate-700"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {msg.text && (
                        <div className={`p-3 rounded-xl text-sm font-medium ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                            {msg.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-brand-500/20 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                {isSignUp ? 'Registrarse' : 'Entrar'}
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-slate-500 hover:text-brand-600 text-sm font-medium transition-colors"
                    >
                        {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                    </button>
                </div>
            </div>
        </div>
    );
}
