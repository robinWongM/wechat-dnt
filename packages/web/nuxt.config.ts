// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/robots", "@nuxtjs/device"],
  build: {
    transpile: ["trpc-nuxt", "vue-sonner"],
  },
  nitro: {
    esbuild: {
      options: {
        target: "esnext",
      },
    },
  },
  runtimeConfig: {
    web: {
      baseUrl: "",
      proxyUrl: "",
    },
    mp: {
      token: "",
      aesKey: "",
      appId: "",
      appSecret: "",
    },
    qy: {
      corpId: "",
      corpSecret: "",
    },
    wxa: {
      appId: "",
    },
    public: {
      defaultShareImageUrl: "",
    },
  },
  robots: {
    rules: {
      UserAgent: "*",
      Disallow: "/",
    },
  },
});
