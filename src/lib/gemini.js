import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
} else {
    console.warn("Falta la API Key de Gemini en .env");
}

export const sendMessageToCoach = async (history, message, streakData) => {
    if (!genAI) return "Error: No se ha configurado la API de Gemini.";

    // Contexto del sistema
    const systemPrompt = `Eres un entrenador personal entusiasta y motivador llamado 'Racha Coach'. 
  Tu objetivo es ayudar al usuario a mantener su racha de ejercicios. 
  Datos actuales del usuario: 
  - Racha actual: ${streakData?.currentStreak || 0} días.
  - Mejor racha: ${streakData?.longestStreak || 0} días.
  
  Sé breve, usa emojis, y enfócate en la consistencia. Si el usuario falla, anímalo a empezar de nuevo.
  Responde siempre en español.`;

    try {
        // 1. Crear modelo (sin systemInstruction para evitar error 400/404 en v1beta si no soportado)
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
        });

        // 2. Construir historial manualmente para inyectar System Prompt
        // Hacemos que el primer mensaje sea las instrucciones de sistema simuladas como usuario, 
        // seguidas de "Entendido" por el modelo (opcional) o simplemente el historial real.
        // Estrategia simple: Concatenar system prompt al primer mensaje o insertarlo al inicio.

        let validHistory = history.slice(0, -1).map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
        }));

        // Asegurar que no empiece con model (si falló limpieza previa)
        if (validHistory.length > 0 && validHistory[0].role === 'model') {
            validHistory.shift();
        }

        // Inyectar System Prompt como primer mensaje de "Usuario" para contexto
        // Esto es compatible con todas las versiones de API.
        const initialContext = {
            role: 'user',
            parts: [{ text: `INSTRUCCIONES DEL SISTEMA (Ignora este prefix en tu respuesta, solo acátalo): \n${systemPrompt}\n\nConfirma si entendiste.` }]
        };
        const initialModelReply = {
            role: 'model',
            parts: [{ text: "Entendido. Soy Racha Coach y estoy listo para motivar." }]
        };

        validHistory = [initialContext, initialModelReply, ...validHistory];

        const chat = model.startChat({
            history: validHistory,
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Error Gemini:", error);
        return "Lo siento, tuve un problema conectando con mi cerebro digital. ¡Sigue entrenando!";
    }
};
