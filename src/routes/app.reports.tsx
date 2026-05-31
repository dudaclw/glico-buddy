import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { PERIODS, periodLabel } from "@/lib/glucose";
import { FileDown, Share2 } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

export const Route = createFileRoute("/app/reports")({
  component: Reports,
});

function Reports() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).single()).data,
    enabled: !!user,
  });
  const min = profile?.target_min ?? 70;
  const max = profile?.target_max ?? 180;

  const { data: items = [] } = useQuery({
    queryKey: ["measurements", user?.id],
    queryFn: async () => {
      const since = new Date(); since.setDate(since.getDate() - 30);
      const { data } = await supabase
        .from("measurements").select("*")
        .gte("measured_at", since.toISOString())
        .order("measured_at", { ascending: true });
      return data ?? [];
    },
    enabled: !!user,
  });

  const chartData = useMemo(
    () => items.map((m) => ({
      t: new Date(m.measured_at).getTime(),
      label: format(new Date(m.measured_at), "dd/MM"),
      glucose: m.glucose_value,
    })),
    [items]
  );

  function stats(days: number) {
    const cut = Date.now() - days * 86400000;
    const list = items.filter((m) => new Date(m.measured_at).getTime() >= cut);
    if (list.length === 0) return { avg: 0, count: 0, low: 0, high: 0 };
    const sum = list.reduce((s, m) => s + m.glucose_value, 0);
    return {
      avg: Math.round(sum / list.length),
      count: list.length,
      low: list.filter((m) => m.glucose_value < min).length,
      high: list.filter((m) => m.glucose_value > max).length,
    };
  }

  const s7 = stats(7), s15 = stats(15), s30 = stats(30);

  const perPeriod = PERIODS.map((p) => {
    const list = items.filter((m) => m.period === p.value);
    return {
      ...p,
      avg: list.length ? Math.round(list.reduce((s, m) => s + m.glucose_value, 0) / list.length) : null,
      count: list.length,
    };
  }).filter((p) => p.count > 0);

  function buildPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("DailyGlico — Relatório de Glicemia", 14, 18);
    doc.setFontSize(10);
    doc.text(`Paciente: ${profile?.name ?? ""}`, 14, 26);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 32);
    doc.text(`Faixa-alvo: ${min}–${max} mg/dL`, 14, 38);

    doc.setFontSize(12);
    doc.text("Resumo (últimos 7 / 15 / 30 dias)", 14, 48);
    autoTable(doc, {
      startY: 52,
      head: [["Período", "Medições", "Média", "Hipo", "Hiper"]],
      body: [
        ["7 dias", s7.count, s7.avg || "—", s7.low, s7.high],
        ["15 dias", s15.count, s15.avg || "—", s15.low, s15.high],
        ["30 dias", s30.count, s30.avg || "—", s30.low, s30.high],
      ],
    });

    autoTable(doc, {
      head: [["Data/Hora", "Período", "Glicemia", "Insulina", "Obs."]],
      body: items.slice().reverse().map((m) => [
        format(new Date(m.measured_at), "dd/MM HH:mm"),
        periodLabel(m.period),
        `${m.glucose_value} mg/dL`,
        m.insulin_units ? `${m.insulin_units}U ${m.insulin_type ?? ""}` : "—",
        m.notes ?? "",
      ]),
      styles: { fontSize: 8 },
    });

    return doc;
  }

  async function downloadPDF() {
    try {
      buildPDF().save(`dailyglico-${format(new Date(), "yyyyMMdd")}.pdf`);
    } catch (e: any) { toast.error(e.message); }
  }

  async function sharePDF() {
    try {
      const doc = buildPDF();
      const blob = doc.output("blob");
      const file = new File([blob], "dailyglico.pdf", { type: "application/pdf" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Relatório DailyGlico" });
      } else {
        downloadPDF();
      }
    } catch (e: any) { toast.error(e.message); }
  }

  return (
    <div className="pt-6">
      <h1 className="text-2xl">Relatórios 📊</h1>

      <div className="mt-4 rounded-3xl bg-card p-4 shadow-soft">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Evolução glicêmica (30 dias)
        </p>
        <div className="h-56">
          {chartData.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Sem dados ainda
            </div>
          ) : (
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="oklch(0.92 0.015 25)" strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={10} interval="preserveStartEnd" />
                <YAxis fontSize={10} domain={[40, 320]} />
                <ReferenceArea y1={min} y2={max} fill="oklch(0.72 0.16 155)" fillOpacity={0.08} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", fontSize: 12 }}
                />
                <Line type="monotone" dataKey="glucose" stroke="oklch(0.68 0.19 18)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[{ l: "7d", s: s7 }, { l: "15d", s: s15 }, { l: "30d", s: s30 }].map(({ l, s }) => (
          <div key={l} className="rounded-2xl bg-card p-3 text-center shadow-soft">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">{l}</div>
            <div className="text-2xl font-black">{s.avg || "—"}</div>
            <div className="text-[10px] text-muted-foreground">{s.count} medições</div>
            <div className="mt-1 flex justify-center gap-1.5 text-[10px] font-bold">
              <span className="text-warning">↓{s.low}</span>
              <span className="text-destructive">↑{s.high}</span>
            </div>
          </div>
        ))}
      </div>

      {perPeriod.length > 0 && (
        <div className="mt-4 rounded-3xl bg-card p-4 shadow-soft">
          <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">Média por período</p>
          <div className="space-y-2">
            {perPeriod.map((p) => (
              <div key={p.value} className="flex items-center gap-3">
                <span className="text-xl">{p.emoji}</span>
                <span className="flex-1 text-sm font-bold">{p.label}</span>
                <span className="text-xs text-muted-foreground">{p.count}×</span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-extrabold text-primary">
                  {p.avg}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button onClick={downloadPDF} className="flex items-center justify-center gap-2 rounded-2xl bg-card py-3.5 text-sm font-extrabold shadow-soft active:scale-[0.98]">
          <FileDown className="h-4 w-4" /> Baixar PDF
        </button>
        <button onClick={sharePDF} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3.5 text-sm font-extrabold text-primary-foreground shadow-cute active:scale-[0.98]">
          <Share2 className="h-4 w-4" /> Compartilhar
        </button>
      </div>
    </div>
  );
}
