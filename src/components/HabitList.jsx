import React, { useState, useEffect } from 'react';
import { Plus, Flame, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const HabitList = () => {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newHabitName, setNewHabitName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('🎯');

    const iconOptions = ['🎯', '📚', '💪', '🧘', '💧', '🏃', '🎨', '✍️', '🎵', '🌱'];

    useEffect(() => {
        loadHabits();
    }, []);

    const loadHabits = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error cargando hábitos:', error);
            return;
        }

        // Cargar check-ins de los últimos 7 días para cada hábito
        const habitsWithCheckIns = await Promise.all(
            (data || []).map(async (habit) => {
                const last7Days = getLast7Days();
                const { data: checkIns } = await supabase
                    .from('habit_check_ins')
                    .select('check_in_date')
                    .eq('habit_id', habit.id)
                    .gte('check_in_date', last7Days[0])
                    .lte('check_in_date', last7Days[6]);

                const checkInDates = (checkIns || []).map(c => c.check_in_date);

                return {
                    ...habit,
                    checkIns: last7Days.map(date => checkInDates.includes(date))
                };
            })
        );

        setHabits(habitsWithCheckIns);
        setLoading(false);
    };

    const getLast7Days = () => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    };

    const getDayLabel = (dateStr) => {
        const days = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
        const date = new Date(dateStr + 'T00:00:00');
        return days[date.getDay()];
    };

    const toggleCheckIn = async (habitId, dateIndex) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const last7Days = getLast7Days();
        const targetDate = last7Days[dateIndex];
        const today = new Date().toISOString().split('T')[0];

        // Solo permitir marcar hoy o días pasados
        if (targetDate > today) {
            alert('No puedes marcar días futuros');
            return;
        }

        const habit = habits.find(h => h.id === habitId);
        const isChecked = habit.checkIns[dateIndex];

        if (isChecked) {
            // Desmarcar
            await supabase
                .from('habit_check_ins')
                .delete()
                .eq('habit_id', habitId)
                .eq('check_in_date', targetDate);
        } else {
            // Marcar
            await supabase
                .from('habit_check_ins')
                .insert({
                    habit_id: habitId,
                    user_id: user.id,
                    check_in_date: targetDate
                });

            if (targetDate === today) {
                confetti({
                    particleCount: 100,
                    spread: 60,
                    origin: { y: 0.6 },
                    colors: ['#ea580c', '#fb923c', '#fff']
                });
            }
        }

        loadHabits();
    };

    const addHabit = async () => {
        if (!newHabitName.trim()) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('habits')
            .insert({
                user_id: user.id,
                name: newHabitName,
                icon: selectedIcon
            });

        if (error) {
            console.error('Error creando hábito:', error);
            alert('Error al crear el hábito');
            return;
        }

        setNewHabitName('');
        setSelectedIcon('🎯');
        setShowAddModal(false);
        loadHabits();
    };

    const calculateStreak = (checkIns) => {
        let streak = 0;
        for (let i = checkIns.length - 1; i >= 0; i--) {
            if (checkIns[i]) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-800">Mis Hábitos</h2>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    <span className="font-medium">Añadir</span>
                </button>
            </div>

            {habits.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                    <p className="text-slate-500 mb-4">No tienes hábitos aún</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors font-medium"
                    >
                        Crear tu primer hábito
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {habits.map((habit) => {
                        const streak = calculateStreak(habit.checkIns);
                        const last7Days = getLast7Days();

                        return (
                            <motion.div
                                key={habit.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{habit.icon}</span>
                                        <div>
                                            <h3 className="font-bold text-slate-800">{habit.name}</h3>
                                            {streak > 0 && (
                                                <div className="flex items-center gap-1 text-brand-600 text-sm font-medium">
                                                    <Flame className="w-4 h-4 fill-current" />
                                                    <span>{streak} día{streak !== 1 ? 's' : ''}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-between">
                                    {habit.checkIns.map((isChecked, index) => {
                                        const date = last7Days[index];
                                        const isToday = date === new Date().toISOString().split('T')[0];

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => toggleCheckIn(habit.id, index)}
                                                className={`flex-1 aspect-square rounded-xl flex flex-col items-center justify-center transition-all ${isChecked
                                                    ? 'bg-brand-600 text-white shadow-md'
                                                    : isToday
                                                        ? 'bg-brand-50 border-2 border-brand-200 text-brand-600'
                                                        : 'bg-slate-50 border border-slate-200 text-slate-400'
                                                    }`}
                                            >
                                                <span className="text-xs font-bold mb-1">
                                                    {getDayLabel(date)}
                                                </span>
                                                {isChecked && <Check className="w-4 h-4" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Modal para añadir hábito */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
                    >
                        <h3 className="text-2xl font-bold text-slate-800 mb-4">Nuevo Hábito</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Nombre del hábito
                                </label>
                                <input
                                    type="text"
                                    value={newHabitName}
                                    onChange={(e) => setNewHabitName(e.target.value)}
                                    placeholder="Ej: Leer 30 minutos"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Elige un icono
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {iconOptions.map((icon) => (
                                        <button
                                            key={icon}
                                            onClick={() => setSelectedIcon(icon)}
                                            className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${selectedIcon === icon
                                                ? 'bg-brand-100 border-2 border-brand-600 scale-110'
                                                : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                                                }`}
                                        >
                                            {icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={addHabit}
                                    disabled={!newHabitName.trim()}
                                    className="flex-1 px-4 py-3 rounded-xl bg-brand-600 text-white font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                >
                                    Crear
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default HabitList;
