const {
  iconsPlugin,
  getIconCollections,
} = require("@egoist/tailwindcss-icons");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{html,js,ts,jsx,tsx,vue}"],
  corePlugins: {
    preflight: false,
  },
  plugins: [
    iconsPlugin({
      collections: getIconCollections(["lucide"]),
    }),
  ],
};
