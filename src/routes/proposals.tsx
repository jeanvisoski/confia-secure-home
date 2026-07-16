import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, BadgeCheck, Clock, MessageCircle, Filter } from "lucide-react";
import { PhoneFrame } from "@/components/confia/PhoneFrame";
import { AppHeader } from "@/components/confia/AppHeader";

export const Route = createFileRoute("/proposals")({
  component: Proposals,
  head: () => ({ meta: [{ title: "Propostas — CONFIA" }] }),
});

const proposals = [
  { name: "João Pereira", role: "Encanador", rating: 4.9, reviews: 342, jobs: 512, price: "R$ 180", eta: "40 min", initials: "JP", tint: "from-sky-400 to-blue-600", verified: true, tag: "Recomendado" },
  { name: "Rafael Costa", role: "Encanador", rating: 4.8, reviews: 198, jobs: 267, price: "R$ 210", eta: "1h 10min", initials: "RC", tint: "from-emerald-400 to-teal-600", verified: true },
  { name: "Bruno Alves", role: "Encanador", rating: 4.7, reviews: 92, jobs: 134, price: "R$ 160", eta: "2h", initials: "BA", tint: "from-orange-400 to-rose-500", verified: true },
  { name: "Diego Nunes", role: "Encanador", rating: 4.9, reviews: 421, jobs: 690, price: "R$ 240", eta: "50 min", initials: "DN", tint: "from-violet-400 to-purple-600", verified: true },
];

function Proposals() {
  return (
    <PhoneFrame>
      <AppHeader title="Propostas recebidas" subtitle="4 profissionais responderam" back="/request" right={
        <button className="h-9 w-9 rounded-full bg-card border border-border flex items-center justify-center">
          <Filter className="h-4 w-4" />
        </button>
      } />

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {proposals.map((p, idx) => (
          <div key={p.name} className="rounded-2xl bg-card border border-border shadow-card p-4 animate-float-up" style={{ animationDelay: `${idx * 60}ms` }}>
            {p.tag && (
              <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-trust bg-trust-soft rounded-full px-2 py-0.5 mb-3">
                ⭐ {p.tag}
              </div>
            )}
            <div className="flex items-start gap-3">
              <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${p.tint} flex items-center justify-center text-white font-bold text-lg shrink-0`}>
                {p.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="font-semibold truncate">{p.name}</p>
                  {p.verified && <BadgeCheck className="h-4 w-4 text-trust shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground">{p.role} • {p.jobs} serviços</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs">
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warn text-warn" /><span className="font-semibold">{p.rating}</span><span className="text-muted-foreground">({p.reviews})</span></span>
                  <span className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{p.eta}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Orçamento</p>
                <p className="text-lg font-extrabold text-foreground font-[Manrope]">{p.price}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to="/messages" className="h-11 rounded-xl border border-border bg-card font-semibold text-sm flex items-center justify-center gap-2">
                <MessageCircle className="h-4 w-4" /> Conversar
              </Link>
              <Link to="/payment" className="h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center active:scale-[0.98] transition-transform">
                Contratar
              </Link>
            </div>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}