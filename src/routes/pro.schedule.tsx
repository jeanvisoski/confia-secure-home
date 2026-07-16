import { createFileRoute } from "@tanstack/react-router";
import { PhoneFrame } from "@/components/confia/PhoneFrame";
import { BottomNav } from "@/components/confia/BottomNav";
import { AppHeader } from "@/components/confia/AppHeader";
import { Wrench, Sparkles, Zap } from "lucide-react";

export const Route = createFileRoute("/pro/schedule")({
  component: Schedule,
  head: () => ({ meta: [{ title: "Agenda — CONFIA Pro" }] }),
});

const days = ["S", "T", "Q", "Q", "S", "S", "D"];
const week = [12, 13, 14, 15, 16, 17, 18];

const items = [
  { h: "09:00", d: "1h", icon: Sparkles, tint: "bg-violet-100 text-violet-700", t: "Faxina completa", c: "Rodrigo M." },
  { h: "11:30", d: "45min", icon: Zap, tint: "bg-amber-100 text-amber-700", t: "Troca de disjuntor", c: "Marina L." },
  { h: "15:00", d: "1h30", icon: Wrench, tint: "bg-sky-100 text-sky-700", t: "Reparo hidráulico", c: "Camila S." },
];

function Schedule() {
  return (
    <PhoneFrame>
      <AppHeader title="Agenda" back={false} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-2">
          <p className="text-xs text-muted-foreground">Novembro</p>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {week.map((n, i) => {
              const active = n === 15;
              return (
                <button key={i} className={`flex flex-col items-center py-2 rounded-2xl ${active ? "bg-primary text-primary-foreground shadow-card" : "bg-card border border-border"}`}>
                  <span className={`text-[10px] font-semibold ${active ? "opacity-80" : "text-muted-foreground"}`}>{days[i]}</span>
                  <span className="text-base font-extrabold font-[Manrope]">{n}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 mt-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Compromissos</h3>
          <div className="space-y-3">
            {items.map((it, i) => (
              <div key={i} className="flex gap-3 items-stretch">
                <div className="w-14 text-right">
                  <p className="text-sm font-extrabold font-[Manrope]">{it.h}</p>
                  <p className="text-[10px] text-muted-foreground">{it.d}</p>
                </div>
                <div className="flex-1 rounded-2xl bg-card border border-border p-3 flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${it.tint}`}><it.icon className="h-5 w-5" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{it.t}</p>
                    <p className="text-xs text-muted-foreground truncate">{it.c}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <BottomNav variant="pro" />
    </PhoneFrame>
  );
}