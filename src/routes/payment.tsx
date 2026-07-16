import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Wallet, CreditCard, ChevronRight, ArrowDown, CheckCircle2, Camera } from "lucide-react";
import { PhoneFrame } from "@/components/confia/PhoneFrame";
import { AppHeader } from "@/components/confia/AppHeader";

export const Route = createFileRoute("/payment")({
  component: Payment,
  head: () => ({ meta: [{ title: "Pagamento — CONFIA" }] }),
});

function Payment() {
  return (
    <PhoneFrame>
      <AppHeader title="Pagamento" back="/proposals" />

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-32">
        <div className="rounded-3xl bg-hero p-5 text-primary-foreground shadow-float relative overflow-hidden">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest bg-white/15 rounded-full px-2.5 py-1 mb-3">
              <Lock className="h-3 w-3" /> Pagamento protegido
            </div>
            <p className="text-sm opacity-80">Total a pagar</p>
            <p className="text-4xl font-extrabold font-[Manrope] mt-1">R$ 188,50</p>
            <p className="text-xs opacity-80 mt-2">Seu dinheiro fica com a CONFIA até você confirmar.</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-card border border-border divide-y divide-border">
          <Row label="Serviço" value="R$ 180,00" />
          <Row label="Taxa CONFIA" value="R$ 8,50" hint="Cobre mediação e garantia" />
          <Row label="Total" value="R$ 188,50" bold />
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Forma de pagamento</p>
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <button className="w-full flex items-center gap-3 p-4 border-b border-border">
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center"><CreditCard className="h-5 w-5 text-primary" /></div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">Cartão •••• 4291</p>
                <p className="text-xs text-muted-foreground">Vence em 08/28</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="w-full flex items-center gap-3 p-4">
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center"><Wallet className="h-5 w-5 text-primary" /></div>
              <div className="flex-1 text-left">
                <p className="font-semibold text-sm">Pix</p>
                <p className="text-xs text-muted-foreground">Aprovação instantânea</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-trust-soft/40 p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-trust mb-4">Como funciona a garantia</p>
          <Timeline />
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-background via-background to-background/0 pt-8">
        <Link to="/tracking" className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-base font-semibold flex items-center justify-center gap-2 shadow-card active:scale-[0.99] transition-transform">
          <Lock className="h-5 w-5" /> Pagar com proteção
        </Link>
      </div>
    </PhoneFrame>
  );
}

function Row({ label, value, hint, bold }: { label: string; value: string; hint?: string; bold?: boolean }) {
  return (
    <div className="p-4 flex items-center justify-between">
      <div>
        <p className={bold ? "text-base font-bold" : "text-sm"}>{label}</p>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
      <p className={bold ? "text-lg font-extrabold font-[Manrope]" : "text-sm font-semibold"}>{value}</p>
    </div>
  );
}

function Timeline() {
  const steps = [
    { icon: Wallet, label: "Pagamento realizado" },
    { icon: CheckCircle2, label: "Prestador executa" },
    { icon: Camera, label: "Fotos enviadas" },
    { icon: CheckCircle2, label: "Cliente confirma" },
    { icon: Wallet, label: "Pagamento liberado" },
  ];
  return (
    <div className="space-y-2">
      {steps.map((s, i) => (
        <div key={i}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-background border border-border flex items-center justify-center">
              <s.icon className="h-4 w-4 text-trust" />
            </div>
            <p className="text-sm font-medium">{s.label}</p>
          </div>
          {i < steps.length - 1 && (
            <div className="ml-[17px] flex items-center h-4">
              <ArrowDown className="h-3 w-3 text-trust/50" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}