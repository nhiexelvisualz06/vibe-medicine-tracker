import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ─────────────────────────────────────────────────────────────
//  IMPORTANT: Set `base` to your GitHub repo name.
//
//  Examples:
//    Repo URL:  https://github.com/yourname/medicine-tracker
//    base:      '/medicine-tracker/'
//
//    Repo URL:  https://github.com/yourname/myapp
//    base:      '/myapp/'
//
//  If your repo is a user/org page (yourname.github.io),
//  and the repo is named yourname.github.io, set:
//    base:      '/'
// ─────────────────────────────────────────────────────────────
const REPO_NAME = 'vibe-medicine-tracker' // <- change this to your repo name

export default defineConfig({
  plugins: [react()],
  base: `/${REPO_NAME}/`,
})
