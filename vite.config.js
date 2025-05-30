import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    "plugins": [
        react(),
        basicSsl()
    ],
    "resolve": {
        "dedupe": [
            "three"
        ]
    },
    "server": {
        "host": true
    },
    "build": {
        "rollupOptions": {
            "input": {
                "index": resolve(__dirname, "index.html"),
                "player": resolve(__dirname, "player.html")
            }
        }
    },
    "base": "/dvbi-r3f-client/"
})
