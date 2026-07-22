import { useEffect } from "react";
import { useSession } from "@/lib/session-context";
import { supabase } from "@/lib/supabase";

/** Registra somente metadados de falhas para a equipe agir no beta. */
export function AppErrorReporter() {
  const { session } = useSession();
  useEffect(() => {
    const report = (message: string, context: Record<string, unknown>) => {
      if (!session) return;
      void supabase.from("app_error_events").insert({
        profile_id: session.user.id,
        source: "mobile",
        message: message.slice(0, 1000),
        context: { route: window.location.pathname, ...context },
      });
    };
    const onError = (event: ErrorEvent) =>
      report(event.message || "Erro não identificado", {
        filename: event.filename,
        line: event.lineno,
      });
    const onRejection = (event: PromiseRejectionEvent) =>
      report(event.reason instanceof Error ? event.reason.message : String(event.reason), {
        kind: "unhandledrejection",
      });
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, [session]);
  return null;
}
