# How the Claude Code Team Does Code Review

🌐 **Live Presentation Deck:** [https://kenhuangus.github.io/claude-code-review-site/](https://kenhuangus.github.io/claude-code-review-site/)

An interactive, production-grade presentation deck analyzing how Anthropic's Claude Code team conducts code review at agentic velocity. Based on the engineering report by **Addy Osmani, Morgan Westlee Lunt, and Qing Wang** (Anthropic, Oct 15, 2026), with architecture framing and analysis by **Ken Huang, CISSP** (Adjunct Professor, University of San Francisco).

---

## Executive Summary

When AI agents author 90% of a codebase, change volume explodes by 12x (scaling from 2,500 to >30,000 daily landings in Anthropic's monorepo). Traditional line-by-line manual human code review becomes an impossible bottleneck.

This presentation walks through the six-layer defense-in-depth architecture that allowed the Claude Code team to **more than double merged pull requests** while **reducing revert rates by over 40%**.

### Key Metrics
- **90%** of Claude Code authored by Claude
- **30,000+** daily landings in Anthropic's monorepo
- **2x+** increase in merged PR velocity
- **-40%** reduction in code revert rates
- **1st-round pass rate:** increased from 65% to 78%
- **Mean review rounds:** decreased from 2.08 to 1.32

---

## Navigation & Controls

| Shortcut | Action |
|---|---|
| <kbd>H</kbd> / <kbd>Home</kbd> | Jump to Home / Title Slide |
| <kbd>M</kbd> | Jump to Modules / Executive Summary |
| <kbd>D</kbd> | Open Official Anthropic Claude Code Documentation |
| <kbd>T</kbd> | Open Interactive Review Terminal Simulator (`/code-review` & `/security-review`) |
| <kbd>F</kbd> | Toggle Fullscreen Mode |
| <kbd>→</kbd> / <kbd>Space</kbd> / <kbd>PageDown</kbd> | Next Slide |
| <kbd>←</kbd> / <kbd>PageUp</kbd> | Previous Slide |
| **Dropdown** | Jump to any slide from 1 to 16 |
| **EN / 中文** | Instant bilingual localization toggle |

---

## The 6 Defense-in-Depth Layers

1. **Pre-PR Verification (`CLAUDE.md`, `REVIEW.md`):** Developers provide runnable verification checks (tests, build, visual diffs) making output 2-3x better.
2. **Required CI Gates:** Automated typecheck, cross-platform matrix testing, and packaging.
3. **Multi-Agent AI Review:** Parallel bug hunters with independent voting verifiers and noise filters.
4. **Blocking Security Review:** Automated security pass blocks merge on open vulnerabilities or secret leakage.
5. **Risk-Based Human Approval:** Scaled strictly by blast radius (Low = 0 humans, Medium = 1 human, High = 2 humans).
6. **Merge Queue & Rollback Net:** Atomic integration against main, internal employee dogfooding, canary releases, and zero-deploy instant flag disablement.

---

## License

Created for educational and engineering research purposes.
Presentation deck architecture and framework analysis by Ken Huang, CISSP. Original engineering report © 2026 Anthropic PBC.
