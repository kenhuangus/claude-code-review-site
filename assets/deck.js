/* ============================================================
   How the Claude Code Team Does Code Review — Deck Navigation
   Optimized for GitHub Pages, Keyboard, Touch, Fullscreen, i18n
   Keybindings: [H] Home, [M] Mods, [D] Docs, [T] Terminal, [F] Fullscreen
   ============================================================ */
(function () {
  const slides = Array.from(document.querySelectorAll(".slide"));
  const total = slides.length;
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const count = document.getElementById("count");
  const dotsWrap = document.getElementById("dots");
  const progress = document.getElementById("progress");
  const title = document.getElementById("slideTitle");
  const slideSelect = document.getElementById("slideSelect");
  const terminalModal = document.getElementById("terminalModal");
  const closeTermBtn = document.getElementById("closeTermBtn");

  // Populate Dropdown Jumper & Dots
  slides.forEach((s, i) => {
    // Dots
    if (dotsWrap) {
      const d = document.createElement("button");
      d.className = "dot";
      d.setAttribute("aria-label", "Go to slide " + (i + 1));
      d.addEventListener("click", () => go(i));
      dotsWrap.appendChild(d);
    }

    // Select Dropdown
    if (slideSelect) {
      const opt = document.createElement("option");
      opt.value = i;
      const sTitle = s.dataset.title || `Slide ${i + 1}`;
      opt.textContent = `${i + 1}. ${sTitle}`;
      slideSelect.appendChild(opt);
    }
  });

  const dots = dotsWrap ? Array.from(dotsWrap.children) : [];
  let cur = 0;

  function clamp(i) {
    return Math.max(0, Math.min(total - 1, i));
  }

  function go(i) {
    i = clamp(i);
    slides.forEach((s, idx) => {
      s.classList.toggle("is-active", idx === i);
      s.classList.toggle("is-prev", idx < i);
    });
    dots.forEach((d, idx) => d.classList.toggle("is-on", idx === i));
    cur = i;
    if (count) count.textContent = (i + 1) + " / " + total;
    if (slideSelect) slideSelect.value = i;
    
    // Localized title
    const activeSlide = slides[i];
    const localizedTitle = (window.CLAUDE_REVIEW_I18N && window.CLAUDE_REVIEW_I18N.getSlideTitle(i)) || activeSlide.dataset.title || "";
    if (title) title.textContent = localizedTitle;

    if (progress) progress.style.width = ((i) / (total - 1) * 100) + "%";
    if (prevBtn) prevBtn.disabled = i === 0;
    if (nextBtn) nextBtn.disabled = i === total - 1;

    if (history.replaceState) {
      history.replaceState(null, "", "#" + (i + 1));
    }

    // Trigger dynamic diagram rendering if defined
    if (window.renderDiagramForSlide) {
      window.renderDiagramForSlide(i + 1);
    }
  }

  const next = () => go(cur + 1);
  const prev = () => go(cur - 1);
  if (nextBtn) nextBtn.addEventListener("click", next);
  if (prevBtn) prevBtn.addEventListener("click", prev);
  if (slideSelect) {
    slideSelect.addEventListener("change", (e) => {
      go(parseInt(e.target.value, 10));
    });
  }

  // Fullscreen support
  const fsBtn = document.getElementById("fsBtn");
  const fsLabel = fsBtn ? fsBtn.querySelector(".bar__btn-label") : null;

  function isFullscreen() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  function toggleFullscreen() {
    if (!isFullscreen()) {
      const docEl = document.documentElement;
      const rfs = docEl.requestFullscreen ||
                  docEl.webkitRequestFullscreen ||
                  docEl.mozRequestFullScreen ||
                  docEl.msRequestFullscreen;
      if (rfs) {
        const p = rfs.call(docEl);
        if (p && p.catch) p.catch(() => {});
      }
    } else {
      const efs = document.exitFullscreen ||
                  document.webkitExitFullscreen ||
                  document.mozCancelFullScreen ||
                  document.msExitFullscreen;
      if (efs) {
        const p = efs.call(document);
        if (p && p.catch) p.catch(() => {});
      }
    }
  }

  function updateFullscreenUI() {
    const inFs = isFullscreen();
    document.body.classList.toggle("is-fullscreen", inFs);
    if (fsLabel) {
      const isZh = window.CLAUDE_REVIEW_I18N && window.CLAUDE_REVIEW_I18N.isZh();
      fsLabel.textContent = inFs
        ? (isZh ? "退出全屏" : "Exit Full")
        : (isZh ? "全屏演示" : "Full Screen");
    }
  }

  if (fsBtn) fsBtn.addEventListener("click", toggleFullscreen);
  ["fullscreenchange", "webkitfullscreenchange", "mozfullscreenchange", "MSFullscreenChange"].forEach(evt => {
    document.addEventListener(evt, updateFullscreenUI);
  });

  // Terminal Modal Toggle
  function toggleTerminal() {
    if (!terminalModal) return;
    const isOpen = terminalModal.classList.contains("is-open");
    terminalModal.classList.toggle("is-open", !isOpen);
  }

  const termBtn = document.getElementById("termBtn");
  if (termBtn) termBtn.addEventListener("click", toggleTerminal);
  if (closeTermBtn) closeTermBtn.addEventListener("click", toggleTerminal);
  if (terminalModal) {
    terminalModal.addEventListener("click", (e) => {
      if (e.target === terminalModal) toggleTerminal();
    });
  }

  // Nav shortcut buttons: [H], [M], [D], [T]
  const homeBtn = document.getElementById("homeNavBtn");
  if (homeBtn) homeBtn.addEventListener("click", () => go(0));

  const modsBtn = document.getElementById("modsNavBtn");
  if (modsBtn) modsBtn.addEventListener("click", () => go(2)); // Slide 3 (Tree/Modules)

  const docsBtn = document.getElementById("docsNavBtn");
  if (docsBtn) {
    docsBtn.addEventListener("click", () => {
      window.open("https://docs.anthropic.com/en/docs/agents-and-tools/claude-code", "_blank", "noopener,noreferrer");
    });
  }

  // Keyboard navigation
  document.addEventListener("keydown", e => {
    const tag = (e.target && e.target.tagName) || "";
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

    if (e.key === "Escape") {
      if (terminalModal && terminalModal.classList.contains("is-open")) {
        toggleTerminal();
        return;
      }
    }

    if (["ArrowRight", "PageDown", " "].includes(e.key)) {
      e.preventDefault();
      next();
    } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
      e.preventDefault();
      prev();
    } else if (e.key === "Home" || e.key === "h" || e.key === "H") {
      e.preventDefault();
      go(0);
    } else if (e.key === "End") {
      e.preventDefault();
      go(total - 1);
    } else if (e.key === "m" || e.key === "M") {
      e.preventDefault();
      go(2); // Jump to Tree / Mods
    } else if (e.key === "d" || e.key === "D") {
      e.preventDefault();
      window.open("https://docs.anthropic.com/en/docs/agents-and-tools/claude-code", "_blank", "noopener,noreferrer");
    } else if (e.key === "t" || e.key === "T") {
      e.preventDefault();
      toggleTerminal();
    } else if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      toggleFullscreen();
    }
  });

  // Touch swipe support
  let x0 = null;
  document.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
  document.addEventListener("touchend", e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) {
      if (dx < 0) next(); else prev();
    }
    x0 = null;
  }, { passive: true });

  // Debounced wheel navigation
  let wheelLock = false;
  document.addEventListener("wheel", e => {
    if (wheelLock) return;
    if (Math.abs(e.deltaY) < 28 && Math.abs(e.deltaX) < 28) return;
    wheelLock = true;
    setTimeout(() => { wheelLock = false; }, 600);
    if (e.deltaY > 0 || e.deltaX > 0) next(); else prev();
  }, { passive: true });

  // Hash deep-link
  function readHash() {
    const start = parseInt((location.hash || "").replace("#", ""), 10);
    if (!isNaN(start)) {
      go(start - 1);
    } else {
      go(0);
    }
  }
  window.addEventListener("hashchange", readHash);
  readHash();

  // Language update listener
  document.addEventListener("claudereview:lang", () => {
    const localizedTitle = (window.CLAUDE_REVIEW_I18N && window.CLAUDE_REVIEW_I18N.getSlideTitle(cur)) || slides[cur].dataset.title || "";
    if (title) title.textContent = localizedTitle;
    updateFullscreenUI();
  });
})();
