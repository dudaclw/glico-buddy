import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, CheckCircle2, Clock3, Droplet, Leaf, NotebookPen } from "lucide-react";
import { useMemo, useState } from "react";
import { CozyCard, GlucoseStatusBadge, InsulinStepper, PeriodSelector } from "@/components/cozy";
import { useMeasurements } from "@/hooks/useMeasurements";
import type { PeriodId } from "@/types/measurement";
import { formatDateKey } from "@/utils/measurementCalculations";

export const Route = createFileRoute("/app/new")({
  component: NewMeasurement,
});

function NewMeasurement() {
  const now = useMemo(() => new Date(), []);
  const [date, setDate] = useState(formatDateKey(now));
  const [time, setTime] = useState(
    `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
  );
  const [glucose, setGlucose] = useState("");
  const [period, setPeriod] = useState<PeriodId>("jejum");
  const [insulinUnits, setInsulinUnits] = useState(0);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const { createMeasurement } = useMeasurements();

  const glucoseValue = useMemo(() => Number(glucose), [glucose]);
  const canSave =
    Boolean(date) &&
    Boolean(period) &&
    Boolean(glucose) &&
    Number.isFinite(glucoseValue) &&
    glucoseValue > 0 &&
    insulinUnits >= 0;

  function save() {
    if (!canSave) return;
    createMeasurement({
      date,
      time,
      period,
      glucoseValue,
      insulinUnits,
      notes,
    });
    setSaved(true);
    setGlucose("");
    setNotes("");
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className="space-y-4 pb-2 pt-2">
      <header>
        <p className="text-sm font-black uppercase tracking-wide text-[#5e8e57]">Registrar</p>
        <h1 className="text-3xl font-black text-[#4a3828]">Nova medição</h1>
        <p className="mt-1 text-sm font-bold text-[#7c6242]">
          O caminho rápido: valor, período e salvar.
        </p>
      </header>

      {saved && (
        <div className="flex items-center gap-3 rounded-[1.25rem] border-2 border-[#82cf67] bg-[#B8E986] px-4 py-3 text-[#315b25] shadow-cozy">
          <CheckCircle2 className="h-6 w-6" />
          <div>
            <p className="text-sm font-black">Registro salvo no diário</p>
            <p className="text-xs font-bold">A missão avançou mais um passo.</p>
          </div>
        </div>
      )}

      <CozyCard className="p-5">
        <label className="text-xs font-black uppercase tracking-wide text-[#7c6242]">
          Glicemia mg/dL
        </label>
        <div className="mt-2 flex items-end gap-3">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={glucose}
            onChange={(event) => setGlucose(event.target.value.replace(/\D/g, "").slice(0, 3))}
            className="w-full bg-transparent text-7xl font-black leading-none text-[#4a3828] outline-none placeholder:text-[#d8bd8d]"
            placeholder="000"
            autoFocus
          />
          {glucoseValue > 0 && (
            <div className="mb-2 shrink-0">
              <GlucoseStatusBadge value={glucoseValue} />
            </div>
          )}
        </div>
        {glucose && glucoseValue <= 0 && (
          <p className="mt-2 text-sm font-bold text-[#9a5f21]">
            Glicemia deve ser um número positivo.
          </p>
        )}
      </CozyCard>

      <div className="grid grid-cols-2 gap-3">
        <CozyCard className="p-3">
          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#7c6242]">
            <CalendarDays className="h-4 w-4" />
            Data
          </label>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="cozy-input mt-2"
          />
        </CozyCard>
        <CozyCard className="p-3">
          <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#7c6242]">
            <Clock3 className="h-4 w-4" />
            Horário
          </label>
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="cozy-input mt-2"
          />
        </CozyCard>
      </div>

      <section>
        <div className="mb-2 flex items-center gap-2">
          <Leaf className="h-5 w-5 text-[#5e8e57]" />
          <h2 className="text-sm font-black uppercase tracking-wide text-[#5e8e57]">
            Período do dia
          </h2>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </section>

      <CozyCard>
        <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#7c6242]">
          <Droplet className="h-5 w-5" />
          Insulina aplicada
        </h2>
        <div className="mt-3">
          <InsulinStepper value={insulinUnits} onChange={setInsulinUnits} />
        </div>
        <p className="mt-2 text-xs font-bold text-[#8a6b45]">
          Use zero se nenhuma unidade foi aplicada.
        </p>
      </CozyCard>

      <CozyCard>
        <label className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-[#7c6242]">
          <NotebookPen className="h-5 w-5" />
          Observações
        </label>
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={3}
          placeholder="Ex.: caminhei, comi fora, estava ansiosa..."
          className="mt-3 w-full resize-none rounded-2xl border-2 border-[#dcbf8b] bg-[#fffdf4] px-4 py-3 text-sm font-bold text-[#4a3828] outline-none placeholder:text-[#b49463] focus:border-[#A67C52]"
        />
      </CozyCard>

      <button
        type="button"
        onClick={save}
        disabled={!canSave}
        className="min-h-16 w-full rounded-[1.35rem] border-2 border-[#8b613b] bg-[#7CC576] px-5 text-lg font-black text-white shadow-cozy transition active:scale-[0.98] disabled:opacity-50"
      >
        Salvar Registro
      </button>
    </div>
  );
}
