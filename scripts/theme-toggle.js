// 사이드바 로드 완료 후 테마 토글 초기화를 위한 수정
function initThemeToggle() {
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
}

// MutationObserver를 사용하여 사이드바 로드 감지
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      const toggle = document.getElementById("theme-toggle-switch");
      if (toggle) {
        initThemeToggle();
        observer.disconnect();
      }
    }
  });
});

// 사이드바 컨테이너 감시 시작
const sidebarContainer = document.getElementById("side-bar-container");
if (sidebarContainer) {
  observer.observe(sidebarContainer, { childList: true, subtree: true });
}

// 페이지 로드 시 초기화 시도
document.addEventListener("DOMContentLoaded", initThemeToggle);
