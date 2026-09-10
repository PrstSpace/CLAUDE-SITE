"use client";

// Фоновое видео для чёрной хиро-шапки — уже заблюрено при экспорте (см.
// public/video/hero.*), поэтому здесь только автовоспроизведение и
// затемняющий градиент поверх для читаемости текста.
export function HeroVideo() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <video
        className="h-full w-full object-cover opacity-60"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
      >
        <source src="/video/hero.webm" type="video/webm" />
        <source src="/video/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/40 via-neutral-950/60 to-neutral-950" />
    </div>
  );
}
