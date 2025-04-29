import { loadTopBar, loadSideBar } from "./loadUI.js";
import { getChannelInfo, getChannelVideoList } from "./getAPI.js";
import { subscribe, unsubscribe, getSubscriptions } from "./subscription.js";
import { timeAgo } from "./utils.js";

async function initChannelPage() {
  // 0) 공통 UI 로드
  await loadTopBar();
  await loadSideBar();

  // 2) 사이드바 토글 이벤트 등록
  const menuButton = document.getElementById("top-bar-container")?.querySelector(".menu-button");
  const layoutWrapper = document.querySelector(".layout-wrapper");
  if (menuButton && layoutWrapper) {
    menuButton.addEventListener("click", () => {
      layoutWrapper.classList.toggle("collapsed");
    });
  }

  // 3) URL 파라미터에서 channel_id 가져오기 (없으면 1)
  const channelID = new URLSearchParams(window.location.search).get("channel_id") || 1;

  try {
    // 4) 채널 정보 렌더
    const ch = await getChannelInfo(channelID);
    document.querySelector(".channel-banner img").src = ch.channel_banner;
    document.querySelector(".channel-profile .channel-avatar").src = ch.channel_profile;
    document.querySelector(".channel-name").textContent = ch.channel_name;
    document.querySelector(".subscriber-count").textContent = ch.subscribers.toLocaleString() + " subscribers";

    // 5) 비디오 그리드 렌더 + 클릭 이벤트 등록
    const videos = await getChannelVideoList(channelID);

    // 대표 비디오 설정
    const featuredVideo = videos[0]; // 첫 번째 비디오를 대표 비디오로 설정

    document.querySelector(".video-player video").src = `https://storage.googleapis.com/youtube-clone-video/${featuredVideo.id}.mp4`;
    document.querySelector(".featured-video .video-title").textContent = featuredVideo.title;
    document.querySelector(".featured-video .video-stats").textContent = `${featuredVideo.views.toLocaleString()} views • ${timeAgo(featuredVideo.created_dt)}`;
    document.querySelector(".featured-video .video-description").textContent = featuredVideo.description;

    document.querySelectorAll(".video-grid").forEach((grid) => {
      // 5-1) 카드 마크업 생성 (data-video-id 포함)
      grid.innerHTML = videos
        .map(
          (video) => `
        <div class="video-card" data-video-id="${video.id}">
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

      // 5-2) 렌더된 카드에 클릭 리스너 붙이기
      grid.querySelectorAll(".video-card").forEach((card) => {
        card.addEventListener("click", () => {
          const videoId = card.getAttribute("data-video-id");
          window.location.href = `video.html?video_id=${videoId}`;
        });
      });
    });

    // 구독 버튼
    const subBtn = document.querySelector(".subscribe-btn");
    if (subBtn) {
      const channelId = ch.id;
      subBtn.addEventListener("click", () => {
        const subs = getSubscriptions();
        const isSub = subs.some((c) => c.id === channelId);
        if (isSub) {
          unsubscribe(channelId);
          subBtn.textContent = "SUBSCRIBE";
          subBtn.classList.remove("subscribed");
        } else {
          subscribe({ id: channelId, name: ch.channel_name, thumbnail: ch.channel_profile });
          subBtn.textContent = "SUBSCRIBED";
          subBtn.classList.add("subscribed");
        }
      });
      // 초기 상태 적용
      if (getSubscriptions().some((c) => c.id === ch.id)) {
        subBtn.textContent = "SUBSCRIBED";
        subBtn.classList.add("subscribed");
      }
    }
  } catch (error) {
    console.error("채널 페이지 초기화 중 오류:", error);
  }

  // 전부 로딩 후 페이지 표시
  const channelPage = document.querySelector(".channel-page");
  channelPage.style.visibility = "visible";
}

document.addEventListener("DOMContentLoaded", initChannelPage);
