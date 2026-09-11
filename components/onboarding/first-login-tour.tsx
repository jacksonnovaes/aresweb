"use client";

import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/api";
import type { OnboardingState } from "@/lib/types";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import Shepherd, { type Tour } from "shepherd.js";

const TOUR_VERSION = "v1";
export const START_ONBOARDING_EVENT = "ares:start-onboarding";

function visibleElement(selector: string) {
  return () => Array.from(document.querySelectorAll<HTMLElement>(selector))
    .find((element) => element.offsetParent !== null) ?? null;
}

function isVisible(selector: string) {
  return () => visibleElement(selector)() !== null;
}

export function FirstLoginTour() {
  const { user, can } = useAuth();
  const pathname = usePathname();
  const tourRef = useRef<Tour | null>(null);
  const startedAutomatically = useRef(false);
  const [onboardingStatus, setOnboardingStatus] = useState<"loading" | "pending" | "completed">("loading");

  const storageKey = user ? `ares.onboarding.${TOUR_VERSION}.${user.tenant.id}.${user.id}` : "";

  const startTour = useCallback(() => {
    if (!user || tourRef.current?.isActive()) return;

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        classes: "ares-tour",
        cancelIcon: { enabled: true, label: "Fechar tour" },
        scrollTo: { behavior: "smooth", block: "center" },
      },
    });
    tourRef.current = tour;

    const backButton = { text: "Voltar", classes: "shepherd-button-secondary", action: () => tour.back() };
    const nextButton = { text: "Avançar", action: () => tour.next() };

    tour.addStep({
      id: "welcome",
      title: `Bem-vindo ao ARES, ${user.name.split(" ")[0]}!`,
      text: "Vamos conhecer os principais recursos para você organizar sua operação desde o primeiro atendimento.",
      buttons: [{ text: "Pular", classes: "shepherd-button-secondary", action: () => tour.cancel() }, nextButton],
    });
    tour.addStep({
      id: "navigation",
      title: "Tudo em um só lugar",
      text: "Use este menu para acessar clientes, ativos, serviços, ordens e configurações da empresa.",
      attachTo: { element: visibleElement('[data-tour="main-navigation"]'), on: "right" },
      showOn: isVisible('[data-tour="main-navigation"]'),
      buttons: [backButton, nextButton],
    });
    if (can("CUSTOMER_READ")) tour.addStep({
      id: "customers",
      title: "Comece pelos clientes",
      text: "Cadastre seus clientes e mantenha dados de contato e histórico de atendimentos organizados.",
      attachTo: { element: visibleElement('[data-tour="nav-customers"]'), on: "right" },
      showOn: isVisible('[data-tour="nav-customers"]'),
      buttons: [backButton, nextButton],
    });
    if (can("SERVICE_READ")) tour.addStep({
      id: "services",
      title: "Monte seu catálogo",
      text: "Cadastre os serviços oferecidos, valores base e tempo estimado para agilizar seus orçamentos.",
      attachTo: { element: visibleElement('[data-tour="nav-services"]'), on: "right" },
      showOn: isVisible('[data-tour="nav-services"]'),
      buttons: [backButton, nextButton],
    });
    if (can("SERVICE_ORDER_READ")) tour.addStep({
      id: "orders",
      title: "Acompanhe as ordens",
      text: "Controle cada serviço desde a abertura até a conclusão, com status, prazos e valores.",
      attachTo: { element: visibleElement('[data-tour="nav-orders"]'), on: "right" },
      showOn: isVisible('[data-tour="nav-orders"]'),
      buttons: [backButton, nextButton],
    });
    if (can("SERVICE_ORDER_CREATE")) tour.addStep({
      id: "new-order",
      title: "Crie uma ordem rapidamente",
      text: "Quando precisar registrar um atendimento, este botão inicia uma nova ordem de serviço.",
      attachTo: { element: visibleElement('[data-tour="new-order"]'), on: "bottom" },
      showOn: isVisible('[data-tour="new-order"]'),
      buttons: [backButton, nextButton],
    });
    tour.addStep({
      id: "account",
      title: "Sua conta e segurança",
      text: "Aqui você altera a aparência, cuida da senha, pode rever este tour e encerra sua sessão.",
      attachTo: { element: visibleElement('[data-tour="account-menu"]'), on: "bottom" },
      showOn: isVisible('[data-tour="account-menu"]'),
      buttons: [backButton, { text: "Concluir", action: () => tour.complete() }],
    });

    const remember = () => {
      localStorage.setItem(storageKey, new Date().toISOString());
      setOnboardingStatus("completed");
      void apiRequest<OnboardingState>("/onboarding", { method: "PUT" }).catch(() => {
        // Local storage prevents repetition on this browser if the API is temporarily unavailable.
      });
      tourRef.current = null;
    };
    tour.on("complete", remember);
    tour.on("cancel", remember);
    tour.start();
  }, [can, storageKey, user]);

  useEffect(() => {
    startedAutomatically.current = false;
    setOnboardingStatus("loading");
    if (!user) return;

    let active = true;
    apiRequest<OnboardingState>("/onboarding")
      .then((state) => {
        if (!active) return;
        const completedLocally = Boolean(localStorage.getItem(storageKey));
        setOnboardingStatus(state.completed || completedLocally ? "completed" : "pending");
        if (!state.completed && completedLocally) {
          void apiRequest<OnboardingState>("/onboarding", { method: "PUT" }).catch(() => {
            // A próxima sessão tentará sincronizar novamente.
          });
        }
      })
      .catch(() => {
        if (active) setOnboardingStatus(localStorage.getItem(storageKey) ? "completed" : "pending");
      });

    return () => {
      active = false;
    };
  }, [storageKey, user]);

  useEffect(() => {
    const handleManualStart = () => startTour();
    window.addEventListener(START_ONBOARDING_EVENT, handleManualStart);
    return () => window.removeEventListener(START_ONBOARDING_EVENT, handleManualStart);
  }, [startTour]);

  useEffect(() => {
    if (!user || pathname !== "/dashboard" || onboardingStatus !== "pending"
      || startedAutomatically.current) return;
    startedAutomatically.current = true;
    const timeout = window.setTimeout(startTour, 650);
    return () => window.clearTimeout(timeout);
  }, [onboardingStatus, pathname, startTour, user]);

  useEffect(() => () => {
    if (tourRef.current?.isActive()) tourRef.current.cancel();
  }, []);

  return null;
}
