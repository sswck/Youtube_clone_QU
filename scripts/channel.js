// /scripts/channel.js

import { loadTopBar, loadSideBar } from "./loadUI.js";
import { getChannelInfo, getChannelVideoList } from "./getAPI.js";
import { timeAgo } from "./utils.js";

async function initChannelPage() {
  // 0) 공통 UI 로드
  await loadTopBar();
  await loadSideBar();

  const channelPage = document.querySelector(".channel-page");
  channelPage.style.visibility = "visible";

  // 0.1) 사이드바 토글 이벤트 등록
  const menuButton = document.getElementById("top-bar-container")?.querySelector(".menu-button");
  const layoutWrapper = document.querySelector(".layout-wrapper");
  if (menuButton && layoutWrapper) {
    menuButton.addEventListener("click", () => {
      layoutWrapper.classList.toggle("collapsed");
    });
  }

  // 1) URL 파라미터에서 channel_id 가져오기 (없으면 1)
  const channelID = new URLSearchParams(window.location.search).get("channel_id") || 1;

  try {
    // 2) 채널 정보 렌더
    const ch = await getChannelInfo(channelID);
    document.querySelector(".channel-banner img").src = ch.channel_banner;
    document.querySelector(".channel-profile .channel-avatar").src = ch.channel_profile;
    document.querySelector(".channel-name").textContent = ch.channel_name;
    document.querySelector(".subscriber-count").textContent = ch.subscribers.toLocaleString() + " subscribers";

    // 3) 비디오 그리드 렌더
    const videos = await getChannelVideoList(channelID);
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

    // 4) UI 보이기
    document.getElementById("top-bar-container").style.visibility = "visible";
    document.getElementById("side-bar-container").style.visibility = "visible";
    document.querySelector(".content").style.visibility = "visible";
  } catch (error) {
    console.error("채널 페이지 초기화 중 오류:", error);
  }
}

document.addEventListener("DOMContentLoaded", initChannelPage);
