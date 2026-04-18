/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        /* Full stacks live in CSS variables — do not append extra families here */
        sans: ["var(--font-sans)"],
        mono: ["var(--font-berkeley-mono)"],
        serif: ["var(--font-serif)"],
      },
      colors: {
        "theme-bg": "var(--color-theme-bg)",
        "theme-text": "var(--color-theme-text)",
        "theme-text-sec": "var(--color-theme-text-sec)",
        "theme-text-mid": "var(--color-theme-text-mid)",
        "theme-text-ter": "var(--color-theme-text-tertiary)",
        "theme-border-02": "var(--color-theme-border-02)",
        "theme-card-hex": "var(--color-theme-card-hex)",
        "theme-card-03-hex": "var(--color-theme-card-03-hex)",
        "theme-accent": "var(--color-theme-accent)",
        "theme-accent-muted": "var(--color-theme-accent-muted)",
        "theme-product-chrome": "var(--color-theme-product-chrome)",
        "theme-product-editor": "var(--color-theme-product-editor)",
        "theme-media-backdrop": "var(--color-theme-media-backdrop)",
      },
      divideColor: {
        "theme-border-02": "var(--color-theme-border-02)",
      },
    },
  },
  plugins: [],
};
