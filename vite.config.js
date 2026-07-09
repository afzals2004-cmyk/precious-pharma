import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: true, // Expose to LAN
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            }
        }
    },
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',
                admin: 'admin/index.html',
                shop: 'shop.html',
                login: 'login.html',
                register: 'register.html',
                cart: 'cart.html',
                checkout: 'checkout.html',
                product: 'product.html',
                about: 'about.html',
                contact: 'contact.html',
                dashboard: 'dashboard.html'
            }
        }
    }
});
