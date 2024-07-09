// File#: color-theme
(function () {
    const htmlEl = document.getElementsByTagName("html")[0];
    //if (htmlEl.classList.contains('js-html-signup')) return;
    const ldTheme = localStorage.getItem('db_darkMode');
    if (ldTheme == 'dark' || (ldTheme == 'system' && window.matchMedia("(prefers-color-scheme: dark)")
            .matches)) {
        htmlEl.setAttribute('data-theme', 'dark');
    }
}());