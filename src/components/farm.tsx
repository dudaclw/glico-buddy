import { Link } from "@tanstack/react-router";
import { Cat, Sparkles } from "lucide-react";
import { CozyCard } from "@/components/cozy";
import { cn } from "@/lib/utils";
import {
  PLANT_CATALOG,
  getPlantDefinition,
  getPlantStageIcon,
  type Farm,
  type FarmAdvanceResult,
  type Plant,
} from "@/types/farm";

const glicoMessages = {
  happy: "Obrigado por registrar sua glicemia!",
  excited: "Sua fazenda está crescendo!",
  celebrating: "Você está cuidando muito bem dela!",
} as const;

export function FarmScene({
  farm,
  compact = false,
  highlightCurrent = false,
}: {
  farm: Farm;
  compact?: boolean;
  highlightCurrent?: boolean;
}) {
  const plots = getFarmPlots(farm);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 border-[#6aa85c] bg-[#bfe8a5] p-3 shadow-tile",
        compact ? "min-h-36" : "min-h-64",
      )}
    >
      <div className="absolute inset-x-0 top-0 h-16 bg-[#a7d8ff]" />
      <div className="absolute left-4 top-7 grid h-16 w-20 place-items-end rounded-t-2xl border-2 border-[#8b613b] bg-[#fff7e6] shadow-tile">
        <div className="absolute -top-5 left-2 h-8 w-16 rotate-[-4deg] rounded-t-xl border-2 border-[#8b613b] bg-[#d58661]" />
        <div className="mb-1 h-8 w-6 rounded-t-lg border-2 border-[#8b613b] bg-[#a67c52]" />
        <div className="absolute right-3 top-5 h-5 w-5 border-2 border-[#8b613b] bg-[#f7d66b]" />
      </div>

      <div className={cn("relative z-10 grid grid-cols-5 gap-2", compact ? "mt-24" : "mt-32")}>
        {plots.map((plot, index) => (
          <div
            key={`${plot?.id ?? "empty"}-${index}`}
            className={cn(
              "grid aspect-square place-items-center rounded-xl border-2 border-[#8b613b] bg-[#a67c52] text-2xl shadow-tile",
              !plot && "bg-[#c99b66]",
              highlightCurrent && index === 0 && "animate-grow-pop",
            )}
          >
            <span aria-hidden>{plot ? getPlantStageIcon(plot) : ""}</span>
          </div>
        ))}
      </div>

      {!compact && (
        <div className="relative z-10 mt-4 flex items-center justify-between rounded-2xl border-2 border-[#77b866] bg-[#dff3c8] px-3 py-2 text-xs font-black text-[#426931]">
          <span>Gramado cuidado</span>
          <span>5 canteiros</span>
        </div>
      )}
    </div>
  );
}

export function FarmDashboardCard({ farm }: { farm: Farm }) {
  const currentPlant = getPlantDefinition(farm.currentPlant.type);
  const progressBlocks = getProgressBlocks(
    farm.currentPlant.growthStage,
    farm.currentPlant.maxStage,
  );

  return (
    <CozyCard variant="grass" className="overflow-hidden">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-[#547d37]">Minha Fazenda</p>
          <h2 className="mt-1 text-lg font-black text-[#375629]">Fazenda da Saúde</h2>
        </div>
        <Link
          to="/app/farm"
          className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-[#8b613b] bg-[#F7D66B] text-xl shadow-tile active:scale-95"
          aria-label="Abrir Fazenda da Saúde"
        >
          🌱
        </Link>
      </div>

      <FarmScene farm={farm} compact />

      <div className="mt-3 grid gap-2 rounded-2xl border-2 border-[#b6d795] bg-[#fffdf4] p-3 text-sm font-black text-[#4a3828]">
        <div className="flex items-center justify-between gap-2">
          <span>Total de registros</span>
          <span>{farm.totalMeasurements}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Planta em crescimento</span>
          <span>
            {currentPlant.icon} {currentPlant.label}
          </span>
        </div>
        <div>
          <div className="flex items-center justify-between gap-2">
            <span>Próxima colheita</span>
            <span>
              {farm.currentPlant.growthStage}/{farm.currentPlant.maxStage}
            </span>
          </div>
          <div className="mt-1 text-lg tracking-wide text-[#5e8e57]">{progressBlocks}</div>
        </div>
      </div>
    </CozyCard>
  );
}

export function GlicoMascot({
  state = "happy",
  className,
}: {
  state?: keyof typeof glicoMessages;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border-2 border-[#dcbf8b] bg-[#fffdf4] p-3 shadow-tile",
        className,
      )}
    >
      <div
        className={cn(
          "grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#8b613b] bg-[#ffc48c] text-[#5f3f23]",
          state === "excited" && "animate-bounce-soft",
          state === "celebrating" && "animate-grow-pop",
        )}
      >
        <Cat className="h-7 w-7" strokeWidth={2.8} />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-black text-[#4a3828]">Glico</p>
        <p className="text-xs font-bold text-[#8a6b45]">{glicoMessages[state]}</p>
      </div>
    </div>
  );
}

export function FarmUnlockList({ farm }: { farm: Farm }) {
  return (
    <div className="grid gap-2">
      {PLANT_CATALOG.map((plant) => {
        const unlocked = farm.unlockedPlants.includes(plant.type);
        const remaining = Math.max(0, plant.unlockAt - farm.totalMeasurements);
        return (
          <div
            key={plant.type}
            className={cn(
              "flex items-center justify-between rounded-2xl border-2 px-3 py-3 text-sm font-black shadow-tile",
              unlocked
                ? "border-[#82cf67] bg-[#dff3c8] text-[#375629]"
                : "border-[#dcbf8b] bg-[#fffdf4] text-[#7c6242]",
            )}
          >
            <span>
              {plant.icon} {plant.label}
            </span>
            <span>{unlocked ? "desbloqueada" : `${remaining} registros`}</span>
          </div>
        );
      })}
    </div>
  );
}

export function FarmFeedbackModal({ result }: { result: FarmAdvanceResult }) {
  const hasHarvest = Boolean(result.harvestedPlant);
  const unlockedPlant = result.unlockedPlants[0]
    ? getPlantDefinition(result.unlockedPlants[0])
    : null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#4a3828]/20 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[1.5rem] border-2 border-[#8b613b] bg-[#fff7e6] p-5 text-center shadow-cozy animate-grow-pop">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border-2 border-[#8b613b] bg-[#dff3c8] text-4xl shadow-tile">
          {getPlantStageIcon(result.grewPlant)}
        </div>
        <div className="mt-3 flex items-center justify-center gap-1 text-[#f0b64b]">
          <Sparkles className="h-4 w-4 fill-current" />
          <Sparkles className="h-5 w-5 fill-current" />
          <Sparkles className="h-4 w-4 fill-current" />
        </div>
        <h2 className="mt-2 text-2xl font-black text-[#4a3828]">
          {hasHarvest ? "Colheita pronta!" : "Registro realizado!"}
        </h2>
        <p className="mt-1 text-sm font-bold text-[#7c6242]">
          {hasHarvest ? "Uma nova semente foi plantada." : "Sua plantinha cresceu."}
        </p>
        {unlockedPlant && (
          <p className="mt-3 rounded-2xl bg-[#dff3c8] px-3 py-2 text-sm font-black text-[#375629]">
            {unlockedPlant.icon} {unlockedPlant.label} desbloqueada
          </p>
        )}
      </div>
    </div>
  );
}

function getFarmPlots(farm: Farm): Array<Plant | null> {
  const harvestedPlots = farm.harvestedPlants.slice(0, 4).map((type, index) => ({
    id: `${type}-${index}`,
    type,
    growthStage: 5,
    maxStage: 5 as const,
  }));

  return [farm.currentPlant, ...harvestedPlots, null, null, null, null].slice(0, 5);
}

function getProgressBlocks(current: number, total: number) {
  return Array.from({ length: total }, (_, index) => (index < current ? "█" : "░")).join("");
}
