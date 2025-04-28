import { renderSubscriptions } from "./subscription.js";

function initSidebar() {
  renderSubscriptions(); // 구독 목록 렌더링
}

// 0.1초마다 sidebar 등장 여부 확인
var intervalId = setInterval(function () {
  if (document.querySelector("#side-bar-container")) {
    clearInterval(intervalId);
    initSidebar();
  }
}, 100);
