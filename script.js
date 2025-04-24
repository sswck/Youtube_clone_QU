document.addEventListener("DOMContentLoaded", () => {
  const topBarContainer = document.getElementById("top-bar-container");
  const sideBarContainer = document.getElementById("side-bar-container");
  const contentDiv = document.querySelector(".content");
  const navLinks = document.querySelectorAll("[data-link]");

  // 상단 바 로드 함수
  function loadTopBar() {
    fetch("/components/top-bar.html")
      .then((response) => response.text())
      .then((html) => {
        topBarContainer.innerHTML = html;
        // 상단 바가 로드된 후 data-link 속성을 가진 요소에 이벤트 리스너를 다시 등록
        const topBarLinks = topBarContainer.querySelectorAll("[data-link]");
        topBarLinks.forEach((link) => {
          link.addEventListener("click", handleLinkClick);
        });
      });
  }

  // 사이드 바 로드 함수
  function loadSideBar() {
    fetch("/components/side-bar.html")
      .then((response) => response.text())
      .then((html) => {
        sideBarContainer.innerHTML = html;
        // 사이드 바가 로드된 후 data-link 속성을 가진 요소에 이벤트 리스너를 다시 등록
        const sideBarLinks = sideBarContainer.querySelectorAll("[data-link]");
        sideBarLinks.forEach((link) => {
          link.addEventListener("click", handleLinkClick);
        });
      });
  }

  // 초기 콘텐츠 로드 함수 (home.html 로드)
  function loadInitialContent() {
    loadContent("/components/home.html");
  }

  function handleLinkClick(event) {
    event.preventDefault();
    const path = this.getAttribute("href");
    loadContent(path);
    history.pushState(null, "", path);
  }

  function loadContent(path) {
    // "/" 또는 "/index.html" 경로 처리 추가
    if (path === "/" || path === "/index.html") {
      loadInitialContent();
      return;
    }

    fetch(path)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((html) => {
        contentDiv.innerHTML = html;
        // home.html이 로드된 경우에만 home.js 스크립트 실행
        if (path === "/components/home.html") {
          loadHomeScript();
        }
      })
      .catch((error) => {
        console.error("콘텐츠 로딩 오류:", error);
        contentDiv.innerHTML = "<p>페이지를 로드하는 데 실패했습니다.</p>";
      });
  }

  // home.js 스크립트를 동적으로 로드하는 함수
  function loadHomeScript() {
    const script = document.createElement("script");
    script.src = "/scripts/home.js";
    document.body.appendChild(script);
  }

  // 초기 상단 바 로드
  loadTopBar();
  // 초기 사이드 바 로드
  loadSideBar();
  // 초기 콘텐츠 로드 (home.html)
  loadInitialContent();

  window.onpopstate = function (event) {
    loadContent(window.location.pathname);
  };
});
