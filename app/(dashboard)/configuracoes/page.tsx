"use client";

import { ErrorAlert, PageLoading } from "@/components/common/feedback";
import { PageHeader } from "@/components/common/page-header";
import { StatusChip } from "@/components/common/status-chip";
import { DataManagementCard } from "@/components/privacy/data-management-card";
import { apiRequest, errorMessage } from "@/lib/api";
import type { CompanySettings, ServiceOrderStatusDefinition } from "@/lib/types";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import DevicesOtherRoundedIcon from "@mui/icons-material/DevicesOtherRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SquareFootRoundedIcon from "@mui/icons-material/SquareFootRounded";
import {
  Alert, Box, Button, Card, CardContent, Chip, FormControl, FormControlLabel, InputAdornment,
  InputLabel, MenuItem, Select, Stack, Switch, TextField, Typography,
} from "@mui/material";
import { FormEvent, useCallback, useEffect, useState } from "react";

const planDetails = {
  ESSENTIAL: { name: "Essencial", price: 49.90 },
  PROFESSIONAL: { name: "Profissional", price: 99.90 },
  BUSINESS: { name: "Empresarial", price: 199.90 },
};

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" });

export default function CompanySettingsPage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [statuses, setStatuses] = useState<ServiceOrderStatusDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [statusName, setStatusName] = useState("");
  const [statusSaving, setStatusSaving] = useState(false);
  const [statusError, setStatusError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [settingsData, statusData] = await Promise.all([
        apiRequest<CompanySettings>("/company-settings"),
        apiRequest<ServiceOrderStatusDefinition[]>("/service-order-statuses"),
      ]);
      setSettings(settingsData); setStatuses(statusData);
    }
    catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!settings) return;
    setSaving(true); setSaved(false); setError("");
    try {
      setSettings(await apiRequest<CompanySettings>("/company-settings", {
        method: "PUT", body: {
          requireAssets: settings.requireAssets,
          quoteCalculationMethod: settings.quoteCalculationMethod,
          defaultSquareMeterPrice: settings.defaultSquareMeterPrice,
          defaultCubicMeterPrice: settings.defaultCubicMeterPrice,
        },
      }));
      setSaved(true);
    } catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  }

  async function createStatus(event: FormEvent) {
    event.preventDefault();
    if (!statusName.trim()) return;
    setStatusSaving(true); setStatusError("");
    try {
      const created = await apiRequest<ServiceOrderStatusDefinition>("/service-order-statuses", {
        method: "POST", body: { name: statusName.trim() },
      });
      setStatuses((current) => [...current, created].sort((a, b) => a.displayOrder - b.displayOrder));
      setStatusName("");
    } catch (err) { setStatusError(errorMessage(err)); }
    finally { setStatusSaving(false); }
  }

  return (
    <>
      <PageHeader eyebrow="Empresa" title="Configuração da empresa" description="Defina como os atendimentos funcionam para o perfil da sua prestação de serviços." />
      {loading && <PageLoading label="Carregando configurações..." />}
      {!loading && error && !settings && <ErrorAlert message={error} onRetry={load} />}
      {!loading && settings && <Stack spacing={3} sx={{ maxWidth: 760 }}>
      <Card><CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}><Stack spacing={2.5}>
        <Stack direction="row" spacing={1.5} alignItems="center"><Box sx={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 2.25, bgcolor: "success.main", color: "white" }}><CreditCardRoundedIcon /></Box><Box><Typography variant="h3">Plano e mensalidade</Typography><Typography variant="body2" color="text.secondary">Acompanhe o plano contratado e a liberação do acesso da empresa.</Typography></Box></Stack>
        <Box sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2.5, bgcolor: "#F8FAFC" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
            <Box><Typography variant="overline" color="text.secondary">Plano atual</Typography><Typography variant="h3">{planDetails[settings.subscriptionPlan].name}</Typography><Typography variant="body2" color="text.secondary" mt={0.5}>{currency.format(settings.subscriptionMonthlyPrice)} por mês</Typography>{settings.couponCode && <Chip label={`Cupom ${settings.couponCode} · ${settings.couponDiscountPercentage}% off`} size="small" color="success" variant="outlined" sx={{ mt: 1 }} />}</Box>
            <Box sx={{ textAlign: { sm: "right" } }}><Typography variant="overline" color="text.secondary">Situação</Typography><Box mt={0.5}><Chip label={settings.subscriptionActive ? "Mensalidade ativa" : "Pagamento pendente"} color={settings.subscriptionActive ? "success" : "warning"} /></Box>{settings.subscriptionPaidUntil && <Typography variant="body2" color="text.secondary" mt={1}>Pago até {date.format(new Date(settings.subscriptionPaidUntil))}</Typography>}</Box>
          </Stack>
        </Box>
        <Alert severity={settings.subscriptionActive ? "success" : "warning"}>{settings.subscriptionActive ? "O pagamento da mensalidade está confirmado e o acesso da empresa está liberado." : "O acesso da empresa permanece bloqueado até a confirmação da mensalidade."}</Alert>
      </Stack></CardContent></Card>
      <Card><Box component="form" onSubmit={submit}><CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}><Stack spacing={2.5}>
        <Stack direction="row" spacing={1.5} alignItems="center"><Box sx={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 2.25, bgcolor: "primary.main", color: "white" }}><DevicesOtherRoundedIcon /></Box><Box><Typography variant="h3">Ativos nos atendimentos</Typography><Typography variant="body2" color="text.secondary">Controle se a empresa trabalha com equipamentos, veículos, imóveis ou outros ativos.</Typography></Box></Stack>
        {error && <Alert severity="error">{error}</Alert>}
        {saved && <Alert severity="success">Configuração salva. Os próximos cadastros já usarão esta regra.</Alert>}
        <Box sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2.5, bgcolor: "#F8FAFC" }}>
          <FormControlLabel control={<Switch checked={!settings.requireAssets} onChange={(event) => { setSaved(false); setSettings({ ...settings, requireAssets: !event.target.checked }); }} />} label={<Box><Typography fontWeight={800}>Não exigir ativos</Typography><Typography variant="body2" color="text.secondary">Use esta opção para diaristas, montadores, pedreiros e outros serviços identificados apenas pela descrição.</Typography></Box>} sx={{ m: 0, alignItems: "flex-start", gap: 1 }} />
        </Box>
        <Alert severity={settings.requireAssets ? "info" : "success"}>{settings.requireAssets ? "Serviços de manutenção continuarão exigindo a seleção de um ativo." : "O cadastro de serviços e as ordens não solicitarão ativo."}</Alert>
        <Box sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.25} alignItems="center"><SquareFootRoundedIcon color="primary" /><Box><Typography fontWeight={850}>Cálculo padrão dos orçamentos</Typography><Typography variant="body2" color="text.secondary">Escolha como novas linhas serão preenchidas. O método ainda poderá ser alterado em cada item.</Typography></Box></Stack>
            <FormControl fullWidth><InputLabel>Método de cálculo padrão</InputLabel><Select label="Método de cálculo padrão" value={settings.quoteCalculationMethod} onChange={(event) => { setSaved(false); setSettings({ ...settings, quoteCalculationMethod: event.target.value as CompanySettings["quoteCalculationMethod"] }); }}><MenuItem value="QUANTITY">Quantidade × valor unitário</MenuItem><MenuItem value="SQUARE_METER">Área: largura × comprimento × quantidade</MenuItem><MenuItem value="CUBIC_METER">Volume: largura × comprimento × altura × quantidade</MenuItem></Select></FormControl>
            {settings.quoteCalculationMethod === "SQUARE_METER" && <TextField label="Valor padrão do metro quadrado" type="number" value={settings.defaultSquareMeterPrice ?? ""} onChange={(event) => { setSaved(false); setSettings({ ...settings, defaultSquareMeterPrice: event.target.value ? Number(event.target.value) : null }); }} required fullWidth slotProps={{ htmlInput: { min: 0.01, step: 0.01 }, input: { startAdornment: <InputAdornment position="start">R$</InputAdornment>, endAdornment: <InputAdornment position="end">/ m²</InputAdornment> } }} helperText="Esse preço será sugerido nas novas linhas e poderá ser ajustado no orçamento." />}
            {settings.quoteCalculationMethod === "CUBIC_METER" && <TextField label="Valor padrão do metro cúbico" type="number" value={settings.defaultCubicMeterPrice ?? ""} onChange={(event) => { setSaved(false); setSettings({ ...settings, defaultCubicMeterPrice: event.target.value ? Number(event.target.value) : null }); }} required fullWidth slotProps={{ htmlInput: { min: 0.01, step: 0.01 }, input: { startAdornment: <InputAdornment position="start">R$</InputAdornment>, endAdornment: <InputAdornment position="end">/ m³</InputAdornment> } }} helperText="Ideal para concreto, escavação, alvenaria e outros serviços calculados por volume." />}
            <Alert severity="info">{settings.quoteCalculationMethod === "SQUARE_METER" ? "Exemplo: 2 m de largura × 3 m de comprimento × 2 peças = 12 m². O subtotal será 12 × o valor do m²." : settings.quoteCalculationMethod === "CUBIC_METER" ? "Exemplo: 2 m de largura × 3 m de comprimento × 0,2 m de altura = 1,2 m³. O subtotal será 1,2 × o valor do m³." : "O subtotal será calculado multiplicando a quantidade pelo valor unitário."}</Alert>
          </Stack>
        </Box>
        <Button type="submit" variant="contained" startIcon={<SaveRoundedIcon />} disabled={saving || (settings.quoteCalculationMethod === "SQUARE_METER" && (!settings.defaultSquareMeterPrice || settings.defaultSquareMeterPrice <= 0)) || (settings.quoteCalculationMethod === "CUBIC_METER" && (!settings.defaultCubicMeterPrice || settings.defaultCubicMeterPrice <= 0))} sx={{ alignSelf: "flex-end" }}>{saving ? "Salvando..." : "Salvar configuração"}</Button>
      </Stack></CardContent></Box></Card>
      <Card><CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}><Stack spacing={2.5}>
        <Stack direction="row" spacing={1.5} alignItems="center"><Box sx={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 2.25, bgcolor: "secondary.main", color: "white" }}><AssignmentTurnedInRoundedIcon /></Box><Box><Typography variant="h3">Status das ordens</Typography><Typography variant="body2" color="text.secondary">Cadastre as etapas que representam o fluxo de atendimento da empresa.</Typography></Box></Stack>
        <Box sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2.5, bgcolor: "#F8FAFC" }}>
          <Typography variant="subtitle2" fontWeight={800} mb={1.5}>Status disponíveis</Typography>
          <Stack direction="row" gap={1} flexWrap="wrap">
            {statuses.map((status) => <Stack key={status.id} direction="row" spacing={0.75} alignItems="center"><StatusChip value={status.code} label={status.name} />{status.systemDefault && <Chip label="Padrão" size="small" variant="outlined" />}</Stack>)}
          </Stack>
        </Box>
        {statusError && <Alert severity="error">{statusError}</Alert>}
        <Box component="form" onSubmit={createStatus}><Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "flex-start" }}>
          <TextField label="Nome do novo status" placeholder="Ex.: Aguardando peças" value={statusName} onChange={(event) => setStatusName(event.target.value)} required fullWidth slotProps={{ htmlInput: { maxLength: 100 } }} helperText="O status ficará disponível imediatamente nas ordens de serviço." />
          <Button type="submit" variant="contained" startIcon={<AddRoundedIcon />} disabled={statusSaving || !statusName.trim()} sx={{ minWidth: 180, height: 56 }}>{statusSaving ? "Cadastrando..." : "Cadastrar status"}</Button>
        </Stack></Box>
      </Stack></CardContent></Card>
      <DataManagementCard />
      </Stack>}
    </>
  );
}
