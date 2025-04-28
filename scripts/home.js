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
        <img class="card-thumbnail" src="${thumbnailUrl}" alt="Video Thumbnail">
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

function initFilterBar() {
  const filterBarContainer = document.querySelector(".filter-bar-container");
  const filterBar = filterBarContainer.querySelector(".filter-bar");
  const leftScrollButton = filterBarContainer.querySelector(".left-scroll");
  const rightScrollButton = filterBarContainer.querySelector(".right-scroll");
  const cardUi = document.getElementById("card-ui");
  const topBar = document.querySelector(".top-bar");

  if (!filterBarContainer) return; // 필터 바 컨테이너가 없으면 종료

  // 초기 스크롤 버튼 상태 설정
  leftScrollButton.style.visibility = "hidden";
  rightScrollButton.style.visibility = filterBar.scrollWidth > filterBar.clientWidth ? "visible" : "hidden";

  // 스크롤 이벤트 감지
  filterBar.addEventListener("scroll", () => {
    leftScrollButton.style.visibility = filterBar.scrollLeft > 0 ? "visible" : "hidden";
    rightScrollButton.style.visibility = filterBar.scrollLeft + filterBar.clientWidth < filterBar.scrollWidth ? "visible" : "hidden";
  });

  // 스크롤 버튼 클릭 이벤트
  leftScrollButton.addEventListener("click", () => {
    filterBar.scrollBy({ left: -filterBar.clientWidth / 2, behavior: "smooth" });
  });

  rightScrollButton.addEventListener("click", () => {
    filterBar.scrollBy({ left: filterBar.clientWidth / 2, behavior: "smooth" });
  });

  // card-ui 높이 자동 계산
  const topBarHeight = topBar ? topBar.offsetHeight : 56;
  const filterBarHeight = filterBarContainer ? filterBarContainer.offsetHeight : 79;
  if (cardUi) {
    cardUi.style.height = `calc(100vh - ${topBarHeight}px - ${filterBarHeight}px)`;
  }
}

function renderVideos(videos, container) {
  if (videos && videos.length > 0 && container) {
    const cardsHTML = videos.map(createVideoCardWithChannel).join("");
    //container.innerHTML = cardsHTML;
    container.innerHTML = `<div class="cards-container">${cardsHTML}</div>`;

    // 카드 클릭 이벤트 리스너
    container.querySelectorAll(".card").forEach((card) => {
      card.addEventListener("click", () => {
        const videoId = card.dataset.videoId;
        window.location.href = `/components/video.html?video_id=${videoId}`;
      });
    });
  } else if (container) {
    container.innerHTML = "<p>표시할 비디오가 없습니다.</p>";
  }
}

// 채널 페이지 초기화 로직
async function initChannelPage() {
  try {
    // 채널 정보가 포함된 전체 비디오 리스트 로드 및 요소를 담을 곳 선언
    const videos = await getVideoListWithChannelInfo();
    //const videoGrid = document.getElementById("card-ui");
    const videoGridContainer = document.getElementById("card-ui");
    const filterBar = document.querySelector(".filter-bar");
    let activeTag = "All";

    if (!filterBar || !videoGridContainer) return;

    // 임시 태그 목록 (API 연동 후 실제 데이터로 변경)
    const tags = ["All", "액션", "코미디", "드라마", "SF", "다큐멘터리"];

    // 필터 버튼 생성 및 이벤트 리스너 추가
    tags.forEach((tag) => {
      const button = document.createElement("button");
      button.textContent = tag;
      if (tag === "All") {
        button.classList.add("active");
      }
      button.addEventListener("click", () => {
        filterBar.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");
        activeTag = tag;
        const filteredVideosByTag = filterByTag(videos, activeTag);
        // 기존 검색 쿼리 파라미터도 함께 고려하여 필터링 (기존 queryFilter 활용)
        const finalFilteredVideos = queryFilter(filteredVideosByTag);
        renderVideos(finalFilteredVideos, videoGridContainer);
      });
      filterBar.appendChild(button);
    });

    // 초기 비디오 목록 렌더링 (기존 검색 쿼리 적용)
    const initialFilteredVideos = queryFilter(videos);
    renderVideos(initialFilteredVideos, videoGridContainer);

    initFilterBar();

    // if (filteredVideos && filteredVideos.length > 0) {
    //   const cardsHTML = filteredVideos.map(createVideoCardWithChannel).join("");
    //   if (videoGrid) {
    //     videoGrid.innerHTML = `<div class="cards-container">${cardsHTML}</div>`;

    //     // DOM 업데이트 이후 이벤트 리스너 등록
    //     const cardElements = videoGrid.querySelectorAll(".card");
    //     cardElements.forEach((card) => {
    //       card.addEventListener("click", () => {
    //         // 카드를 클릭했을 때 수행할 동작
    //         const videoId = card.dataset.videoId;
    //         //console.log(videoId);
    //         window.location.href = `/components/video.html?video_id=${videoId}`;
    //       });
    //     });
    //   }
    // } else {
    //   if (videoGrid) {
    //     videoGrid.innerHTML = "<p>표시할 비디오가 없습니다.</p>";
    //   }
    // }
  } catch (error) {
    console.error("채널 페이지 초기화 중 오류:", error);
    const cardUi = document.getElementById("card-ui");
    if (cardUi) {
      cardUi.innerHTML = "<p>비디오 목록을 불러오는 데 실패했습니다.</p>";
    }
  }
}

function filterByTag(videos, activeTag) {
  if (activeTag === "All") {
    return videos;
  }
  return videos.filter((video) => video.tags.includes(activeTag));
}

// SPA 환경에서 채널 페이지 로드 시점 대기
const intervalId = setInterval(() => {
  if (document.getElementById("card-ui")) {
    clearInterval(intervalId);
    initChannelPage();
  }
}, 100);
