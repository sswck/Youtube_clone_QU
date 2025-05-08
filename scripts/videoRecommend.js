import { getWordRelationship } from "./getAPI.js";

const similarityCache = {};

// 지연 함수 (ms 단위)
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 캐시를 사용하여 word1 word2 단어 순서의 영향으로 API를 호출하지 않고 같은 결과를 반환
async function getWordRelationshipWithCache(word1, word2) {
  const sortedWords = [word1, word2].sort();
  const cacheKey = `${sortedWords[0]}-${sortedWords[1]}`;

  if (similarityCache[cacheKey]) {
    return similarityCache[cacheKey];
  }

  try {
    await delay(10);
    const similarity = await getWordRelationship(word1, word2); // 원래 순서대로 호출

    if (typeof similarity === "number") {
      similarityCache[cacheKey] = similarity; // 결과를 캐시에 저장
      return similarity;
    } else {
      return Infinity; // 유사도 값이 숫자가 아니면 최하위로 처리
    }
  } catch (error) {
    console.error("Error fetching word relationship:", error);
    return Infinity; // 에러 발생 시 최하위로 처리
  }
}

// ==================== 추천 동영상 리스트 정렬 ====================
async function orderVideoList(currentVideoTags, data) {
  const scoredVideos = [];

  // 1. 1차 정렬: 태그 일치 개수 기준으로
  for (const video of data) {
    let matchingTagCount = 0;
    for (const currentTag of currentVideoTags) {
      if (video.tags.includes(currentTag)) {
        matchingTagCount++;
      }
    }
    scoredVideos.push({ video, matchingCount: matchingTagCount });
  }

  // 일치하는 태그 수를 기준으로 내림차순 정렬
  scoredVideos.sort((a, b) => b.matchingCount - a.matchingCount);
  // 가장 높은 일치 개수 찾기
  const maxMatchingCount = scoredVideos.length > 0 ? --scoredVideos[0].matchingCount : 0;
  // 가장 높은 일치 개수를 가진 비디오들만 필터링 (현재 자기 자신의 영상도 포함되기 때문에 --연산 후 >= 비교로 처리)
  const topMatchingVideos = scoredVideos.filter((video) => video.matchingCount >= maxMatchingCount);

  let finalOrderedList = [];
  // 2. 2차 정렬: 일치하는 태그 수가 같은 경우 API로 유사도 검사 (가장 높은 일치 개수를 가진 비디오가 1개보다 많은 상황에만)
  if (topMatchingVideos.length > 1) {
    const scores = [];
    for (const scoredVideo of topMatchingVideos) {
      const otherVideoTags = scoredVideo.video.tags.filter((tag) => !currentVideoTags.includes(tag));
      const currentRemainingTags = currentVideoTags.filter((tag) => !scoredVideo.video.tags.includes(tag));

      let totalSimilarity = 0;
      let comparisonCount = 0;

      if (currentRemainingTags.length > 0 && otherVideoTags.length > 0) {
        for (const currentRemainingTag of currentRemainingTags) {
          for (const otherVideoTag of otherVideoTags) {
            const similarity = await getWordRelationshipWithCache(currentRemainingTag, otherVideoTag);
            if (typeof similarity === "number" && similarity !== Infinity) {
              totalSimilarity += similarity;
              comparisonCount++;
            }
          }
        }
        scoredVideo.similarityScore = comparisonCount > 0 ? totalSimilarity / comparisonCount : Infinity;
      } else {
        scoredVideo.similarityScore = Infinity; // 비교할 태그가 없으면 최하위로
      }
      scores.push(scoredVideo);
    }

    // 유사도 점수를 기준으로 오름차순 정렬 (낮을수록 유사)
    scores.sort((a, b) => a.similarityScore - b.similarityScore);
    finalOrderedList = scores.map((item) => item.video);
  } else if (topMatchingVideos.length === 1) {
    // 가장 높은 일치 개수를 가진 비디오가 1개인 경우 바로 반환
    finalOrderedList = [topMatchingVideos[0].video];
  }

  return finalOrderedList;
}

export { orderVideoList };
