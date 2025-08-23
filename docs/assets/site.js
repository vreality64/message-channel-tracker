(() => {
  try {
    const root = document.documentElement;
    // Allow theme override via URL param (?theme=light|dark)
    try {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get("theme");
      const hasUrlTheme = urlTheme === "light" || urlTheme === "dark";
      if (hasUrlTheme) {
        root.setAttribute("data-theme", urlTheme);
        localStorage.setItem("mct:theme", urlTheme);
      }
      // Only apply saved theme if no URL override is present
      const saved = localStorage.getItem("mct:theme");
      if (!hasUrlTheme && (saved === "light" || saved === "dark")) {
        root.setAttribute("data-theme", saved);
      }
    } catch {}
    // If nothing set yet, respect existing attribute or system preference via CSS
    const toggle = document.getElementById("theme-toggle");
    toggle?.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      localStorage.setItem("mct:theme", next);
    });
  } catch {}
})();
