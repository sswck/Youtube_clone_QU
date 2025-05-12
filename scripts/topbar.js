function initTopBar() {
  initSidebarCloser();
  initSearch();
}

function initSidebarCloser() {
  const menuButton = document.querySelector(".menu-button");
  const sideBarContainer = document.getElementById("side-bar-container");
  const aside = sideBarContainer.querySelector("aside");

  if (menuButton && sideBarContainer) {
    menuButton.addEventListener("click", () => {
      aside.classList.toggle("closed");
    });
  }
}

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
      triggerSearch();
    }
  });

  searchButton.addEventListener("click", triggerSearch);
  // console.log("Search initialized.");
}

// 0.1초마다 topbar 등장 여부 확인
var intervalId = setInterval(function () {
  if (document.querySelector("#topBar")) {
    clearInterval(intervalId);
    initTopBar();
    document.querySelector("header").style.visibility = "visible";
  }
}, 100);
