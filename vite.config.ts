import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const isLibrary = mode === 'library'

  if (isLibrary) {
    return {
      plugins: [vue()],
      build: {
        lib: {
          entry: 'src/index.ts',
          name: 'LangTest',
          fileName: (format) => (format === 'es' ? 'langtest.js' : 'langtest.umd.cjs'),
          cssFileName: 'style',
          formats: ['es', 'umd'],
        },
        rollupOptions: {
          external: ['vue'],
          output: {
            exports: 'named',
            globals: {
              vue: 'Vue',
            },
          },
        },
      },
    }
  }

  return {
    plugins: [vue()],
    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: ['llm1.ru.tuna.am'],
    },
    preview: {
      host: '0.0.0.0',
      port: 5173,
    },
  }
})
