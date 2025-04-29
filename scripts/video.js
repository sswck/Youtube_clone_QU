import { getVideoInfo, getChannelInfo, getVideoList } from "./getAPI.js";
import { timeAgo, formatView } from "./utils.js";
import { subscribe, unsubscribe, getSubscriptions } from "./subscription.js";
import { loadTopBar, loadSideBar } from "./loadUI.js";

// ==================== 최초 동영상 페이지 로드 함수 ====================
async function initVideoPage() {
  await loadTopBar(); // 상단 바 로드
  await loadSideBar(); // 사이드 바 로드
  document.querySelector("#side-bar-container").style.display = "none"; // 사이드 바 최초 상태: 안 보이게 설정

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

  // 전부 로딩 완료 된 후에 비디오 페이지를 보이게 합니다.
  const videoPage = document.querySelector(".video-page");
  videoPage.style.visibility = "visible";

  document.addEventListener("DOMContentLoaded", () => {
    const videoPlayer = document.getElementById("videoPlayer");

    if (!videoPlayer) {
      console.error("Video player not found.");
      return;
    }
  });

  const videoPlayer = document.getElementById("videoPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");

  customVideoPlayer(); // 비디오 플레이어 커스텀 함수 호출
}

// ==================== 동영상 정보 표시 함수 ====================
function displayVideoInfo(data) {
  const video = document.querySelector("#videoPlayer");
  const title = document.querySelector(".video-title");
  const views = document.querySelector("#view-count");
  const createdDate = document.querySelector("#created-date");
  const liked = document.querySelector("#buttonLike span");
  const disliked = document.querySelector("#buttonDislike span");

  video.src = `https://storage.googleapis.com/youtube-clone-video/${data.id}.mp4`;
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

// ==================== 태그 필터링 기능 추가 ====================
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

// ==================== 채널 정보 표시 함수 ====================
function displayChannelInfo(data) {
  const channelAvatar = document.querySelector(".channel-avatar");
  const channelName = document.querySelector(".channel-name");
  const subscribers = document.querySelector(".subscribers span");

  channelAvatar.src = data.channel_profile;
  channelName.textContent = data.channel_name;
  subscribers.textContent = formatView(data.subscribers);

  const channelProfile = document.querySelector(".channel-profile");
  // 클릭 이벤트 추가
  channelProfile.addEventListener("click", (event) => {
    event.preventDefault(); // 기본 동작 방지
    window.location.href = `Channel_Page.html?channel_id=${data.id}`;
  });

  const channelId = data.id;
  // 구독 버튼 클릭 이벤트
  const subscribeButton = document.querySelector(".subscribe-button");
  if (subscribeButton) {
    subscribeButton.addEventListener("click", () => {
      if (!channelId || !channelName || !channelAvatar) {
        console.error("Channel information is missing.");
        return;
      }
      const subscribedChannels = getSubscriptions();
      const isSubscribed = subscribedChannels.some((channel) => channel.id === channelId);
      if (isSubscribed) {
        unsubscribe(channelId);
        subscribeButton.textContent = "SUBSCRIBE"; // UI 변경
        subscribeButton.classList.remove("subscribed"); // 색상 변경
      } else {
        subscribe({ id: channelId, name: data.channel_name, thumbnail: data.channel_profile });
        subscribeButton.textContent = "SUBSCRIBED"; // UI 변경
        subscribeButton.classList.add("subscribed"); // 색상 변경
      }
    });

    // 초기 로드 시 버튼 상태 설정
    const subscribedChannels = getSubscriptions();
    if (subscribedChannels.some((channel) => channel.id === channelId)) {
      subscribeButton.textContent = "SUBSCRIBED";
      subscribeButton.classList.add("subscribed");
    } else {
      subscribeButton.textContent = "SUBSCRIBE";
    }
  }
}

// ==================== 동영상 목록 표시 함수 ====================
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
        <div class="secondary-thumbnail" style="background-image: url('${video.thumbnail}');"><span class="secondary-videoTime">--:--</span></div>
        <div class="secondary-video-text">
          <span class="secondary-video-title">${video.title}</span>
          <span class="secondary-video-channel">${channelName}</span>
          <span class="secondary-video-info">${formatView(video.views)} views ${timeAgo(video.created_dt)}</span>
        </div>
      `;

    // 비디오 태그를 data-tags 속성에 저장
    videoItem.setAttribute("data-tags", video.tags.join(","));

    // 클릭 이벤트 추가
    videoItem.addEventListener("click", (event) => {
      event.preventDefault(); // 기본 동작 방지
      window.location.href = `/components/video.html?video_id=${video.id}`;
    });

    videoList.appendChild(videoItem);
  });
}

// ==================== 비디오 플레이어 커스텀 함수 ====================
function customVideoPlayer() {
  const videoPlayer = document.getElementById("videoPlayer");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const volumeBtn = document.getElementById("volumeBtn");
  const volumeSlider = document.getElementById("volumeSlider");
  const speedBtn = document.getElementById("speedBtn");
  const speedOptions = document.querySelector(".speed-options");
  const pipBtn = document.getElementById("pipBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const progressBar = document.getElementById("progressBar");
  const timeDisplay = document.getElementById("timeDisplay");

  // 🎥 ▶️ 재생 / 일시 정지
  playPauseBtn.addEventListener("click", () => {
    if (videoPlayer.paused) {
      videoPlayer.play();
      playPauseBtn.textContent = "⏸";
    } else {
      videoPlayer.pause();
      playPauseBtn.textContent = "▶️";
    }
  });
  videoPlayer.addEventListener("click", () => {
    if (videoPlayer.paused) {
      videoPlayer.play();
      playPauseBtn.textContent = "⏸";
    } else {
      videoPlayer.pause();
      playPauseBtn.textContent = "▶️";
    }
  });

  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  // 🎯 시간 업데이트
  videoPlayer.addEventListener("timeupdate", () => {
    const currentTime = formatTime(videoPlayer.currentTime);
    const totalTime = formatTime(videoPlayer.duration);
    timeDisplay.textContent = `${currentTime} / ${totalTime}`;
  });

  // 🎯 비디오 로드 시 총 길이 설정
  videoPlayer.addEventListener("loadedmetadata", () => {
    timeDisplay.textContent = `00:00 / ${formatTime(videoPlayer.duration)}`;
  });

  // 🔊 볼륨 조절
  volumeBtn.addEventListener("click", () => {
    if (videoPlayer.volume > 0) {
      videoPlayer.volume = 0;
      volumeBtn.textContent = "🔇";
    } else {
      videoPlayer.volume = 1;
      volumeBtn.textContent = "🔊";
    }
  });

  // 볼륨 슬라이더 조절
  volumeSlider.addEventListener("input", (e) => {
    var gradient_value = 100 / e.target.attributes.max.value;
    e.target.style.background =
      "linear-gradient(to right, rgb(0,0,255) 0%, rgb(0,153,255)" +
      (gradient_value * e.target.value) / 2 +
      "%, rgb(255,255,255)" +
      gradient_value * e.target.value +
      "%, rgb(85,85,85)" +
      gradient_value * e.target.value +
      "%)";
    videoPlayer.volume = e.target.value;
  });

  // ⚡ 배속 변경
  speedBtn.addEventListener("click", () => {
    if (speedOptions.style.display === "none" || speedOptions.style.display === "") {
      speedOptions.style.display = "flex"; // 🎯 드롭다운 열기
    } else {
      speedOptions.style.display = "none"; // 🎯 드롭다운 닫기
    }
  });

  document.querySelectorAll(".speed").forEach((btn) => {
    btn.addEventListener("click", () => {
      videoPlayer.playbackRate = parseFloat(btn.dataset.speed);
      speedOptions.style.display = "none"; // 🎯 선택 후 드롭다운 닫기
    });
  });

  // 📺 PIP 모드
  pipBtn.addEventListener("click", () => {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    } else {
      videoPlayer.requestPictureInPicture();
    }
  });

  // ⛶ 전체 화면
  fullscreenBtn.addEventListener("click", () => {
    if (!document.fullscreenElement) {
      videoPlayer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  // ⏳ 영상 재생 시간에 따른 프로그레스 바 업데이트
  videoPlayer.addEventListener("timeupdate", (e) => {
    const percentage = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    progressBar.value = percentage;
    progressBar.style.background =
      "linear-gradient(to right, rgb(255,0,0) 0%, rgb(255,153,0)" +
      percentage / 2 +
      "%, rgb(255,255,255)" +
      percentage +
      "%, rgb(85,85,85)" +
      percentage +
      "%)";
  });

  // ⏳ 프로그레스 바 클릭 시 비디오 재생 위치 변경
  progressBar.addEventListener("input", (e) => {
    videoPlayer.currentTime = (e.target.value / 100) * videoPlayer.duration;
    e.target.style.background =
      "linear-gradient(to right, rgb(255,0,0) 0%, rgb(255,153,0)" +
      e.target.value / 2 +
      "%, rgb(255,255,255)" +
      e.target.value +
      "%, rgb(85,85,85)" +
      e.target.value +
      "%)";
  });
}

document.addEventListener("DOMContentLoaded", initVideoPage); // DOMContentLoaded 이벤트 리스너 추가
