type BrandLogoProps = {
  className?: string;
  variant?: "mark" | "full" | "lockup";
};

/** Marca bicojá: símbolo geométrico e logotipo em minúsculas conforme manual de marca. */
export function BrandLogo({ className = "", variant = "mark" }: BrandLogoProps) {
  if (variant === "lockup") {
    return <span aria-label="bicojá" className={`inline-flex shrink-0 items-center justify-center gap-3 ${className}`}><img src="/bicoja-mark.svg" alt="" aria-hidden="true" className="h-[min(72%,5rem)] min-h-0 w-auto max-w-[48%] object-contain" /><span className="font-display text-xl font-medium leading-none tracking-[-0.04em] text-foreground sm:text-2xl">bicojá</span></span>;
  }

  if (variant === "full") {
    return <span aria-label="bicojá" className={`inline-flex shrink-0 flex-col items-center justify-center gap-1 ${className}`}><img src="/bicoja-mark.svg" alt="" aria-hidden="true" className="min-h-0 max-h-[78%] w-auto max-w-full object-contain" /><span className="font-display text-xs font-medium leading-none tracking-[-0.03em] text-foreground">bicojá</span></span>;
  }

  return <img src="/bicoja-mark.svg" alt="bicojá" className={`shrink-0 object-contain ${className}`} />;
}
