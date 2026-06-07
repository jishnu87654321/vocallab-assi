/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "surface-container": "#1d2026",
        "on-surface-variant": "#cbc3d7",
        "on-error": "#690005",
        "on-secondary-fixed": "#001f26",
        "on-primary-container": "#340080",
        "tertiary": "#4edea3",
        "on-background": "#e1e2eb",
        "secondary-container": "#03b5d3",
        "inverse-on-surface": "#2e3037",
        "outline-variant": "#494454",
        "on-tertiary": "#003824",
        "background": "#10131a",
        "secondary-fixed-dim": "#4cd7f6",
        "on-primary-fixed": "#23005c",
        "on-primary": "#3c0091",
        "primary-fixed-dim": "#d0bcff",
        "on-tertiary-container": "#00311f",
        "outline": "#958ea0",
        "on-surface": "#e1e2eb",
        "tertiary-fixed-dim": "#4edea3",
        "on-secondary-container": "#00424e",
        "on-tertiary-fixed": "#002113",
        "tertiary-fixed": "#6ffbbe",
        "error": "#ffb4ab",
        "surface-container-high": "#272a31",
        "on-secondary-fixed-variant": "#004e5c",
        "inverse-primary": "#6d3bd7",
        "surface-bright": "#363940",
        "surface-variant": "#32353c",
        "secondary-fixed": "#acedff",
        "surface-container-low": "#191c22",
        "inverse-surface": "#e1e2eb",
        "on-tertiary-fixed-variant": "#005236",
        "surface-container-lowest": "#0b0e14",
        "primary": "#d0bcff",
        "tertiary-container": "#00a572",
        "primary-fixed": "#e9ddff",
        "on-secondary": "#003640",
        "on-primary-fixed-variant": "#5516be",
        "secondary": "#4cd7f6",
        "surface-tint": "#d0bcff",
        "surface-container-highest": "#32353c",
        "on-error-container": "#ffdad6",
        "error-container": "#93000a",
        "primary-container": "#a078ff",
        "surface-dim": "#10131a",
        "surface": "#10131a"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      spacing: {
        "xs": "8px",
        "gutter": "24px",
        "lg": "40px",
        "md": "24px",
        "sm": "16px",
        "base": "4px",
        "xl": "64px",
        "container-max": "1280px"
      },
      fontFamily: {
        "body-md": ["Inter", "sans-serif"],
        "label-sm": ["JetBrains Mono", "monospace"],
        "headline-lg-mobile": ["Inter", "sans-serif"],
        "headline-lg": ["Inter", "sans-serif"],
        "headline-xl": ["Inter", "sans-serif"],
        "code-md": ["JetBrains Mono", "monospace"]
      },
      fontSize: {
        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "500" }],
        "headline-lg-mobile": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
        "headline-lg": ["32px", { "lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600" }],
        "headline-xl": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "code-md": ["14px", { "lineHeight": "20px", "fontWeight": "400" }]
      }
    }
  },
  plugins: [],
}
