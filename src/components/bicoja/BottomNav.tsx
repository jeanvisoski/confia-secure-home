import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  Search,
  ClipboardList,
  MessageCircle,
  User,
  LayoutDashboard,
  Wallet,
  Repeat,
} from "lucide-react";
import type { ComponentType } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/session-context";
import { setViewMode } from "@/lib/view-mode";

type Item = { to: string; label: string; icon: ComponentType<{ className?: string }> };

const clientItems: Item[] = [
  { to: "/home", label: "Início", icon: Home },
  { to: "/search", label: "Buscar", icon: Search },
  { to: "/orders", label: "Pedidos", icon: ClipboardList },
  { to: "/messages", label: "Mensagens", icon: MessageCircle },
  { to: "/profile", label: "Perfil", icon: User },
];

const proItems: Item[] = [
  { to: "/pro", label: "Painel", icon: LayoutDashboard },
  { to: "/pro/orders", label: "Pedidos", icon: ClipboardList },
  { to: "/pro/wallet", label: "Carteira", icon: Wallet },
  { to: "/messages", label: "Mensagens", icon: MessageCircle },
  { to: "/pro/profile", label: "Perfil", icon: User },
];

function useIsProvider(userId: string | undefined) {
  return useQuery({
    queryKey: ["is-provider", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_profiles")
        .select("profile_id")
        .eq("profile_id", userId)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function BottomNav({ variant = "client" }: { variant?: "client" | "pro" }) {
  const { session } = useSession();
  const nav = useNavigate();
  const { data: isProvider = false } = useIsProvider(session?.user.id);
  const items = variant === "pro" ? proItems : clientItems;
  const path = useRouterState({ select: (s) => s.location.pathname });

  function switchView() {
    const target = variant === "pro" ? "cliente" : "prestador";
    setViewMode(target);
    nav({ to: target === "cliente" ? "/home" : "/pro" });
  }

  return (
    <nav className="sticky bottom-0 z-40 shrink-0 bg-card/95 backdrop-blur border-t border-border">
      <div
        className={`grid ${isProvider ? "grid-cols-6" : "grid-cols-5"} px-1 pt-1.5 pb-2 safe-bottom`}
      >
        {items.map((it) => {
          const active = path === it.to || (it.to !== "/pro" && path.startsWith(it.to));
          const Icon = it.icon;
          return (
            <Link
              key={it.to}
              to={it.to}
              className="flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors"
            >
              <div
                className={`flex items-center justify-center h-9 w-14 rounded-full transition-all ${active ? "bg-primary/10" : ""}`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <span
                className={`text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                {it.label}
              </span>
            </Link>
          );
        })}
        {isProvider && (
          <button
            onClick={switchView}
            className="flex flex-col items-center gap-1 py-1.5 rounded-xl transition-colors"
          >
            <div className="flex items-center justify-center h-9 w-14 rounded-full">
              <Repeat className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-[10px] font-medium text-muted-foreground">
              {variant === "pro" ? "Cliente" : "Prestador"}
            </span>
          </button>
        )}
      </div>
    </nav>
  );
}
