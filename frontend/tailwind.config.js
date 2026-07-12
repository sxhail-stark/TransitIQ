/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: "#111317",
        surface: "#111317",
        "surface-dim": "#111317",
        "surface-bright": "#37393e",
        "surface-container-lowest": "#0c0e12",
        "surface-container-low": "#1a1c20",
        "surface-container": "#1e2024",
        "surface-container-high": "#282a2e",
        "surface-container-highest": "#333539",
        "surface-variant": "#333539",
        
        primary: "#ffb865",
        "primary-container": "#d98a16", // Custom orange accent
        "on-primary": "#482a00",
        "on-primary-container": "#4c2c00",
        
        secondary: "#b6c4ff",
        "secondary-container": "#264191",
        "on-secondary": "#05297a",
        "on-secondary-container": "#9db2ff",
        
        tertiary: "#83cfff",
        "tertiary-container": "#1ca6e3",
        "on-tertiary": "#00344b",
        "on-tertiary-container": "#003750",
        
        error: "#ffb4ab",
        "error-container": "#93000a",
        "on-error": "#690005",
        "on-error-container": "#ffdad6",
        
        "on-background": "#e2e2e8",
        "on-surface": "#e2e2e8",
        "on-surface-variant": "#d8c3af",
        
        outline: "#a08e7b",
        "outline-variant": "#534435",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px"
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        base: "4px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "sidebar-width": "260px",
        "container-max": "1440px"
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
