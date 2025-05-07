function cardHoverStyle(container, overlay) {
  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateY = (-40 / container.offsetWidth) * x + 20;
    const rotateX = (40 / container.offsetHeight) * y - 20;
    container.style = `transform: perspective(1000px) rotateY(${rotateY}deg) rotateX(${rotateX}deg);`;
    // overlay.style = `filter: opacity(0.5); background-position: ${x - 100}px ${y - 100}px;`;
  });

  container.addEventListener("mouseleave", () => {
    // overlay.style = `filter : opacity(0);`;
    container.style = `transform: perspective(1000px) rotateY(0deg) rotateX(0deg);`;
  });
}

export { cardHoverStyle };
