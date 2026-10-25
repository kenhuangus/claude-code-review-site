/* ============================================================
   How the Claude Code Team Does Code Review — Deck Navigation
   Optimized for GitHub Pages, Keyboard, Touch, Fullscreen, i18n
   Keybindings: [H] Home, [M] Mods, [D] Docs, [T] Terminal, [F] Fullscreen, [L] Lang
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
  const themeBtn = document.getElementById("themeBtn");
  const langBtn = document.getElementById("langBtn");
  const termInput = document.getElementById("termInput");
  const termBody = document.getElementById("termBody");

  // Populate Dropdown Jumper & Dots
  function updateDropdownTitles() {
    if (!slideSelect) return;
    slideSelect.innerHTML = "";
    slides.forEach((s, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      const sTitle = (window.CLAUDE_REVIEW_I18N && window.CLAUDE_REVIEW_I18N.getSlideTitle(i)) || s.dataset.title || `Slide ${i + 1}`;
      opt.textContent = `${i + 1}. ${sTitle}`;
      slideSelect.appendChild(opt);
    });
    slideSelect.value = cur;
  }

  slides.forEach((s, i) => {
    // Dots
    if (dotsWrap) {
      const d = document.createElement("button");
      d.className = "dot";
      d.setAttribute("aria-label", "Go to slide " + (i + 1));
      d.addEventListener("click", () => go(i));
      dotsWrap.appendChild(d);
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

    if (window.renderDiagramForSlide) {
      window.renderDiagramForSlide(i + 1);
    }
  }

  // Expose global go
  window.deckGo = go;

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

  // Theme Toggle
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isDark = document.body.classList.contains("theme-dark");
      document.body.classList.toggle("theme-dark", !isDark);
      document.body.classList.toggle("theme-light", isDark);
      localStorage.setItem("claudereview_theme", isDark ? "light" : "dark");
    });
    // Check saved theme
    const savedTheme = localStorage.getItem("claudereview_theme");
    if (savedTheme === "light") {
      document.body.classList.remove("theme-dark");
      document.body.classList.add("theme-light");
    }
  }

  // Language Button
  if (langBtn) {
    langBtn.addEventListener("click", () => {
      if (window.CLAUDE_REVIEW_I18N) {
        window.CLAUDE_REVIEW_I18N.toggleLang();
        updateDropdownTitles();
      }
    });
  }

  // Terminal Modal Toggle
  function toggleTerminal() {
    if (!terminalModal) return;
    const isOpen = terminalModal.classList.contains("is-open");
    terminalModal.classList.toggle("is-open", !isOpen);
    if (!isOpen && termInput) {
      setTimeout(() => termInput.focus(), 100);
    } else if (isOpen && termInput) {
      termInput.blur();
    }
  }

  const termBtn = document.getElementById("termBtn");
  if (termBtn) termBtn.addEventListener("click", toggleTerminal);
  if (closeTermBtn) closeTermBtn.addEventListener("click", toggleTerminal);
  if (terminalModal) {
    terminalModal.addEventListener("click", (e) => {
      if (e.target === terminalModal) toggleTerminal();
    });
  }

  // Interactive Terminal Simulator CLI
  if (termInput && termBody) {
    termInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const rawCmd = termInput.value.trim();
        if (!rawCmd) return;
        termInput.value = "";

        const cmdLine = document.createElement("div");
        cmdLine.className = "term-line";
        cmdLine.innerHTML = `<span class="term-cmd">claude&gt; ${escapeHtml(rawCmd)}</span>`;
        termBody.appendChild(cmdLine);

        const cmd = rawCmd.toLowerCase();
        const resp = document.createElement("div");
        resp.className = "term-line";

        if (cmd === "help") {
          resp.innerHTML = `
<span class="term-comment">Available Claude Code Review commands:</span><br>
  <strong>/code-review</strong>         Run multi-agent parallel review with consensus voting<br>
  <strong>/security-review</strong>     Execute AST semantic SAST & credential vulnerability audit<br>
  <strong>cat CLAUDE.md</strong>        Inspect global repository conventions & non-goals<br>
  <strong>cat REVIEW.md</strong>        View subsystem failure definitions ('it lies', 'it misroutes')<br>
  <strong>eval</strong>                 Display daily incident-to-eval regression benchmark metrics<br>
  <strong>status</strong>               Show monorepo landing volume & current revert rate guardrail<br>
  <strong>clear</strong>                Clear the terminal log history
`;
        } else if (cmd === "/code-review" || cmd.startsWith("/code-review")) {
          resp.innerHTML = `
<span class="term-pass">✓</span> Loaded CLAUDE.md conventions & REVIEW.md owner guidelines<br>
<span class="term-pass">✓</span> Spawned 3 parallel bug-hunting agents in fresh context<br>
<span class="term-pass">✓</span> Consensus verifier ensemble validated 5 candidate findings<br>
<span class="term-warn">!</span> Suppressed 3 stylistic nits via empirical A/B noise filters<br>
<strong>Active Findings:</strong><br>
  <span class="term-badge term-badge--important">Important</span> src/auth/token.ts:58 — Race condition in refresh lock<br>
  <span class="term-badge term-badge--pre">Pre-existing</span> src/network/retry.ts:112 — Unbounded exponential backoff<br>
<span class="term-cmd">Risk Classifier:</span> <span class="term-block">HIGH RISK (Auth Path)</span> ➔ <strong>2 Human Approvals Required</strong>
`;
        } else if (cmd === "/security-review") {
          resp.innerHTML = `
<span class="term-pass">✓</span> Executed automated security scan pass across 18 changed files<br>
<span class="term-pass">✓</span> Zero hardcoded secrets, API tokens, or unsafe subprocess calls detected<br>
<span class="term-pass">✓</span> Security review gate: <strong style="color:#10b981;">PASSED (Ready for Merge Queue)</strong>
`;
        } else if (cmd === "cat claude.md") {
          resp.innerHTML = `
<span class="term-comment"># CLAUDE.md (Anthropic Claude Code Conventions)</span><br>
• Stack: TypeScript, Node.js, Rust native core<br>
• Principle: 90% agent-authored; all changes must execute automated verification<br>
• Rule: Zero metaphors in documentation; runnable verification required before PR creation<br>
• Guardrail: Reverts and incidents must remain flat as volume expands
`;
        } else if (cmd === "cat review.md") {
          resp.innerHTML = `
<span class="term-comment"># REVIEW.md (Subsystem Failure Definitions)</span><br>
• For Docs: Failure means "it lies" or contradicts CLI flag output<br>
• For Routing: Failure means "it misroutes" or swallows cancellation signals<br>
• Reviewer Constraint: Cap nits at 2; demand exact file & line evidence; suppress repeat findings
`;
        } else if (cmd === "eval") {
          resp.innerHTML = `
<span class="term-comment"># Daily Regression Eval Suite (FIG C)</span><br>
• Test cases: 142 historical incident PRs & expert-verified reverts<br>
• Today's Score: 94.8% bug recall (+2.3% over baseline)<br>
• Status: Reviewer prompt changes accepted and merged into production pipeline
`;
        } else if (cmd === "status") {
          resp.innerHTML = `
<span class="term-comment"># Anthropic Monorepo Velocity & Safety Status</span><br>
• Daily PR Landings: 31,420 / day (Leap from 2,500 in May)<br>
• Merged PR Velocity: +114% vs June baseline<br>
• Revert Rate: -41.2% (Guardrail healthy)<br>
• 1-Round Pass Rate: 78.4% (Convergence engineering active)
`;
        } else if (cmd === "clear") {
          termBody.innerHTML = "";
          return;
        } else {
          resp.innerHTML = `<span class="term-warn">Command not recognized: '${escapeHtml(rawCmd)}'. Type 'help' for available commands.</span>`;
        }

        termBody.appendChild(resp);
        termBody.scrollTop = termBody.scrollHeight;
      }
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
    if (e.key === "Escape") {
      if (terminalModal && terminalModal.classList.contains("is-open")) {
        toggleTerminal();
        return;
      }
    }

    const tag = (e.target && e.target.tagName) || "";
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

    if (false) {
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
    } else if (e.key === "l" || e.key === "L") {
      e.preventDefault();
      if (window.CLAUDE_REVIEW_I18N) {
        window.CLAUDE_REVIEW_I18N.toggleLang();
        updateDropdownTitles();
      }
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
  updateDropdownTitles();

  // Language update listener
  document.addEventListener("claudereview:lang", () => {
    const localizedTitle = (window.CLAUDE_REVIEW_I18N && window.CLAUDE_REVIEW_I18N.getSlideTitle(cur)) || slides[cur].dataset.title || "";
    if (title) title.textContent = localizedTitle;
    updateFullscreenUI();
    updateDropdownTitles();
  });
})();
