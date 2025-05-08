import { getVideoInfo, getChannelInfo, getVideoList } from "./getAPI.js";
import { timeAgo, formatView } from "./utils.js";
import { subscribe, unsubscribe, getSubscriptions } from "./subscription.js";
import { loadTopBar, loadSideBar, loadCustomVideo } from "./loadUI.js";
import { likeVideo, unlikeVideo, getLikedVideos, dislikeVideo, undislikeVideo, getDislikedVideos } from "./likedVideos.js";
import { cardHoverStyle } from "./cardHoverStyle.js";
import { orderVideoList } from "./videoRecommend.js";

// 최초 동영상 페이지 로드 함수
async function initVideoPage() {
  await loadTopBar(); // 상단 바 로드
  await loadSideBar(); // 사이드 바 로드
  document.querySelector("aside").classList.add("closed"); // 사이드 바 닫기

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
    const tempVideoListData = videoListData.filter((video) => video.id !== videoData.id);
    // 추천알고리즘으로 정렬후 orderedVideoListData 반환
    const orderedVideoListData = await orderVideoList(videoData.tags, tempVideoListData);
    displayVideoList(orderedVideoListData);

    // 비디오 플레이어 커스터마이징
    const videoElement = document.querySelector(".video-player");
    await loadCustomVideo(videoElement);
    document.getElementById("videoPlayer").src = `https://storage.googleapis.com/youtube-clone-video/${videoData.id}.mp4`;
    videoElement.style.visibility = "visible";
  } catch (error) {
    console.error("Error fetching API data:", error);
  }

  // 전부 로딩 완료 된 후에 비디오 페이지를 보이게 합니다.
  const videoPage = document.querySelector(".video-page");
  videoPage.style.visibility = "visible";

  // 댓글 기능 초기화
  initCommentFeature();
}

// 동영상 정보 표시
function displayVideoInfo(data) {
  const title = document.querySelector(".video-title");
  const views = document.querySelector("#view-count");
  const createdDate = document.querySelector("#created-date");
  const liked = document.querySelector("#buttonLike span");
  const disliked = document.querySelector("#buttonDislike span");
  const description = document.querySelector(".description-text");

  title.textContent = data.title;
  views.textContent = formatView(data.views);
  createdDate.textContent = timeAgo(data.created_dt);
  liked.textContent = formatView(data.likes);
  disliked.textContent = formatView(data.dislikes);
  description.textContent = data.description;

  // 태그 버튼
  const tagsContainer = document.querySelector(".video-tags");
  tagsContainer.innerHTML = "";
  data.tags.forEach((tag) => {
    const btn = document.createElement("button");
    btn.className = "tag-button";
    btn.textContent = "# " + tag;
    tagsContainer.appendChild(btn);
  });
  addTagSearchFunctionality();

  // 좋아요/싫어요 버튼 초기화
  const likeButton = document.querySelector("#buttonLike");
  const likeCount = document.querySelector("#buttonLike span");
  const dislikeButton = document.querySelector("#buttonDislike");
  const dislikeCount = document.querySelector("#buttonDislike span");

  if (likeButton) {
    const videoId = data.id;

    // 초기 좋아요 상태 확인
    const likedVideos = getLikedVideos();
    if (likedVideos.includes(videoId)) {
      likeButton.classList.add("liked");
      likeCount.textContent = formatView(data.likes + 1);
    }

    // 클릭 시 좋아요 추가/취소
    likeButton.addEventListener("click", () => {
      if (likeButton.classList.contains("liked")) {
        unlikeVideo(videoId);
        likeButton.classList.remove("liked");
        likeCount.textContent = formatView(data.likes);
      } else {
        likeVideo(videoId);
        likeButton.classList.add("liked");
        likeCount.textContent = formatView(data.likes + 1);
      }
    });
  }

  if (dislikeButton) {
    const videoId = data.id;

    // 초기 싫어요 상태 확인
    const dislikedVideos = getDislikedVideos();
    if (dislikedVideos.includes(videoId)) {
      dislikeButton.classList.add("disliked");
      dislikeCount.textContent = formatView(data.dislikes + 1);
    }

    // 클릭 시 싫어요 추가/취소
    dislikeButton.addEventListener("click", () => {
      if (dislikeButton.classList.contains("disliked")) {
        undislikeVideo(videoId);
        dislikeButton.classList.remove("disliked");
        dislikeCount.textContent = formatView(data.dislikes);
      } else {
        dislikeVideo(videoId);
        dislikeButton.classList.add("disliked");
        dislikeCount.textContent = formatView(data.dislikes + 1);
      }
    });
  }
}

// ==================== 태그 검색 기능 추가 ====================
function addTagSearchFunctionality() {
  const buttons = document.querySelectorAll(".tag-button");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const selected = btn.textContent.substring(2); // "# " 제거
      window.location.href = `/index.html?search=${encodeURIComponent(selected)}`;
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
async function displayVideoList(data) {
  const list = document.querySelector(".secondary-list");
  list.innerHTML = "";

  const currentId = parseInt(new URLSearchParams(window.location.search).get("video_id") || "1", 10);
  if (!data.length) {
    list.innerHTML = "<p>No videos available.</p>";
    return;
  }

  for (const video of data) {
    if (video.id === currentId) continue;
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
    cardHoverStyle(item);
    list.appendChild(item);
  }
}

// ==================== 댓글 기능 ====================
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

document.addEventListener("DOMContentLoaded", initVideoPage);
