import { renderSubscriptions } from "./subscription.js";

function initSidebar() {
  renderSubscriptions(); // 구독 목록 렌더링
  initButtons();
}

function initButtons() {
  document.querySelector("#button-home").addEventListener("click", function () {
    window.location.href = "/index.html";
  });

  document.querySelector("#button-subscriptions").addEventListener("click", function () {
    window.location.href = "/index.html?subscriptions=true";
  });

  document.querySelector("#button-liked").addEventListener("click", function () {
    window.location.href = "/index.html?liked=true";
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
