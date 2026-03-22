const LANG_ORDER = ['en', 'ru', 'uk'];
const THEME_ORDER = ['light', 'dark'];

function getStoredLang() {
    return localStorage.getItem('lang') || 'en';
}

function getStoredTheme() {
    const storedTheme = localStorage.getItem('theme');

    if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
}

function updateThemeButtonsLabel(theme) {
    const label = theme === 'dark' ? 'DARK' : 'LIGHT';

    const themeButtons = [
        document.getElementById('themeButton'),
        document.getElementById('themeButtonMobile')
    ];

    themeButtons.forEach((button) => {
        if (button) {
            button.textContent = label;
        }
    });
}

function updateLangButtonsLabel(lang) {
    const label = lang.toUpperCase();

    const langButtons = [
        document.getElementById('langButton'),
        document.getElementById('langButtonMobile')
    ];

    langButtons.forEach((button) => {
        if (button) {
            button.textContent = label;
        }
    });
}

function updatePortraitImage(theme) {
    const image = document.getElementById('portraitImage');
    if (!image) return;

    const darkSrc = image.dataset.portraitDark;
    const lightSrc = image.dataset.portraitLight;

    image.src = theme === 'dark' ? darkSrc : lightSrc;
}

function applyTheme(theme, save = true) {
    const html = document.documentElement;

    html.setAttribute('data-theme', theme);
    html.classList.remove('theme-dark', 'theme-light');
    html.classList.add(`theme-${theme}`);

    if (save) {
        localStorage.setItem('theme', theme);
    }

    updateThemeButtonsLabel(theme);
    updatePortraitImage(theme);
}

function applyTranslations(lang) {
    const fallbackDict = window.translations?.en || {};
    const dict = window.translations?.[lang] || fallbackDict;

    document.documentElement.setAttribute('data-lang', lang);
    localStorage.setItem('lang', lang);

    document.querySelectorAll('[data-i18n]').forEach((node) => {
        const key = node.dataset.i18n;
        const value = dict[key] || fallbackDict[key];

        if (!value) return;

        const hasHtml = /<[^>]+>/.test(value);

        if (hasHtml) {
            node.innerHTML = value;
        } else {
            node.textContent = value;
        }
    });

    updateLangButtonsLabel(lang);
}

function getNextValue(currentValue, values) {
    const currentIndex = values.indexOf(currentValue);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % values.length;
    return values[nextIndex];
}

function initControlButtons() {
    const langButtons = [
        document.getElementById('langButton'),
        document.getElementById('langButtonMobile')
    ].filter(Boolean);

    const themeButtons = [
        document.getElementById('themeButton'),
        document.getElementById('themeButtonMobile')
    ].filter(Boolean);

    langButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const currentLang = getStoredLang();
            const nextLang = getNextValue(currentLang, LANG_ORDER);
            applyTranslations(nextLang);
        });
    });

    themeButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const currentTheme = getStoredTheme();
            const nextTheme = getNextValue(currentTheme, THEME_ORDER);
            applyTheme(nextTheme);
        });
    });
}

function initSmartHeader() {
    const header = document.getElementById('header');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
        const currentScrollY = window.scrollY;
        const isScrollingDown = currentScrollY > lastScrollY;
        const passedThreshold = currentScrollY > 120;
        const menuIsOpen = mobileMenu?.classList.contains('is-open');

        if (isScrollingDown && passedThreshold && !menuIsOpen) {
            header.classList.add('is-hidden');
        } else {
            header.classList.remove('is-hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(updateHeader);
            ticking = true;
        }
    });
}

function initMobileMenu() {
    const burgerButton = document.getElementById('burgerButton');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!burgerButton || !mobileMenu) return;

    burgerButton.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('is-open');
        burgerButton.setAttribute('aria-expanded', String(isOpen));
        document.body.classList.toggle('menu-open', isOpen);
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('is-open');
            burgerButton.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            mobileMenu.classList.remove('is-open');
            burgerButton.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 860) {
            mobileMenu.classList.remove('is-open');
            burgerButton.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('menu-open');
        }
    });
}

function initSystemThemeWatcher() {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
        const hasStoredTheme = localStorage.getItem('theme');

        if (!hasStoredTheme) {
            applyTheme(media.matches ? 'dark' : 'light', false);
        }
    };

    if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', handleChange);
    } else if (typeof media.addListener === 'function') {
        media.addListener(handleChange);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const initialLang = getStoredLang();
    const initialTheme = getStoredTheme();

    applyTranslations(initialLang);
    applyTheme(initialTheme, false);

    initControlButtons();
    initSmartHeader();
    initMobileMenu();
    initSystemThemeWatcher();
    initCurrentYear();
});

function initCurrentYear() {
    const yearNode = document.getElementById('currentYear');
    if (yearNode) {
        yearNode.textContent = new Date().getFullYear();
    }
}