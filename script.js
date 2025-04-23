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

  // 초기 콘텐츠 로드 함수
  function loadInitialContent() {
    fetch("/") // 또는 초기 페이지의 실제 경로 (상단 바 제외)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((html) => {
        contentDiv.innerHTML = html;
      })
      .catch((error) => {
        console.error("초기 콘텐츠 로딩 오류:", error);
        contentDiv.innerHTML = "<p>초기 페이지를 로드하는 데 실패했습니다.</p>";
      });
  }

  function handleLinkClick(event) {
    event.preventDefault();
    const path = this.getAttribute("href");
    loadContent(path);
    history.pushState(null, "", path);
  }

  function loadContent(path) {
    fetch(path)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((html) => {
        contentDiv.innerHTML = html;
      })
      .catch((error) => {
        console.error("콘텐츠 로딩 오류:", error);
        contentDiv.innerHTML = "<p>페이지를 로드하는 데 실패했습니다.</p>";
      });
  }

  // 초기 상단 바 로드
  loadTopBar();
  // 초기 사이드 바 로드
  loadSideBar();
  // 초기 콘텐츠 로드
  loadInitialContent();

  window.onpopstate = function (event) {
    loadContent(window.location.pathname);
  };
});
