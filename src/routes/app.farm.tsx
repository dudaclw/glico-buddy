import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, PackageCheck, ShoppingBasket, X } from "lucide-react";
import { useState } from "react";
import gatoImage from "../../gato.png";
import { CozyCard } from "@/components/cozy";
import { FarmScene } from "@/components/farm";
import { useFarm } from "@/hooks/useFarm";
import { useFarmShop } from "@/hooks/useFarmShop";
import { useProfile } from "@/hooks/useProfile";
import { useRewards } from "@/hooks/useRewards";
import { farmShopItems, getFarmShopItem } from "@/services/farmShop";
import { getPlantDefinition } from "@/types/farm";

export const Route = createFileRoute("/app/farm")({
  component: FarmPage,
});

function FarmPage() {
  const { farm } = useFarm();
  const { inventory, buyItem } = useFarmShop();
  const { profile } = useProfile();
  const { rewards } = useRewards();
  const [shopOpen, setShopOpen] = useState(false);
  const [shopMessage, setShopMessage] = useState("");
  const [shopMessageType, setShopMessageType] = useState<"success" | "error">("success");
  const currentPlant = getPlantDefinition(farm.currentPlant.type);

  function buyShopItem(itemId: string) {
    const result = buyItem(itemId);
    setShopMessage(result.message);
    setShopMessageType(result.success ? "success" : "error");
  }

  function openShop() {
    setShopOpen(true);
    setShopMessage("");
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
      <div className="pointer-events-none fixed inset-x-0 top-[clamp(18rem,43vh,21rem)] z-20 px-4">
        <div className="mx-auto max-w-md">
          <FarmScene farm={farm} highlightCurrent />
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

      <div className="relative z-10 space-y-4 pb-44 pt-2">
        <div aria-hidden="true" className="h-[clamp(19rem,48vh,24rem)]" />

        <CozyCard>
          <div className="mb-3 flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#F7D66B] text-xl">
              {currentPlant.icon}
            </span>
            <div>
              <h2 className="text-base font-black text-[#4a3828]">{currentPlant.label}</h2>
              <p className="text-xs font-bold text-[#8a6b45]">
                {farm.currentPlant.growthStage}/{farm.currentPlant.maxStage} registros até a
                colheita
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
              {farmShopItems.map((item) => (
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
                      className="shrink-0 rounded-2xl border-2 border-[#8b613b] bg-[#7CC576] px-3 py-2 text-xs font-black text-white shadow-tile active:scale-95"
                    >
                      Comprar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border-2 border-[#b6d795] bg-[#dff3c8] p-3">
              <div className="mb-3 flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-[#5e8e57]" />
                <h3 className="text-base font-black text-[#375629]">Inventário</h3>
              </div>
              {inventory.length === 0 ? (
                <p className="text-sm font-bold text-[#547d37]">Nenhuma semente comprada ainda.</p>
              ) : (
                <div className="grid gap-2">
                  {inventory.map((item) => {
                    const shopItem = getFarmShopItem(item.itemId);
                    return (
                      <div
                        key={item.itemId}
                        className="flex items-center justify-between rounded-2xl bg-[#fffdf4] px-3 py-2 text-sm font-black text-[#4a3828] shadow-tile"
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
        </div>
      )}
    </>
  );
}
