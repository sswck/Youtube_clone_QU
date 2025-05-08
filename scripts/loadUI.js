// 웹 페이지의 UI 컴포넌트 (탑바, 사이드바)를 동적으로 로드하고 기능을 초기화합니다.

/**
 * 탑바 HTML을 서버로부터 가져와 페이지에 삽입
 */
async function loadTopBar() {
  try {
    const response = await fetch("/components/top-bar.html");
    const html = await response.text();
    const topBarContainer = document.getElementById("top-bar-container");
    const sideBarContainer = document.getElementById("side-bar-container");

    if (!topBarContainer) {
      console.error("탑바 컨테이너(.topbar)를 찾을 수 없습니다.");
      return;
    }

    topBarContainer.innerHTML = html;
    topBarContainer.style.display = "block";

    // DOM 업데이트 후 이벤트 리스너 추가
    // setTimeout(() => {
    //   const menuButton = topBarContainer.querySelector(".menu-button");

    //   // 로드 완료 후 탑바를 보이게 설정
    //   topBarContainer.style.visibility = "visible";

    //   if (menuButton && sideBarContainer) {
    //     menuButton.addEventListener("click", () => {
    //       sideBarContainer.style.display = sideBarContainer.style.display === "none" ? "block" : "none";
    //     });
    //   }
    //   function handleResize() {
    //     if (window.matchMedia("(max-width: 768px)").matches) {
    //       sideBarContainer.style.display = "none";
    //     }
    //   }
    //   // window.addEventListener("resize", handleResize);
    //   // 초기 실행
    //   // handleResize();
    // }, 100); // 100ms 지연
  } catch (error) {
    console.error("탑바를 로드하는 동안 오류가 발생했습니다:", error);
  }
}

/**
 * 사이드바 HTML을 서버로부터 가져와 페이지에 삽입
 */
async function loadSideBar() {
  try {
    const response = await fetch("/components/side-bar.html");
    const html = await response.text();
    const sideBarContainer = document.getElementById("side-bar-container");

    if (!sideBarContainer) {
      console.error("사이드바 컨테이너(.sidebar)를 찾을 수 없습니다.");
      return;
    }

    sideBarContainer.innerHTML = html;

    // 사이드바 로드 완료 후 테마 토글 초기화를 위한 이벤트 발생
    const event = new CustomEvent("sidebarLoaded");
    document.dispatchEvent(event);

    // 테마 상태 복원
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);

    // 사이드바 표시
    sideBarContainer.style.visibility = "visible";
  } catch (error) {
    console.error("사이드바를 로드하는 동안 오류가 발생했습니다:", error);
  }
}

async function loadCustomVideo(videoElement) {
  try {
    const response = await fetch("/components/videoPlayer.html");
    const html = await response.text();

    videoElement.innerHTML = html;
  } catch (error) {
    console.error("비디오 플레이어를 로드하는 동안 오류가 발생했습니다:", error);
  }
}

export { loadTopBar, loadSideBar, loadCustomVideo };
