import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Sprout } from "lucide-react";
import { CozyCard } from "@/components/cozy";
import { FarmScene, FarmUnlockList, GlicoMascot } from "@/components/farm";
import { useFarm } from "@/hooks/useFarm";
import { getPlantDefinition } from "@/types/farm";

export const Route = createFileRoute("/app/farm")({
  component: FarmPage,
});

function FarmPage() {
  const { farm } = useFarm();
  const currentPlant = getPlantDefinition(farm.currentPlant.type);
  const glicoState =
    farm.currentPlant.growthStage === 0
      ? "happy"
      : farm.currentPlant.growthStage >= 4
        ? "celebrating"
        : "excited";

  return (
    <div className="space-y-4 pb-2 pt-2">
      <header>
        <p className="text-sm font-black uppercase tracking-wide text-[#5e8e57]">
          Fazenda da Saúde
        </p>
        <h1 className="text-3xl font-black text-[#4a3828]">Minha Fazenda</h1>
        <p className="mt-1 text-sm font-bold text-[#7c6242]">
          Cada registro ajuda uma plantinha a crescer.
        </p>
      </header>

      <FarmScene farm={farm} highlightCurrent />

      <GlicoMascot state={glicoState} />

      <CozyCard>
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#F7D66B] text-xl">
            {currentPlant.icon}
          </span>
          <div>
            <h2 className="text-base font-black text-[#4a3828]">{currentPlant.label}</h2>
            <p className="text-xs font-bold text-[#8a6b45]">
              {farm.currentPlant.growthStage}/{farm.currentPlant.maxStage} registros até a colheita
            </p>
          </div>
        </div>
        <div className="h-5 rounded-full border-2 border-[#6aa85c] bg-[#fff7df] p-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7CC576] to-[#F7D66B] transition-all"
            style={{
              width: `${(farm.currentPlant.growthStage / farm.currentPlant.maxStage) * 100}%`,
            }}
          />
        </div>
      </CozyCard>

      <CozyCard variant="sky">
        <div className="mb-3 flex items-center gap-2">
          <Sprout className="h-5 w-5 text-[#5e8e57]" />
          <h2 className="text-base font-black text-[#4a3828]">Plantas desbloqueadas</h2>
        </div>
        <FarmUnlockList farm={farm} />
      </CozyCard>

      <Link
        to="/app/new"
        className="flex min-h-16 items-center justify-between rounded-[1.35rem] border-2 border-[#8b613b] bg-[#7CC576] px-5 text-white shadow-cozy transition active:scale-[0.98]"
      >
        <span className="text-lg font-black">Registrar glicemia</span>
        <ChevronRight className="h-7 w-7" strokeWidth={3} />
      </Link>
    </div>
  );
}
