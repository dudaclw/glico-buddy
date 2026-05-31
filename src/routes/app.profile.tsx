import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Mascot } from "@/components/Mascot";
import { Moon, Sun, LogOut, Award } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/profile")({
  component: Profile,
});

function Profile() {
  const { user, signOut } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).single()).data,
    enabled: !!user,
  });

  const { data: count = 0 } = useQuery({
    queryKey: ["measurements-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase.from("measurements").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
    enabled: !!user,
  });

  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [diabetesType, setDiabetesType] = useState("");
  const [targetMin, setTargetMin] = useState("70");
  const [targetMax, setTargetMax] = useState("180");
  const [dark, setDark] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setBirthDate(profile.birth_date ?? "");
      setDiabetesType(profile.diabetes_type ?? "");
      setTargetMin(String(profile.target_min ?? 70));
      setTargetMax(String(profile.target_max ?? 180));
    }
  }, [profile]);

  useEffect(() => {
    const isDark = localStorage.getItem("theme") === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  async function save() {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          name,
          birth_date: birthDate || null,
          diabetes_type: diabetesType || null,
          target_min: Number(targetMin),
          target_max: Number(targetMax),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user!.id);
      if (error) throw error;
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Perfil atualizado 💖");
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  const achievements = [
    { label: "Primeira medição", earned: count >= 1, icon: "🎉" },
    { label: "10 registros", earned: count >= 10, icon: "⭐" },
    { label: "50 registros", earned: count >= 50, icon: "🏆" },
    { label: "100 registros", earned: count >= 100, icon: "💎" },
  ];

  return (
    <div className="pt-6">
      <div className="flex items-center gap-3">
        <Mascot size={64} />
        <div>
          <h1 className="text-2xl">{name || "Perfil"}</h1>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </div>

      <div className="mt-5 rounded-3xl bg-card p-5 shadow-soft">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase tracking-wide text-muted-foreground">
          <Award className="h-4 w-4" /> Conquistas
        </h2>
        <div className="grid grid-cols-2 gap-2">
          {achievements.map((a) => (
            <div
              key={a.label}
              className={`flex items-center gap-2 rounded-2xl border-2 p-2.5 text-sm font-bold ${
                a.earned ? "border-primary/30 bg-primary/5 text-foreground" : "border-dashed border-border text-muted-foreground"
              }`}
            >
              <span className={`text-2xl ${!a.earned && "grayscale opacity-40"}`}>{a.icon}</span>
              <span className="text-xs">{a.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-3 rounded-3xl bg-card p-5 shadow-soft">
        <Field label="Nome">
          <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
        </Field>
        <Field label="Data de nascimento">
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="input" />
        </Field>
        <Field label="Tipo de diabetes">
          <select value={diabetesType} onChange={(e) => setDiabetesType(e.target.value)} className="input">
            <option value="">Selecione</option>
            <option value="tipo_1">Tipo 1</option>
            <option value="tipo_2">Tipo 2</option>
            <option value="gestacional">Gestacional</option>
            <option value="lada">LADA</option>
            <option value="outro">Outro</option>
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Meta mín (mg/dL)">
            <input inputMode="numeric" value={targetMin} onChange={(e) => setTargetMin(e.target.value.replace(/\D/g, ""))} className="input" />
          </Field>
          <Field label="Meta máx (mg/dL)">
            <input inputMode="numeric" value={targetMax} onChange={(e) => setTargetMax(e.target.value.replace(/\D/g, ""))} className="input" />
          </Field>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="w-full rounded-2xl bg-gradient-primary py-3.5 text-base font-extrabold text-primary-foreground shadow-cute disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>

      <button
        onClick={toggleDark}
        className="mt-4 flex w-full items-center justify-between rounded-2xl bg-card px-4 py-3.5 text-sm font-bold shadow-soft"
      >
        <span className="flex items-center gap-2">
          {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Modo escuro
        </span>
        <span className={`h-6 w-11 rounded-full transition ${dark ? "bg-primary" : "bg-muted"}`}>
          <span className={`block h-5 w-5 translate-y-0.5 rounded-full bg-card transition ${dark ? "translate-x-5" : "translate-x-0.5"}`} />
        </span>
      </button>

      <button
        onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-card py-3.5 text-sm font-bold text-destructive shadow-soft"
      >
        <LogOut className="h-4 w-4" /> Sair
      </button>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        ☁️ Backup automático na nuvem
      </p>

      <style>{`.input { width:100%; border-radius: 0.85rem; background: var(--color-input); padding: 0.7rem 0.9rem; font-size: 0.95rem; outline: none; border: 2px solid transparent; transition: border-color .15s; }
      .input:focus { border-color: var(--color-primary); background: var(--color-card); }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
