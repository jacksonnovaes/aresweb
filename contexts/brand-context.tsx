"use client";

import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/api";
import { publicMediaUrl } from "@/lib/public-profile";
import type { AppearanceSettings, Branding } from "@/lib/types";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface BrandSettings {
  tradeName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  borderRadius: number;
  darkMode: boolean;
}

const defaults: BrandSettings = {
  tradeName: "Ares",
  logoUrl: "",
  primaryColor: "#2457E6",
  secondaryColor: "#16A085",
  borderRadius: 12,
  darkMode: false,
};

interface BrandContextValue {
  brand: BrandSettings;
  remoteBrand: Branding | null;
  saveBrand: (settings: BrandSettings) => Promise<BrandSettings>;
  restoreRemoteBrand: () => void;
  loadBranding: (slug: string) => Promise<void>;
}

const BrandContext = createContext<BrandContextValue | null>(null);

const dashboardRoutes = [
  "/admin",
  "/aparencia",
  "/ativos",
  "/clientes",
  "/configuracoes",
  "/dashboard",
  "/ordens",
  "/pagina-publica",
  "/seguranca",
  "/servicos",
  "/usuarios",
];

function isDashboardRoute(pathname: string) {
  return dashboardRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function fromRemote(remote: Branding): BrandSettings {
  return {
    ...defaults,
    tradeName: remote.tradeName || defaults.tradeName,
    logoUrl: publicMediaUrl(remote.logoUrl),
    primaryColor: remote.primaryColor || defaults.primaryColor,
    secondaryColor: remote.secondaryColor || defaults.secondaryColor,
    borderRadius: remote.borderRadius ?? defaults.borderRadius,
    darkMode: remote.darkMode ?? defaults.darkMode,
  };
}

function fromSettings(settings: AppearanceSettings): BrandSettings {
  return {
    tradeName: settings.tradeName || defaults.tradeName,
    logoUrl: publicMediaUrl(settings.logoUrl),
    primaryColor: settings.primaryColor || defaults.primaryColor,
    secondaryColor: settings.secondaryColor || defaults.secondaryColor,
    borderRadius: settings.borderRadius ?? defaults.borderRadius,
    darkMode: settings.darkMode ?? defaults.darkMode,
  };
}

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [brand, setBrand] = useState(defaults);
  const [remoteBrand, setRemoteBrand] = useState<Branding | null>(null);

  const loadBranding = useCallback(async (slug: string) => {
    const remote = await apiRequest<Branding>(`/branding?slug=${encodeURIComponent(slug)}`);
    setRemoteBrand(remote);
    localStorage.setItem("ares.lastTenantSlug", slug);
    setBrand(fromRemote(remote));
  }, []);

  useEffect(() => {
    const querySlug = new URLSearchParams(window.location.search).get("tenant");
    const slug = user?.tenant.slug || querySlug || localStorage.getItem("ares.lastTenantSlug");
    if (slug) loadBranding(slug).catch(() => setBrand(defaults));
    else setBrand(defaults);
  }, [loadBranding, user?.tenant.slug]);

  const saveBrand = useCallback(async (settings: BrandSettings) => {
    const persisted = await apiRequest<AppearanceSettings>("/appearance-settings", {
      method: "PUT",
      body: {
        tradeName: settings.tradeName,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        borderRadius: settings.borderRadius,
        darkMode: settings.darkMode,
      },
    });
    const updated = fromSettings(persisted);
    setBrand(updated);
    setRemoteBrand((current) => current ? {
      ...current,
      tradeName: persisted.tradeName,
      logoUrl: persisted.logoUrl,
      primaryColor: persisted.primaryColor,
      secondaryColor: persisted.secondaryColor,
      borderRadius: persisted.borderRadius,
      darkMode: persisted.darkMode,
    } : current);
    return updated;
  }, []);

  const restoreRemoteBrand = useCallback(() => {
    const restored = remoteBrand ? fromRemote(remoteBrand) : defaults;
    setBrand(restored);
  }, [remoteBrand]);

  const darkModeEnabled = brand.darkMode && isDashboardRoute(pathname);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkModeEnabled ? "dark" : "light",
      primary: { main: brand.primaryColor },
      secondary: { main: brand.secondaryColor },
      background: darkModeEnabled
        ? { default: "#0B1120", paper: "#111827" }
        : { default: "#F5F7FB", paper: "#FFFFFF" },
      text: darkModeEnabled
        ? { primary: "#F3F4F6", secondary: "#A7B0C0" }
        : { primary: "#172033", secondary: "#667085" },
      divider: darkModeEnabled ? "#2A364A" : "#E5E9F2",
    },
    shape: { borderRadius: brand.borderRadius },
    typography: {
      fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      h1: { fontSize: "2rem", fontWeight: 760, letterSpacing: "-0.035em" },
      h2: { fontSize: "1.5rem", fontWeight: 740, letterSpacing: "-0.025em" },
      h3: { fontSize: "1.125rem", fontWeight: 700 },
      button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { minHeight: 42, paddingInline: 18 } },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            border: `1px solid ${darkModeEnabled ? "#2A364A" : "#E5E9F2"}`,
            boxShadow: darkModeEnabled ? "0 1px 3px rgba(0,0,0,.35)" : "0 1px 3px rgba(16,24,40,.04)",
            backgroundImage: "none",
          },
        },
      },
      MuiTextField: { defaultProps: { size: "medium" } },
      MuiFormControl: { defaultProps: { size: "medium" } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: Math.max(12, brand.borderRadius), minHeight: 54 },
        },
      },
      MuiDialog: { styleOverrides: { paper: { backgroundImage: "none" } } },
    },
  }), [brand, darkModeEnabled]);

  const value = useMemo(() => ({ brand, remoteBrand, saveBrand, restoreRemoteBrand, loadBranding }),
    [brand, loadBranding, remoteBrand, restoreRemoteBrand, saveBrand]);

  return (
    <BrandContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) throw new Error("useBrand deve ser usado dentro de BrandProvider");
  return context;
}
