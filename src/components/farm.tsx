import { Link } from "@tanstack/react-router";
import { Cat, Sparkles } from "lucide-react";
import brotinhoImage from "../../brotinho.png";
import canteiroImage from "@/canteiro.png";
import { CozyCard } from "@/components/cozy";
import { cn } from "@/lib/utils";
import {
  FARM_STAGE_LABELS,
  getFarmPlantIcon,
  type Farm,
  type FarmAdvanceResult,
  type FarmPlant,
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
      {plots.map(({ plot, plant }, index) => (
        <div
          key={plot.id}
          className={cn(
            "relative grid aspect-square min-w-0 place-items-center overflow-visible",
            highlightCurrent && plant && index === 0 && "animate-grow-pop",
          )}
        >
          <img
            src={canteiroImage}
            alt=""
            className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain pixel-mascot"
            draggable={false}
          />
          {plant && <PlantPlotVisual plant={plant} compact={compact} />}
        </div>
      ))}
    </div>
  );
}

function PlantPlotVisual({ plant, compact }: { plant: FarmPlant; compact: boolean }) {
  const plantIcon = getFarmPlantIcon(plant);

  if (plant.stage === "seed" || plant.stage === "sprout") {
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
  const activePlants = farm.plants.filter((plant) => plant.stage !== "completed");
  const completedPlants = farm.plants.filter((plant) => plant.stage === "completed");
  const nextPlant = activePlants[0] ?? completedPlants[0] ?? null;

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
          <span>Plantas ativas</span>
          <span>{activePlants.length}</span>
        </div>
        {nextPlant ? (
          <div>
            <div className="flex items-center justify-between gap-2">
              <span>{nextPlant.name}</span>
              <span>
                {nextPlant.currentGrowth}/{nextPlant.growthRequiredRecords}
              </span>
            </div>
            <div className="mt-1 text-lg tracking-wide text-[#5e8e57]">
              {getProgressBlocks(nextPlant.currentGrowth, nextPlant.growthRequiredRecords)}
            </div>
          </div>
        ) : null}
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
  const plantedSeedIds = new Set(farm.plants.map((plant) => plant.seedItemId));

  return (
    <div className="grid gap-2">
      {farm.plants.map((plant) => (
        <div
          key={plant.id}
          className="flex items-center justify-between rounded-2xl border-2 border-[#82cf67] bg-[#dff3c8] px-3 py-3 text-sm font-black text-[#375629] shadow-tile"
        >
          <span>
            {getFarmPlantIcon(plant)} {plant.name}
          </span>
          <span>{FARM_STAGE_LABELS[plant.stage]}</span>
        </div>
      ))}
      {plantedSeedIds.size === 0 ? (
        <p className="rounded-2xl border-2 border-[#dcbf8b] bg-[#fffdf4] px-3 py-3 text-sm font-black text-[#7c6242] shadow-tile">
          Nenhuma planta plantada ainda.
        </p>
      ) : null}
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
  const completedPlant = result.completedPlants[0] ?? null;
  const progressedPlant = result.progressedPlants[0] ?? completedPlant;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#4a3828]/20 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[1.5rem] border-2 border-[#8b613b] bg-[#fff7e6] p-5 text-center shadow-cozy animate-grow-pop">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border-2 border-[#8b613b] bg-[#dff3c8] text-4xl shadow-tile">
          {progressedPlant ? getFarmPlantIcon(progressedPlant) : "🌱"}
        </div>
        <div className="mt-3 flex items-center justify-center gap-1 text-[#f0b64b]">
          <Sparkles className="h-4 w-4 fill-current" />
          <Sparkles className="h-5 w-5 fill-current" />
          <Sparkles className="h-4 w-4 fill-current" />
        </div>
        <h2 className="mt-2 text-2xl font-black text-[#4a3828]">
          {completedPlant ? "Planta completa!" : "Registro realizado!"}
        </h2>
        <p className="mt-1 text-sm font-bold text-[#7c6242]">
          {completedPlant
            ? `Sua ${completedPlant.name} terminou de crescer!`
            : result.progressedPlants.length > 0
              ? "Suas plantas receberam cuidado com este registro!"
              : "Plante uma semente para começar sua fazendinha."}
        </p>
        {rewardAmount ? (
          <p className="mt-3 rounded-2xl bg-[#F7D66B] px-3 py-2 text-sm font-black text-[#5f3f23]">
            Você ganhou +{rewardAmount} ATP.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function getFarmPlots(farm: Farm) {
  return farm.plots.map((plot) => ({
    plot,
    plant: plot.plantId
      ? farm.plants.find((candidate) => candidate.id === plot.plantId) ?? null
      : null,
  }));
}

function getProgressBlocks(current: number, total: number) {
  return Array.from({ length: total }, (_, index) => (index < current ? "█" : "░")).join("");
}
