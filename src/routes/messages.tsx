import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Search, Send, Paperclip } from "lucide-react";
import { PhoneFrame } from "@/components/confia/PhoneFrame";
import { BottomNav } from "@/components/confia/BottomNav";
import { useState } from "react";

export const Route = createFileRoute("/messages")({
  component: Messages,
  head: () => ({ meta: [{ title: "Mensagens — CONFIA" }] }),
});

const chats = [
  { name: "João Pereira", initials: "JP", tint: "from-sky-400 to-blue-600", last: "Chego em 10 min 👋", time: "14:12", unread: 2, verified: true },
  { name: "Ana Ribeiro", initials: "AR", tint: "from-violet-400 to-fuchsia-500", last: "Combinado para quinta às 9h", time: "10:30", unread: 0, verified: true },
  { name: "Marcos Silva", initials: "MS", tint: "from-amber-400 to-orange-500", last: "Obrigado pela avaliação!", time: "Ontem", unread: 0, verified: true },
];

function Messages() {
  const [open, setOpen] = useState<number | null>(0);
  if (open !== null) {
    const c = chats[open];
    return (
      <PhoneFrame>
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border px-3 h-14 flex items-center gap-3">
          <button onClick={() => setOpen(null)} className="p-2 -ml-2 rounded-full hover:bg-muted">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <div className={`h-9 w-9 rounded-full bg-gradient-to-br ${c.tint} text-white text-sm font-bold flex items-center justify-center`}>{c.initials}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-semibold truncate">{c.name}</p>
              {c.verified && <BadgeCheck className="h-4 w-4 text-trust" />}
            </div>
            <p className="text-[11px] text-trust flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-trust" /> online</p>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-secondary/40">
          <Bubble from="them">Boa tarde! Confirmando o serviço para hoje 15h.</Bubble>
          <Bubble from="me">Perfeito, estarei aqui!</Bubble>
          <Bubble from="them">Chego em 10 min 👋</Bubble>
          <div className="text-center">
            <span className="text-[10px] font-semibold text-muted-foreground bg-background rounded-full px-3 py-1 border border-border">Pagamento protegido pela CONFIA</span>
          </div>
        </div>
        <div className="p-3 border-t border-border flex items-center gap-2 bg-background">
          <button className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center">
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </button>
          <input placeholder="Mensagem" className="flex-1 h-11 rounded-full bg-secondary px-4 text-sm outline-none" />
          <button className="h-11 w-11 rounded-full bg-primary flex items-center justify-center">
            <Send className="h-4 w-4 text-primary-foreground" />
          </button>
        </div>
      </PhoneFrame>
    );
  }
  return (
    <PhoneFrame>
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-8">
          <h1 className="text-2xl font-extrabold font-[Manrope] tracking-tight mb-4">Mensagens</h1>
          <div className="flex items-center gap-3 h-12 rounded-2xl bg-secondary px-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Buscar conversas" className="flex-1 bg-transparent outline-none text-sm" />
          </div>
        </div>
        <div className="mt-3 divide-y divide-border">
          {chats.map((c, i) => (
            <button key={i} onClick={() => setOpen(i)} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-secondary/50 text-left">
              <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${c.tint} text-white font-bold flex items-center justify-center`}>{c.initials}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                  {c.verified && <BadgeCheck className="h-4 w-4 text-trust shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{c.last}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[11px] text-muted-foreground">{c.time}</span>
                {c.unread > 0 && <span className="h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center animate-pop-in">{c.unread}</span>}
              </div>
            </button>
          ))}
        </div>
      </div>
      <BottomNav />
    </PhoneFrame>
  );
}

function Bubble({ from, children }: { from: "me" | "them"; children: React.ReactNode }) {
  const me = from === "me";
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[75%] px-3.5 py-2.5 text-sm rounded-2xl shadow-card ${me ? "bg-primary text-primary-foreground rounded-br-md" : "bg-background rounded-bl-md"}`}>
        {children}
      </div>
    </div>
  );
}