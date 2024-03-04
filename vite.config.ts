import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        viteStaticCopy({
            targets: [
                // relative path is from src
                { src: './assets/favicon.ico', dest: './' }
            ]
        })
    ],
    root: 'devfiles',
    build: {
        outDir: '../dist',
        sourcemap: true
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: 'src/tests/setup.ts'
    }
});
