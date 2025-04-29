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
    if (event.key === "Enter") {
      event.preventDefault();
      triggerSearch();
    }
  });

  searchButton.addEventListener("click", triggerSearch);
  console.log("Search initialized.");
}

// 0.1초마다 topbar 등장 여부 확인
var intervalId = setInterval(function () {
  if (document.querySelector("#top-bar-container")) {
    clearInterval(intervalId);
    initSearch();
    document.querySelector("header").style.visibility = "visible";
  }
}, 100);
