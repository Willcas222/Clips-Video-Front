/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#fe2c55",
          cyan: "#25f4ee",
        },
      },
    },
  },
};
