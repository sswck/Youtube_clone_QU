function initSearch() {
  const searchInput = document.querySelector(".search-bar input");
  const searchButton = document.querySelector(".search-button");

  function triggerSearch() {
    const query = searchInput.value.trim();
    if (query.length > 0) {
      window.location.href = `/index.html?search=${encodeURIComponent(query)}`;
    }
  }

  searchInput.addEventListener("keypress", (event) => {
    event.preventDefault();
    if (event.key === "Enter") {
      triggerSearch();
    }
  });

  searchButton.addEventListener("click", triggerSearch);
  console.log("Search initialized.");
}

// 0.1초마다 채널 페이지(.channel-page) 등장 여부 확인
var intervalId = setInterval(function () {
  if (document.querySelector(".top-bar")) {
    clearInterval(intervalId);
    initSearch();
  }
}, 100);
