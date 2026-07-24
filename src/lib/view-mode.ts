// Preferência de qual "visão" mostrar quando a mesma conta é cliente e
// prestador ao mesmo tempo. É só uma lembrança de navegação local -- não
// afeta nenhuma permissão (isso é sempre decidido no banco/RLS).
export type ViewMode = "cliente" | "prestador";

const KEY = "bicoja_view_mode";

export function getViewMode(): ViewMode | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(KEY);
  return value === "cliente" || value === "prestador" ? value : null;
}

export function setViewMode(mode: ViewMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, mode);
}
