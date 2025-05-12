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
    const url = `https://www.techfree-oreumi-api.ai.kr/${endpoint}?${new URLSearchParams(params).toString()}`;
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

/**
 * @description
 * 전체 비디오 목록(채널 정보 포함)을 가져옵니다. WARNING : 로드 시 시간이 더 소요될 수 있습니다.
 * @returns {Promise<Object[]>} A promise that resolves with an array of video information data as a JSON object,
 * or rejects with an error if the request fails.
 */

async function getVideoListWithChannelInfo() {
  try {
    const videos = await getVideoList();
    const videosWithChannel = [];
    for (const video of videos) {
      const videoInfo = await getVideoInfo(video.id);
      if (videoInfo && videoInfo.channel_id) {
        const channelInfo = await getChannelInfo(videoInfo.channel_id);
        videosWithChannel.push({ ...video, channelInfo });
      } else {
        videosWithChannel.push(video); // 채널 정보가 없으면 기존 비디오 정보만 사용
      }
    }
    return videosWithChannel;
  } catch (error) {
    console.error("비디오 목록 및 채널 정보 가져오기 실패:", error);
    return [];
  }
}

/**
 * @description
 * XMLHttpRequest을 사용해서 두 단어의 관계 정보를 비동기적으로 가져오는 함수.
 * 입력 받은 두 단어를 사용하여 POST 요청을 보내고,
 * 어휘 간 거리를 응답으로 반환합니다.
 * @param {string} firstWord - 첫 번째 단어.
 * @param {string} secondWord - 두 번째 단어.
 * @returns {Promise<number|null>}
 */

async function getWordRelationship(firstWord, secondWord) {
  return new Promise((resolve, reject) => {
    const openApiURL = "https://www.techfree-oreumi-api.ai.kr/WiseWWN/WordRel";
    const access_key = "3f699673-6330-4028-8aa9-01cf78a87fb8";

    const argument = {
      first_word: firstWord,
      second_word: secondWord,
    };

    const requestJson = {
      request_id: "reserved field",
      argument: argument,
    };

    const xhr = new XMLHttpRequest();
    xhr.open("POST", openApiURL);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("Authorization", access_key);

    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (data && data.return_object) {
            const distance = data.return_object["WWN WordRelInfo"].WordRelInfo.Distance;
            resolve(distance);
          } else {
            resolve(null);
          }
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error(`HTTP error! status: ${xhr.status}`));
      }
    };

    xhr.onerror = function () {
      reject(new Error("요청에 실패했습니다."));
    };

    xhr.send(JSON.stringify(requestJson));
  });
}

export { getVideoInfo, getChannelInfo, getVideoList, getChannelVideoList, getVideoListWithChannelInfo, getWordRelationship };
