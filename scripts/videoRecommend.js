import { getWordRelationship } from "./getAPI.js";

// 지연 함수 (ms 단위)
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ==================== 추천 동영상 리스트 정렬 ====================
async function orderVideoList(currentVideoTags, data) {
  const scoredVideos = [];

  // 1. 1차 정렬: 태그 일치 개수 기준으로 점수 매기기
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

  // 2. 2차 정렬: 일치하는 태그 수가 같은 경우 API로 유사도 검사
  const groupsWithSameMatchCount = {};
  for (const scoredVideo of scoredVideos) {
    const count = scoredVideo.matchingCount;
    if (!groupsWithSameMatchCount[count]) {
      groupsWithSameMatchCount[count] = [];
    }
    groupsWithSameMatchCount[count].push(scoredVideo);
  }

  for (const count in groupsWithSameMatchCount) {
    if (groupsWithSameMatchCount[count].length > 1) {
      const videosToSort = groupsWithSameMatchCount[count];
      const scores = [];

      for (const scoredVideo of videosToSort) {
        const otherVideoTags = scoredVideo.video.tags.filter((tag) => !currentVideoTags.includes(tag));
        const currentRemainingTags = currentVideoTags.filter((tag) => !scoredVideo.video.tags.includes(tag));

        let totalSimilarity = 0;
        let comparisonCount = 0;

        if (currentRemainingTags.length > 0 && otherVideoTags.length > 0) {
          for (const currentRemainingTag of currentRemainingTags) {
            for (const otherVideoTag of otherVideoTags) {
              // API 호출 전에 딜레이 추가 (10ms이하는 연속호출제한)
              await delay(10);
              const similarity = await getWordRelationship(currentRemainingTag, otherVideoTag);
              if (typeof similarity === "number") {
                totalSimilarity += similarity;
                comparisonCount++;
              }
            }
          }
          scoredVideo.similarityScore = comparisonCount > 0 ? totalSimilarity / comparisonCount : Infinity;
        }
        scores.push(scoredVideo);
      }

      // 유사도 점수를 기준으로 해당 그룹 내 재정렬 (내림차순)
      scores.sort((a, b) => a.similarityScore - b.similarityScore);
      groupsWithSameMatchCount[count] = scores;
    }
  }

  // 최종 정렬된 리스트로 재구성
  const finalOrderedList = [];
  for (const count in groupsWithSameMatchCount) {
    finalOrderedList.push(...groupsWithSameMatchCount[count].map((item) => item.video));
  }

  return finalOrderedList;
}

export { orderVideoList };
