// script.js
// SPA 라우팅 및 레이아웃 로딩 담당

import { loadTopBar, loadSideBar } from "/scripts/loadUI.js";

document.addEventListener("DOMContentLoaded", () => {
  const contentDiv = document.querySelector(".content");
  
  // 초기 테마 설정
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", savedTheme);

  // 초기 콘텐츠 로드 (Home)
  function loadInitialContent() {
    loadTopBar();
    loadSideBar();

    fetch("/components/home.html")
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        return res.text();
      })
      .then((html) => {
        contentDiv.innerHTML = html;
        // home.js 등 스크립트 실행
        loadScript("/scripts/home.js", "home-script");
        // content 로드 후 표시
        contentDiv.style.visibility = "visible";
      })
      .catch((e) => {
        console.error("초기 콘텐츠 로딩 오류:", e);
        contentDiv.innerHTML = "<p>초기 페이지 로드 실패</p>";
      });
  }

  // 컨텐츠 로드 핸들러
  // function handleLinkClick(e) {
  //   e.preventDefault();
  //   const path = e.currentTarget.getAttribute("href");
  //   loadContent(path);
  //   history.pushState(null, "", path);
  // }

  // 동적 컨텐츠 로드
  function loadContent(path) {
    if (path === "/" || path === "/index.html") {
      loadInitialContent();
      return;
    }
    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        return res.text();
      })
      .then((html) => {
        contentDiv.innerHTML = html;
        // 콘텐츠별 스크립트 실행
        if (path.includes("home.html")) {
          loadScript("/scripts/home.js", "home-script");
        } else if (path.includes("Channel_Page.html")) {
          loadScript("/scripts/channel.js", "channel-script");
        } else if (path.includes("video.html")) {
          loadScript("/scripts/video.js", "video-script");
        }
      })
      .catch((e) => {
        console.error("콘텐츠 로딩 오류:", e);
        contentDiv.innerHTML = "<p>페이지 로드 실패</p>";
      });
  }

  // 유틸: 스크립트 태그 동적 추가
  function loadScript(src, id) {
    // 기존 로드된 스크립트 제거
    const old = document.getElementById(id);
    if (old) old.remove();
    const s = document.createElement("script");
    s.src = src;
    s.id = id;
    s.type = "module";
    document.body.appendChild(s);
  }

  // 초기화
  loadInitialContent();

  // 뒤로/앞으로 버튼 처리
  window.onpopstate = () => loadContent(window.location.pathname);
});
