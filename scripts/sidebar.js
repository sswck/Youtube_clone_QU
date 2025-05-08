import { renderSubscriptions } from "./subscription.js";

function initSidebar() {
  renderSubscriptions(); // 구독 목록 렌더링
  initButtons();
}

function initButtons() {
  const urlParams = new URLSearchParams(window.location.search);
  const sidebarButtons = document.querySelectorAll(".sidebar-item");
  const currentPage = window.location.search;
  sidebarButtons.forEach((button) => {
    button.classList.remove("selected"); // 모든 버튼에서 selected 클래스 제거
    const targetPage = button.getAttribute("data-target-page");
    if (targetPage && targetPage.includes(currentPage) && currentPage.length > 0) {
      // Check if the button's target page matches the current page
      button.classList.add("selected"); // Add the "selected" class if it matches
    } else if (currentPage.length === 0) {
      // If no query parameters, set the first button as selected
      const firstButton = sidebarButtons[0];
      if (firstButton) {
        firstButton.classList.add("selected");
      }
    }
    button.addEventListener("click", function () {
      if (targetPage) {
        window.location.href = targetPage;
      }
    });
  });
}

// 0.1초마다 sidebar 등장 여부 확인
var intervalId = setInterval(function () {
  if (document.querySelector("#side-bar-container")) {
    clearInterval(intervalId);
    initSidebar();
    document.querySelector("aside").style.visibility = "visible";
  }
}, 100);
