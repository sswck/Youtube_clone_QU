// channel.js
// setInterval을 사용해서 채널 페이지 로딩을 대기한 뒤 초기화 실행
(function () {
  const API_BASE = "http://techfree-oreumi-api.kro.kr:5000";

  // 채널 페이지가 로드되면 호출되는 초기화 함수
  function initChannelPage() {
    // 1) 채널 정보 API 호출
    var chXhr = new XMLHttpRequest();
    chXhr.open("GET", API_BASE + "/channel/getChannelInfo?id=2", true);
    chXhr.onreadystatechange = function () {
      if (chXhr.readyState !== 4) return;
      if (chXhr.status === 200) {
        var ch = JSON.parse(chXhr.responseText);
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

    // 2) 채널 비디오 리스트 API 호출
    var vidXhr = new XMLHttpRequest();
    vidXhr.open("GET", API_BASE + "/video/getChannelVideoList?channel_id=2", true);
    vidXhr.onreadystatechange = function () {
      if (vidXhr.readyState !== 4) return;
      if (vidXhr.status === 200) {
        var videos = JSON.parse(vidXhr.responseText);
        var grids = document.querySelectorAll(".video-grid");
        grids.forEach(function (grid) {
          grid.innerHTML = "";
        });

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
            document.querySelector(".channel-name").textContent +
            "</p>" +
            '<p class="card-stats">' +
            video.views.toLocaleString() +
            " views • " +
            timeAgo(video.created_dt) +
            "</p>" +
            "</div>";
          grids.forEach(function (grid) {
            grid.appendChild(card.cloneNode(true));
          });
        });
      } else {
        console.error("채널 비디오 리스트 로드 실패:", vidXhr.status);
      }
    };
    vidXhr.send();

    // 3) 날짜를 "n days ago" 형태로 포맷팅
    function timeAgo(iso) {
      var then = new Date(iso);
      var now = new Date();
      var diffSec = Math.floor((now - then) / 1000);
      var days = Math.floor(diffSec / 86400);
      if (days < 1) return "Today";
      if (days < 30) return days + " days ago";
      var months = Math.floor(days / 30);
      if (months < 12) return months + " months ago";
      return Math.floor(months / 12) + " years ago";
    }
  }

  // 0.1초마다 채널 페이지(.channel-page) 등장 여부 확인
  var intervalId = setInterval(function () {
    if (document.querySelector(".channel-page")) {
      clearInterval(intervalId);
      initChannelPage();
    }
  }, 100);
})();
