document.addEventListener("DOMContentLoaded", () => {
  const contentDiv = document.getElementById("content");
  const navLinks = document.querySelectorAll("[data-link]");

  // 초기 콘텐츠 로드 (예: 홈페이지)
  loadContent(window.location.pathname);

  navLinks.forEach((link) => {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      const path = this.getAttribute("href");
      loadContent(path);
      history.pushState(null, "", path);
    });
  });

  window.onpopstate = function (event) {
    loadContent(window.location.pathname);
  };

  function loadContent(path) {
    fetch(path) // 서버에서 해당 경로의 콘텐츠를 요청
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text(); // 또는 response.json() 등 서버 응답 형식에 따라
      })
      .then((html) => {
        contentDiv.innerHTML = html; // 받아온 HTML을 content 영역에 삽입
        // 필요한 경우, 새로 로드된 콘텐츠에 대한 이벤트 리스너 등을 다시 등록
      })
      .catch((error) => {
        console.error("콘텐츠 로딩 오류:", error);
        contentDiv.innerHTML = "<p>페이지를 로드하는 데 실패했습니다.</p>";
      });
  }
});
