// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {
      config: './tailwind.config.js' // Point to your Tailwind config file
    },
    autoprefixer: {}
  }
};
