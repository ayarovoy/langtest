import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'node:fs/promises'
import path from 'node:path'
import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'

const createGeneratedSuitesApiPlugin = (): Plugin => {
  const outputsDir = path.resolve(__dirname, 'generator/fixtures/outputs')
  const listEndpoint = '/api/generated-suites'
  const oneEndpointPrefix = '/api/generated-suites/'

  const handler = async (req: IncomingMessage, res: ServerResponse, next: () => void): Promise<void> => {
    try {
      if (!req.url) return next()
      const pathname = new URL(req.url, 'http://localhost').pathname

      if (pathname === listEndpoint) {
        let files: string[] = []
        try {
          const dirEntries = await fs.readdir(outputsDir, { withFileTypes: true })
          files = dirEntries
            .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
            .map((entry) => entry.name)
        } catch {
          files = []
        }

        const payload = await Promise.all(
          files.map(async (fileName) => {
            const filePath = path.join(outputsDir, fileName)
            const [content, stats] = await Promise.all([fs.readFile(filePath, 'utf-8'), fs.stat(filePath)])
            let componentCount = 0
            try {
              const parsed = JSON.parse(content)
              componentCount = Array.isArray(parsed) ? parsed.length : 0
            } catch {
              componentCount = 0
            }
            return {
              fileName,
              componentCount,
              updatedAt: stats.mtime.toISOString(),
            }
          }),
        )

        payload.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.statusCode = 200
        res.end(JSON.stringify(payload))
        return
      }

      if (pathname.startsWith(oneEndpointPrefix)) {
        const fileName = decodeURIComponent(pathname.slice(oneEndpointPrefix.length))
        if (!fileName || fileName.includes('/') || fileName.includes('\\') || !fileName.endsWith('.json')) {
          res.statusCode = 400
          res.end('Invalid file name')
          return
        }
        const filePath = path.join(outputsDir, fileName)
        try {
          const content = await fs.readFile(filePath, 'utf-8')
          const parsed = JSON.parse(content)
          if (!Array.isArray(parsed)) {
            res.statusCode = 422
            res.end('Suite file must contain an array')
            return
          }
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.statusCode = 200
          res.end(JSON.stringify(parsed))
          return
        } catch {
          res.statusCode = 404
          res.end('Suite file not found')
          return
        }
      }
    } catch (error) {
      res.statusCode = 500
      res.end(`Server error: ${String(error)}`)
      return
    }
    next()
  }

  return {
    name: 'generated-suites-api',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(handler)
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(handler)
    },
  }
}

export default defineConfig(({ mode }) => {
  const isLibrary = mode === 'library'

  if (isLibrary) {
    return {
      plugins: [vue(), createGeneratedSuitesApiPlugin()],
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
    plugins: [vue(), createGeneratedSuitesApiPlugin()],
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
