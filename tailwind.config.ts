import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                // Твоя палитра из Streamlit
                primary: {
                    50: "#f0f9f7",
                    100: "#e3f2ef",
                    200: "#c7e5df",
                    300: "#a8d5ca",
                    400: "#88c8bc",  // Основной цвет
                    500: "#6ba292",
                    600: "#568375",
                    700: "#456a5e",
                    800: "#37554c",
                    900: "#2d5a4f",  // Темный акцент
                },
                secondary: {
                    50: "#fafdfb",
                    100: "#f5faf8",
                    200: "#e8f4f0",
                    300: "#d4ebe5",
                    400: "#b8ddd3",
                    500: "#9acec1",
                    600: "#7cb8a8",
                    700: "#60a08e",
                    800: "#4d8274",
                    900: "#3f6b5e",
                },
                // Статусы
                success: {
                    light: "#f0f9f7",
                    DEFAULT: "#88c8bc",
                    dark: "#2d5a4f",
                },
                warning: {
                    light: "#fffbeb",
                    DEFAULT: "#f59e0b",
                    dark: "#92400e",
                },
                error: {
                    light: "#fef2f2",
                    DEFAULT: "#ef4444",
                    dark: "#7f1d1d",
                },
                info: {
                    light: "#eff6ff",
                    DEFAULT: "#3b82f6",
                    dark: "#1e3a8a",
                },
                // Статусы записей
                pending: {
                    bg: "#fffbeb",
                    text: "#f59e0b",
                },
                confirmed: {
                    bg: "#f0f9f7",
                    text: "#88c8bc",
                },
                completed: {
                    bg: "#ecfdf5",
                    text: "#10b981",
                },
                cancelled: {
                    bg: "#fef2f2",
                    text: "#ef4444",
                },
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            fontSize: {
                xs: ["0.75rem", { lineHeight: "1rem" }],
                sm: ["0.875rem", { lineHeight: "1.25rem" }],
                base: ["1rem", { lineHeight: "1.5rem" }],
                lg: ["1.125rem", { lineHeight: "1.75rem" }],
                xl: ["1.25rem", { lineHeight: "1.75rem" }],
                "2xl": ["1.5rem", { lineHeight: "2rem" }],
                "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
                "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
            },
            spacing: {
                18: "4.5rem",
                22: "5.5rem",
            },
            borderRadius: {
                lg: "16px",
                md: "12px",
                sm: "8px",
            },
            boxShadow: {
                card: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(136, 200, 188, 0.08)",
                "card-hover": "0 8px 24px rgba(0, 0, 0, 0.05), 0 4px 10px rgba(136, 200, 188, 0.12)",
                button: "0 2px 8px rgba(136, 200, 188, 0.25)",
                "button-hover": "0 4px 12px rgba(136, 200, 188, 0.35)",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                slideIn: {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(0)" },
                },
            },
            animation: {
                fadeIn: "fadeIn 0.3s ease-out",
                slideIn: "slideIn 0.2s ease-out",
            },
        },
    },
};

export default config;