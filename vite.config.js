import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "tailwindcss";

// https://vite.dev/config/
//
// RA_BRD Interesting option: npm run dev -- --host
//
export default defineConfig({
    base: './',    
    
    build: {
        outDir: './front-end',
        emptyOutDir: true,    
    },

    plugins: [react()],
        
    server: {
        port: 3000,
        open: true,

        headers: {
            "Strict-Transport-Security": "max-age=32536000; includeSubDomains", // Adds HSTS options to your website, with a expiry time of one year
            "X-Content-Type-Options": "nosniff",  // Protects from improper scripts from running
            "X-Frame-Options": "DENY",            // Stops the site being used as an iFrame                       
            "X-XSS-Protection": "1; mode=block",  // Gives XSS protection to legacy browsers
        }        
    },

    css: {
        postcss: {
        plugins: [tailwindcss()],
        },
    },
})
