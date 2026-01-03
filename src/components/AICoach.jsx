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
        <div className="flex flex-col h-72 bg-white/10 rounded-xl backdrop-blur-sm overflow-hidden border border-white/20">
            <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-white text-brand-600 font-medium'
                                : 'bg-black/20 text-white backdrop-blur-md'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-black/20 px-3 py-2 rounded-2xl">
                            <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce delay-75" />
                                <div className="w-1.5 h-1.5 bg-white/70 rounded-full animate-bounce delay-150" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 flex gap-2 border-t border-white/10 bg-black/10">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Pregúntame algo..."
                    className="flex-1 bg-transparent text-white placeholder-white/60 px-4 py-2 rounded-full border border-white/20 focus:outline-none focus:border-white/50 focus:bg-white/5 text-sm transition-all"
                />
                <button type="submit" className="p-2 bg-white text-brand-600 rounded-full hover:bg-slate-100 transition-transform active:scale-95 disabled:opacity-50" disabled={loading}>
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
};

export default AICoach;
