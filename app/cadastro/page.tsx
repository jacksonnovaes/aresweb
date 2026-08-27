"use client";

import { AuthShell } from "@/components/auth/auth-shell";
import { apiRequest, errorMessage } from "@/lib/api";
import type {
  CouponValidation, RegistrationConfiguration, SubscriptionPlan, TenantRegistrationResult, WhatsAppPlanSimulation,
} from "@/lib/types";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Alert, Box, Button, Card, CardActionArea, Checkbox, Chip, CircularProgress, FormControlLabel, Grid,
  InputAdornment, Link as MuiLink, Stack, Switch, TextField, Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

interface RegistrationForm {
  legalName: string;
  tradeName: string;
  slug: string;
  document: string;
  logoUrl: string;
  primaryColor: string;
  plan: SubscriptionPlan;
  whatsapp: string;
  couponCode: string;
  simulatedPaymentApproved: boolean;
  legalAccepted: boolean;
  adminName: string;
  email: string;
  password: string;
  confirmation: string;
}

const plans: Array<{ code: SubscriptionPlan; name: string; price: number; description: string; highlight?: boolean }> = [
  { code: "ESSENTIAL", name: "Essencial", price: 49.90, description: "Para começar a organizar clientes e ordens." },
  { code: "PROFESSIONAL", name: "Profissional", price: 99.90, description: "Para equipes com mais atendimentos.", highlight: true },
  { code: "BUSINESS", name: "Empresarial", price: 199.90, description: "Para operações que precisam escalar." },
];

const initial: RegistrationForm = {
  legalName: "", tradeName: "", slug: "", document: "", logoUrl: "", primaryColor: "#2457E6",
  plan: "PROFESSIONAL", whatsapp: "", couponCode: "", simulatedPaymentApproved: false,
  legalAccepted: false,
  adminName: "", email: "", password: "", confirmation: "",
};

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [simulation, setSimulation] = useState<WhatsAppPlanSimulation | null>(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationError, setSimulationError] = useState("");
  const [registrationConfig, setRegistrationConfig] = useState<RegistrationConfiguration | null>(null);
  const [couponQuote, setCouponQuote] = useState<CouponValidation | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const set = <K extends keyof RegistrationForm>(field: K, value: RegistrationForm[K]) =>
    setForm((current) => ({ ...current, [field]: value }));

  useEffect(() => {
    let cancelled = false;
    apiRequest<RegistrationConfiguration>("/tenants/registration-config")
      .then((config) => {
        if (cancelled) return;
        setRegistrationConfig(config);
        if (config.subscriptionPaymentSimulationEnabled) {
          setForm((current) => ({ ...current, simulatedPaymentApproved: true }));
        }
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível carregar as condições de cadastro. Recarregue a página.");
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const whatsapp = form.whatsapp.replace(/\D/g, "");
    setSimulationLoading(false);
    if (whatsapp.length < 10 || whatsapp.length > 13) {
      setSimulation(null);
      setSimulationError("");
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setSimulationLoading(true);
      setSimulationError("");
      try {
        const result = await apiRequest<WhatsAppPlanSimulation>("/tenants/plan-whatsapp-simulation", {
          method: "POST", body: {
            tradeName: form.tradeName, whatsapp, plan: form.plan,
            couponCode: couponQuote?.couponCode ?? null,
          },
        });
        if (!cancelled) setSimulation(result);
      } catch (err) {
        if (!cancelled) {
          setSimulation(null);
          setSimulationError(errorMessage(err));
        }
      } finally {
        if (!cancelled) setSimulationLoading(false);
      }
    }, 400);

    return () => { cancelled = true; window.clearTimeout(timeout); };
  }, [couponQuote?.couponCode, form.plan, form.tradeName, form.whatsapp]);

  function selectPlan(plan: SubscriptionPlan) {
    set("plan", plan);
    setCouponQuote(null);
    setCouponError("");
  }

  async function applyCoupon() {
    const couponCode = form.couponCode.trim().toUpperCase();
    if (!couponCode) return setCouponError("Informe o código do cupom.");
    setCouponLoading(true); setCouponError("");
    try {
      const result = await apiRequest<CouponValidation>("/tenants/coupon-validation", {
        method: "POST", body: { plan: form.plan, couponCode },
      });
      set("couponCode", result.couponCode);
      setCouponQuote(result);
    } catch (err) {
      setCouponQuote(null);
      setCouponError(errorMessage(err));
    } finally {
      setCouponLoading(false);
    }
  }

  function setTradeName(value: string) {
    setForm((current) => ({
      ...current,
      tradeName: value,
      slug: current.slug || value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError("");
    if (!registrationConfig) return setError("As condições de cadastro não foram carregadas. Recarregue a página.");
    if (!form.legalAccepted) return setError("Aceite os Termos de Uso e confirme a leitura da Política de Privacidade.");
    const document = form.document.replace(/\D/g, "");
    const whatsapp = form.whatsapp.replace(/\D/g, "");
    if (document.length !== 11 && document.length !== 14) {
      return setError("Informe um CPF com 11 dígitos ou um CNPJ com 14 dígitos.");
    }
    if (whatsapp.length < 10 || whatsapp.length > 13) {
      return setError("Informe um WhatsApp válido com DDD.");
    }
    if (form.password !== form.confirmation) return setError("A confirmação da senha não confere.");
    if (form.password.length < 12 || form.password.length > 72
      || !/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password)
      || !/\d/.test(form.password) || !/[^A-Za-z0-9]/.test(form.password)) {
      return setError("A senha deve ter entre 12 e 72 caracteres, com maiúscula, minúscula, número e símbolo.");
    }
    setSubmitting(true);
    try {
      const result = await apiRequest<TenantRegistrationResult>("/tenants/register", { method: "POST", body: {
        legalName: form.legalName, tradeName: form.tradeName, slug: form.slug, document,
        logoUrl: form.logoUrl || null, primaryColor: form.primaryColor,
        plan: form.plan, whatsapp, couponCode: couponQuote?.couponCode ?? null,
        simulatedPaymentApproved: form.simulatedPaymentApproved,
        termsAccepted: form.legalAccepted, privacyNoticeAcknowledged: form.legalAccepted,
        termsVersion: registrationConfig.termsVersion, privacyVersion: registrationConfig.privacyVersion,
        admin: { name: form.adminName, email: form.email, password: form.password, passwordConfirmation: form.confirmation },
      } });
      localStorage.setItem("ares.lastTenantSlug", form.slug);
      router.push(`/?cadastro=${result.subscriptionActive ? "sucesso" : "pendente"}`);
    } catch (err) { setError(errorMessage(err)); }
    finally { setSubmitting(false); }
  }

  return (
    <AuthShell title="Crie seu espaço" subtitle="Cadastre a empresa e personalize a identidade que sua equipe verá.">
      <Box component="form" onSubmit={submit}>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          <Box><Typography variant="h3" mb={2}>Dados da empresa</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}><TextField label="Razão social" required fullWidth value={form.legalName} onChange={(e) => set("legalName", e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 7 }}><TextField label="Nome da marca" required fullWidth value={form.tradeName} onChange={(e) => setTradeName(e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 5 }}><TextField label="CPF/CNPJ" required fullWidth value={form.document} onChange={(e) => set("document", e.target.value.replace(/\D/g, "").slice(0, 14))} helperText="Somente números: 11 dígitos para CPF ou 14 para CNPJ." slotProps={{ htmlInput: { inputMode: "numeric", maxLength: 14 } }} /></Grid>
              <Grid size={{ xs: 12 }}><TextField label="Identificador da empresa" helperText="Apenas letras minúsculas, números e hífens." required fullWidth value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} /></Grid>
            </Grid>
          </Box>
          <Box><Typography variant="h3" mb={2}>Identidade visual</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}><TextField label="URL do logo" fullWidth value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 4 }}><TextField label="Cor principal" fullWidth value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} slotProps={{ input: { startAdornment: <InputAdornment position="start"><Box component="input" type="color" value={form.primaryColor} onChange={(e) => set("primaryColor", e.target.value)} sx={{ width: 26, height: 26, p: 0, border: 0, bgcolor: "transparent", cursor: "pointer" }} /></InputAdornment> } }} /></Grid>
            </Grid>
          </Box>
          <Box><Typography variant="h3">Escolha seu plano</Typography><Typography variant="body2" color="text.secondary" mb={2}>Valores e pagamento simulados para demonstrar a contratação mensal.</Typography>
            <Stack spacing={1.25}>
              {plans.map((plan) => {
                const selected = form.plan === plan.code;
                return <Card key={plan.code} variant="outlined" sx={{ borderColor: selected ? "primary.main" : "divider", borderWidth: selected ? 2 : 1, bgcolor: selected ? "action.selected" : "background.paper" }}>
                  <CardActionArea onClick={() => selectPlan(plan.code)} aria-pressed={selected} sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="center">
                      <Box><Stack direction="row" spacing={1} alignItems="center"><Typography fontWeight={850}>{plan.name}</Typography>{plan.highlight && <Chip label="Mais escolhido" size="small" color="primary" />}</Stack><Typography variant="body2" color="text.secondary" mt={0.5}>{plan.description}</Typography></Box>
                      <Box textAlign="right" flexShrink={0}>
                        {selected && couponQuote?.couponApplied && <Typography variant="caption" color="text.secondary" sx={{ textDecoration: "line-through" }}>{currency.format(couponQuote.originalPrice)}</Typography>}
                        <Typography fontWeight={900} color={selected ? "primary.main" : "text.primary"}>{currency.format(selected && couponQuote ? couponQuote.monthlyPrice : plan.price)}</Typography>
                        <Typography variant="caption" color="text.secondary">por mês</Typography>
                      </Box>
                    </Stack>
                  </CardActionArea>
                </Card>;
              })}
            </Stack>
            {registrationConfig?.couponEnabled && <Box sx={{ mt: 2, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} alignItems={{ sm: "flex-start" }}>
                <TextField label="Cupom de desconto" value={form.couponCode} onChange={(event) => {
                  set("couponCode", event.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "").slice(0, 40));
                  setCouponQuote(null); setCouponError("");
                }} fullWidth slotProps={{ input: { startAdornment: <InputAdornment position="start"><LocalOfferRoundedIcon /></InputAdornment> } }} />
                <Button type="button" variant="outlined" onClick={applyCoupon} disabled={couponLoading || !form.couponCode.trim()} sx={{ minWidth: 130, height: 56 }}>{couponLoading ? "Aplicando..." : "Aplicar"}</Button>
              </Stack>
              {couponError && <Alert severity="error" sx={{ mt: 1.5 }}>{couponError}</Alert>}
              {couponQuote?.couponApplied && <Alert severity="success" sx={{ mt: 1.5 }}>
                Cupom {couponQuote.couponCode} aplicado: {couponQuote.discountPercentage}% de desconto. Mensalidade de {currency.format(couponQuote.monthlyPrice)}.
              </Alert>}
            </Box>}
            <TextField label="WhatsApp para receber a proposta" required fullWidth value={form.whatsapp} onChange={(event) => set("whatsapp", event.target.value.replace(/\D/g, "").slice(0, 13))} helperText="Informe DDD e número. Nenhuma mensagem real será enviada nesta simulação." slotProps={{ htmlInput: { inputMode: "tel", maxLength: 13 }, input: { startAdornment: <InputAdornment position="start"><WhatsAppIcon color="success" /></InputAdornment> } }} sx={{ mt: 2 }} />
            <Box sx={{ mt: 1.5, p: 2, borderRadius: 2.5, bgcolor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}><WhatsAppIcon color="success" /><Typography fontWeight={800}>Prévia do WhatsApp</Typography>{simulationLoading && <CircularProgress size={16} />}</Stack>
              {simulationError && <Alert severity="error">{simulationError}</Alert>}
              {!simulation && !simulationLoading && !simulationError && <Typography variant="body2" color="text.secondary">Informe o WhatsApp e escolha um plano para gerar a mensagem simulada.</Typography>}
              {simulation && <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{simulation.message}</Typography>}
            </Box>
            {registrationConfig?.subscriptionPaymentSimulationEnabled && <Box sx={{ mt: 2, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
              <FormControlLabel control={<Switch checked={form.simulatedPaymentApproved} onChange={(event) => set("simulatedPaymentApproved", event.target.checked)} />} label={<Box><Typography fontWeight={800}>Simular primeira mensalidade paga</Typography><Typography variant="body2" color="text.secondary">Ativado: acesso liberado por 30 dias. Desativado: empresa criada com acesso pendente.</Typography></Box>} sx={{ m: 0, alignItems: "flex-start", gap: 1 }} />
            </Box>}
            {registrationConfig && !registrationConfig.subscriptionPaymentSimulationEnabled && <Alert severity="info" sx={{ mt: 2 }}>A simulação de pagamento está desabilitada neste ambiente. A empresa será criada com mensalidade pendente.</Alert>}
          </Box>
          <Box><Typography variant="h3" mb={2}>Administrador</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}><TextField label="Nome completo" required fullWidth value={form.adminName} onChange={(e) => set("adminName", e.target.value)} /></Grid>
              <Grid size={{ xs: 12 }}><TextField label="E-mail" type="email" required fullWidth value={form.email} onChange={(e) => set("email", e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Senha" type="password" required fullWidth value={form.password} onChange={(e) => set("password", e.target.value)} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Confirmar senha" type="password" required fullWidth value={form.confirmation} onChange={(e) => set("confirmation", e.target.value)} /></Grid>
            </Grid>
          </Box>
          <FormControlLabel control={<Checkbox checked={form.legalAccepted} onChange={(event) => set("legalAccepted", event.target.checked)} required />} label={<Typography variant="body2" color="text.secondary">
            Li e aceito os <MuiLink component={Link} href="/termos-de-uso" target="_blank" fontWeight={750}>Termos de Uso</MuiLink> e declaro ter lido a <MuiLink component={Link} href="/politica-de-privacidade" target="_blank" fontWeight={750}>Política de Privacidade</MuiLink>.
          </Typography>} sx={{ alignItems: "flex-start", m: 0 }} />
          <Button type="submit" variant="contained" size="large" disabled={submitting || !registrationConfig || !form.legalAccepted} startIcon={<CheckRoundedIcon />}>{submitting ? "Criando espaço..." : `Criar empresa no plano ${plans.find((plan) => plan.code === form.plan)?.name}`}</Button>
        </Stack>
      </Box>
    </AuthShell>
  );
}
