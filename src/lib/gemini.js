const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Frases de respaldo por si falla la API
const BACKUP_RESPONSES = [
    "¡Sigue así! La consistencia es la clave del éxito. 💪",
    "No importa cuán lento vayas, siempre y cuando no te detengas. 🐢➡️🐇",
    "Cada día cuenta. ¡Hoy es un gran día para sumar a tu racha! 🔥",
    "El dolor es temporal, la gloria de la racha es eterna. 🏆",
    "¡Vamos! Un día más, una victoria más. ✨",
    "Recuerda por qué empezaste. ¡Tú puedes! 🚀",
    "La disciplina te llevará donde la motivación no alcanza. 🧠"
];

export const sendMessageToCoach = async (history, message, streakData) => {
    // 1. Intentar conexión real con IA
    if (API_KEY) {
        try {
            const systemPrompt = `Eres 'Racha Coach'. Tu objetivo es motivar al usuario.
        Datos: Racha actual ${streakData?.currentStreak || 0} días.
        Sé breve, usa emojis y responde en español.`;

            let contents = history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            }));

            const systemMessage = {
                role: 'user',
                parts: [{ text: `[SYSTEM]: ${systemPrompt}` }]
            };

            if (contents.length > 0 && contents[0].role === 'model') contents.shift();
            contents = [systemMessage, { role: "model", parts: [{ text: "Entendido." }] }, ...contents];

            const models = [
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent"
            ];

            for (const url of models) {
                const response = await fetch(`${url}?key=${API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents })
                });

                if (response.ok) {
                    const data = await response.json();
                    return data.candidates?.[0]?.content?.parts?.[0]?.text;
                }
            }
            console.warn("API de Gemini falló o sin cuota, usando modo offline.");
        } catch (e) {
            console.error("Error de conexión, usando modo offline.", e);
        }
    }

    // 2. Fallback: Modo Offline (Coach Local)
    // Simular pequeño delay para realismo
    await new Promise(resolve => setTimeout(resolve, 600));

    const randomResponse = BACKUP_RESPONSES[Math.floor(Math.random() * BACKUP_RESPONSES.length)];
    return `${randomResponse} (Coach Offline 🤖)`;
};
