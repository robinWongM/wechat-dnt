import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { UnifiedViteWeappTailwindcssPlugin as uvwt } from "weapp-tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    uni(),
    uvwt(),
  ],
  css: {
    postcss: {
      plugins: [require("tailwindcss"), require("autoprefixer")],
    },
  },
});
