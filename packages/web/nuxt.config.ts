// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/robots"],
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
    web: {
      baseUrl: '',
    },
    mp: {
      token: '',
      aesKey: '',
      appId: '',
      appSecret: '',
    },
    qy: {
      corpId: '',
      corpSecret: '',
    },
    wxa: {
      appId: '',
    }
  },
  robots: {
    rules: {
      UserAgent: '*',
      Disallow: '/',
    }
  }
})
