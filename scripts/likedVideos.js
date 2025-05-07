// ✅ 좋아요 추가
export function likeVideo(videoId) {
  let likedVideos = JSON.parse(localStorage.getItem("likedVideos")) || [];

  if (!likedVideos.includes(videoId)) {
    likedVideos.push(videoId);
    localStorage.setItem("likedVideos", JSON.stringify(likedVideos));
  }
}

// ✅ 좋아요 취소
export function unlikeVideo(videoId) {
  let likedVideos = JSON.parse(localStorage.getItem("likedVideos")) || [];
  likedVideos = likedVideos.filter((id) => id !== videoId);
  localStorage.setItem("likedVideos", JSON.stringify(likedVideos));
}

// ✅ 좋아요 목록 가져오기
export function getLikedVideos() {
  return JSON.parse(localStorage.getItem("likedVideos")) || [];
}
