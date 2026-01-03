import React, { useState } from 'react';
import { Flame, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

const StreakCounter = ({ streak, setStreak }) => {
    const [completedToday, setCompletedToday] = useState(false);

    const handleCheckIn = () => {
        if (completedToday) return;

        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#ea580c', '#fb923c', '#fff']
        });

        setStreak(prev => prev + 1);
        setCompletedToday(true);
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCheckIn}
                disabled={completedToday}
                className={`relative group w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 ${completedToday
                    ? 'bg-slate-100 border-4 border-slate-200 cursor-default'
                    : 'bg-gradient-to-tr from-brand-500 to-orange-400 border-4 border-orange-200 shadow-[0_0_40px_rgba(249,115,22,0.4)] animate-pulse-slow'
                    }`}
            >
                {completedToday ? (
                    <CheckCircle2 className="w-20 h-20 text-slate-300" />
                ) : (
                    <Flame className="w-20 h-20 text-white fill-current animate-flame filter drop-shadow-md" />
                )}

                {!completedToday && (
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
