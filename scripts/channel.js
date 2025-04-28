import { loadTopBar, loadSideBar } from "./loadUI.js";
import { getChannelInfo, getChannelVideoList } from "./getAPI.js";
import { timeAgo } from "./utils.js";

async function initChannelPage() {
  // 0) 공통 UI 로드 (탑바·사이드바)
  await loadTopBar();
  await loadSideBar();

  try {
    // 1) 채널 정보 렌더링
    const ch = await getChannelInfo(2);
    document.querySelector(".channel-banner img").src = ch.channel_banner;
    document.querySelector(".channel-profile .channel-avatar").src = ch.channel_profile;
    document.querySelector(".channel-name").textContent = ch.channel_name;
    document.querySelector(".subscriber-count").textContent = ch.subscribers.toLocaleString() + " subscribers";

    // 2) 비디오 리스트 렌더링
    const videos = await getChannelVideoList(2);
    document.querySelectorAll(".video-grid").forEach((grid) => {
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

    // 3) 숨겨둔 컨테이너와 콘텐츠 보이기
    document.getElementById("top-bar-container").style.visibility = "visible";
    document.getElementById("side-bar-container").style.visibility = "visible";
    document.querySelector(".content").style.visibility = "visible";
  } catch (error) {
    console.error("채널 페이지 초기화 중 오류:", error);
  }
}

// SPA 환경: .channel-page 요소가 DOM에 나타날 때까지 대기
const intervalId = setInterval(() => {
  if (document.querySelector(".channel-page")) {
    clearInterval(intervalId);
    initChannelPage();
  }
}, 100);
