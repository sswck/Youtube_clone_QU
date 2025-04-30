document.addEventListener("DOMContentLoaded", () => {
  const htmlEl = document.documentElement;
  const toggle = document.getElementById("theme-toggle-switch");
  const saved = localStorage.getItem("theme") || "dark";

  // 초기 상태 복원
  htmlEl.setAttribute("data-theme", saved);
  if (toggle) toggle.checked = saved === "light";

  // 토글 이벤트
  if (toggle) {
    toggle.addEventListener("change", () => {
      const theme = toggle.checked ? "light" : "dark";
      htmlEl.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    });
  }
});
