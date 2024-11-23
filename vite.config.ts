import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';

export default defineConfig({
  plugins: [
    checker({
      typescript: true,
      // Optional: enable terminal output
      overlay: false,
      // Optional: enable type checking during dev
      enableBuild: true
    })
  ],
  // If you need to keep your index.html in the export folder:
  root: 'export'
});