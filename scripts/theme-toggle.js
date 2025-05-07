// 사이드바 로드 완료 후 테마 토글 초기화를 위한 수정
function initThemeToggle() {
  const htmlEl = document.documentElement;
  const toggle = document.getElementById("theme-toggle-switch");
  const themeToggleItem = document.querySelector(".theme-toggle-item");
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

    // theme-toggle-item 클릭 이벤트 추가
    if (themeToggleItem) {
      themeToggleItem.addEventListener("click", (e) => {
        // 체크박스나 슬라이더를 직접 클릭한 경우는 제외
        if (e.target !== toggle && !e.target.classList.contains("slider")) {
          toggle.checked = !toggle.checked;
          // change 이벤트 발생시키기
          toggle.dispatchEvent(new Event("change"));
        }
      });
    }
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

// 페이지 로드 시 테마 초기화
document.addEventListener("DOMContentLoaded", () => {
  const htmlEl = document.documentElement;
  const toggle = document.getElementById("theme-toggle-switch");
  
  // localStorage에서 테마 가져오기
  const savedTheme = localStorage.getItem("theme") || "dark";
  
  // HTML에 테마 적용
  htmlEl.setAttribute("data-theme", savedTheme);
  
  // 토글 스위치 상태 설정
  if (toggle) {
    toggle.checked = savedTheme === "light";
    
    // 토글 이벤트 리스너
    toggle.addEventListener("change", () => {
      const theme = toggle.checked ? "light" : "dark";
      htmlEl.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    });
  }
});

// 사이드바 로드 완료 이벤트 리스너 추가
document.addEventListener("sidebarLoaded", () => {
  const toggle = document.getElementById("theme-toggle-switch");
  const savedTheme = localStorage.getItem("theme") || "dark";
  
  if (toggle) {
    toggle.checked = savedTheme === "light";
    
    // 토글 이벤트 리스너 재설정
    toggle.addEventListener("change", () => {
      const theme = toggle.checked ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
    });
  }
});
