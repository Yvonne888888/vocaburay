import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Inject API Key securely during build
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill process.env for older libraries/Android Webview compatibility
      'process.env': {} 
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // Target es2015 to ensure compatibility with a wide range of Android WebViews
      target: 'es2015',
      sourcemap: false, // Disable sourcemaps in production/APK to save size
    },
    server: {
      host: true // Expose to network for testing on device if needed
    },
    // Ensure proper base path for Android (file system routing)
    base: './' 
  };
});