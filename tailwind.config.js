/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'pierat-blue': '#007bff',
        'pierat-dark': '#1a202c',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
