/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-grading": "var(--gradient-grading)",
        "gradient-month": "var(--gradient-month)",
        "gradient-week": "var(--gradient-week)",
        "gradient-day": "var(--gradient-day)",
      },
      colors: {
        "accent-1": "#FAFAFA",
        "accent-2": "#EAEAEA",
        "accent-7": "#333",
        "pink-light": "#dec8cd",

        primary: {
          light: "#c24c71", // Lighter shade
          DEFAULT: "red", // Default shade
          dark: "#620724", // Darker shade
        },
      },
    },
  },
  plugins: [],
};
