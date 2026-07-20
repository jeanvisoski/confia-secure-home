type BrandLogoProps = {
  className?: string;
  variant?: "mark" | "full" | "lockup";
};

/** Marca bicojá: símbolo geométrico e logotipo em minúsculas conforme manual de marca. */
export function BrandLogo({ className = "", variant = "mark" }: BrandLogoProps) {
  if (variant === "lockup") {
    return <span aria-label="bicojá" className={`inline-flex shrink-0 items-center justify-center gap-[0.5em] ${className}`}><img src="/bicoja-mark.svg" alt="" aria-hidden="true" className="h-full min-h-0 w-auto max-w-[40%] object-contain" /><span className="font-display text-[0.68em] font-medium leading-none tracking-[-0.03em] text-foreground">bicojá</span></span>;
  }

  if (variant === "full") {
    return <span aria-label="bicojá" className={`inline-flex shrink-0 flex-col items-center justify-center gap-[0.14em] ${className}`}><img src="/bicoja-mark.svg" alt="" aria-hidden="true" className="min-h-0 max-h-[78%] w-auto max-w-full object-contain" /><span className="font-display text-[0.3em] font-medium leading-none tracking-[-0.03em] text-foreground">bicojá</span></span>;
  }

  return <img src="/bicoja-mark.svg" alt="bicojá" className={`shrink-0 object-contain ${className}`} />;
}
