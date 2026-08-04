function applyTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
  document.body.classList.toggle("dark", theme === "dark");
  localStorage.setItem("theme", theme);
}

function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (systemPrefersDark ? "dark" : "light");
  applyTheme(theme);

  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", window.toggleTheme);
  }
}

window.toggleTheme = function() {
  const nextTheme = document.body.classList.contains("light") ? "dark" : "light";
  applyTheme(nextTheme);
};
