const {
  iconsPlugin,
  getIconCollections,
} = require("@egoist/tailwindcss-icons");
const safeAreaPlugin = require('tailwindcss-safe-area');

/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [
    iconsPlugin({
      // Select the icon collections you want to use
      // You can also ignore this option to automatically discover all individual icon packages you have installed
      // If you install @iconify/json, you should explicitly specify the collections you want to use, like this:
      collections: getIconCollections(["simple-icons", "lucide"]),
      // If you want to use all icons from @iconify/json, you can do this:
      // collections: getIconCollections("all"),
      // and the more recommended way is to use `dynamicIconsPlugin`, see below.
    }),
    safeAreaPlugin,
  ],
};
