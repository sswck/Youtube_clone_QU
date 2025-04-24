/**
 * @description
 *  현재 시각으로부터 시간을 계산해 얼마나 과거인지 표시
 * @param {string|Date} timestamp   Date   ,   ISO 8601
 * @return {string}
 */
function timeAgo(timestamp) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  if (minutes < 60) return `${minutes}분 전`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}주 전`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}달 전`;

  const years = Math.floor(days / 365);
  return `${years}년 전`;
}

// 예제 사용법:
// console.log(timeAgo("Sun, 20 Apr 2025 07:11:35 GMT")); // 표준 GMT 형식
// console.log(timeAgo("2025-04-20T07:11:35Z")); // ISO 8601 형식 (UTC)
// console.log(timeAgo("April 20, 2025 07:11:35")); // 일반적인 영문 날짜 형식
// console.log(timeAgo("2025/04/20 07:11:35")); // 슬래시(/)를 사용하는 날짜 형식
// console.log(timeAgo("2025-04-20 07:11:35")); // 하이픈(-)을 사용하는 날짜 형식
// console.log(timeAgo("2025-04-20T07:11:35+0900")); // 타임존이 포함된 ISO 형식 (KST)
// console.log(timeAgo("20 Apr 2025 07:11:35 GMT+0900")); // GMT+0900 형식
// console.log(timeAgo("Sun Apr 20 2025 07:11:35 GMT")); // 또 다른 GMT 형식
// console.log(timeAgo("20250420 07:11:35")); // 숫자로만 구성된 날짜 형식
// console.log(timeAgo("2025년 04월 20일 07시 11분 35초")); // 한글 형식 (파싱이 필요)

export { timeAgo };
