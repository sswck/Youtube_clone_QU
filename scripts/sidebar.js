import { renderSubscriptions } from "./subscription.js";

document.addEventListener("DOMContentLoaded", () => {
  renderSubscriptions();
});

function handleSidebarClick() {
  // Add your onclick functionality here
  alert("Sidebar item clicked");
}

function openSubscribedChannelPage() {
  // Add your onclick functionality here
  alert("Subscribed channel page opened");
}
