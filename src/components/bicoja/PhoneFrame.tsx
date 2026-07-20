import type { ReactNode } from "react";

/**
 * PhoneFrame constrains the app to a mobile viewport with a subtle device
 * chrome on desktop. On real phones it fills the screen.
 */
export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="h-dvh w-full bg-secondary flex items-center justify-center md:py-8">
      <div className="relative w-full max-w-[430px] h-dvh md:h-[900px] bg-background md:rounded-[42px] md:shadow-float overflow-hidden md:border md:border-border flex flex-col">
        {children}
      </div>
    </div>
  );
}
