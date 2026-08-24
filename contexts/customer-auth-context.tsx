"use client";

import { useBrand } from "@/contexts/brand-context";
import { customerApiRequest } from "@/lib/api";
import type { AuthenticationResult, Me } from "@/lib/types";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

interface CustomerAuthContextValue {
  customer: Me | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { loadBranding } = useBrand();

  const refreshCustomer = useCallback(async () => {
    try {
      const me = await customerApiRequest<Me>("/auth/me");
      if (!me.roles.includes("CUSTOMER")) throw new Error("A conta não pertence a um cliente.");
      setCustomer(me);
      void loadBranding(me.tenant.slug).catch(() => undefined);
    } catch {
      setCustomer(null);
    }
  }, [loadBranding]);

  useEffect(() => {
    void refreshCustomer().finally(() => setLoading(false));
  }, [refreshCustomer]);

  useEffect(() => {
    if (loading) return;
    if (!customer && pathname !== "/portal") router.replace("/portal");
    if (customer && pathname === "/portal") router.replace("/portal/ordens");
  }, [customer, loading, pathname, router]);

  const login = useCallback(async (email: string, password: string) => {
    await customerApiRequest<AuthenticationResult>("/auth/login", {
      method: "POST", body: { email, password },
    });
    await refreshCustomer();
    router.replace("/portal/ordens");
  }, [refreshCustomer, router]);

  const logout = useCallback(async () => {
    try {
      await customerApiRequest<void>("/auth/logout", { method: "POST" });
    } finally {
      setCustomer(null);
      router.replace("/portal");
    }
  }, [router]);

  const value = useMemo(() => ({ customer, loading, login, logout }),
    [customer, loading, login, logout]);

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) throw new Error("useCustomerAuth deve ser usado dentro de CustomerAuthProvider");
  return context;
}
