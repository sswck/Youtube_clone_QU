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

        // 비디오 그리드 요소 모두 선택 및 초기화
        var grids = document.querySelectorAll(".video-grid");
        grids.forEach(function (grid) {
          grid.innerHTML = "";
        });

        var channelName = document.querySelector(".channel-name").textContent;

        // 각 그리드에 동일한 비디오 리스트 삽입
        grids.forEach(function (grid) {
          videos.forEach(function (video) {
            var card = document.createElement("div");
            card.className = "video-card";
            card.innerHTML =
              '<img class="card-thumbnail" src="' +
              video.thumbnail +
              '" alt="' +
              video.title +
              '"> ' +
              '<div class="card-data">' +
              '<h4 class="card-title">' +
              video.title +
              "</h4>" +
              '<p class="card-channel">' +
              channelName +
              "</p>" +
              '<p class="card-stats">' +
              video.views.toLocaleString() +
              " views • " +
              timeAgo(video.created_dt) +
              "</p>" +
              "</div>";
            grid.appendChild(card);
          });
        });
      } else {
        console.error("채널 비디오 리스트 로드 실패:", vidXhr.status);
      }
    };
    vidXhr.send();

    // ─── 유틸 함수: ISO 날짜를 "n days ago" 형태로 변환 ───
    function timeAgo(isoString) {
      var then = new Date(isoString);
      var now = new Date();
      var diffMs = now - then;
      var diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 1) return "Today";
      if (diffDays < 30) return diffDays + " days ago";
      var diffMonths = Math.floor(diffDays / 30);
      if (diffMonths < 12) return diffMonths + " months ago";
      var diffYears = Math.floor(diffMonths / 12);
      return diffYears + " years ago";
    }
  });
})();
