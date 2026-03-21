// ── Scroll-based fade-in animations ──
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { rootMargin: "-10% 0px -10% 0px", threshold: 0.1 }
);

document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));

// ── Table of Contents active link tracking ──
const tocLinks = document.querySelectorAll("[data-toc-link]");
const sections = [];

tocLinks.forEach((link) => {
  const id = link.getAttribute("href").slice(1);
  const section = document.getElementById(id);
  if (section) sections.push({ id, el: section, link });
});

const tocObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const match = sections.find((s) => s.el === entry.target);
      if (!match) return;
      if (entry.isIntersecting) {
        tocLinks.forEach((l) => l.classList.remove("active"));
        match.link.classList.add("active");
      }
    });
  },
  { rootMargin: "-20% 0px -60% 0px" }
);

sections.forEach((s) => tocObserver.observe(s.el));
