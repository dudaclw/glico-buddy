import type { ReactNode } from "react";
import {
  Bed,
  Coffee,
  Edit3,
  HelpCircle,
  Moon,
  Plus,
  Trash2,
  Soup,
  Star,
  Sun,
  Sunrise,
  Sunset,
  Utensils,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getPeriodLabel,
  periods,
  TARGET_MAX,
  TARGET_MIN,
  type Measurement,
  type PeriodId,
} from "@/types/measurement";

type GlucoseStatus = "low" | "ideal" | "high";

const periodIcons: Record<PeriodId, typeof Sun> = {
  jejum: Sunrise,
  cafe_manha: Coffee,
  antes_cafe: Coffee,
  depois_cafe: Coffee,
  antes_almoco: Utensils,
  depois_almoco: Soup,
  cafe_tarde: Coffee,
  antes_jantar: Sunset,
  depois_jantar: Utensils,
  antes_dormir: Bed,
  madrugada: Moon,
  outro: HelpCircle,
};

const statusClasses: Record<GlucoseStatus, string> = {
  low: "border-[#72b9ee] bg-[#A7D8FF] text-[#255a7c]",
  ideal: "border-[#82cf67] bg-[#B8E986] text-[#315b25]",
  high: "border-[#f1a85f] bg-[#FFC48C] text-[#75451b]",
};

function getGlucoseStatus(value: number): GlucoseStatus {
  if (value < TARGET_MIN) return "low";
  if (value > TARGET_MAX) return "high";
  return "ideal";
}

function getStatusLabel(status: GlucoseStatus) {
  if (status === "low") return "Hipo";
  if (status === "high") return "Alta";
  return "Ideal";
}

export function CozyCard({
  children,
  className,
  variant = "cream",
}: {
  children: ReactNode;
  className?: string;
  variant?: "cream" | "wood" | "sky" | "grass";
}) {
  return (
    <section
      className={cn(
        "pixel-frame rounded-[1.35rem] border-2 p-4 shadow-cozy",
        variant === "cream" && "border-[#dcbf8b] bg-[#FFF7E6]",
        variant === "wood" && "border-[#7d5735] bg-[#A67C52] text-white",
        variant === "sky" && "border-[#6aaee2] bg-[#dff2ff]",
        variant === "grass" && "border-[#62a85d] bg-[#dff3c8]",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PixelMascot({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pixel-mascot relative grid h-24 w-20 grid-cols-5 grid-rows-7 gap-1",
        className,
      )}
      aria-label="Mascote gotinha pixelada"
      role="img"
    >
      {Array.from({ length: 35 }).map((_, index) => {
        const visible = [
          2, 6, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 27, 28,
        ].includes(index);
        const shine = [7, 11].includes(index);
        const face = [16, 18, 22].includes(index);
        return (
          <span
            key={index}
            className={cn(
              "rounded-[3px]",
              visible ? "bg-[#ff9aa0]" : "bg-transparent",
              shine && "bg-[#ffd5c6]",
              face && "bg-[#5b2f2a]",
            )}
          />
        );
      })}
    </div>
  );
}

export function GlucoseStatusBadge({ value }: { value: number }) {
  const status = getGlucoseStatus(value);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-black",
        statusClasses[status],
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}

export function StatCard({
  icon,
  label,
  value,
  helper,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  helper?: string;
  className?: string;
}) {
  return (
    <CozyCard className={cn("p-3", className)}>
      <div className="flex items-center gap-2 text-[#7b5a35]">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#F7D66B] text-[#7b5a35]">
          {icon}
        </span>
        <span className="text-[11px] font-black uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2 text-3xl font-black leading-none text-[#4a3828]">{value}</div>
      {helper && <p className="mt-1 text-xs font-bold text-[#8a6b45]">{helper}</p>}
    </CozyCard>
  );
}

export function ProgressQuestBar({ current, total }: { current: number; total: number }) {
  const progress = Math.min(100, Math.round((current / total) * 100));

  return (
    <CozyCard variant="grass" className="overflow-hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#547d37]">Missão do dia</p>
          <h2 className="mt-1 text-lg font-black text-[#375629]">Registrar {total} medições</h2>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#b89152] bg-[#F7D66B]">
          <Star className="h-6 w-6 fill-[#A67C52] text-[#A67C52]" />
        </div>
      </div>
      <div className="mt-4 h-5 rounded-full border-2 border-[#6aa85c] bg-[#fff7df] p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#7CC576] to-[#F7D66B] transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs font-bold text-[#547d37]">
        {current} de {total} registros completos
      </p>
    </CozyCard>
  );
}

export function PeriodSelector({
  value,
  onChange,
}: {
  value: PeriodId | "";
  onChange: (period: PeriodId) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {periods.map((period) => {
        const Icon = periodIcons[period.id];
        const active = value === period.id;
        return (
          <button
            key={period.id}
            type="button"
            onClick={() => onChange(period.id)}
            className={cn(
              "min-h-24 rounded-2xl border-2 p-2 text-center shadow-tile transition active:scale-[0.98]",
              active
                ? "border-[#A67C52] bg-[#F7D66B] text-[#4a3828]"
                : "border-[#dcbf8b] bg-[#FFF7E6] text-[#765739]",
            )}
          >
            <Icon className="mx-auto h-6 w-6" strokeWidth={2.5} />
            <span className="mt-2 block text-[11px] font-black leading-tight">
              {period.shortLabel}
            </span>
            <span className="mt-1 block text-[10px] font-bold opacity-70">{period.timeHint}</span>
          </button>
        );
      })}
    </div>
  );
}

export function InsulinStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center rounded-2xl border-2 border-[#dcbf8b] bg-[#fffdf4] p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="grid h-12 w-12 place-items-center rounded-xl bg-[#dff3c8] text-xl font-black text-[#4d7d38] active:scale-95"
      >
        -
      </button>
      <div className="flex-1 text-center">
        <div className="text-3xl font-black tabular-nums text-[#4a3828]">{value}</div>
        <div className="text-[10px] font-black uppercase tracking-wide text-[#8a6b45]">
          unidades
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(50, value + 1))}
        className="grid h-12 w-12 place-items-center rounded-xl bg-[#F7D66B] text-xl font-black text-[#6c4a24] active:scale-95"
      >
        <Plus className="h-5 w-5" strokeWidth={3} />
      </button>
    </div>
  );
}

export function MeasurementCard({
  measurement,
  onEdit,
  onDelete,
}: {
  measurement: Measurement;
  onEdit?: (measurement: Measurement) => void;
  onDelete?: (measurement: Measurement) => void;
}) {
  return (
    <CozyCard className="p-3">
      <div className="flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#dcbf8b] bg-[#dff2ff]">
          {(() => {
            const Icon = periodIcons[measurement.period];
            return <Icon className="h-6 w-6 text-[#5a7da1]" />;
          })()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-[#4a3828]">
            {getPeriodLabel(measurement.period)}
          </p>
          <p className="text-xs font-bold text-[#8a6b45]">
            {measurement.time || "Sem horário"}
            {measurement.insulinUnits ? ` · ${measurement.insulinUnits}U` : ""}
          </p>
          {measurement.notes && (
            <p className="mt-1 truncate text-xs font-semibold text-[#8a6b45]">
              {measurement.notes}
            </p>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-black leading-none text-[#4a3828]">
            {measurement.glucoseValue}
          </div>
          <div className="mt-1">
            <GlucoseStatusBadge value={measurement.glucoseValue} />
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="grid gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(measurement)}
                aria-label="Editar medição"
                className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#dcbf8b] bg-[#fffdf4] text-[#765739] active:scale-95"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(measurement)}
                aria-label="Excluir medição"
                className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#e6a07b] bg-[#ffe4d2] text-[#8f3f28] active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </CozyCard>
  );
}
