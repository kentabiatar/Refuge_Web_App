import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        playball: ['Playball', 'cursive'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        refuge: {
          primary: "#DEDBD2", // light brown
          secondary: "#A09686", // dark brown
          neutral: "#FFFFFF",
        },
      },
    ],
  }
}

