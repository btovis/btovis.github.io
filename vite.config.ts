import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
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
