/*Dark and Light mode */
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

const toggleSwitch = document.querySelector(".switch__input");
const currentTheme = localStorage.getItem("theme");

if (currentTheme) {
  document.documentElement.setAttribute("data-mode", currentTheme);

  if (currentTheme === "dark" && toggleSwitch) {
    toggleSwitch.checked = true;
  }
} else if (prefersDarkScheme.matches && toggleSwitch) {
  toggleSwitch.checked = true;
}

function switchTheme(e) {
  if (e.target.checked) {
    document.documentElement.setAttribute("data-mode", "dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.setAttribute("data-mode", "light");
    localStorage.setItem("theme", "light");
  }
}

if (toggleSwitch) {
  toggleSwitch.addEventListener("change", switchTheme, false);
}
