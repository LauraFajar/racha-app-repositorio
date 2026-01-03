import React from 'react';
import { Trophy, Medal, Star, Target } from 'lucide-react';

export default function Achievements() {
    const achievements = [
        { title: "Primer Fuego", desc: "Comienza tu primera racha", icon: <FlameIcon />, active: true },
        { title: "Semana de Hierro", desc: "7 días seguidos", icon: <Medal className="text-slate-400" />, active: false },
        { title: "Imparable", desc: "30 días de actividad", icon: <Star className="text-slate-400" />, active: false },
        { title: "Meta Cumplida", desc: "Registra 100 actividades", icon: <Target className="text-slate-400" />, active: false },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800">Tus Logros</h2>
            <div className="grid grid-cols-1 gap-3">
                {achievements.map((ach, i) => (
                    <div key={i} className={`p-4 rounded-2xl border flex items-center gap-4 ${ach.active ? 'bg-white border-brand-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
                        <div className={`p-3 rounded-full ${ach.active ? 'bg-brand-100 text-brand-600' : 'bg-slate-200 text-slate-400'}`}>
                            {ach.icon}
                        </div>
                        <div>
                            <h3 className={`font-bold ${ach.active ? 'text-slate-800' : 'text-slate-500'}`}>{ach.title}</h3>
                            <p className="text-xs text-slate-400">{ach.desc}</p>
                        </div>
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
