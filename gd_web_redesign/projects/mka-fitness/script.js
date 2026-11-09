if (window.lucide) {
  window.lucide.createIcons();
}

document.querySelectorAll("[data-scratch-card]").forEach((card) => {
  const cover = card.querySelector(".scratch-cover");
  const canvas = cover.querySelector("canvas");
  const prize = card.querySelector(".scratch-prize");
  const status = card.querySelector(".scratch-status");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  let scratching = false;
  let revealed = false;
  let lastPoint = null;
  let scratchedDistance = 0;
  let width = 0;
  let height = 0;
  let scale = 1;

  const drawCover = () => {
    const bounds = cover.getBoundingClientRect();
    width = bounds.width;
    height = bounds.height;
    scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.fillStyle = "#1d1d1d";
    context.fillRect(0, 0, width, height);
  };

  const revealPrize = () => {
    if (revealed) return;
    revealed = true;
    card.classList.add("is-revealed");
    cover.setAttribute("aria-hidden", "true");
    cover.tabIndex = -1;
    prize.removeAttribute("aria-hidden");
    prize.tabIndex = 0;
    status.textContent = "Hai vinto un giorno gratis! Clicca sul premio per riscattarlo.";
  };

  const scratchAt = (event) => {
    const bounds = cover.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;
    context.globalCompositeOperation = "destination-out";
    context.lineWidth = 38;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    if (lastPoint) {
      scratchedDistance += Math.hypot(x - lastPoint.x, y - lastPoint.y);
      context.moveTo(lastPoint.x, lastPoint.y);
      context.lineTo(x, y);
      context.stroke();
    } else {
      context.arc(x, y, 19, 0, Math.PI * 2);
      context.fill();
    }
    lastPoint = { x, y };
  };

  const checkProgress = () => {
    if (revealed) return;
    if (scratchedDistance >= width * 1.4) {
      revealPrize();
      return;
    }
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    let visible = 0;
    let sampled = 0;
    for (let i = 3; i < pixels.length; i += 16) {
      sampled++;
      if (pixels[i] > 0) visible++;
    }
    if (sampled > 0 && visible / sampled < 0.58) revealPrize();
  };

  cover.addEventListener("pointerdown", (event) => {
    if (revealed) return;
    event.preventDefault();
    scratching = true;
    lastPoint = null;
    cover.setPointerCapture(event.pointerId);
    scratchAt(event);
  });
  cover.addEventListener("pointermove", (event) => {
    if (scratching) scratchAt(event);
  });
  const stopScratching = () => {
    if (!scratching) return;
    scratching = false;
    lastPoint = null;
    checkProgress();
  };
  cover.addEventListener("pointerup", stopScratching);
  cover.addEventListener("pointercancel", stopScratching);
  cover.addEventListener("keydown", (event) => {
    if (!revealed && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      revealPrize();
    }
  });

  drawCover();
});
