function fetchData(endpoint, params, successCallback, errorCallback) {
  const url = `http://techfree-oreumi-api.kro.kr:5000/${endpoint}?${new URLSearchParams(params).toString()}`;
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);

    xhr.onload = function () {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (successCallback) successCallback(response); // 성공 콜백 실행
        resolve(response);
      } else {
        const error = new Error(`Error fetching ${endpoint}: ${xhr.statusText}`);
        if (errorCallback) errorCallback(error);
        reject(error);
      }
    };

    xhr.onerror = function () {
      const error = new Error(`Network error: ${xhr.statusText}`);
      if (errorCallback) errorCallback(error);
      reject(error);
    };

    xhr.send();
  });
}

/**
 * 비디오 정보 받아오기: successCallback을 정의하여 사용
 * @param {Number} videoID
 * @param {Function} successCallback
 * @returns
 */
function getVideoInfo(videoID, successCallback) {
  return fetchData("video/getVideoInfo", { video_id: videoID }, successCallback, console.error);
}

/**
 * 채널 정보 받아오기: successCallback을 정의하여 사용
 * @param {Number} channelID
 * @param {Function} successCallback
 * @returns
 */
function getChannelInfo(channelID, successCallback) {
  return fetchData("channel/getChannelInfo", { id: channelID }, successCallback, console.error);
}

/**
 * 비디오 리스트 받아오기: successCallback을 정의하여 사용
 * @param {Function} successCallback
 * @returns
 */
function getVideoList(successCallback) {
  return fetchData("video/getVideoList", {}, successCallback, console.error);
}

// 각 JS 파일에서 successCallback을 정의하여 사용
export { getVideoInfo, getChannelInfo, getVideoList };

function testAPI() {
  function showVideoData(data) {
    console.log("🎥 Video Info:", data);
  }
  function showChannelData(data) {
    console.log("📺 Channel Info:", data);
  }
  function showVideoList(data) {
    console.log("🎞 Video List:", data);
  }
  getVideoInfo("1", showVideoData);
  getChannelInfo("1", showChannelData);
  getVideoList(showVideoList);
}

// testAPI();
