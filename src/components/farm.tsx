import { Link } from "@tanstack/react-router";
import { Cat, Sparkles } from "lucide-react";
import brotinhoImage from "../../brotinho.png";
import canteiroImage from "@/canteiro.png";
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
  className,
}: {
  farm: Farm;
  compact?: boolean;
  highlightCurrent?: boolean;
  className?: string;
}) {
  const plots = getFarmPlots(farm);

  return (
    <div
      className={cn(
        "mx-auto grid w-full grid-cols-[repeat(5,minmax(0,1fr))] items-center overflow-visible",
        compact
          ? "min-h-[clamp(3.25rem,16vw,5rem)] max-w-[18rem] gap-[clamp(0.0625rem,0.8vw,0.25rem)]"
          : "min-h-[clamp(3.75rem,18vw,6rem)] max-w-[24rem] gap-[clamp(0.0625rem,1vw,0.375rem)]",
        className,
      )}
      aria-label="Canteiros da Fazenda da Saúde"
      role="img"
    >
      {plots.map((plot, index) => (
        <div
          key={`${plot?.id ?? "empty"}-${index}`}
          className={cn(
            "relative grid aspect-square min-w-0 place-items-center overflow-visible",
            highlightCurrent && index === 0 && "animate-grow-pop",
          )}
        >
          <img
            src={canteiroImage}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain pixel-mascot"
            draggable={false}
          />
          {plot && <PlantPlotVisual plot={plot} compact={compact} />}
        </div>
      ))}
    </div>
  );
}

function PlantPlotVisual({ plot, compact }: { plot: Plant; compact: boolean }) {
  const plantIcon = getPlantStageIcon(plot);

  if (plantIcon === "🌰") {
    return (
      <img
        src={brotinhoImage}
        alt=""
        aria-hidden
        className={cn(
          "relative z-10 -mt-1 w-[clamp(1.25rem,6vw,1.875rem)] select-none object-contain drop-shadow-[0_3px_0_rgba(95,63,35,0.25)] pixel-mascot",
          compact && "w-[clamp(1.125rem,5vw,1.5rem)]",
        )}
        draggable={false}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "relative z-10 -mt-1 text-[clamp(1.5rem,8vw,1.875rem)] leading-none drop-shadow-[0_3px_0_rgba(95,63,35,0.25)]",
        compact && "text-[clamp(1.25rem,7vw,1.5rem)]",
      )}
    >
      {plantIcon}
    </span>
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

export function FarmFeedbackModal({
  result,
  rewardAmount,
}: {
  result: FarmAdvanceResult;
  rewardAmount?: number;
}) {
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
        {rewardAmount ? (
          <p className="mt-3 rounded-2xl bg-[#F7D66B] px-3 py-2 text-sm font-black text-[#5f3f23]">
            Você ganhou +{rewardAmount} ATP.
          </p>
        ) : null}
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
