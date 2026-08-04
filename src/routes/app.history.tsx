import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Filter, Save, Upload, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  CozyCard,
  GlucoseStatusBadge,
  InsulinStepper,
  MeasurementCard,
  PeriodSelector,
} from "@/components/cozy";
import { useMeasurements } from "@/hooks/useMeasurements";
import { importMeasurements } from "@/services/measurements";
import type { Measurement, MeasurementInput, PeriodId } from "@/types/measurement";
import { getMonthKey, groupMeasurementsByDate } from "@/utils/measurementCalculations";

export const Route = createFileRoute("/app/history")({
  component: History,
});

function History() {
  const [month, setMonth] = useState(getMonthKey());
  const [editing, setEditing] = useState<Measurement | null>(null);
  const { measurements, updateMeasurement, deleteMeasurement, refreshMeasurements } =
    useMeasurements();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleImportFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    let parsed: unknown;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      toast.error("Não foi possível ler o arquivo. Confira se é um JSON válido.");
      return;
    }

    const rawItems = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { measurements?: unknown })?.measurements)
        ? (parsed as { measurements: unknown[] }).measurements
        : null;

    if (!rawItems) {
      toast.error('O JSON precisa ser uma lista de medições (ou {"measurements": [...]}).');
      return;
    }

    const result = importMeasurements(rawItems);
    refreshMeasurements();

    if (result.imported === 0 && result.invalid > 0 && result.duplicates === 0) {
      toast.error(`Nenhuma medição importada — ${result.invalid} registro(s) inválido(s).`);
      return;
    }

    const parts = [`${result.imported} importada${result.imported === 1 ? "" : "s"}`];
    if (result.duplicates > 0) {
      parts.push(`${result.duplicates} duplicada${result.duplicates === 1 ? "" : "s"}`);
    }
    if (result.invalid > 0) {
      parts.push(`${result.invalid} inválida${result.invalid === 1 ? "" : "s"}`);
    }
    toast.success(parts.join(", "));
  }

  const filtered = useMemo(
    () => measurements.filter((item) => item.date.startsWith(month)),
    [measurements, month],
  );

  const groups = useMemo(() => groupMeasurementsByDate(filtered), [filtered]);

  function confirmDelete(measurement: Measurement) {
    const confirmed = window.confirm("Excluir esta medição do diário?");
    if (!confirmed) return;
    deleteMeasurement(measurement.id);
    if (editing?.id === measurement.id) setEditing(null);
  }

  return (
    <div className="space-y-4 pt-2">
      <header>
        <p className="text-sm font-black uppercase tracking-wide text-[#5e8e57]">Diário</p>
        <h1 className="text-3xl font-black text-[#4a3828]">Histórico</h1>
        <p className="mt-1 text-sm font-bold text-[#7c6242]">
          Seus registros organizados como páginas de um caderno.
        </p>
      </header>

      <CozyCard className="p-3">
        <label className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-[#7c6242]">
          <Filter className="h-4 w-4" />
          Filtrar por mês
        </label>
        <input
          type="month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          className="mt-2 h-14 w-full rounded-2xl border-2 border-[#dcbf8b] bg-[#fffdf4] px-4 text-base font-black text-[#4a3828] outline-none focus:border-[#A67C52]"
        />
      </CozyCard>

      <CozyCard variant="sky" className="p-3">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-[#255a7c]">Importar medições antigas</p>
            <p className="mt-1 text-xs font-bold text-[#6a7f91]">
              Paliativo enquanto o Supabase não entra: envie um .json com registros anteriores.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Importar arquivo JSON de medições"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 border-[#8b613b] bg-[#F7D66B] text-[#5f3f23] shadow-tile active:scale-95"
          >
            <Upload className="h-5 w-5" strokeWidth={3} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={handleImportFile}
          />
        </div>
      </CozyCard>

      {editing && (
        <EditMeasurementCard
          measurement={editing}
          onCancel={() => setEditing(null)}
          onSave={(measurement) => {
            updateMeasurement(editing.id, measurement);
            setEditing(null);
          }}
        />
      )}

      <CozyCard variant="sky" className="p-3">
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-black">
          <span className="rounded-2xl border-2 border-[#72b9ee] bg-[#A7D8FF] px-2 py-2 text-[#255a7c]">
            Hipo &lt; 70
          </span>
          <span className="rounded-2xl border-2 border-[#82cf67] bg-[#B8E986] px-2 py-2 text-[#315b25]">
            Ideal 70-180
          </span>
          <span className="rounded-2xl border-2 border-[#f1a85f] bg-[#FFC48C] px-2 py-2 text-[#75451b]">
            Alta &gt; 180
          </span>
        </div>
      </CozyCard>

      {groups.length === 0 ? (
        <CozyCard>
          <p className="text-base font-black text-[#4a3828]">Nenhuma medição registrada ainda.</p>
          <p className="mt-1 text-sm font-bold text-[#8a6b45]">
            Cadastre sua primeira glicemia para visualizar o histórico.
          </p>
        </CozyCard>
      ) : (
        groups.map(([date, list]) => (
          <section key={date} className="space-y-2">
            <div className="flex items-center gap-2 px-1 text-[#5e8e57]">
              <CalendarDays className="h-5 w-5" />
              <h2 className="text-sm font-black uppercase tracking-wide">
                {new Date(`${date}T12:00:00`).toLocaleDateString("pt-BR", {
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                })}
              </h2>
            </div>
            {list.map((measurement) => (
              <MeasurementCard
                key={measurement.id}
                measurement={measurement}
                onEdit={setEditing}
                onDelete={confirmDelete}
              />
            ))}
          </section>
        ))
      )}
    </div>
  );
}

function EditMeasurementCard({
  measurement,
  onCancel,
  onSave,
}: {
  measurement: Measurement;
  onCancel: () => void;
  onSave: (measurement: MeasurementInput) => void;
}) {
  const [date, setDate] = useState(measurement.date);
  const [time, setTime] = useState(measurement.time ?? "");
  const [period, setPeriod] = useState<PeriodId>(measurement.period);
  const [glucose, setGlucose] = useState(String(measurement.glucoseValue));
  const [insulinUnits, setInsulinUnits] = useState(measurement.insulinUnits ?? 0);
  const [notes, setNotes] = useState(measurement.notes ?? "");
  const glucoseValue = Number(glucose);
  const canSave = Boolean(date) && Boolean(period) && glucoseValue > 0 && insulinUnits >= 0;

  return (
    <CozyCard className="p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black text-[#4a3828]">Editar medição</h2>
          <p className="text-xs font-bold text-[#8a6b45]">Atualiza o mesmo registro no diário.</p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancelar edição"
          className="grid h-10 w-10 place-items-center rounded-xl border-2 border-[#dcbf8b] bg-[#fffdf4] text-[#765739]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Data">
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="cozy-input"
          />
        </Field>
        <Field label="Horário">
          <input
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            className="cozy-input"
          />
        </Field>
      </div>

      <div className="mt-3">
        <Field label="Glicemia mg/dL">
          <div className="flex items-center gap-2">
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              value={glucose}
              onChange={(event) => setGlucose(event.target.value.replace(/\D/g, "").slice(0, 3))}
              className="cozy-input"
            />
            {glucoseValue > 0 && <GlucoseStatusBadge value={glucoseValue} />}
          </div>
        </Field>
      </div>

      <div className="mt-3">
        <p className="mb-2 text-xs font-black uppercase tracking-wide text-[#7c6242]">
          Período do dia
        </p>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      <div className="mt-3">
        <Field label="Insulina">
          <InsulinStepper value={insulinUnits} onChange={setInsulinUnits} />
        </Field>
      </div>

      <div className="mt-3">
        <Field label="Observações">
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={3}
            className="cozy-input min-h-24 resize-none py-3"
          />
        </Field>
      </div>

      <button
        type="button"
        disabled={!canSave}
        onClick={() =>
          onSave({
            date,
            time,
            period,
            glucoseValue,
            insulinUnits,
            notes,
          })
        }
        className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-[1.2rem] border-2 border-[#8b613b] bg-[#7CC576] px-5 text-base font-black text-white shadow-cozy transition active:scale-[0.98] disabled:opacity-50"
      >
        <Save className="h-5 w-5" />
        Salvar alterações
      </button>
    </CozyCard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-wide text-[#7c6242]">
        {label}
      </span>
      {children}
    </label>
  );
}
