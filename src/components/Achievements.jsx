import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Target } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Achievements() {
    const [stats, setStats] = useState({
        totalCheckIns: 0,
        maxStreak: 0,
        hasAnyCheckIn: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { count: totalCount } = await supabase
            .from('habit_check_ins')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

        const { data: habits } = await supabase
            .from('habits')
            .select('id');

        let highestStreak = 0;

        if (habits && habits.length > 0) {
            for (const habit of habits) {
                const { data: streak } = await supabase
                    .rpc('calculate_habit_streak', { p_habit_id: habit.id });

                if (streak > highestStreak) {
                    highestStreak = streak;
                }
            }
        }

        setStats({
            totalCheckIns: totalCount || 0,
            maxStreak: highestStreak,
            hasAnyCheckIn: (totalCount || 0) > 0
        });
        setLoading(false);
    };

    const achievements = [
        {
            title: "Primer Fuego",
            desc: "Comienza tu primera racha",
            icon: <FlameIcon />,
            active: stats.hasAnyCheckIn
        },
        {
            title: "Semana de Hierro",
            desc: "7 días seguidos en cualquier hábito",
            icon: <Medal className={stats.maxStreak >= 7 ? "text-orange-500" : "text-slate-400"} />,
            active: stats.maxStreak >= 7
        },
        {
            title: "Imparable",
            desc: "30 días de actividad total",
            icon: <Star className={stats.totalCheckIns >= 30 ? "text-yellow-500" : "text-slate-400"} />,
            active: stats.totalCheckIns >= 30
        },
        {
            title: "Meta Cumplida",
            desc: "Registra 100 actividades",
            icon: <Target className={stats.totalCheckIns >= 100 ? "text-red-500" : "text-slate-400"} />,
            active: stats.totalCheckIns >= 100
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">Tus Logros</h2>
            <div className="grid grid-cols-1 gap-3">
                {achievements.map((ach, i) => (
                    <div key={i} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all duration-500 ${ach.active ? 'bg-white border-brand-200 shadow-md scale-[1.02]' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                        <div className={`p-3 rounded-full ${ach.active ? 'bg-brand-100 text-brand-600' : 'bg-slate-200 text-slate-400'}`}>
                            {ach.icon}
                        </div>
                        <div>
                            <h3 className={`font-bold ${ach.active ? 'text-slate-800' : 'text-slate-500'}`}>{ach.title}</h3>
                            <p className="text-xs text-slate-400">{ach.desc}</p>
                        </div>
                        {ach.active && (
                            <div className="ml-auto">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

const FlameIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
        className="w-6 h-6"
    >
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1 1.2-2.1 2.33-2.67.633-.319 1.17.17 1.17.17z" />
    </svg>
)
