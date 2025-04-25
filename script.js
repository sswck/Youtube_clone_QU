// script.js
// SPA 라우팅 및 레이아웃 로딩 담당

document.addEventListener("DOMContentLoaded", () => {
  const topBarContainer = document.getElementById("top-bar-container");
  const sideBarContainer = document.getElementById("side-bar-container");
  const contentDiv = document.querySelector(".content");

  // 상단 바 로드 함수
  function loadTopBar() {
    fetch("/components/top-bar.html")
      .then((res) => res.text())
      .then((html) => {
        topBarContainer.innerHTML = html;
        const links = topBarContainer.querySelectorAll("[data-link]");
        links.forEach((a) => a.addEventListener("click", handleLinkClick));
      });
  }

  // 사이드 바 로드 함수
  function loadSideBar() {
    fetch("/components/side-bar.html")
      .then((res) => res.text())
      .then((html) => {
        sideBarContainer.innerHTML = html;
        const links = sideBarContainer.querySelectorAll("[data-link]");
        links.forEach((a) => a.addEventListener("click", handleLinkClick));
      });
  }

  // 초기 콘텐츠 로드 (Home)
  function loadInitialContent() {
    fetch("/components/home.html")
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        return res.text();
      })
      .then((html) => {
        contentDiv.innerHTML = html;
        // home.js 등 스크립트 실행
        loadScript("/scripts/home.js", "home-script");
      })
      .catch((e) => {
        console.error("초기 콘텐츠 로딩 오류:", e);
        contentDiv.innerHTML = "<p>초기 페이지 로드 실패</p>";
      });
  }

  // 컨텐츠 로드 핸들러
  function handleLinkClick(e) {
    e.preventDefault();
    const path = e.currentTarget.getAttribute("href");
    loadContent(path);
    history.pushState(null, "", path);
  }

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
  loadTopBar();
  loadSideBar();
  loadInitialContent();

  // 뒤로/앞으로 버튼 처리
  window.onpopstate = () => loadContent(window.location.pathname);
});
