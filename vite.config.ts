import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Enable Fast Refresh for better development experience
      fastRefresh: true,
      // Include .js files in Fast Refresh
      include: "**/*.{jsx,tsx,js,ts}",
    })
  ],
  
  // Enhanced development server configuration
  server: {
    port: 5173,
    host: true,
    // Enable Hot Module Replacement
    hmr: {
      overlay: true,
    },
    // Faster cold start
    fs: {
      strict: false,
    },
    // Open browser automatically in development
    open: false,
  },
  
  // TypeScript and esbuild optimizations
  esbuild: {
    // Target modern browsers for better performance
    target: 'es2020',
    // Remove console logs in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  
  // Enhanced build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Target modern browsers
    target: 'es2020',
    // Enable minification with esbuild
    minify: 'esbuild',
    // Optimize chunk splitting
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ai: ['openai', '@anthropic-ai/sdk'],
        },
      },
    },
    // Report bundle size
    reportCompressedSize: true,
    // Increase chunk size warning limit for AI dependencies
    chunkSizeWarningLimit: 1000,
  },
  
  // Dependency optimization
  optimizeDeps: {
    // Pre-bundle these dependencies for faster dev startup
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
    ],
    // Exclude large dependencies that change frequently
    exclude: ['@aws-sdk/client-bedrock-runtime'],
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  
  // Enable preview server configuration
  preview: {
    port: 4173,
    host: true,
  },
})