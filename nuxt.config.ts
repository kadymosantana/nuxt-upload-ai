export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: "pt-BR" },
      title: "Upload AI",
      meta: [
        {
          "http-equiv": "Content-Security-Policy",
          content: "upgrade-insecure-requests",
        },
        {
          name: "description",
          content: "Gere títulos e descrições para seus vídeos com IA.",
        },
        {
          name: "keywords",
          content:
            "IA, JavaScript, TypeScript, Vue.js, Nuxt.js, Tailwind CSS, Vercel, NLW, Upload",
        },
      ],
    },
  },

  modules: ["@nuxt/ui", "@nuxtjs/google-fonts"],

  devtools: { enabled: true },

  vite: {
    optimizeDeps: {
      exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
    },
  },

  ui: { icons: ["simple-icons"] },

  googleFonts: {
    prefetch: true,
    preconnect: true,
    preload: true,
    families: {
      Inter: {
        wght: [400, 700],
      },
    },
  },
});
