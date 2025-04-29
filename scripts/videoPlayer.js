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

export default customVideoPlayer;
