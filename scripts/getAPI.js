/**
 * @description
 * XMLHttpRequest을 사용해서 데이터를 가져오는 함수.
 * 입력 받은 endpoint와 params를 사용하여 GET 요청을 보내고,
 * 응답을 JSON으로 파싱하여 반환합니다.
 * @param {string} endpoint - The API endpoint to fetch data from.
 * @param {Object} params - An object representing query parameters to be appended to the request URL.
 * @returns {Promise<Object>} A promise that resolves with the response data as a JSON object,
 * or rejects with an error if the request fails.
 */

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

/**
 * @description
 * 비디오 정보를 가져옵니다.
 * @param {number} videoID - The ID of the video to retrieve.
 * @returns {Promise<Object>} A promise that resolves with the video information data as a JSON object,
 * or rejects with an error if the request fails.
 */
async function getVideoInfo(videoID) {
  return await fetchData("video/getVideoInfo", { video_id: videoID });
}

/**
 * @description
 * 채널 정보를 가져옵니다.
 * @param {number} channelID - The ID of the channel to retrieve.
 * @returns {Promise<Object>} A promise that resolves with the channel information data as a JSON object,
 * or rejects with an error if the request fails.
 */
async function getChannelInfo(channelID) {
  return await fetchData("channel/getChannelInfo", { id: channelID });
}

/**
 * @description
 * 채널에 속한 비디오 목록을 가져옵니다.
 * @param {number} channelID - The ID of the channel to retrieve the video list from.
 * @returns {Promise<Object[]>} A promise that resolves with an array of video information data as a JSON object,
 * or rejects with an error if the request fails.
 */
async function getChannelVideoList(channelID) {
  return await fetchData("video/getChannelVideoList", { channel_id: channelID });
}

/**
 * @description
 * 전체 비디오 목록을 가져옵니다.
 * @returns {Promise<Object[]>} A promise that resolves with an array of video information data as a JSON object,
 * or rejects with an error if the request fails.
 */
async function getVideoList() {
  return await fetchData("video/getVideoList", {});
}

export { getVideoInfo, getChannelInfo, getVideoList, getChannelVideoList };
