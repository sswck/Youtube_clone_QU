function fetchData(endpoint, params) {
  return new Promise((resolve, reject) => {
    const url = `http://techfree-oreumi-api.kro.kr:5000/${endpoint}?${new URLSearchParams(params).toString()}`;
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);

    xhr.onload = function () {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText)); // 성공 시 데이터 반환
      } else {
        reject(new Error(`Error fetching ${endpoint}: ${xhr.statusText}`));
      }
    };

    xhr.onerror = function () {
      reject(new Error(`Network error: ${xhr.statusText}`));
    };

    xhr.send();
  });
}

async function getVideoInfo(videoID) {
  return await fetchData("video/getVideoInfo", { video_id: videoID });
}

async function getChannelInfo(channelID) {
  return await fetchData("channel/getChannelInfo", { id: channelID });
}

async function getVideoList() {
  return await fetchData("video/getVideoList", {});
}

export { getVideoInfo, getChannelInfo, getVideoList };
