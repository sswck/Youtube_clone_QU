// /scripts/channel.js
import { getChannelInfo, getChannelVideoList } from "./getAPI.js";
import { timeAgo } from "./utils.js";

function loadTopBar() {
  fetch("/components/top-bar.html")
    .then((res) => {
      if (!res.ok) throw new Error(`TopBar fetch failed: ${res.status}`);
      return res.text();
    })
    .then((html) => {
      const topbar = document.querySelector(".topbar");
      topbar.innerHTML = html;
      topbar.style.display = "block";
    })
    .catch((err) => console.error("TopBar load error:", err));
}

function loadSideBar() {
  fetch("/components/side-bar.html")
    .then((res) => {
      if (!res.ok) throw new Error(`SideBar fetch failed: ${res.status}`);
      return res.text();
    })
    .then((html) => {
      const sidebar = document.querySelector(".sidebar");
      sidebar.innerHTML = html;
      sidebar.style.display = "block";
    })
    .catch((err) => console.error("SideBar load error:", err));
}

async function initChannelPage() {
  // 0) 공통 컴포넌트부터 로드
  loadTopBar();
  loadSideBar();

  // 1) API로 채널 정보, 영상 리스트 가져오기
  try {
    const ch = await getChannelInfo(2);
    document.querySelector(".channel-banner img").src = ch.channel_banner;
    document.querySelector(".channel-profile .channel-avatar").src = ch.channel_profile;
    document.querySelector(".channel-name").textContent = ch.channel_name;
    document.querySelector(".subscriber-count").textContent = ch.subscribers.toLocaleString() + " subscribers";

    const videos = await getChannelVideoList(2);
    const grids = document.querySelectorAll(".video-grid");
    grids.forEach((grid) => {
      grid.innerHTML = videos
        .map(
          (video) => `
        <div class="video-card">
          <img class="card-thumbnail" src="${video.thumbnail}" alt="${video.title}">
          <div class="card-data">
            <h4 class="card-title">${video.title}</h4>
            <p class="card-channel">${ch.channel_name}</p>
            <p class="card-stats">
              ${video.views.toLocaleString()} views • ${timeAgo(video.created_dt)}
            </p>
          </div>
        </div>
      `
        )
        .join("");
    });

    // 2) 모든 렌더링 끝나면 페이지 보이기
    const page = document.querySelector(".channel-page");
    page.style.visibility = "visible";
  } catch (error) {
    console.error("채널 페이지 초기화 중 오류:", error);
  }
}

// SPA 환경: .channel-page 가 DOM에 나타나는 시점까지 대기
const intervalId = setInterval(() => {
  if (document.querySelector(".channel-page")) {
    clearInterval(intervalId);
    initChannelPage();
  }
}, 100);
