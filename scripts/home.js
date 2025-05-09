import { getVideoListWithChannelInfo } from "./getAPI.js";
import { timeAgo, formatView } from "./utils.js";
import { getSubscriptions } from "./subscription.js";
import { getLikedVideos } from "./likedVideos.js";
import { cardHoverStyle } from "./cardHoverStyle.js";

function queryFilter(videos) {
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.get("search")) {
    // 비디오 제목, 채널 이름, 태그를 기준으로 필터링
    const searchQuery = urlParams.get("search")?.toLowerCase() || "";
    const searchInput = document.getElementById("search-bar-input");
    searchInput.value = searchQuery;
    console.log("검색어:", searchQuery); // 디버깅용 로그

    const filteredVideos = searchQuery
      ? videos.filter(
          (video) =>
            video.title.toLowerCase().includes(searchQuery) ||
            video.channelInfo?.channel_name.toLowerCase().includes(searchQuery) ||
            video.tags.includes(searchQuery)
        )
      : videos;
    return filteredVideos;
  } else if (urlParams.get("subscriptions")) {
    // 구독한 채널의 비디오만 필터링
    const subscriptions = getSubscriptions();
    console.log("구독 목록:", subscriptions); // 디버깅용 로그
    const subscriptionIds = subscriptions.map((sub) => sub.id);
    return videos.filter((video) => subscriptionIds.includes(video.channel_id));
  } else if (urlParams.get("liked")) {
    // 좋아요한 비디오만 필터링
    const likedVideos = getLikedVideos();
    return videos.filter((video) => likedVideos.includes(video.id));
  } else {
    // 검색어가 없을 때는 전체 비디오 리스트를 반환
    return videos;
  }
}

async function createVideoCardWithChannel(video) {
  const videoUrl = `https://storage.googleapis.com/youtube-clone-video/${video.id}.mp4`;
  const thumbnailUrl = video.thumbnail || "/assets/images/thumbnail.png";
  const avatarUrl = video.channelInfo?.channel_profile || "https://randomuser.me/api/portraits/men/32.jpg";

  const createdDate = new Date(video.created_dt);
  const timeInfo = timeAgo(createdDate);
  const channelName = video.channelInfo?.channel_name || "알 수 없는 채널";
  const vID = video.id;
  const chID = video.channel_id;

  return `
      <article class="card" data-video-id="${vID}" data-channel-id="${chID}">
        <div class="card-thumbnail-container">
          <img class="card-thumbnail" data-imgid="${vID}" src="${thumbnailUrl}" alt="Video Thumbnail">
          <video class="card-video" data-videoid="${vID}" src="${videoUrl}" muted loop preload="metadata" style="opacity: 0;"></video>
        </div>
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
  const topBar = document.getElementById("top-bar-container");

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

  // card-ui 높이 자동 계산 (왜 여기서?)
  const topBarHeight = topBar ? topBar.offsetHeight : 56;
  const filterBarHeight = filterBarContainer ? filterBarContainer.offsetHeight : 79;
  if (cardUi) {
    cardUi.style.height = `calc(100vh - ${topBarHeight}px - ${filterBarHeight}px)`;
  }

  filterBarContainer.style.visibility = "visible"; // 로드 후 필터바 보이게
}

async function renderVideos(videos, container) {
  if (videos && videos.length > 0 && container) {
    const videoCardPromises = videos.map(async (video) => {
      return await createVideoCardWithChannel(video);
    });
    const cardsHTMLArray = await Promise.all(videoCardPromises);
    const cardsHTML = cardsHTMLArray.join("");
    container.innerHTML = `<div class="cards-container">${cardsHTML}</div>`;

    // 카드 클릭 이벤트 리스너
    container.querySelectorAll(".card").forEach((card) => {
      const video = container.querySelector(`video[data-videoid="${card.dataset.videoId}" ]`);
      //const video = container.querySelector(".card-video");
      const thumbnail = container.querySelector(`img[data-imgid="${card.dataset.videoId}" ]`);
      //const thumbnail = container.querySelector(".card-thumbnail");
      let hoverTimeout;

      cardHoverStyle(card); // 카드 호버 스타일 적용

      card.addEventListener("mouseenter", () => {
        hoverTimeout = setTimeout(() => {
          thumbnail.style.opacity = "0";
          video.style.opacity = "1";
          video.play();
        }, 500);
      });

      card.addEventListener("mouseleave", () => {
        clearTimeout(hoverTimeout);
        video.pause();
        video.currentTime = 0;
        video.style.opacity = "0";
        thumbnail.style.opacity = "1";
      });

      card.addEventListener("click", () => {
        // 클릭된 요소가 card-avatar 클래스 영역이면 채널페이지로, 그 외 영역은 비디오페이지
        if (event.target.classList.contains("card-avatar")) {
          window.location.href = `/components/Channel_Page.html?channel_id=${card.dataset["channelId"]}`;
        } else {
          window.location.href = `/components/video.html?video_id=${card.dataset.videoId}`;
        }
      });
    });
  } else if (container) {
    container.innerHTML = "<p>표시할 비디오가 없습니다.</p>";
  }
}

// 채널 페이지 초기화 로직
async function initHomePage() {
  try {
    // 채널 정보가 포함된 전체 비디오 리스트 로드 및 요소를 담을 곳 선언
    const videos = await getVideoListWithChannelInfo();
    //const videoGrid = document.getElementById("card-ui");
    const videoGridContainer = document.getElementById("card-ui");
    const filterBar = document.querySelector(".filter-bar");
    let activeTag = "All";

    if (!filterBar || !videoGridContainer) return;

    // 초기 비디오 목록 렌더링 (기존 검색 쿼리 적용)
    const initialFilteredVideos = queryFilter(videos);
    await renderVideos(initialFilteredVideos, videoGridContainer);

    const allTags = []; // 모든 태그를 저장할 배열

    initialFilteredVideos.forEach((video) => {
      if (video.tags && Array.isArray(video.tags)) {
        video.tags.forEach((tag) => allTags.push(tag));
      }
    });

    // 중복 제거를 위해 Set 사용
    const uniqueTags = new Set(allTags);
    // Set을 다시 배열로 변환하고 "All"을 맨 앞에 추가
    const tags = ["All", ...Array.from(uniqueTags)];

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
        const filteredVideosByTag = filterByTag(initialFilteredVideos, activeTag);
        // 기존 검색 쿼리 파라미터도 함께 고려하여 필터링 (기존 queryFilter 활용)
        const finalFilteredVideos = queryFilter(filteredVideosByTag);
        renderVideos(finalFilteredVideos, videoGridContainer);
      });
      filterBar.appendChild(button);
    });

    initFilterBar();

    // home 페이지 로드 후 표시
    const homePage = document.querySelector(".content");
    homePage.style.visibility = "visible";
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
    initHomePage();
  }
}, 100);

// document.addEventListener("DOMContentLoaded", initHomePage);
