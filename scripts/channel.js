import { getChannelInfo, getChannelVideoList } from "./getAPI.js";
import { timeAgo } from "./utils.js";

// 채널 페이지 초기화 로직
async function initChannelPage() {
  try {
    // 1) 채널 정보 로드
    const ch = await getChannelInfo(2);
    document.querySelector(".channel-banner img").src = ch.channel_banner;
    document.querySelector(".channel-profile .channel-avatar").src = ch.channel_profile;
    document.querySelector(".channel-name").textContent = ch.channel_name;
    document.querySelector(".subscriber-count").textContent = ch.subscribers.toLocaleString() + " subscribers";

    // 2) 채널 비디오 리스트 로드
    const videos = await getChannelVideoList(2);
    const grids = document.querySelectorAll(".video-grid");
    const channelName = ch.channel_name;

    // 각 그리드에 동일한 카드 렌더링
    grids.forEach((grid) => {
      grid.innerHTML = videos
        .map((video) => {
          return `
          <div class="video-card">
            <img class="card-thumbnail" src="${video.thumbnail}" alt="${video.title}">
            <div class="card-data">
              <h4 class="card-title">${video.title}</h4>
              <p class="card-channel">${channelName}</p>
              <p class="card-stats">${video.views.toLocaleString()} views • ${timeAgo(video.created_dt)}</p>
            </div>
          </div>
        `;
        })
        .join("");
    });
  } catch (error) {
    console.error("채널 페이지 초기화 중 오류:", error);
  }
}

// SPA 환경에서 채널 페이지 로드 시점 대기
const intervalId = setInterval(() => {
  if (document.querySelector(".channel-page")) {
    clearInterval(intervalId);
    initChannelPage();
  }
}, 100);
