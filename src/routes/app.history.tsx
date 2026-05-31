import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { classify, periodEmoji, periodLabel, statusBg } from "@/lib/glucose";
import { format, startOfDay, startOfWeek, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/history")({
  component: History,
});

type View = "day" | "week" | "month";

function History() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [view, setView] = useState<View>("day");
  const [search, setSearch] = useState("");

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
      const { data, error } = await supabase
        .from("measurements")
        .select("*")
        .order("measured_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    let list = items;
    if (search) {
      const d = new Date(search);
      if (!isNaN(d.getTime())) {
        const day = d.toDateString();
        list = list.filter((m) => new Date(m.measured_at).toDateString() === day);
      }
    }
    return list;
  }, [items, search]);

  const groups = useMemo(() => {
    const map = new Map<string, typeof filtered>();
    filtered.forEach((m) => {
      const date = new Date(m.measured_at);
      let key: string;
      if (view === "day") key = format(startOfDay(date), "yyyy-MM-dd");
      else if (view === "week") key = format(startOfWeek(date, { locale: ptBR }), "yyyy-'S'ww");
      else key = format(startOfMonth(date), "yyyy-MM");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    });
    return Array.from(map.entries());
  }, [filtered, view]);

  async function remove(id: string) {
    if (!confirm("Apagar este registro?")) return;
    const { error } = await supabase.from("measurements").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Removido");
      qc.invalidateQueries({ queryKey: ["measurements"] });
      qc.invalidateQueries({ queryKey: ["measurements-recent"] });
    }
  }

  function groupLabel(key: string, list: typeof filtered) {
    const d = new Date(list[0].measured_at);
    if (view === "day") return format(d, "EEEE, dd 'de' MMMM", { locale: ptBR });
    if (view === "week") return `Semana de ${format(startOfWeek(d, { locale: ptBR }), "dd/MM", { locale: ptBR })}`;
    return format(d, "MMMM 'de' yyyy", { locale: ptBR });
  }

  return (
    <div className="pt-6">
      <h1 className="text-2xl">Histórico 📚</h1>

      <div className="mt-4 flex rounded-full bg-muted p-1">
        {(["day", "week", "month"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`flex-1 rounded-full py-2 text-sm font-bold capitalize transition ${
              view === v ? "bg-card shadow-soft text-foreground" : "text-muted-foreground"
            }`}
          >
            {v === "day" ? "Dia" : v === "week" ? "Semana" : "Mês"}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-2xl bg-card px-3 py-2 shadow-soft">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="date"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm outline-none"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-xs font-bold text-primary">
            limpar
          </button>
        )}
      </div>

      {groups.length === 0 ? (
        <p className="mt-10 text-center text-sm text-muted-foreground">Sem registros por aqui ainda.</p>
      ) : (
        groups.map(([key, list]) => {
          const avg = Math.round(list.reduce((s, m) => s + m.glucose_value, 0) / list.length);
          return (
            <div key={key} className="mt-5">
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-sm font-extrabold capitalize">{groupLabel(key, list)}</h2>
                <span className="text-xs font-bold text-muted-foreground">
                  média {avg} mg/dL · {list.length}
                </span>
              </div>
              <div className="space-y-2">
                {list.map((m) => {
                  const s = classify(m.glucose_value, min, max);
                  return (
                    <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft">
                      <div className="text-2xl">{periodEmoji(m.period)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold">{periodLabel(m.period)}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(m.measured_at), "dd/MM HH:mm")}
                          {m.insulin_units ? ` · ${m.insulin_units}U` : ""}
                        </div>
                        {m.notes && <div className="truncate text-xs text-muted-foreground italic">"{m.notes}"</div>}
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-sm font-extrabold ${statusBg(s)}`}>
                        {m.glucose_value}
                      </span>
                      <button onClick={() => remove(m.id)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
