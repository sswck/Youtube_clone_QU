import { renderSubscriptions } from "./subscription.js";

function initSidebar() {
  renderSubscriptions(); // 구독 목록 렌더링
  initButtons();
  closeByWindowSize();
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

function closeByWindowSize() {
  if (new URLSearchParams(window.location.search).get("video_id") !== null) return; // 비디오 페이지에서는 사이드바 닫기 기능을 사용하지 않음
  const aside = document.querySelector("aside");
  const mediaQuery = window.matchMedia("(max-width: 1200px)");

  function handleMediaQueryChange(event) {
    if (event.matches) {
      aside.classList.add("closed");
    } else {
      aside.classList.remove("closed");
    }
  }

  mediaQuery.addEventListener("change", handleMediaQueryChange);
  handleMediaQueryChange(mediaQuery); // 초기 상태 설정
}

// 0.1초마다 sidebar 등장 여부 확인
var intervalId = setInterval(function () {
  if (document.querySelector("#sideBar")) {
    clearInterval(intervalId);
    initSidebar();
    // document.querySelector("aside").style.visibility = "visible";
    console.log("sidebar.js: 사이드바 초기화 완료");
  }
}, 100);
