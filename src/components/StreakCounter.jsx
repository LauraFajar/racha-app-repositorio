import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

const StreakCounter = ({ streak, setStreak }) => {
    const [completedToday, setCompletedToday] = useState(false);
    const [loading, setLoading] = useState(false);

    // Verificar si ya completó hoy al cargar el componente
    useEffect(() => {
        checkIfCompletedToday();
    }, []);

    const checkIfCompletedToday = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from('profiles')
            .select('last_activity_date')
            .eq('id', user.id)
            .single();

        if (data?.last_activity_date) {
            const today = new Date().toISOString().split('T')[0];
            setCompletedToday(data.last_activity_date === today);
        }
    };

    const handleCheckIn = async () => {
        if (completedToday || loading) return;

        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert('Debes iniciar sesión');
                setLoading(false);
                return;
            }

            const today = new Date().toISOString().split('T')[0];
            const newStreak = streak + 1;

            let { data: existingProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (!existingProfile) {
                await new Promise(resolve => setTimeout(resolve, 500));
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();
                existingProfile = data;
            }

            if (!existingProfile) {
                alert('Error: No se pudo cargar tu perfil. Intenta cerrar sesión y volver a entrar.');
                setLoading(false);
                return;
            }

            const longestStreak = Math.max(newStreak, existingProfile?.longest_streak || 0);

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    current_streak: newStreak,
                    longest_streak: longestStreak,
                    last_activity_date: today
                })
                .eq('id', user.id);

            if (updateError) {
                console.error('Error actualizando perfil:', updateError);
                throw updateError;
            }

            try {
                await supabase
                    .from('exercise_logs')
                    .insert({
                        user_id: user.id,
                        activity_date: today,
                        activity_type: 'check-in',
                        notes: `Racha día ${newStreak}`
                    });
            } catch (logError) {
                console.warn('No se pudo crear el log, pero la racha se guardó:', logError);
            }

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ea580c', '#fb923c', '#fff']
            });

            setStreak(newStreak);
            setCompletedToday(true);

        } catch (error) {
            console.error('Error al registrar check-in:', error);
            alert('Hubo un error al registrar tu actividad. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCheckIn}
                disabled={completedToday || loading}
                className={`relative group w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 ${completedToday || loading
                    ? 'bg-slate-100 border-4 border-slate-200 cursor-default'
                    : 'bg-gradient-to-tr from-brand-500 to-orange-400 border-4 border-orange-200 shadow-[0_0_40px_rgba(249,115,22,0.4)] animate-pulse-slow'
                    }`}
            >
                {completedToday ? (
                    <CheckCircle2 className="w-20 h-20 text-slate-300" />
                ) : loading ? (
                    <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Flame className="w-20 h-20 text-white fill-current animate-flame filter drop-shadow-md" />
                )}

                {!completedToday && !loading && (
                    <span className="absolute -bottom-10 px-6 py-2 bg-brand-100 text-brand-700 text-sm font-bold rounded-full shadow-sm">
                        ¡Registrar!
                    </span>
                )}
            </motion.button>

            {completedToday && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-brand-600 font-bold text-lg text-center mt-4">
                    ¡Racha extendida! 🔥
                </motion.div>
            )}
        </div>
    );
};

export default StreakCounter;
