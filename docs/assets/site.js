(() => {
  try {
    const root = document.documentElement;
    const saved = localStorage.getItem("mct:theme");
    if (saved === "light" || saved === "dark") {
      root.setAttribute("data-theme", saved);
    }
    const toggle = document.getElementById("theme-toggle");
    toggle?.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      localStorage.setItem("mct:theme", next);
    });
  } catch {}
})();
