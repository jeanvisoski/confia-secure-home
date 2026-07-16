import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Star, Check, PartyPopper } from "lucide-react";
import { PhoneFrame } from "@/components/confia/PhoneFrame";
import { AppHeader } from "@/components/confia/AppHeader";

export const Route = createFileRoute("/rate")({
  component: Rate,
  head: () => ({ meta: [{ title: "Avaliar — CONFIA" }] }),
});

function Rate() {
  const [stars, setStars] = useState(5);
  const [q, setQ] = useState<Record<string, boolean | null>>({ pontual: true, novamente: true, recomenda: true });
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <PhoneFrame>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="h-24 w-24 rounded-full bg-trust flex items-center justify-center animate-pop-in mb-6 shadow-float">
            <PartyPopper className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-extrabold font-[Manrope] mb-2">Obrigado!</h1>
          <p className="text-muted-foreground mb-8">Sua avaliação ajuda outros clientes e libera o pagamento para o prestador.</p>
          <Link to="/home" className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center shadow-card">
            Voltar para o início
          </Link>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <AppHeader title="Avaliar serviço" back="/confirm" />

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-32">
        <div className="text-center">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-sky-400 to-blue-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-3">JP</div>
          <h2 className="text-xl font-extrabold font-[Manrope]">Como foi com o João?</h2>
          <p className="text-sm text-muted-foreground">Sua opinião importa muito.</p>
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} onClick={() => setStars(n)} className="p-1 active:scale-95 transition-transform">
              <Star className={`h-11 w-11 ${n <= stars ? "fill-warn text-warn" : "text-border"}`} strokeWidth={1.5} />
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {[
            { key: "pontual", label: "Foi pontual?" },
            { key: "novamente", label: "Resolveria novamente?" },
            { key: "recomenda", label: "Recomendaria?" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border">
              <span className="text-sm font-medium">{item.label}</span>
              <div className="flex gap-2">
                {["Sim", "Não"].map((opt) => {
                  const val = opt === "Sim";
                  const active = q[item.key] === val;
                  return (
                    <button
                      key={opt}
                      onClick={() => setQ((s) => ({ ...s, [item.key]: val }))}
                      className={`h-9 px-4 rounded-full text-sm font-semibold transition-all ${active ? (val ? "bg-trust text-primary-foreground" : "bg-destructive text-destructive-foreground") : "bg-secondary text-muted-foreground"}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <textarea
          placeholder="Conte um pouco sobre a experiência (opcional)"
          className="w-full mt-4 h-28 p-4 rounded-2xl bg-card border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-background via-background to-background/0 pt-8">
        <button onClick={() => setDone(true)} className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-base font-semibold flex items-center justify-center gap-2 shadow-card active:scale-[0.99] transition-transform">
          <Check className="h-5 w-5" /> Enviar avaliação
        </button>
      </div>
    </PhoneFrame>
  );
}