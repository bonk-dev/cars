import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    lightningcss: {
      // XP.css zawiera niepoprawny selektor (progress:...:before:not([value])),
      // przez który minifikacja kończy się błędem. errorRecovery pomija tę
      // jedną regułę z ostrzeżeniem zamiast przerywać build.
      errorRecovery: true,
    },
  },
})
