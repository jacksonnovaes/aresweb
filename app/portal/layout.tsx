import { CustomerAuthProvider } from "@/contexts/customer-auth-context";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal do cliente",
  description: "Acompanhamento de ordens de serviço do cliente.",
};

export default function CustomerPortalLayout({ children }: { children: React.ReactNode }) {
  return <CustomerAuthProvider>{children}</CustomerAuthProvider>;
}
