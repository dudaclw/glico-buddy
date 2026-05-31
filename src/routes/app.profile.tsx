import { createFileRoute } from "@tanstack/react-router";
import { Bell, Brush, ChevronRight, Moon, Palette, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { CozyCard, PixelMascot } from "@/components/cozy";

export const Route = createFileRoute("/app/profile")({
  component: Profile,
});

function Profile() {
  const [name, setName] = useState("Ana");
  const [diabetesType, setDiabetesType] = useState("Tipo 1");
  const [targetMin, setTargetMin] = useState("70");
  const [targetMax, setTargetMax] = useState("180");
  const [cozyMode, setCozyMode] = useState(true);
  const [reminders, setReminders] = useState(true);

  return (
    <div className="space-y-4 pt-2">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-[#5e8e57]">Perfil</p>
          <h1 className="text-3xl font-black text-[#4a3828]">Minha fazenda</h1>
          <p className="mt-1 text-sm font-bold text-[#7c6242]">Ajustes simples para seu diário.</p>
        </div>
        <PixelMascot className="scale-90" />
      </header>

      <CozyCard>
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F7D66B] text-[#765739]">
            <UserRound className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-lg font-black">Dados do jogador</h2>
            <p className="text-xs font-bold text-[#8a6b45]">Informações usadas no protótipo</p>
          </div>
        </div>

        <div className="space-y-3">
          <Field label="Nome">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="cozy-input"
            />
          </Field>
          <Field label="Tipo de diabetes">
            <select
              value={diabetesType}
              onChange={(event) => setDiabetesType(event.target.value)}
              className="cozy-input"
            >
              <option>Tipo 1</option>
              <option>Tipo 2</option>
              <option>Gestacional</option>
              <option>LADA</option>
              <option>Outro</option>
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Meta mín.">
              <input
                inputMode="numeric"
                value={targetMin}
                onChange={(event) => setTargetMin(event.target.value.replace(/\D/g, ""))}
                className="cozy-input"
              />
            </Field>
            <Field label="Meta máx.">
              <input
                inputMode="numeric"
                value={targetMax}
                onChange={(event) => setTargetMax(event.target.value.replace(/\D/g, ""))}
                className="cozy-input"
              />
            </Field>
          </div>
        </div>
      </CozyCard>

      <CozyCard variant="grass">
        <h2 className="mb-3 flex items-center gap-2 text-base font-black text-[#375629]">
          <Palette className="h-5 w-5" />
          Configurações visuais
        </h2>
        <SettingRow
          icon={<Brush className="h-5 w-5" />}
          label="Modo cozy"
          helper="Cards maiores e cores suaves"
          active={cozyMode}
          onClick={() => setCozyMode((value) => !value)}
        />
        <SettingRow
          icon={<Bell className="h-5 w-5" />}
          label="Lembretes visuais"
          helper="Missões aparecem no início"
          active={reminders}
          onClick={() => setReminders((value) => !value)}
        />
        <SettingRow
          icon={<Moon className="h-5 w-5" />}
          label="Contraste noturno"
          helper="Preparado para próxima versão"
          active={false}
          onClick={() => undefined}
        />
      </CozyCard>

      <CozyCard variant="sky">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#B8E986] text-[#315b25]">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <h2 className="text-base font-black">Protótipo local</h2>
            <p className="text-xs font-bold text-[#6a7f91]">
              Sem login e sem banco de dados nesta fase.
            </p>
          </div>
          <ChevronRight className="h-5 w-5 text-[#6a7f91]" />
        </div>
      </CozyCard>
    </div>
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

function SettingRow({
  icon,
  label,
  helper,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  helper: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mb-2 flex w-full items-center gap-3 rounded-2xl border-2 border-[#b6d795] bg-[#fffdf4] p-3 text-left shadow-tile active:scale-[0.99]"
    >
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F7D66B] text-[#765739]">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black text-[#4a3828]">{label}</span>
        <span className="block text-xs font-bold text-[#8a6b45]">{helper}</span>
      </span>
      <span
        className={`relative h-8 w-14 rounded-full border-2 transition ${
          active ? "border-[#5e8e57] bg-[#7CC576]" : "border-[#d2b17e] bg-[#e8d4ad]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-[#FFF7E6] shadow-tile transition ${
            active ? "left-6" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}
