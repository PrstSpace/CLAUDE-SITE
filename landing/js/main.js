// Ссылка на форму регистрации конкретного мероприятия.
// Замените на реальный адрес, когда узнаете точный slug на проде.
const REGISTRATION_URL = "https://events.prst.space/rdda-spb-2026";

document.getElementById("cta-register").href = REGISTRATION_URL;

// Фоновое видео — опционально. Если файла нет, тихо остаёмся на градиенте.
(function setupHeroVideo() {
  const video = document.getElementById("hero-video");
  const sources = ["assets/video/hero.webm", "assets/video/hero.mp4"];

  function tryNext(index) {
    if (index >= sources.length) return;
    const src = sources[index];

    fetch(src, { method: "HEAD" })
      .then((res) => {
        if (!res.ok) return tryNext(index + 1);
        video.src = src;
        video.load();
        video.addEventListener(
          "canplay",
          () => {
            video.classList.add("is-ready");
            video.play().catch(() => {});
          },
          { once: true }
        );
        video.addEventListener("error", () => tryNext(index + 1), { once: true });
      })
      .catch(() => tryNext(index + 1));
  }

  tryNext(0);
})();

// Плавное появление секций при скролле. Контент уже виден по умолчанию
// (см. style.css) — этот блок только включает анимацию поверх, и лишь
// если в браузере есть IntersectionObserver.
(function setupReveal() {
  if (!("IntersectionObserver" in window)) return;

  const items = document.querySelectorAll(".reveal");
  document.body.classList.add("js-reveal-ready");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
})();
