import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ocre: "#C17B3F",
        vert: "#1F7A4E",
        or: "#D4A843",
        fond: "#F6EFE3",
        nuit: "#1A0D05",
        brun: "#2C1508",
        panneau: "#3D1A06",
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        inter: ["Inter", "sans-serif"],
        georgia: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
