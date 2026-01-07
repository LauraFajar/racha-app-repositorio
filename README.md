# Racha - App web para seguimiento de hábitos y rachas

> Aplicación web para seguimiento de hábitos y rachas de productividad con coach de inteligencia artificial integrado.

![React](https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.18-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-2.89.0-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

---

## 📋 Descripción

**Racha** es una aplicación de seguimiento de hábitos que te ayuda a mantener la consistencia en tus actividades diarias. Incluye un sistema de gamificación con logros desbloqueables y un coach de IA que te motiva y acompaña en tu progreso.

### ✨ Características Principales

- ✅ **Sistema de Autenticación**: Login y registro seguro con Supabase Auth
- 🔥 **Contador de Rachas**: Seguimiento visual de días consecutivos de actividad
- 🤖 **Coach de IA**: Chat en tiempo real con asistente motivacional powered by Google Gemini
- 🏆 **Sistema de Logros**: Desbloquea achievements según tu progreso
- 🎨 **Interfaz Moderna**: Diseño responsivo con animaciones fluidas

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 19.2.0** - Biblioteca principal
- **React Router DOM 7.11.0** - Navegación entre páginas
- **Tailwind CSS 4.1.18** - Estilos y diseño responsivo
- **Framer Motion 12.23.26** - Animaciones
- **Lucide React** - Iconos

### Backend & Servicios
- **Supabase** - Base de datos PostgreSQL y autenticación
- **Google Gemini API** - Inteligencia artificial para el coach

### Herramientas de Desarrollo
- **Vite 7.2.4** - Build tool y dev server
- **ESLint** - Linting de código

---

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js (v18 o superior)
- Cuenta de Supabase
- API Key de Google Gemini

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/LauraFajar/racha-app-repositorio.git
cd racha-app-repositorio
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_GEMINI_API_KEY=tu_gemini_api_key
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 📂 Estructura del Proyecto

```
racha-app/
├── src/
│   ├── components/
│   │   ├── Auth.jsx           # Componente de autenticación
│   │   ├── StreakCounter.jsx  # Contador de rachas con animaciones
│   │   ├── AICoach.jsx        # Chat con IA
│   │   └── Achievements.jsx   # Sistema de logros
│   ├── lib/
│   │   ├── supabase.js        # Configuración de Supabase
│   │   └── gemini.js          # Integración con Gemini API
│   ├── App.jsx                # Componente principal con rutas
│   ├── main.jsx               # Punto de entrada
│   └── index.css              # Estilos globales
├── package.json
└── vite.config.js
```

---

## 🎯 Funcionalidades Implementadas

### 1. Autenticación
- Registro de nuevos usuarios
- Login con email y contraseña
- Sesión persistente
- Logout seguro

### 2. Seguimiento de Rachas
- Botón interactivo para registrar actividad diaria
- Contador visual de días consecutivos
- Animación de confetti al completar
- Estados visuales (activo/completado)

### 3. Coach de IA
- Chat conversacional con contexto de racha actual
- Respuestas motivacionales personalizadas
- Interfaz de mensajería moderna
- Indicador de "escribiendo..."

### 4. Sistema de Logros
- 4 achievements disponibles:
  - 🔥 **Primer Fuego**: Comienza tu primera racha
  - 🥇 **Semana de Hierro**: 7 días seguidos
  - ⭐ **Imparable**: 30 días de actividad
  - 🎯 **Meta Cumplida**: 100 actividades registradas

### 5. Navegación
- Routing con React Router DOM
- 3 secciones principales:
  - Home (Racha)
  - Logros
  - Chat con Coach
- Navegación inferior sticky
- URLs funcionales y compartibles

---

## 🎨 Diseño y UX

- **Paleta de colores**: Naranja/Rojo (brand) con tonos slate
- **Tipografía**: Sistema de fuentes nativo optimizado
- **Animaciones**: Transiciones suaves con Framer Motion
- **Responsive**: Optimizado para mobile-first
- **Accesibilidad**: Contraste adecuado y estados hover/focus

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.
