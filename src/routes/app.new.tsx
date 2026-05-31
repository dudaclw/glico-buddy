import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Leaf, NotebookPen } from "lucide-react";
import { useMemo, useState } from "react";
import { CozyCard, GlucoseStatusBadge, InsulinStepper, PeriodSelector } from "@/components/cozy";
import { insulinTypes, type PeriodId } from "@/lib/prototype-data";

export const Route = createFileRoute("/app/new")({
  component: NewMeasurement,
});

function NewMeasurement() {
  const [glucose, setGlucose] = useState("112");
  const [period, setPeriod] = useState<PeriodId>("jejum");
  const [insulinUnits, setInsulinUnits] = useState(0);
  const [insulinType, setInsulinType] = useState("Rápida");
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const glucoseValue = useMemo(() => Number(glucose), [glucose]);
  const canSave = glucoseValue >= 10 && glucoseValue <= 800;

  function save() {
    if (!canSave) return;
    setSaved(true);
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
          {canSave && (
            <div className="mb-2 shrink-0">
              <GlucoseStatusBadge value={glucoseValue} />
            </div>
          )}
        </div>
        {!canSave && (
          <p className="mt-2 text-sm font-bold text-[#9a5f21]">Digite um valor entre 10 e 800.</p>
        )}
      </CozyCard>

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
        <h2 className="text-sm font-black uppercase tracking-wide text-[#7c6242]">
          Insulina opcional
        </h2>
        <div className="mt-3">
          <InsulinStepper value={insulinUnits} onChange={setInsulinUnits} />
        </div>
        <select
          value={insulinType}
          onChange={(event) => setInsulinType(event.target.value)}
          className="mt-3 h-14 w-full rounded-2xl border-2 border-[#dcbf8b] bg-[#fffdf4] px-4 text-sm font-black text-[#4a3828] outline-none focus:border-[#A67C52]"
        >
          {insulinTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
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
