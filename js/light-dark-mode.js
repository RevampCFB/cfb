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