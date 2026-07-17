type BrandLogoProps = {
  className?: string;
  variant?: "mark" | "full" | "lockup";
};

/** Marca BICOJA: o arquivo possui area transparente para nunca cortar o simbolo. */
export function BrandLogo({ className = "", variant = "mark" }: BrandLogoProps) {
  if (variant === "lockup") {
    return (
      <span aria-label="BICOJA" className={`inline-flex shrink-0 flex-col items-center justify-center gap-1 ${className}`}>
        <img src="/bicoja-mark.png" alt="" aria-hidden="true" className="min-h-0 max-h-[76%] w-auto max-w-full object-contain" />
        <span className="font-[Manrope] text-[0.63em] font-extrabold leading-none tracking-[0.04em]"><span className="text-[#102a63]">bico</span><span className="text-[#1479ff]">Já</span></span>
      </span>
    );
  }

  return (
    <img
      src="/bicoja-mark.png"
      alt="BICOJA"
      className={`shrink-0 object-contain ${className}`}
    />
  );
}
