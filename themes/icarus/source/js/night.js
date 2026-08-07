(function () {
    /**

     * Icarus 夜间模式 by iMaeGoo
     * https://www.imaegoo.com/
     */

    var storageKey = 'night';
    var systemTheme = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    var isNight = getPreferredTheme();
    var nightNav;

    function getStoredTheme() {
        try {
            return localStorage.getItem(storageKey);
        } catch (e) {
            return null;
        }
    }

    function getPreferredTheme() {
        var storedTheme = getStoredTheme();
        return storedTheme === null ? !!(systemTheme && systemTheme.matches) : storedTheme === 'true';
    }

    function applyNight(value) {
        if (value) {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('night');
        } else {
            document.documentElement.classList.remove('night');
            document.documentElement.classList.add('light');
        }
    }

    function findNightNav() {
        nightNav = document.getElementById('night-nav');
        if (!nightNav) {
            setTimeout(findNightNav, 100);
        } else {
            nightNav.addEventListener('click', switchNight);
        }
    }

    function switchNight() {
        isNight = !document.documentElement.classList.contains('night');
        applyNight(isNight);
        try {
            localStorage.setItem(storageKey, isNight);
        } catch (e) {
            // Keep the selected theme for the current page when storage is unavailable.
        }
    }

    function handleSystemThemeChange(event) {
        if (getStoredTheme() === null) {
            isNight = event.matches;
            applyNight(isNight);
        }
    }

    if (systemTheme) {
        if (systemTheme.addEventListener) {
            systemTheme.addEventListener('change', handleSystemThemeChange);
        } else if (systemTheme.addListener) {
            systemTheme.addListener(handleSystemThemeChange);
        }
    }

    findNightNav();
    applyNight(isNight);
}());
