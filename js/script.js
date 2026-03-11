/* ============================================
   VERIATAX INTERACTIVE — Scripts
   ============================================ */

// Loading Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 800);
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
        });
    });
}

// Smooth scroll helper
function scrollToTop(e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Scroll reveal
function initReveal() {
    const reveals = document.querySelectorAll(
        '.game-card, .music-card-featured, .music-card-compact, .tool-card, .stat-card, .about-text, .section-header'
    );
    reveals.forEach(el => el.classList.add('reveal'));

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, i * 80);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
}

// Animate stat counters
function animateStats() {
    const stats = document.querySelectorAll('.stat-value[data-target]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.target);
                let current = 0;
                const increment = Math.max(1, target / 30);
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    el.textContent = Math.floor(current);
                }, 40);
                observer.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    stats.forEach(el => observer.observe(el));
}

// Active nav link on scroll
function updateActiveNav() {
    const sections = document.querySelectorAll('.section[id]');
    const links = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                links.forEach(l => l.classList.remove('active'));
                const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                if (active) active.classList.add('active');
            }
        });
    }, {
        threshold: 0.25,
        rootMargin: '-80px 0px -50% 0px'
    });

    sections.forEach(s => observer.observe(s));
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    animateStats();
    updateActiveNav();
    initLang();
});

// ==========================================
// Language Toggle (DE/EN)
// ==========================================

let currentLang = 'en';

function initLang() {
    // Check saved preference
    try {
        const saved = localStorage.getItem('veriatax-lang');
        if (saved === 'de' || saved === 'en') {
            currentLang = saved;
        } else {
            // Auto-detect from browser language
            const browserLang = navigator.language || navigator.userLanguage || 'en';
            currentLang = browserLang.startsWith('de') ? 'de' : 'en';
        }
    } catch (e) {
        currentLang = 'en';
    }

    applyLang(currentLang);
}

function toggleLang() {
    currentLang = currentLang === 'en' ? 'de' : 'en';
    applyLang(currentLang);
    try { localStorage.setItem('veriatax-lang', currentLang); } catch(e) {}
}

function applyLang(lang) {
    // Check if translations object is available
    if (typeof translations === 'undefined') return;

    const dict = translations[lang];
    if (!dict) return;

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            el.textContent = dict[key];
        }
    });

    // Update toggle button text
    const btn = document.getElementById('langToggle');
    if (btn) {
        btn.textContent = lang === 'en' ? 'DE' : 'EN';
        btn.title = lang === 'en' ? 'Auf Deutsch wechseln' : 'Switch to English';
    }

    // Update html lang attribute
    document.documentElement.lang = lang;
}
