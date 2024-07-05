document.getElementsByTagName("html")[0].className += " js";

// File#: _1_notice
(function () {
    function initNoticeEvents(notice) {
        notice.addEventListener('click', function (event) {
            if (event.target.closest('.js-notice__hide-control')) {
                event.preventDefault();
                notice.classList.add('notice--hide');
                setCookie('noticeHidden', 'true'); // Set cookie without expiration
            }
        });
    }

    var noticeElements = document.getElementsByClassName('js-notice');
    if (noticeElements.length > 0) {
        if (getCookie('noticeHidden')) {
            for (var i = 0; i < noticeElements.length; i++) {
                noticeElements[i].classList.add('notice--hide');
            }
        } else {
            for (var i = 0; i < noticeElements.length; i++) {
                (function (i) {
                    initNoticeEvents(noticeElements[i]);
                })(i);
            }
        }
    }

    function setCookie(name, value) {
        document.cookie = name + "=" + (value || "") + "; path=/";
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
}());

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

// File#: light-dark-mode
document.addEventListener("DOMContentLoaded", () => {
    const lightDarkSwitch = document.querySelector('#switch-checkbox-1');
    const html = document.querySelector('html');

    if (localStorage.getItem("db_darkMode") === "dark") {
        lightDarkSwitch.checked = true;
        html.setAttribute("data-theme", "dark");
    }

    lightDarkSwitch.addEventListener('change', () => {
        if (lightDarkSwitch.checked) {
            localStorage.setItem("db_darkMode", "dark");
            html.setAttribute("data-theme", localStorage.getItem("db_darkMode"));
        } else {
            localStorage.removeItem("db_darkMode");
            html.removeAttribute("data-theme");
        }
    });
});