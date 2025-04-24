import { getVideoInfo, getChannelInfo, getVideoList } from "./getAPI.js";
import { timeAgo } from "./utils.js";

async function init() {
  const videoID = new URLSearchParams(window.location.search).get("video_id") || 1;
  if (!videoID) {
    console.error("No video ID provided in the URL.");
    return;
  }

  const videoData = await getVideoInfo(videoID); // 동영상 정보 가져오기
  if (!videoData) {
    console.error("Failed to fetch video data.");
    return;
  }
  const channelData = await getChannelInfo(videoData.channel_id); // 채널 정보 가져오기
  if (!channelData) {
    console.error("Failed to fetch channel data.");
    return;
  }
  const videoListData = await getVideoList(); // 동영상 목록 가져오기
  if (!videoListData) {
    console.error("Failed to fetch video list data.");
    return;
  }
  displayVideoInfo(videoData); // 동영상 정보 표시
  displayChannelInfo(channelData); // 채널 정보 표시
  displayVideoList(videoListData); // 동영상 목록 표시
}

function displayVideoInfo(data) {
  const video = document.querySelector(".video-player img");
  const title = document.querySelector(".video-title");
  const views = document.querySelector("#view-count");
  const createdDate = document.querySelector("#created-date");
  const liked = document.querySelector("#buttonLike span");
  const disliked = document.querySelector("#buttonDislike span");

  video.src = data.thumbnail;
  title.textContent = data.title;
  views.textContent = data.views;
  createdDate.textContent = timeAgo(data.created_dt);
  liked.textContent = data.likes;
  disliked.textContent = data.dislikes;
}

function displayChannelInfo(data) {
  const channelAvatar = document.querySelector(".channel-avatar img");
  const channelName = document.querySelector(".channel-name");
  const subscribers = document.querySelector(".subscribers span");

  channelName.textContent = data.channel_name;
  subscribers.textContent = data.subscribers;
}

function displayVideoList(data) {
  const videoList = document.querySelector(".sidebar-list");
  videoList.innerHTML = ""; // Clear existing content

  if (!data || data.length === 0) {
    videoList.innerHTML = "<p>No videos available.</p>";
    return;
  }

  data.forEach(async (video) => {
    const channelName = (await getChannelInfo(video.channel_id).then((channelData) => channelData.channel_name)) || "Unknown Channel";
    const videoItem = document.createElement("div");
    videoItem.className = "sidebar-video";
    videoItem.innerHTML = `
      <div class="sidebar-thumbnail" style="background-image: url('${video.thumbnail}');"><span class="sidebar-videoTime">23:45</span></div>
      <div class="sidebar-video-text">
        <span class="sidebar-video-title">${video.title}</span>
        <span class="sidebar-video-channel">${channelName}</span>
        <span class="sidebar-video-info">${video.views} views ${timeAgo(video.created_dt)}</span>
      </div>
      `;
    videoList.appendChild(videoItem);
  });
}

init();
