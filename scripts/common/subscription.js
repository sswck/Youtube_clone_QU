// ✅ 구독 추가
function subscribe(channel) {
  let subscriptions = JSON.parse(localStorage.getItem("subscriptions")) || [];

  // 이미 구독한 채널인지 확인
  if (!subscriptions.some((sub) => sub.id === channel.id)) {
    subscriptions.push(channel);
    localStorage.setItem("subscriptions", JSON.stringify(subscriptions));
  }
}

// ✅ 구독 취소
function unsubscribe(channelId) {
  let subscriptions = JSON.parse(localStorage.getItem("subscriptions")) || [];
  subscriptions = subscriptions.filter((sub) => sub.id !== channelId);
  localStorage.setItem("subscriptions", JSON.stringify(subscriptions));
}

// ✅ 구독 목록 가져오기
function getSubscriptions() {
  const subscriptions = JSON.parse(localStorage.getItem("subscriptions")) || [];
  // console.log("구독 목록:", subscriptions); // 디버깅용 로그
  return subscriptions;
}

// ✅ 사이드바에 구독 목록 반영
function renderSubscriptions() {
  const subscriptions = getSubscriptions();
  const sidebarContainer = document.querySelector("#sidebar-subscriptions"); // "SUBSCRIPTIONS" 영역
  sidebarContainer.innerHTML = '<div class="sidebar-title">SUBSCRIPTIONS</div>'; // 초기화 후 제목 추가

  // 최대 5개까지 표시
  const visibleSubscriptions = subscriptions.slice(0, 5);

  visibleSubscriptions.forEach((channel) => {
    const channelElement = document.createElement("div");
    channelElement.className = "subscribed-channel";
    channelElement.innerHTML = `
      <img src="${channel.thumbnail}" alt="Channel Thumbnail" class="channel-thumbnail" />
      <span class="side-channel-name">${channel.name}</span>
    `;
    channelElement.onclick = () => (window.location.href = `/components/channel.html?channel_id=${channel.id}`);
    if (parseInt(new URLSearchParams(window.location.search).get("channel_id")) === channel.id) channelElement.classList.add("selected"); // 현재 페이지와 일치하는 경우 강조 표시
    sidebarContainer.appendChild(channelElement);
  });

  // "Show More..." 버튼 추가 (구독 목록이 5개 이상일 경우)
  if (subscriptions.length > 5) {
    const showMoreElement = document.createElement("div");
    showMoreElement.className = "sidebar-item";
    showMoreElement.innerHTML = `
            <img src="/assets/icons/sidebar/arrowBottom.svg" alt="Item Thumbnail" class="item-thumbnail" />
            <span class="item-title">Show More...</span>
        `;
    showMoreElement.onclick = () => showAllSubscriptions(sidebarContainer);
    sidebarContainer.appendChild(showMoreElement);
  }
}

// ✅ 전체 구독 목록 표시
function showAllSubscriptions(container) {
  const subscriptions = getSubscriptions();
  container.innerHTML = '<div class="sidebar-title">SUBSCRIPTIONS</div>'; // 초기화 후 제목 추가

  subscriptions.forEach((channel) => {
    const channelElement = document.createElement("div");
    channelElement.className = "subscribed-channel";
    channelElement.innerHTML = `
            <img src="${channel.thumbnail}" alt="Channel Thumbnail" class="channel-thumbnail" />
            <span class="side-channel-name">${channel.name}</span>
        `;
    channelElement.onclick = () => (window.location.href = `/components/channel.html/?channel_id=${channel.id}`);
    container.appendChild(channelElement);
  });
}

export { subscribe, unsubscribe, getSubscriptions, renderSubscriptions };
