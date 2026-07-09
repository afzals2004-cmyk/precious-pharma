import { translations } from './translations.js';

export async function initLocalization() {
    const userLang = localStorage.getItem('lang');

    if (userLang) {
        applyLanguage(userLang);
    } else {
        try {
            // Auto-detect country
            const res = await fetch('https://ipapi.co/json/');
            const data = await res.json();
            const country = data.country_code; // e.g., 'US', 'AE', 'SA'

            // Arab countries list for demo
            const arabCountries = ['SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'EG', 'LB', 'JO'];
            const frenchCountries = ['FR', 'BE', 'LU', 'MC', 'CH'];
            const germanCountries = ['DE', 'AT', 'LI'];
            const spanishCountries = ['ES', 'MX', 'AR', 'CO', 'CL', 'PE']; // + Latin America

            if (arabCountries.includes(country)) {
                applyLanguage('ar');
                localStorage.setItem('lang', 'ar');
            } else if (frenchCountries.includes(country)) {
                applyLanguage('fr');
                localStorage.setItem('lang', 'fr');
            } else if (germanCountries.includes(country)) {
                applyLanguage('de');
                localStorage.setItem('lang', 'de');
            } else if (spanishCountries.includes(country)) {
                applyLanguage('es');
                localStorage.setItem('lang', 'es');
            } else {
                applyLanguage('en');
                localStorage.setItem('lang', 'en');
            }
        } catch (err) {
            console.error('Geo-detection failed, defaulting to English', err);
            applyLanguage('en');
        }
    }
}

export function applyLanguage(lang) {
    const t = translations[lang] || translations['en'];

    // Update direction for Arabic
    if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.lang = 'ar';
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.lang = 'en';
    }

    // Update text content for elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.innerText = t[key];
        }
    });

    // Handle Hero Title Separately to keep the Gold color span
    const heroTitle = document.querySelector('.hero h1');
    if (heroTitle && t.hero_title_1) {
        heroTitle.innerHTML = `${t.hero_title_1} <br><span class="text-gold">${t.hero_title_2}</span>`;
    }
}
