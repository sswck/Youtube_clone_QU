function loadInitalCardUI() {
  fetch("/components/CardUI.html")
    .then((res) => res.text())
    .then((html) => {
      document.getElementById("card-ui").innerHTML = html;
    });
}

// loadInitalCardUI();
