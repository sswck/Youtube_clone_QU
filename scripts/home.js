const API_BASE_URL = "http://techfree-oreumi-api.kro.kr:5000";
const videoGrid = document.getElementById("card-ui");

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

async function fetchVideoInfo(videoId) {
  try {
    const response = await fetch(`${API_BASE_URL}/video/getVideoInfo?video_id=${videoId}`);
    if (!response.ok) {
      console.error(`비디오 정보 가져오기 실패 (ID: ${videoId}): ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`비디오 정보 가져오기 오류 (ID: ${videoId}):`, error);
    return null;
  }
}

async function fetchChannelInfo(channelId) {
  try {
    const response = await fetch(`${API_BASE_URL}/channel/getChannelInfo?id=${channelId}`);
    if (!response.ok) {
      console.error(`채널 정보 가져오기 실패 (ID: ${channelId}): ${response.status}`);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error(`채널 정보 가져오기 오류 (ID: ${channelId}):`, error);
    return null;
  }
}

async function fetchVideoListWithChannelInfo() {
  try {
    const response = await fetch(`${API_BASE_URL}/video/getVideoList`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const videos = await response.json();
    const videosWithChannel = [];
    for (const video of videos) {
      const videoInfo = await fetchVideoInfo(video.id);
      if (videoInfo && videoInfo.channel_id) {
        const channelInfo = await fetchChannelInfo(videoInfo.channel_id);
        videosWithChannel.push({ ...video, channelInfo });
      } else {
        videosWithChannel.push(video); // 채널 정보가 없으면 기존 비디오 정보만 사용
      }
    }
    const filteredVideos = queryFilter(videosWithChannel);
    return filteredVideos;
    // return videosWithChannel;
  } catch (error) {
    console.error("비디오 목록 및 채널 정보 가져오기 실패:", error);
    if (videoGrid) {
      videoGrid.innerHTML = "<p>비디오 목록을 불러오는 데 실패했습니다.</p>";
    }
    return [];
  }
}

function createVideoCardWithChannel(video) {
  const videoUrl = `https://storage.googleapis.com/youtube-clone-video/${video.id}.mp4`;
  const thumbnailUrl = video.thumbnail || "/assets/images/thumbnail.png";
  const avatarUrl = video.channelInfo?.channel_profile || "https://randomuser.me/api/portraits/men/32.jpg";

  const createdDate = new Date(video.created_dt);
  const timeAgo = formatTimeAgo(createdDate);
  const channelName = video.channelInfo?.channel_name || "알 수 없는 채널";

  return `
    <article class="card">
      <img class="card-thumbnail" src="${thumbnailUrl}" alt="Video Thumbnail" style="width: 100%; display: block; object-fit: cover;">
      <div class="card-details">
        <img class="card-avatar" src="${avatarUrl}" alt="Channel Avatar" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
        <div class="card-data">
          <h3 class="card-title">${video.title}</h3>
          <p class="card-channel">${channelName}</p>
          <p class="card-stats">${video.views ? formatViewCount(video.views) + " views" : "조회수 정보 없음"} • ${timeAgo}</p>
        </div>
      </div>
    </article>
  `;
}

function renderVideoListWithChannel(videos) {
  if (videos && videos.length > 0) {
    const cardsHTML = videos.map(createVideoCardWithChannel).join("");
    if (videoGrid) {
      videoGrid.innerHTML = `<div class="cards-container">${cardsHTML}</div>`;
    }
  } else {
    if (videoGrid) {
      videoGrid.innerHTML = "<p>표시할 비디오가 없습니다.</p>";
    }
  }
}

function formatViewCount(views) {
  if (views >= 1000000) {
    return (views / 1000000).toFixed(1) + "M";
  } else if (views >= 1000) {
    return (views / 1000).toFixed(1) + "K";
  }
  return views;
}

function formatTimeAgo(date) {
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  let interval = Math.floor(seconds / 31536000);
  if (interval > 1) return interval + " years ago";
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) return interval + " months ago";
  interval = Math.floor(seconds / 86400);
  if (interval > 1) return interval + " days ago";
  interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hours ago";
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " minutes ago";
  return Math.floor(seconds) + " seconds ago";
}

// 즉시 API 호출 및 렌더링 시도
fetchVideoListWithChannelInfo()
  .then(renderVideoListWithChannel)
  .catch((error) => console.error("초기 데이터 로딩 실패:", error));
