(function () {
  document.addEventListener("DOMContentLoaded", function () {
    // ─── 1) 채널 정보 API 호출 ───
    var chXhr = new XMLHttpRequest();
    chXhr.open("GET", "http://techfree-oreumi-api.kro.kr:5000/channel/getChannelInfo?id=2", true);
    chXhr.onreadystatechange = function () {
      if (chXhr.readyState !== 4) return;
      if (chXhr.status === 200) {
        var ch = JSON.parse(chXhr.responseText);
        console.log("🔍 채널 API 응답:", ch);
        // 헤더 업데이트
        document.querySelector(".channel-banner img").src = ch.channel_banner;
        document.querySelector(".channel-profile .channel-avatar").src = ch.channel_profile;
        document.querySelector(".channel-name").textContent = ch.channel_name;
        document.querySelector(".subscriber-count").textContent = ch.subscribers.toLocaleString() + " subscribers";
      } else {
        console.error("채널 정보 로드 실패:", chXhr.status);
      }
    };
    chXhr.send();

    // ─── 2) 채널 비디오 리스트 API 호출 ───
    var vidXhr = new XMLHttpRequest();
    vidXhr.open("GET", "http://techfree-oreumi-api.kro.kr:5000/video/getChannelVideoList?channel_id=2", true);
    vidXhr.onreadystatechange = function () {
      if (vidXhr.readyState !== 4) return;
      if (vidXhr.status === 200) {
        var videos = JSON.parse(vidXhr.responseText);
        console.log("🔍 채널 비디오 리스트 응답:", videos);

        // .video-grid 요소 모두 선택 & 초기화
        var grids = document.querySelectorAll(".video-grid");
        grids.forEach(function (g) {
          g.innerHTML = "";
        });

        var defaultThumb = "/assets/images/thumbnail_youtube.png";
        var channelName = document.querySelector(".channel-name").textContent;

        // 각 그리드에 동일한 비디오 리스트를 뿌림
        grids.forEach(function (grid) {
          videos.forEach(function (video) {
            var card = document.createElement("div");
            card.className = "video-card";
            card.innerHTML =
              '<img class="card-thumbnail" src="' +
              defaultThumb +
              '" alt="' +
              video.title +
              '">' +
              '<div class="card-data">' +
              '<h4 class="card-title">' +
              video.title +
              "</h4>" +
              '<p class="card-channel">' +
              channelName +
              "</p>" +
              '<p class="card-stats">' +
              video.views.toLocaleString() +
              " views</p>" +
              "</div>";
            grid.appendChild(card);
          });
        });
      } else {
        console.error("채널 비디오 리스트 로드 실패:", vidXhr.status);
      }
    };
    vidXhr.send();
  });
})();
