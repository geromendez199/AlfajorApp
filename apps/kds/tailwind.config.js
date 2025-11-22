const preset = require('@alfajor/config/tailwind-preset');

module.exports = {
  presets: [preset],
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  darkMode: 'class'
};
