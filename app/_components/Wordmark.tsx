// Reproduces the PRST logo (bold "PR|ST" with a vertical divider, "space"
// tracked below) in markup rather than as an image asset — stays crisp at
// any size and can be recolored for light/dark contexts without needing a
// second exported file from the designer.

export function Wordmark({
  variant = "dark",
  size = "md",
  className = "",
}: {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const color = variant === "dark" ? "text-white" : "text-neutral-950";
  const sizes = {
    sm: { mark: "text-xl gap-1.5", tag: "text-[9px] mt-1 tracking-[0.35em]" },
    md: { mark: "text-3xl gap-2.5", tag: "text-xs mt-1.5 tracking-[0.4em]" },
    lg: { mark: "text-5xl gap-3.5", tag: "text-sm mt-2 tracking-[0.45em]" },
  }[size];

  return (
    <div className={`inline-flex flex-col items-center ${color} ${className}`}>
      <div className={`flex items-center font-bold leading-none ${sizes.mark}`}>
        <span>PR</span>
        <span className="h-[0.9em] w-px bg-current" aria-hidden="true" />
        <span>ST</span>
      </div>
      <span className={`font-normal ${sizes.tag}`}>space</span>
    </div>
  );
}
