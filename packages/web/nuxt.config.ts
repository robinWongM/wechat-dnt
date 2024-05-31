// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss"],
  build: {
    transpile: ['trpc-nuxt'],
  },
  nitro: {
    esbuild: {
      options: {
        target: 'esnext'
      }
    }
  },
  runtimeConfig: {
    mp: {
      token: '',
      appId: '',
      appSecret: '',
    },
    wxa: {
      appId: '',
    }
  }
})
