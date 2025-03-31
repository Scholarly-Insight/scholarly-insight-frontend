/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        scholarly: {
          primary: "#2563eb", // Blue
          secondary: "#4b5563", // Gray
          accent: "#8b5cf6", // Purple
          success: "#10b981", // Green
          danger: "#ef4444", // Red
          warning: "#f59e0b", // Amber
          info: "#3b82f6", // Light blue
          background: "#f9fafb", // Light gray
          sidebar: "#f3f4f6",
          card: "#ffffff",
          text: "#1f2937",
          secondaryText: "#6b7280",
          borderColor: "#e5e7eb",
          buttonBg: "#f1f5f9",
          hoverBg: "#f8fafc",
        },
      },
      fontFamily: {
        "google-sans": ["Google Sans", "Arial", "sans-serif"],
      },
      backgroundImage: {
        'scholarly-gradient': 'linear-gradient(90deg, #2563eb, #8b5cf6, #ec4899)',
      },
      boxShadow: {
        "scholarly-card": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "scholarly-button": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "scholarly-dropdown": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: 0 },
          "100%": { transform: "translateY(0)", opacity: 1 },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
