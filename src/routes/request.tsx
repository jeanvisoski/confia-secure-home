import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Wrench, PaintRoller, Hammer, Sprout, Sparkles, Key, Home as HomeIcon, Camera, MapPin, Clock, Calendar, CalendarDays, Check, ChevronRight, ChevronLeft, Plus } from "lucide-react";
import { PhoneFrame } from "@/components/confia/PhoneFrame";
import { TrustBadge } from "@/components/confia/TrustBadge";

export const Route = createFileRoute("/request")({
  component: RequestFlow,
  head: () => ({ meta: [{ title: "Solicitar serviço — CONFIA" }] }),
});

const STEPS = ["Categoria", "Descrição", "Fotos", "Endereço", "Urgência", "Confirmar"];

const cats = [
  { icon: Zap, label: "Eletricista" },
  { icon: Wrench, label: "Encanador" },
  { icon: PaintRoller, label: "Pintor" },
  { icon: Hammer, label: "Pedreiro" },
  { icon: Sprout, label: "Jardineiro" },
  { icon: Sparkles, label: "Diarista" },
  { icon: Key, label: "Chaveiro" },
  { icon: HomeIcon, label: "Marido de aluguel" },
];

function RequestFlow() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState<string | null>("Encanador");
  const [desc, setDesc] = useState("");
  const [photos, setPhotos] = useState(0);
  const [urgency, setUrgency] = useState<string | null>("Hoje");

  const canNext =
    (step === 0 && cat) ||
    (step === 1 && desc.length > 5) ||
    step === 2 ||
    step === 3 ||
    (step === 4 && urgency) ||
    step === 5;

  const next = () => {
    if (step === STEPS.length - 1) nav({ to: "/proposals" });
    else setStep(step + 1);
  };
  const back = () => (step === 0 ? nav({ to: "/home" }) : setStep(step - 1));

  return (
    <PhoneFrame>
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2 px-4 h-14">
          <button onClick={back} className="-ml-2 p-2 rounded-full hover:bg-muted">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 text-center">
            <p className="text-xs text-muted-foreground">Passo {step + 1} de {STEPS.length}</p>
            <p className="text-sm font-semibold">{STEPS[step]}</p>
          </div>
          <div className="w-9" />
        </div>
        <div className="h-1 bg-muted mx-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-32">
        {step === 0 && (
          <div className="animate-float-up">
            <h2 className="text-2xl font-extrabold font-[Manrope] leading-tight mb-1">Qual serviço você precisa?</h2>
            <p className="text-muted-foreground mb-6 text-sm">Escolha uma categoria para começar.</p>
            <div className="grid grid-cols-2 gap-3">
              {cats.map((c) => {
                const active = cat === c.label;
                return (
                  <button
                    key={c.label}
                    onClick={() => setCat(c.label)}
                    className={`p-4 rounded-2xl border text-left transition-all ${active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border bg-card"}`}
                  >
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center mb-3 ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}>
                      <c.icon className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-sm">{c.label}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="animate-float-up">
            <h2 className="text-2xl font-extrabold font-[Manrope] leading-tight mb-1">Descreva o problema</h2>
            <p className="text-muted-foreground mb-6 text-sm">Quanto mais detalhes, melhores as propostas.</p>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Ex.: Vazamento embaixo da pia da cozinha, água pingando desde ontem."
              className="w-full h-56 p-4 rounded-2xl bg-card border border-border text-base resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-muted-foreground mt-2 text-right">{desc.length} caracteres</p>
          </div>
        )}

        {step === 2 && (
          <div className="animate-float-up">
            <h2 className="text-2xl font-extrabold font-[Manrope] leading-tight mb-1">Adicione fotos</h2>
            <p className="text-muted-foreground mb-6 text-sm">Até 10 fotos ajudam o prestador a entender.</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => setPhotos(Math.min(10, photos + 1))} className="aspect-square rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Camera className="h-6 w-6" />
                <span className="text-[11px] font-medium">Adicionar</span>
              </button>
              {Array.from({ length: photos }).map((_, i) => (
                <div key={i} className="aspect-square rounded-2xl bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                  <Camera className="h-6 w-6 text-muted-foreground" />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">{photos}/10 fotos</p>
          </div>
        )}

        {step === 3 && (
          <div className="animate-float-up">
            <h2 className="text-2xl font-extrabold font-[Manrope] leading-tight mb-1">Onde é o serviço?</h2>
            <p className="text-muted-foreground mb-6 text-sm">Só o profissional escolhido verá o endereço completo.</p>
            <div className="rounded-2xl overflow-hidden border border-border h-52 relative bg-secondary">
              <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 30% 40%, oklch(0.72 0.16 155 / 0.15), transparent 60%), radial-gradient(circle at 70% 60%, oklch(0.32 0.14 265 / 0.15), transparent 60%)" }} />
              <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(oklch(0.9 0.01 260) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0.01 260) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="h-6 w-6 rounded-full bg-primary shadow-float animate-pulse-ring" />
                <div className="mt-1 text-[10px] font-semibold bg-background rounded-full px-2 py-0.5 shadow-card">Você</div>
              </div>
            </div>
            <div className="mt-3 p-4 rounded-2xl bg-card border border-border">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">Rua das Palmeiras, 245</p>
                  <p className="text-xs text-muted-foreground">Vila Mariana • São Paulo</p>
                </div>
                <button className="text-primary text-xs font-semibold">Alterar</button>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="animate-float-up">
            <h2 className="text-2xl font-extrabold font-[Manrope] leading-tight mb-1">Qual a urgência?</h2>
            <p className="text-muted-foreground mb-6 text-sm">Isso ajuda a filtrar quem pode atender.</p>
            <div className="space-y-3">
              {[
                { label: "Hoje", desc: "Preciso agora", icon: Clock },
                { label: "Esta semana", desc: "Nos próximos dias", icon: Calendar },
                { label: "Sem pressa", desc: "Quando for possível", icon: CalendarDays },
              ].map((u) => {
                const active = urgency === u.label;
                return (
                  <button
                    key={u.label}
                    onClick={() => setUrgency(u.label)}
                    className={`w-full p-4 rounded-2xl border flex items-center gap-4 text-left transition-all ${active ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                  >
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-primary"}`}>
                      <u.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{u.label}</p>
                      <p className="text-xs text-muted-foreground">{u.desc}</p>
                    </div>
                    {active && <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center"><Check className="h-4 w-4 text-primary-foreground" /></div>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="animate-float-up">
            <h2 className="text-2xl font-extrabold font-[Manrope] leading-tight mb-1">Confirmar solicitação</h2>
            <p className="text-muted-foreground mb-6 text-sm">Revise e envie para receber orçamentos.</p>
            <div className="rounded-2xl bg-card border border-border divide-y divide-border overflow-hidden">
              <Row label="Serviço" value={cat ?? "-"} />
              <Row label="Descrição" value={desc || "Vazamento embaixo da pia da cozinha."} multi />
              <Row label="Fotos" value={`${photos} anexadas`} />
              <Row label="Endereço" value="Rua das Palmeiras, 245 — Vila Mariana" />
              <Row label="Urgência" value={urgency ?? "-"} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <TrustBadge kind="payment" />
              <TrustBadge kind="verified" />
              <TrustBadge kind="mediation" />
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-background via-background to-background/0 pt-8">
        <button
          onClick={next}
          disabled={!canNext}
          className="w-full h-14 rounded-2xl bg-primary text-primary-foreground text-base font-semibold flex items-center justify-center gap-2 shadow-card active:scale-[0.99] transition-transform disabled:opacity-40 disabled:pointer-events-none"
        >
          {step === STEPS.length - 1 ? "Solicitar orçamento" : "Continuar"}
          {step === STEPS.length - 1 ? <Check className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>
    </PhoneFrame>
  );
}

function Row({ label, value, multi }: { label: string; value: string; multi?: boolean }) {
  return (
    <div className="p-4 flex items-start gap-4">
      <span className="text-xs font-medium text-muted-foreground w-20 pt-0.5">{label}</span>
      <span className={`flex-1 text-sm font-medium ${multi ? "" : "truncate"}`}>{value}</span>
    </div>
  );
}