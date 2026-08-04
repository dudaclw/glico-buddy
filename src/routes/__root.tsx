import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "../components/ui/sonner";
import { useTheme } from "@/hooks/useTheme";
import { AuthProvider } from "@/lib/auth";

const THEME_INIT_SCRIPT = `
(() => {
  const root = document.documentElement;
  let theme = "light";

  try {
    theme = localStorage.getItem("theme") === "dark" ? "dark" : "light";
    localStorage.setItem("theme", theme);
  } catch {}

  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.style.colorScheme = theme === "dark" ? "dark" : "only light";

  const colorScheme = document.querySelector('meta[name="color-scheme"]');
  const supportedSchemes = document.querySelector('meta[name="supported-color-schemes"]');
  const themeColor = document.querySelector('meta[name="theme-color"]');

  if (colorScheme) colorScheme.content = theme === "dark" ? "dark" : "only light";
  if (supportedSchemes) supportedSchemes.content = theme === "dark" ? "dark" : "light";
  if (themeColor) themeColor.content = theme === "dark" ? "#1E1B16" : "#8CCAF7";
})();
`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-cute"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente novamente em alguns instantes.</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground shadow-cute"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "color-scheme", content: "only light" },
      { name: "supported-color-schemes", content: "light" },
      { name: "theme-color", content: "#8CCAF7" },
      { title: "dailyglico — diário glicêmico cozy" },
      {
        name: "description",
        content: "Diário mobile-first para registro glicêmico rápido e acolhedor.",
      },
      { property: "og:title", content: "DailyGlico" },
      { property: "og:description", content: "Diário de glicemia simples, cozy e prático." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Nunito:wght@500;700;800;900&display=swap",
      },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="light" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="light" suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster position="top-center" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}
