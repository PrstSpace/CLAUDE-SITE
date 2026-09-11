"use client";

// Фоновое видео на весь экран — уже заблюрено при экспорте (см.
// public/video/hero.*), поэтому здесь только автовоспроизведение и ровное
// затемнение поверх для читаемости текста и полей формы (без градиента в
// сплошной чёрный, чтобы видео оставалось видно по всей высоте страницы).
export function HeroVideo() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <video
        className="h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
      >
        <source src="/video/hero.webm" type="video/webm" />
        <source src="/video/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-neutral-950/20" />
    </div>
  );
}
