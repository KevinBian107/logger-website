// ── log(ger) landing — restrained, one-shot motion ──
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ── Year heatmap illustration (Analyze section) ──
// Deterministic, not random: a slow ramp-up (adopting the habit), two
// deliberate gap bands (breaks — bridged, not reset), weekday > weekend
// intensity, and a wavy cadence so it reads as lived-in rather than uniform.
document.querySelectorAll("[data-heatmap]").forEach((grid) => {
  const WEEKS = 52, DAYS = 7;
  const cells = [];
  for (let w = 0; w < WEEKS; w++) {
    for (let d = 0; d < DAYS; d++) {
      const ramp = Math.min(1, w / 6);
      const onBreak = (w >= 30 && w <= 31) || w === 47;
      const weekday = d < 5;
      let level = 0;
      if (!onBreak) {
        const wave = 0.5 + 0.5 * Math.sin(w * 0.33 + d * 0.6);
        const base = weekday ? 1 + wave * 3 : wave * 1.5;
        level = Math.round(ramp * base);
      }
      cells.push(Math.max(0, Math.min(4, level)));
    }
  }
  grid.innerHTML = cells.map((l) => `<i class="l${l}"></i>`).join("");
});

// ── Theme toggle (dark by default — see the anti-flash inline script in <head>) ──
document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    root.classList.toggle("dark", next === "dark");
    localStorage.setItem("logger-theme", next);
  });
});

// Stagger reveals within each shared parent (hero, grid, hierarchy…).
document.querySelectorAll(".reveal").forEach((el) => {
  const sibs = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
  el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 6) * 70}ms`;
});

// Count a stat from data-from (default 0) to data-to once, easing out.
function runCounter(span) {
  const from = parseFloat(span.dataset.from || "0");
  const to = parseFloat(span.dataset.to || "0");
  const suffix = span.dataset.suffix || "";
  if (reduceMotion) { span.textContent = `${to}${suffix}`; return; }
  const dur = 1100;
  const start = performance.now();
  function frame(now) {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
    span.textContent = `${Math.round(from + (to - from) * eased)}${suffix}`;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// Reveal-on-scroll for both the new (.reveal) and legacy (.fade-in) classes.
const revealer = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      entry.target.querySelectorAll?.(".counter").forEach(runCounter);
      obs.unobserve(entry.target);
    });
  },
  { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
);
document.querySelectorAll(".reveal, .fade-in").forEach((el) => revealer.observe(el));

// ── Replay buttons (re-run a tile's one-shot animation) ──
document.querySelectorAll("[data-replay]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.querySelector(btn.dataset.replay);
    if (!target) return;
    target.classList.remove("visible");
    void target.offsetWidth; // force reflow so animations restart
    target.classList.add("visible");
    target.querySelectorAll(".counter").forEach(runCounter);
  });
});

// ── Table of Contents active-link tracking (docs page sidebar) ──
const tocLinks = document.querySelectorAll("[data-toc-link]");
if (tocLinks.length) {
  const sections = [];
  tocLinks.forEach((link) => {
    const el = document.getElementById(link.getAttribute("href").slice(1));
    if (el) sections.push({ el, link });
  });
  const tocObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const match = sections.find((s) => s.el === entry.target);
        if (match && entry.isIntersecting) {
          tocLinks.forEach((l) => l.classList.remove("active"));
          match.link.classList.add("active");
        }
      });
    },
    { rootMargin: "-20% 0px -60% 0px" }
  );
  sections.forEach((s) => tocObserver.observe(s.el));
}
