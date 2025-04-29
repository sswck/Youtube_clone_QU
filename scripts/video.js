import { getVideoInfo, getChannelInfo, getVideoList } from "./getAPI.js";
import { timeAgo, formatView } from "./utils.js";
import { subscribe, unsubscribe, getSubscriptions } from "./subscription.js";
import { loadTopBar, loadSideBar } from "./loadUI.js";

/**
 * 댓글 입력창에서 Enter 키를 누르면
 * 새 댓글을 화면에 추가하고 좋아요·싫어요·삭제 기능을 위임으로 처리하는 함수
 */
function initCommentFeature() {
  const commentInput = document.querySelector(".comment-field input");
  const commentsList = document.querySelector(".comments-list");
  if (!commentInput || !commentsList) return;

  // 비디오 ID별로 다른 저장소 키 설정
  const videoID = new URLSearchParams(window.location.search).get("video_id") || "1";
  const storageKey = `comments_${videoID}`;

  // 저장된 댓글 불러오기
  let comments = JSON.parse(localStorage.getItem(storageKey)) || [];

  // 댓글 엘리먼트 생성 헬퍼
  function createCommentElement({ text, created, likes, dislikes }) {
    const el = document.createElement("div");
    el.className = "comment";
    el.dataset.created = created;
    el.innerHTML = `
      <img src="/assets/images/User-Avatar.png" alt="user avatar" class="user-avatar" />
      <div class="comment-box">
        <div class="comment-header">
          <span class="comment-name">You</span>
          <span class="comment-time">${timeAgo(created)}</span>
        </div>
        <span class="comment-text">${text}</span>
        <div class="comment-toolbar">
          <div class="comment-like">
            <img src="/assets/icons/video/Liked.svg" alt="like-this-comment" />
            <span class="comment-like-count">${likes}</span>
          </div>
          <div class="comment-dislike">
            <img src="/assets/icons/video/DisLiked.svg" alt="dislike-this-comment" />
            <span class="comment-dislike-count">${dislikes}</span>
          </div>
          <div class="comment-edit"><span>수정</span></div>
          <div class="comment-delete"><span>삭제</span></div>
        </div>
      </div>`;
    return el;
  }

  // 1. 기존 저장된 댓글 렌더링
  comments.forEach((c) => commentsList.appendChild(createCommentElement(c)));

  // 2️⃣ 새 댓글 추가 & 저장
  commentInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter" && commentInput.value.trim() !== "") {
      const text = commentInput.value.trim();
      const created = new Date().toISOString();
      const newCmt = { text, created, likes: 0, dislikes: 0 };

      comments.unshift(newCmt);
      localStorage.setItem(storageKey, JSON.stringify(comments));

      commentsList.prepend(createCommentElement(newCmt));
      commentInput.value = "";
    }
  });

  // 이벤트 위임: 좋아요·싫어요·삭제·수정
  commentsList.addEventListener("click", (event) => {
    const commentEl = event.target.closest(".comment");
    if (!commentEl) return;
    const created = commentEl.dataset.created;
    const idx = comments.findIndex((c) => c.created === created);
    if (idx === -1) return;

    // 좋아요
    if (event.target.closest(".comment-like")) {
      comments[idx].likes++;
      localStorage.setItem(storageKey, JSON.stringify(comments));
      commentEl.querySelector(".comment-like-count").textContent = comments[idx].likes;
      return;
    }

    // 싫어요
    if (event.target.closest(".comment-dislike")) {
      comments[idx].dislikes++;
      localStorage.setItem(storageKey, JSON.stringify(comments));
      commentEl.querySelector(".comment-dislike-count").textContent = comments[idx].dislikes;
      return;
    }

    // 삭제
    if (event.target.closest(".comment-delete")) {
      comments.splice(idx, 1);
      localStorage.setItem(storageKey, JSON.stringify(comments));
      commentEl.remove();
      return;
    }

    // 수정
    if (event.target.closest(".comment-edit")) {
      const textSpan = commentEl.querySelector(".comment-text");
      const original = textSpan.textContent;

      // 입력창 생성
      const textarea = document.createElement("textarea");
      textarea.className = "comment-edit-input";
      textarea.value = original;

      textSpan.replaceWith(textarea);
      textarea.focus();
      textarea.setSelectionRange(0, original.length);

      // 높이 초기화 & 자동 조절
      const resize = () => {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
      };
      textarea.addEventListener("input", resize);
      resize(); // 최초 높이 맞추기

      // 수정 완료 함수
      function finishEdit() {
        const newText = textarea.value.trim() || original;
        comments[idx].text = newText;
        localStorage.setItem(storageKey, JSON.stringify(comments));

        const span = document.createElement("span");
        span.className = "comment-text";
        span.textContent = newText;
        textarea.replaceWith(span);
      }

      // Enter 키 또는 포커스 아웃 시 수정 완료
      textarea.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          finishEdit();
        }
      });
      textarea.addEventListener("blur", finishEdit);

      return;
    }
  });
}

// 최초 동영상 페이지 로드 함수
async function initVideoPage() {
  await loadTopBar(); // 상단 바 로드
  await loadSideBar(); // 사이드 바 로드
  document.querySelector("#side-bar-container").style.display = "none";

  // video_id 쿼리 파라미터 가져오기 (기본 1)
  const videoID = new URLSearchParams(window.location.search).get("video_id") || 1;
  if (!videoID) {
    console.error("No video ID provided in the URL.");
    return;
  }

  // API 호출 및 화면에 렌더링
  try {
    const videoData = await getVideoInfo(videoID);
    displayVideoInfo(videoData);

    const channelData = await getChannelInfo(videoData.channel_id);
    displayChannelInfo(channelData);

    const videoListData = await getVideoList();
    displayVideoList(videoListData);
  } catch (error) {
    console.error("Error fetching API data:", error);
  }

  // 전부 로딩 완료 된 후에 비디오 페이지를 보이게 합니다.
  const videoPage = document.querySelector(".video-page");
  videoPage.style.visibility = "visible";

  // 댓글 기능 초기화
  initCommentFeature();

  // 비디오 플레이어 커스터마이징
  customVideoPlayer();
}

// 동영상 정보 표시
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

  // 태그 버튼
  const tagsContainer = document.querySelector(".secondary-tags");
  tagsContainer.innerHTML = `<button class="secondary-button">All</button>`;
  data.tags.forEach((tag) => {
    const btn = document.createElement("button");
    btn.className = "secondary-button";
    btn.textContent = tag;
    tagsContainer.appendChild(btn);
  });
  addTagFilterFunctionality();
}

// ==================== 태그 필터링 기능 추가 ====================
function addTagFilterFunctionality() {
  const buttons = document.querySelectorAll(".secondary-button");
  const allBtn = document.querySelector(".secondary-button:first-child");
  allBtn?.classList.add("active");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const selected = btn.textContent;
      document.querySelectorAll(".secondary-video").forEach((vid) => {
        const tags = vid.getAttribute("data-tags")?.split(",") || [];
        const show = selected === "All" || tags.includes(selected);
        vid.style.visibility = show ? "visible" : "hidden";
        vid.style.position = show ? "static" : "absolute";
      });
    });
  });
}

// ==================== 채널 정보 표시 함수 ====================
function displayChannelInfo(data) {
  document.querySelector(".channel-avatar").src = data.channel_profile;
  document.querySelector(".channel-name").textContent = data.channel_name;
  document.querySelector(".subscribers span").textContent = formatView(data.subscribers);

  // 채널 프로필 클릭 시 이동
  document.querySelector(".channel-profile")?.addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = `Channel_Page.html?channel_id=${data.id}`;
  });

  // 구독 버튼
  const subBtn = document.querySelector(".subscribe-button");
  if (subBtn) {
    const channelId = data.id;
    subBtn.addEventListener("click", () => {
      const subs = getSubscriptions();
      const isSub = subs.some((c) => c.id === channelId);
      if (isSub) {
        unsubscribe(channelId);
        subBtn.textContent = "SUBSCRIBE";
        subBtn.classList.remove("subscribed");
      } else {
        subscribe({ id: channelId, name: data.channel_name, thumbnail: data.channel_profile });
        subBtn.textContent = "SUBSCRIBED";
        subBtn.classList.add("subscribed");
      }
    });
    // 초기 상태 적용
    if (getSubscriptions().some((c) => c.id === data.id)) {
      subBtn.textContent = "SUBSCRIBED";
      subBtn.classList.add("subscribed");
    }
  }
}

// ==================== 추천 동영상 리스트 표시 ====================
function displayVideoList(data) {
  const list = document.querySelector(".secondary-list");
  list.innerHTML = "";

  const currentId = parseInt(new URLSearchParams(window.location.search).get("video_id") || "1", 10);
  if (!data.length) {
    list.innerHTML = "<p>No videos available.</p>";
    return;
  }

  data.forEach(async (video) => {
    if (video.id === currentId) return;
    const chName = (await getChannelInfo(video.channel_id)).channel_name || "Unknown";
    const item = document.createElement("div");
    item.className = "secondary-video";
    item.setAttribute("data-tags", video.tags.join(","));
    item.innerHTML = `
      <div class="secondary-thumbnail" style="background-image: url('${video.thumbnail}')">
        <span class="secondary-videoTime">--:--</span>
      </div>
      <div class="secondary-video-text">
        <span class="secondary-video-title">${video.title}</span>
        <span class="secondary-video-channel">${chName}</span>
        <span class="secondary-video-info">${formatView(video.views)} views ${timeAgo(video.created_dt)}</span>
      </div>`;
    item.addEventListener("click", () => {
      window.location.href = `/components/video.html?video_id=${video.id}`;
    });
    list.appendChild(item);
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

document.addEventListener("DOMContentLoaded", initVideoPage);
