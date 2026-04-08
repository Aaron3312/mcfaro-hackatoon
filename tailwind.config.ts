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
        // Paleta Ronald McDonald - mcFaro
        ronald: {
          orange: "#C85A2A",      // Naranja principal
          "orange-light": "#E87A3A", // Naranja medio
          yellow: "#F5C842",      // Amarillo/dorado
          brown: "#7A3D1A",       // Marrón oscuro
          "brown-medium": "#9A6A2A", // Marrón medio
          beige: "#FDF0E6",       // Beige claro
          "beige-light": "#F7EDD5", // Beige muy claro
          cream: "#FFF8E6",       // Crema
        },
      },
      backgroundImage: {
        "ronald-gradient": "linear-gradient(135deg, #C85A2A 0%, #E87A3A 65%, #F5C842 100%)",
        "ronald-gradient-warm": "linear-gradient(135deg, #FFF8E6, #FEF3C7)",
        "ronald-gradient-soft": "linear-gradient(135deg, #FDF0E6, #FDDCBF)",
      },
      spacing: {
        safe: "env(safe-area-inset-bottom)",
      },
    },
  },
  plugins: [],
};

export default config;
