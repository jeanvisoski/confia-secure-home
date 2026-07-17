import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session-context";

type IncomingNotification = { title: string; body: string | null; link: string | null };

/** Entrega alertas nativos quando o navegador ou PWA estiver em execucao. */
export function BrowserNotifications() {
  const { session } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    const userId = session?.user.id;
    if (!userId) return;
    const channel = supabase
      .channel(`browser-notifications-${userId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `profile_id=eq.${userId}` }, async (payload) => {
        queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
        queryClient.invalidateQueries({ queryKey: ["notifications-unread", userId] });
        if (!("Notification" in window) || Notification.permission !== "granted") return;
        const notification = payload.new as IncomingNotification;
        const registration = await navigator.serviceWorker?.ready;
        await registration?.showNotification(notification.title || "BICOJA", {
          body: notification.body || "Voce recebeu uma atualizacao.", icon: "/bicoja-mark.png", badge: "/bicoja-mark.png",
          data: { link: notification.link || "/notifications" },
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient, session?.user.id]);

  return null;
}
