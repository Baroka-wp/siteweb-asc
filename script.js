const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector(".mobile-nav");
const languageButtons = document.querySelectorAll(".language-button");
const copyElements = document.querySelectorAll("[data-copy-fr][data-copy-en]");
const modal = document.querySelector("#calendly-modal");
const modalClose = document.querySelector(".modal-close");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelector("#year").textContent = new Date().getFullYear();

function setMenu(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  mobileNav.setAttribute("aria-hidden", String(!open));
  mobileNav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
}

menuButton.addEventListener("click", () => {
  setMenu(menuButton.getAttribute("aria-expanded") !== "true");
});

mobileNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

function setLanguage(language) {
  document.documentElement.lang = language;
  copyElements.forEach((element) => {
    element.textContent = language === "en" ? element.dataset.copyEn : element.dataset.copyFr;
  });
  languageButtons.forEach((button) => {
    const active = button.dataset.language === language;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  localStorage.setItem("asc-language", language);
}

languageButtons.forEach((button) => {
  button.addEventListener("click", () => setLanguage(button.dataset.language));
});

setLanguage(localStorage.getItem("asc-language") || "fr");

document.querySelectorAll(".calendly-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => modal.showModal());
});

modalClose.addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.style.setProperty("--reveal-delay", `${entry.target.dataset.delay || 0}ms`);
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const counted = new WeakSet();
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting || counted.has(entry.target)) return;
    counted.add(entry.target);
    const target = Number(entry.target.dataset.count);
    const startedAt = performance.now();
    const duration = 1300;

    function update(now) {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      entry.target.textContent = Math.round(target * eased);
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  });
}, { threshold: 0.6 });

document.querySelectorAll("[data-count]").forEach((element) => countObserver.observe(element));

function updateOnScroll() {
  header.classList.toggle("is-scrolled", window.scrollY > 36);

  if (reduceMotion.matches) return;
  const scrollRange = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const scrollProgress = Math.min(Math.max(window.scrollY / scrollRange, 0), 1);
  const networkY = (0.5 - scrollProgress) * 140;
  const networkX = (scrollProgress - 0.5) * 36;
  document.body.style.setProperty("--network-y", `${networkY.toFixed(2)}px`);
  document.body.style.setProperty("--network-x", `${networkX.toFixed(2)}px`);

  document.querySelectorAll("[data-parallax]").forEach((container) => {
    const rect = container.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const speed = Number(container.dataset.parallax);
    const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * speed;
    container.querySelector("img").style.transform = `translateY(calc(-5% + ${offset}px))`;
  });
}

let ticking = false;
window.addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateOnScroll();
    ticking = false;
  });
}, { passive: true });

updateOnScroll();
