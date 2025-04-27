import { getVideoListWithChannelInfo } from "./getAPI.js";
import { timeAgo, formatView } from "./utils.js";

function queryFilter(videos) {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search")?.toLowerCase() || "";
  console.log("Search Query:", searchQuery);

  // 비디오 제목, 채널 이름, 태그를 기준으로 필터링
  const filteredVideos = searchQuery
    ? videos.filter(
        (video) =>
          video.title.toLowerCase().includes(searchQuery) ||
          video.channelInfo?.channel_name.toLowerCase().includes(searchQuery) ||
          video.tags.includes(searchQuery)
      )
    : videos;
  return filteredVideos;
}

function createVideoCardWithChannel(video) {
  //const videoUrl = `https://storage.googleapis.com/youtube-clone-video/${video.id}.mp4`;
  const thumbnailUrl = video.thumbnail || "/assets/images/thumbnail.png";
  const avatarUrl = video.channelInfo?.channel_profile || "https://randomuser.me/api/portraits/men/32.jpg";

  const createdDate = new Date(video.created_dt);
  const timeInfo = timeAgo(createdDate);
  const channelName = video.channelInfo?.channel_name || "알 수 없는 채널";

  return `
      <article class="card" data-video-id="${video.id}">
        <img class="card-thumbnail" src="${thumbnailUrl}" alt="Video Thumbnail" style="width: 100%; display: block; object-fit: cover;">
        <div class="card-details">
          <img class="card-avatar" src="${avatarUrl}" alt="Channel Avatar" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
          <div class="card-data">
            <h3 class="card-title">${video.title}</h3>
            <p class="card-channel">${channelName}</p>
            <p class="card-stats">${video.views ? formatView(video.views) + " views" : "조회수 정보 없음"} • ${timeInfo}</p>
          </div>
        </div>
      </article>
    `;
}

// 채널 페이지 초기화 로직
async function initChannelPage() {
  try {
    // 채널 정보가 포함된 전체 비디오 리스트 로드 및 요소를 담을 곳 선언
    const videos = await getVideoListWithChannelInfo();
    const videoGrid = document.getElementById("card-ui");
    const filteredVideos = queryFilter(videos);

    if (filteredVideos && filteredVideos.length > 0) {
      const cardsHTML = filteredVideos.map(createVideoCardWithChannel).join("");
      if (videoGrid) {
        videoGrid.innerHTML = `<div class="cards-container">${cardsHTML}</div>`;

        // DOM 업데이트 이후 이벤트 리스너 등록
        const cardElements = videoGrid.querySelectorAll(".card");
        cardElements.forEach((card) => {
          card.addEventListener("click", () => {
            // 여기에 카드를 클릭했을 때 수행할 동작을 작성합니다.
            const videoId = card.dataset.videoId;
            console.log(videoId);
            window.location.href = `/components/video.html?video_id=${videoId}`;
          });
        });
      }
    } else {
      if (videoGrid) {
        videoGrid.innerHTML = "<p>표시할 비디오가 없습니다.</p>";
      }
    }
  } catch (error) {
    console.error("채널 페이지 초기화 중 오류:", error);
  }
}

// SPA 환경에서 채널 페이지 로드 시점 대기
const intervalId = setInterval(() => {
  if (document.getElementById("card-ui")) {
    clearInterval(intervalId);
    initChannelPage();
  }
}, 100);
