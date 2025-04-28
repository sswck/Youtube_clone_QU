import { getVideoInfo, getChannelInfo, getVideoList } from "./getAPI.js";
import { timeAgo, formatView } from "./utils.js";

function loadTopBar() {
  fetch("/components/top-bar.html")
    .then((res) => res.text())
    .then((html) => {
      document.querySelector(".topbar").innerHTML = html;

      const topbar = document.querySelector(".topbar");
      topbar.style.display = "block";

      // 요소가 삽입된 후 이벤트 리스너 추가
      setTimeout(() => {
        const menuButton = document.querySelector(".menu-button");
        const sidebar = document.querySelector(".sidebar");

        // 로드 완료 후 topbar 보이게 설정
        const topBar = document.querySelector(".topbar");
        topBar.style.visibility = "visible";

        if (menuButton && sidebar) {
          sidebar.style.display = "none";
          menuButton.addEventListener("click", () => {
            sidebar.style.display = sidebar.style.display === "none" ? "block" : "none";
          });
        }
      }, 100); // 100ms 지연 후 버튼 찾기
    });
}

// 사이드 바 로드 함수
function loadSideBar() {
  fetch("/components/side-bar.html")
    .then((res) => res.text())
    .then((html) => {
      document.querySelector(".sidebar").innerHTML = html;
    });
}

// 최초 동영상 페이지 로드 함수
async function initVideoPage() {
  loadTopBar(); // 상단 바 로드
  loadSideBar(); // 사이드 바 로드

  // videoID는 URL의 쿼리 파라미터에서 가져옵니다. 예: ?video_id=12345
  const videoID = new URLSearchParams(window.location.search).get("video_id") || 1;
  if (!videoID) {
    console.error("No video ID provided in the URL.");
    return;
  }

  // API 호출하여 동영상 정보, 채널 정보, 동영상 목록 가져오기
  try {
    const videoData = await getVideoInfo(videoID);
    displayVideoInfo(videoData); // 동영상 정보 표시

    const channelData = await getChannelInfo(videoData.channel_id);
    displayChannelInfo(channelData); // 채널 정보 표시

    const videoListData = await getVideoList();
    displayVideoList(videoListData); // 동영상 목록 표시
  } catch (error) {
    console.error("Error fetching API data:", error);
  }

  // 비디오 페이지 로드 후 표시
  const videoPage = document.querySelector(".video-page");
  videoPage.style.visibility = "visible";
}

function displayVideoInfo(data) {
  // 비디오 정보 (thumbnail, title, views, created date, likes, dislikes) 표시
  const video = document.querySelector(".video-player img");
  const title = document.querySelector(".video-title");
  const views = document.querySelector("#view-count");
  const createdDate = document.querySelector("#created-date");
  const liked = document.querySelector("#buttonLike span");
  const disliked = document.querySelector("#buttonDislike span");

  video.src = data.thumbnail;
  title.textContent = data.title;
  views.textContent = formatView(data.views);
  createdDate.textContent = timeAgo(data.created_dt);
  liked.textContent = formatView(data.likes);
  disliked.textContent = formatView(data.dislikes);

  // 비디오 태그 버튼 생성 (예: 동물, 고양이 등)
  const tagsContainer = document.querySelector(".secondary-tags");
  tagsContainer.innerHTML = ""; // 기존 태그 초기화

  tagsContainer.innerHTML = `<button class="secondary-button">All</button>`; // "All" 버튼 추가
  // 태그 버튼 생성
  data.tags.forEach((tag) => {
    const tagElement = document.createElement("button");
    tagElement.className = "secondary-button";
    tagElement.textContent = tag;
    tagsContainer.appendChild(tagElement);
  });

  addTagFilterFunctionality();
}

function addTagFilterFunctionality() {
  const buttons = document.querySelectorAll(".secondary-button");

  // 최초 로드 시 "All" 버튼 활성화
  const allButton = document.querySelector(".secondary-button:first-child");
  if (allButton) {
    allButton.classList.add("active");
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedTag = button.textContent;

      // 기존 활성화된 버튼 초기화 후 클릭된 버튼만 활성화
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      document.querySelectorAll(".secondary-video").forEach((video) => {
        const videoTags = video.getAttribute("data-tags")?.split(",") || [];
        video.style.visibility = selectedTag === "All" || videoTags.includes(selectedTag) ? "visible" : "hidden";
        video.style.position = selectedTag === "All" || videoTags.includes(selectedTag) ? "static" : "absolute";
      });
    });
  });
}

function displayChannelInfo(data) {
  const channelAvatar = document.querySelector(".channel-avatar");
  const channelName = document.querySelector(".channel-name");
  const subscribers = document.querySelector(".subscribers span");

  channelAvatar.src = data.channel_profile;
  channelName.textContent = data.channel_name;
  subscribers.textContent = formatView(data.subscribers);
}

function displayVideoList(data) {
  const videoList = document.querySelector(".secondary-list");
  videoList.innerHTML = ""; // Clear existing content

  if (!data || data.length === 0) {
    videoList.innerHTML = "<p>No videos available.</p>";
    return;
  }

  const videoID = parseInt(new URLSearchParams(window.location.search).get("video_id") || 1, 10); // 현재 비디오 ID

  data.forEach(async (video) => {
    if (video.id === videoID) return; // 현재 비디오 ID와 일치하는 경우 건너뜁니다.
    // 채널 id를 사용하여 채널 정보를 가져옵니다.
    const channelName = (await getChannelInfo(video.channel_id).then((channelData) => channelData.channel_name)) || "Unknown Channel";
    const videoItem = document.createElement("div");
    videoItem.className = "secondary-video";
    videoItem.innerHTML = `
      <a href="video.html?video_id=${video.id}" class="secondary-video-link"></a>
        <div class="secondary-thumbnail" style="background-image: url('${video.thumbnail}');"><span class="secondary-videoTime">--:--</span></div>
        <div class="secondary-video-text">
          <span class="secondary-video-title">${video.title}</span>
          <span class="secondary-video-channel">${channelName}</span>
          <span class="secondary-video-info">${formatView(video.views)} views ${timeAgo(video.created_dt)}</span>
        </div>
      </a>
      `;

    // 비디오 태그를 data-tags 속성에 저장
    videoItem.setAttribute("data-tags", video.tags.join(","));

    // 클릭 이벤트 추가
    videoItem.addEventListener("click", (event) => {
      event.preventDefault(); // 기본 동작 방지
      window.location.href = `video.html?video_id=${video.id}`;
    });

    videoList.appendChild(videoItem);
  });
}
// SPA 환경에서 채널 페이지 로드 시점 대기
const intervalId = setInterval(() => {
  if (document.querySelector(".video-page")) {
    clearInterval(intervalId);
    initVideoPage();
  }
}, 100);
