import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, MapPin, Bell, HelpCircle, Shield, LogOut, ChevronRight, Sparkles } from "lucide-react";
import { PhoneFrame } from "@/components/confia/PhoneFrame";
import { BottomNav } from "@/components/confia/BottomNav";
import { TrustBadge } from "@/components/confia/TrustBadge";

export const Route = createFileRoute("/profile")({
  component: Profile,
  head: () => ({ meta: [{ title: "Perfil — CONFIA" }] }),
});

function Profile() {
  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="bg-hero text-primary-foreground px-5 pt-10 pb-8 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center text-2xl font-extrabold">C</div>
            <div className="flex-1">
              <p className="text-xl font-extrabold font-[Manrope]">Camila Santos</p>
              <p className="text-sm opacity-80">camila@email.com</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <TrustBadge kind="verified" />
            <TrustBadge kind="reviews" />
          </div>
        </div>

        <div className="px-5 -mt-5">
          <Link to="/pro" className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border shadow-card">
            <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center"><Sparkles className="h-5 w-5" /></div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Tornar-se prestador</p>
              <p className="text-xs text-muted-foreground">Ofereça seus serviços na CONFIA</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>

        <div className="px-5 mt-5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-2">Conta</p>
          <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
            <Item icon={CreditCard} label="Pagamentos" desc="Cartão •••• 4291" />
            <Item icon={MapPin} label="Endereços" desc="2 salvos" />
            <Item icon={Bell} label="Notificações" />
          </div>

          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-2 mt-6">Suporte</p>
          <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
            <Item icon={HelpCircle} label="Central de ajuda" />
            <Item icon={Shield} label="Segurança e privacidade" />
          </div>

          <button className="mt-6 w-full h-13 flex items-center justify-center gap-2 rounded-2xl border border-border py-3 text-destructive font-semibold">
            <LogOut className="h-4 w-4" /> Sair da conta
          </button>
          <p className="text-[11px] text-muted-foreground text-center mt-4">CONFIA v1.0 · Feito com segurança</p>
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

function Item({ icon: Icon, label, desc }: { icon: any; label: string; desc?: string }) {
  return (
    <button className="w-full flex items-center gap-3 p-4">
      <div className="h-10 w-10 rounded-xl bg-secondary text-primary flex items-center justify-center"><Icon className="h-5 w-5" /></div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold">{label}</p>
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </button>
  );
}