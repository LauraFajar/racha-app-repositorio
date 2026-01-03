import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { sendMessageToCoach } from '../lib/gemini';

const AICoach = ({ currentStreak }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'model', content: `¡Hola! Soy tu coach. Llevas una racha de ${currentStreak} días. ¿Entrenamos hoy? 💪` }
    ]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const responseText = await sendMessageToCoach([...messages, userMsg], input, { currentStreak });

        setMessages(prev => [...prev, { role: 'model', content: responseText }]);
        setLoading(false);
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-xl overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                ? 'bg-brand-600 text-white rounded-tr-none'
                                : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75" />
                                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 bg-slate-50 text-slate-800 placeholder-slate-400 px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 text-sm transition-all"
                />
                <button type="submit" className="p-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-brand-200" disabled={loading}>
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default AICoach;
