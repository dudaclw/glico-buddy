import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Mascot } from "@/components/Mascot";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — DailyGlico" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/app", replace: true });
  }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${window.location.origin}/app`,
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Bem-vindo 💖");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message ?? "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-soft px-5 pt-10 pb-8">
      <div className="mx-auto max-w-md">
        <div className="flex flex-col items-center text-center">
          <Mascot size={120} className="animate-bounce-soft" />
          <h1 className="mt-3 text-3xl">DailyGlico</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Seu diário de glicemia, fofo e prático 🩸
          </p>
        </div>

        <div className="mt-8 rounded-3xl bg-card p-6 shadow-soft">
          <div className="mb-5 flex rounded-full bg-muted p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-full py-2 text-sm font-bold transition ${
                  mode === m ? "bg-card text-foreground shadow-soft" : "text-muted-foreground"
                }`}
              >
                {m === "signin" ? "Entrar" : "Criar conta"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            {mode === "signup" && (
              <Field label="Como podemos te chamar?">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="Seu nome"
                />
              </Field>
            )}
            <Field label="E-mail">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="voce@email.com"
                autoComplete="email"
              />
            </Field>
            <Field label="Senha">
              <input
                required
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </Field>
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-2xl bg-gradient-primary py-3.5 text-base font-extrabold text-primary-foreground shadow-cute transition active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar minha conta"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          🔒 Seus dados ficam protegidos e só você pode vê-los.
        </p>
      </div>

      <style>{`.input { width:100%; border-radius: 1rem; background: var(--color-input); padding: 0.85rem 1rem; font-size: 1rem; outline: none; border: 2px solid transparent; transition: border-color .15s; }
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
