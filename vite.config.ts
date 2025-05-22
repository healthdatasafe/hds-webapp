
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import backloop from 'vite-plugin-backloop.dev';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const config = {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
  if (mode === 'backloop') {
    config.plugins.push(backloop('mycomputer'));
  }
  return config;
});
