import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Escutar em todas as interfaces para acesso externo
    host: true,
    port: 3000,
    // Em servidor sem GUI, não tentar abrir navegador
    open: false
  }
})