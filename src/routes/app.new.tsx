import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { PERIODS, INSULIN_TYPES, classify, statusLabel } from "@/lib/glucose";
import { Mascot } from "@/components/Mascot";

export const Route = createFileRoute("/app/new")({
  component: NewMeasurement,
});

function suggestPeriod() {
  const h = new Date().getHours();
  if (h < 6) return "madrugada";
  if (h < 9) return "jejum";
  if (h < 11) return "depois_cafe";
  if (h < 13) return "antes_almoco";
  if (h < 16) return "depois_almoco";
  if (h < 19) return "antes_jantar";
  if (h < 22) return "depois_jantar";
  return "madrugada";
}

function NewMeasurement() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [glucose, setGlucose] = useState("");
  const [period, setPeriod] = useState(suggestPeriod());
  const [insulinUnits, setInsulinUnits] = useState("");
  const [insulinType, setInsulinType] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const value = parseInt(glucose, 10);
  const status = useMemo(() => (value ? classify(value) : null), [value]);

  async function save() {
    if (!value || value < 10 || value > 800) {
      toast.error("Informe um valor de glicemia válido");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("measurements").insert({
        user_id: user!.id,
        glucose_value: value,
        period,
        insulin_units: insulinUnits ? Number(insulinUnits) : null,
        insulin_type: insulinType || null,
        notes: notes || null,
        measured_at: new Date().toISOString(),
      });
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["measurements-recent"] });
      qc.invalidateQueries({ queryKey: ["measurements"] });
      toast.success("Registrado! 🎉");
      navigate({ to: "/app" });
    } catch (e: any) {
      toast.error(e.message ?? "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pt-4">
      <button
        onClick={() => navigate({ to: "/app" })}
        className="flex items-center gap-1.5 rounded-full bg-card px-3 py-2 text-sm font-bold shadow-soft"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar
      </button>

      <div className="mt-4 flex items-center gap-3">
        <Mascot size={56} />
        <div>
          <h1 className="text-2xl">Nova medição</h1>
          <p className="text-xs text-muted-foreground">Leva menos de 10 segundos ⚡</p>
        </div>
      </div>

      {/* Glucose */}
      <div className="mt-6 rounded-3xl bg-card p-5 shadow-soft">
        <label className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Glicemia (mg/dL)
        </label>
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          autoFocus
          value={glucose}
          onChange={(e) => setGlucose(e.target.value.replace(/\D/g, "").slice(0, 3))}
          placeholder="0"
          className="mt-1 w-full bg-transparent text-6xl font-black tabular-nums outline-none placeholder:text-muted-foreground/30"
        />
        {status && (
          <div
            className={`mt-1 inline-block rounded-full border px-3 py-1 text-xs font-bold ${
              status === "low"
                ? "border-warning/30 bg-warning/15 text-warning"
                : status === "high"
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : "border-success/30 bg-success/15 text-success"
            }`}
          >
            {statusLabel(status)} {status === "low" && "— atenção!"}{" "}
            {status === "high" && "— atenção!"}
          </div>
        )}
      </div>

      {/* Period */}
      <div className="mt-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Período do dia
        </p>
        <div className="grid grid-cols-2 gap-2">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`flex items-center gap-2 rounded-2xl border-2 p-3 text-left text-sm font-bold transition ${
                period === p.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent bg-card shadow-soft"
              }`}
            >
              <span className="text-xl">{p.emoji}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Insulin */}
      <div className="mt-4 rounded-3xl bg-card p-4 shadow-soft">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Insulina (opcional)
        </p>
        <div className="flex gap-2">
          <input
            inputMode="decimal"
            value={insulinUnits}
            onChange={(e) => setInsulinUnits(e.target.value.replace(",", "."))}
            placeholder="0"
            className="w-24 rounded-xl bg-input px-3 py-3 text-center text-lg font-bold tabular-nums outline-none focus:bg-card"
          />
          <select
            value={insulinType}
            onChange={(e) => setInsulinType(e.target.value)}
            className="flex-1 rounded-xl bg-input px-3 py-3 text-sm font-bold outline-none focus:bg-card"
          >
            <option value="">Tipo de insulina</option>
            {INSULIN_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div className="mt-4 rounded-3xl bg-card p-4 shadow-soft">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Observações (opcional)
        </p>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Ex.: comi pizza, estava ansiosa..."
          className="w-full resize-none rounded-xl bg-input px-3 py-2.5 text-sm outline-none focus:bg-card"
        />
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="mt-6 w-full rounded-2xl bg-gradient-primary py-4 text-base font-extrabold text-primary-foreground shadow-cute transition active:scale-[0.98] disabled:opacity-60"
      >
        {saving ? "Salvando..." : "Salvar medição 💖"}
      </button>
    </div>
  );
}
