import { Capacitor } from "@capacitor/core";

export function isNativeApp() {
  return Capacitor.isNativePlatform();
}

/**
 * Checkout deve abrir fora do WebView: gateways bancários e 3DS funcionam
 * melhor no navegador seguro do aparelho. A volta é tratada pelo App plugin
 * quando uma URL bicoja:// for utilizada no futuro.
 */
export async function openExternalCheckout(url: string) {
  if (!isNativeApp()) {
    window.location.assign(url);
    return;
  }
  const { Browser } = await import("@capacitor/browser");
  await Browser.open({ url, presentationStyle: "fullscreen" });
}
