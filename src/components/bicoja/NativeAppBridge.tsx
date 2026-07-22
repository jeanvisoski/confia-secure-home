import { useEffect } from "react";
import { App } from "@capacitor/app";
import { isNativeApp } from "@/lib/native";

/** Recebe links bicoja:// e entrega a rota para o app web. */
export function NativeAppBridge() {
  useEffect(() => {
    if (!isNativeApp()) return;

    const listener = App.addListener("appUrlOpen", ({ url }) => {
      try {
        const incoming = new URL(url);
        if (incoming.protocol !== "bicoja:") return;
        const path = `/${incoming.hostname}${incoming.pathname}`.replace(/\/{2,}/g, "/");
        window.location.assign(`${path}${incoming.search}${incoming.hash}`);
      } catch {
        // Link malformado não pode interromper a sessão do usuário.
      }
    });

    return () => {
      void listener.then((handle) => handle.remove());
    };
  }, []);

  return null;
}
