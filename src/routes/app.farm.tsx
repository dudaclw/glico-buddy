import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, PackageCheck, ShoppingBasket, X } from "lucide-react";
import { useEffect, useState } from "react";
import gatoImage from "../../gato.png";
import { CozyCard } from "@/components/cozy";
import { FarmScene } from "@/components/farm";
import { useFarm } from "@/hooks/useFarm";
import { useFarmShop } from "@/hooks/useFarmShop";
import { useProfile } from "@/hooks/useProfile";
import { useRewards } from "@/hooks/useRewards";
import { harvestPlot, plantSeedOnPlot } from "@/services/farm";
import { farmShopItems, getFarmShopItem, type FarmInventoryItem } from "@/services/farmShop";
import { FARM_STAGE_LABELS, getFarmPlantIcon, type Farm, type FarmPlot } from "@/types/farm";

export const Route = createFileRoute("/app/farm")({
  component: FarmPage,
});

function FarmPage() {
  const { farm, refreshFarm } = useFarm();
  const { inventory, buyItem, refreshInventory } = useFarmShop();
  const { profile } = useProfile();
  const { rewards } = useRewards();
  const [shopOpen, setShopOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [shopMessage, setShopMessage] = useState("");
  const [shopMessageType, setShopMessageType] = useState<"success" | "error">("success");
  const [farmMessage, setFarmMessage] = useState("");
  const [farmMessageType, setFarmMessageType] = useState<"success" | "error">("success");
  const [plotsOpen, setPlotsOpen] = useState(true);
  const seedInventory = inventory.filter((item) => item.type === "seed");

  useEffect(() => {
    if (!shopMessage) return;

    const timeoutId = window.setTimeout(() => {
      setShopMessage("");
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [shopMessage]);

  function buyShopItem(itemId: string) {
    const result = buyItem(itemId);
    setShopMessage(result.message);
    setShopMessageType(result.success ? "success" : "error");
  }

  function openShop() {
    setShopOpen(true);
    setShopMessage("");
  }

  function plantSeed(seedItemId: string, plotId: string) {
    const result = plantSeedOnPlot(seedItemId, plotId);
    setFarmMessage(result.message);
    setFarmMessageType(result.success ? "success" : "error");
    refreshFarm();
    refreshInventory();
  }

  function harvestPlotAndFree(plotId: string) {
    const result = harvestPlot(plotId);
    setFarmMessage(result.message);
    setFarmMessageType(result.success ? "success" : "error");
    refreshFarm();
  }

  return (
    <>
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-farm-background" />
      <div className="pointer-events-none fixed left-[58%] top-[clamp(15rem,33vh,17rem)] z-20 flex -translate-x-1/2 items-end gap-2">
        <img
          src={gatoImage}
          alt=""
          className="h-20 w-auto select-none pixel-mascot"
          draggable={false}
        />
      </div>
      <div className="pointer-events-none fixed inset-x-0 top-[clamp(20rem,48vh,24rem)] z-20 px-4">
        <div className="mx-auto max-w-md">
          <FarmScene farm={farm} highlightCurrent showNumbers />
        </div>
      </div>
      <header className="fixed inset-x-0 top-3 z-30 px-16">
        <div className="mx-auto grid max-w-md justify-items-center gap-2">
          <h1 className="max-w-full break-words text-center text-3xl font-black leading-tight text-[#4a3828]">
            {profile.farmName}
          </h1>
          <span className="shrink-0 rounded-2xl border-2 border-[#8b613b] bg-[#F7D66B] px-3 py-1 text-sm font-black text-[#5f3f23] shadow-tile">
            ATP: {rewards.careDrops}
          </span>
        </div>
      </header>
      <button
        type="button"
        onClick={openShop}
        className="fixed right-4 top-4 z-40 grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#8b613b] bg-[#F7D66B] text-[#5f3f23] shadow-cozy active:scale-95"
        aria-label="Abrir lojinha da fazenda"
      >
        <ShoppingBasket className="h-6 w-6" strokeWidth={3} />
      </button>
      <button
        type="button"
        onClick={() => setInventoryOpen(true)}
        className="fixed left-4 top-4 z-40 grid h-12 w-12 place-items-center rounded-2xl border-2 border-[#8b613b] bg-[#F7D66B] text-[#5f3f23] shadow-cozy active:scale-95"
        aria-label="Abrir inventário da fazenda"
      >
        <PackageCheck className="h-6 w-6" strokeWidth={3} />
      </button>

      <div
        className="fixed inset-x-0 bottom-[calc(10.5rem+env(safe-area-inset-bottom))] top-[calc(clamp(20rem,48vh,24rem)+clamp(3.75rem,18vw,6rem)+0.75rem)] z-10 overflow-y-auto overscroll-contain px-4 pb-9"
        style={{
          WebkitMaskImage: "linear-gradient(to bottom, black calc(100% - 28px), transparent 100%)",
          maskImage: "linear-gradient(to bottom, black calc(100% - 28px), transparent 100%)",
        }}
      >
        <div className="mx-auto max-w-md space-y-4">
          {farmMessage && (
            <p
              className={`rounded-2xl border-2 px-3 py-2 text-sm font-black shadow-tile ${
                farmMessageType === "success"
                  ? "border-[#82cf67] bg-[#dff3c8] text-[#375629]"
                  : "border-[#dcbf8b] bg-[#ffe4d2] text-[#8f3f28]"
              }`}
            >
              {farmMessage}
            </p>
          )}

          <CozyCard className="grid gap-3">
            <div className="grid gap-1">
              <button
                type="button"
                onClick={() => setPlotsOpen((current) => !current)}
                aria-expanded={plotsOpen}
                className="flex w-full items-center justify-between gap-3 text-left active:scale-[0.99]"
              >
                <span className="text-base font-black text-[#4a3828]">Canteiros</span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border-2 border-[#8b613b] bg-[#fff7e6] text-[#5f3f23] shadow-tile">
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${plotsOpen ? "rotate-180" : ""}`}
                    strokeWidth={3}
                  />
                </span>
              </button>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-[#8a6b45]">
                  {farm.plants.length} planta{farm.plants.length === 1 ? "" : "s"} na fazendinha
                </span>
                <span className="shrink-0 rounded-2xl bg-[#F7D66B] px-3 py-1 text-xs font-black text-[#5f3f23] shadow-tile">
                  {seedInventory.reduce((total, item) => total + item.quantity, 0)} sementes no
                  estoque
                </span>
              </div>
            </div>

            {plotsOpen && (
              <div className="grid gap-2">
                {farm.plots.map((plot, index) => (
                  <FarmPlotRow
                    key={plot.id}
                    plot={plot}
                    plotNumber={index + 1}
                    farm={farm}
                    seedInventory={seedInventory}
                    onPlant={plantSeed}
                    onHarvest={harvestPlotAndFree}
                  />
                ))}
              </div>
            )}
          </CozyCard>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-30 px-4">
        <Link
          to="/app/new"
          className="mx-auto flex min-h-16 max-w-md items-center justify-between rounded-[1.35rem] border-2 border-[#8b613b] bg-[#7CC576] px-5 text-white shadow-cozy transition active:scale-[0.98]"
        >
          <span className="text-lg font-black">Ganhe ATP</span>
          <ChevronRight className="h-7 w-7" strokeWidth={3} />
        </Link>
      </div>

      {shopOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#4a3828]/30 px-3 pb-3 pt-10 backdrop-blur-sm">
          <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[1.5rem] border-2 border-[#8b613b] bg-[#FFF7E6] p-4 shadow-cozy">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[#4a3828]">Lojinha da Fazenda</h2>
                <p className="mt-1 text-sm font-bold text-[#7c6242]">
                  Seu saldo: {rewards.atp} ATP
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShopOpen(false)}
                aria-label="Fechar lojinha"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 border-[#8b613b] bg-[#F7D66B] text-[#5f3f23] shadow-tile active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {shopMessage && (
              <p
                className={`mb-3 rounded-2xl px-3 py-2 text-sm font-black ${
                  shopMessageType === "success"
                    ? "bg-[#dff3c8] text-[#375629]"
                    : "bg-[#ffe4d2] text-[#8f3f28]"
                }`}
              >
                {shopMessage}
              </p>
            )}

            <div className="grid gap-2">
              {farmShopItems.map((item) => {
                const affordable = rewards.atp >= item.price;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border-2 border-[#dcbf8b] bg-[#fffdf4] p-3 shadow-tile"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-[#4a3828]">{item.name}</p>
                        <p className="mt-1 text-xs font-bold text-[#8a6b45]">{item.description}</p>
                        <p className="mt-2 text-xs font-black uppercase tracking-wide text-[#5e8e57]">
                          {item.type === "seed" ? "Semente" : item.type} · {item.price} ATP
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => buyShopItem(item.id)}
                        disabled={!affordable}
                        className="shrink-0 rounded-2xl border-2 border-[#8b613b] bg-[#7CC576] px-3 py-2 text-xs font-black text-white shadow-tile active:scale-95 disabled:cursor-not-allowed disabled:border-[#c8b593] disabled:bg-[#e5ddc9] disabled:text-[#8a806b] disabled:active:scale-100"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {inventoryOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#4a3828]/30 px-3 pb-3 pt-10 backdrop-blur-sm">
          <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-[1.5rem] border-2 border-[#8b613b] bg-[#FFF7E6] p-4 shadow-cozy">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black text-[#4a3828]">Inventário</h2>
                <p className="mt-1 text-sm font-bold text-[#7c6242]">
                  {inventory.length} item{inventory.length === 1 ? "" : "s"} guardado
                  {inventory.length === 1 ? "" : "s"}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInventoryOpen(false)}
                aria-label="Fechar inventário"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 border-[#8b613b] bg-[#F7D66B] text-[#5f3f23] shadow-tile active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {inventory.length === 0 ? (
              <p className="rounded-2xl border-2 border-[#dcbf8b] bg-[#fffdf4] px-3 py-3 text-sm font-black text-[#7c6242] shadow-tile">
                Nenhuma semente comprada ainda.
              </p>
            ) : (
              <div className="grid gap-2">
                {inventory.map((item) => {
                  const shopItem = getFarmShopItem(item.itemId);
                  return (
                    <div
                      key={item.itemId}
                      className="flex items-center justify-between rounded-2xl border-2 border-[#dcbf8b] bg-[#fffdf4] px-3 py-3 text-sm font-black text-[#4a3828] shadow-tile"
                    >
                      <span>{shopItem?.name ?? item.itemId}</span>
                      <span>x{item.quantity}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function FarmPlotRow({
  plot,
  plotNumber,
  farm,
  seedInventory,
  onPlant,
  onHarvest,
}: {
  plot: FarmPlot;
  plotNumber: number;
  farm: Farm;
  seedInventory: FarmInventoryItem[];
  onPlant: (seedItemId: string, plotId: string) => void;
  onHarvest: (plotId: string) => void;
}) {
  const plant = plot.plantId
    ? (farm.plants.find((candidate) => candidate.id === plot.plantId) ?? null)
    : null;

  return (
    <div className="rounded-2xl border-2 border-[#dcbf8b] bg-[#fffdf4] p-3 shadow-tile">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-black text-[#4a3828]">Canteiro {plotNumber}</p>
          {plant ? (
            <>
              <p className="mt-1 text-xs font-bold text-[#8a6b45]">
                {getFarmPlantIcon(plant)} {plant.name} · {FARM_STAGE_LABELS[plant.stage]}
              </p>
              <p className="mt-1 text-xs font-black text-[#5e8e57]">
                {plant.currentGrowth}/{plant.growthRequiredRecords} registros
              </p>
            </>
          ) : (
            <p className="mt-1 text-xs font-bold text-[#8a6b45]">Status: vazio</p>
          )}
        </div>
        {plant ? (
          <span
            className={`shrink-0 rounded-2xl px-3 py-1 text-xs font-black shadow-tile ${
              plot.status === "completed"
                ? "bg-[#dff3c8] text-[#375629]"
                : "bg-[#F7D66B] text-[#5f3f23]"
            }`}
          >
            {plot.status === "completed" ? "Completa" : "Crescendo"}
          </span>
        ) : null}
      </div>

      {plant ? (
        plot.status === "completed" ? (
          <button
            type="button"
            onClick={() => onHarvest(plot.id)}
            className="mt-3 w-full rounded-2xl border-2 border-[#8b613b] bg-[#F7D66B] px-3 py-2 text-xs font-black text-[#5f3f23] shadow-tile active:scale-95"
          >
            Colher e liberar canteiro
          </button>
        ) : (
          <div className="mt-3 h-4 rounded-full border-2 border-[#6aa85c] bg-[#fff7df] p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7CC576] to-[#F7D66B] transition-all"
              style={{
                width: `${Math.min(100, (plant.currentGrowth / plant.growthRequiredRecords) * 100)}%`,
              }}
            />
          </div>
        )
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {seedInventory.length === 0 ? (
            <span className="rounded-2xl bg-[#fff0c8] px-3 py-2 text-xs font-black text-[#7c6242]">
              Sem sementes
            </span>
          ) : (
            seedInventory.map((item) => {
              const shopItem = getFarmShopItem(item.itemId);
              return (
                <button
                  key={item.itemId}
                  type="button"
                  onClick={() => onPlant(item.itemId, plot.id)}
                  className="rounded-2xl border-2 border-[#8b613b] bg-[#7CC576] px-3 py-2 text-xs font-black text-white shadow-tile active:scale-95"
                >
                  Plantar {shopItem?.name.replace(/^Semente de\s+/i, "") ?? "semente"} x
                  {item.quantity}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
