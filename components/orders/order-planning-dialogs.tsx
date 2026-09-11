"use client";

import { apiRequest, errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { ServiceOrder, ServiceOrderTechnician, ServiceOrderTimelineEvent } from "@/lib/types";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import {
  Alert, Avatar, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography,
} from "@mui/material";
import { FormEvent, useEffect, useMemo, useState } from "react";

function toLocalInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function toIso(value: string) {
  return value ? new Date(value).toISOString() : null;
}

export function OrderPlanningDialog({ order, technicians, onClose, onUpdated }: {
  order: ServiceOrder | null;
  technicians: ServiceOrderTechnician[];
  onClose: () => void;
  onUpdated: (order: ServiceOrder) => void;
}) {
  const [technicianId, setTechnicianId] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!order) return;
    setTechnicianId(order.assignedTechnicianId ?? "");
    setDueAt(toLocalInput(order.dueAt));
    setStartAt(toLocalInput(order.scheduledStartAt));
    setEndAt(toLocalInput(order.scheduledEndAt));
    setError("");
  }, [order]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!order) return;
    setSaving(true);
    setError("");
    try {
      const updated = await apiRequest<ServiceOrder>(`/service-orders/${order.id}/planning`, {
        method: "PATCH",
        body: {
          assignedTechnicianId: technicianId || null,
          dueAt: toIso(dueAt),
          scheduledStartAt: toIso(startAt),
          scheduledEndAt: toIso(endAt),
        },
      });
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={Boolean(order)} onClose={() => !saving && onClose()} fullWidth maxWidth="sm">
      <Box component="form" onSubmit={submit}>
        <DialogTitle>Planejar atendimento<Typography variant="body2" color="text.secondary" mt={0.5}>{order?.title}</Typography></DialogTitle>
        <DialogContent dividers><Stack spacing={2.25}>
          {error && <Alert severity="error">{error}</Alert>}
          <FormControl fullWidth><InputLabel>Técnico responsável</InputLabel><Select
            label="Técnico responsável" value={technicianId} onChange={(event) => setTechnicianId(event.target.value)}>
            <MenuItem value="">Não atribuído</MenuItem>
            {technicians.map((technician) => <MenuItem key={technician.id} value={technician.id}>{technician.name}</MenuItem>)}
          </Select></FormControl>
          <TextField label="Prazo da ordem" type="datetime-local" value={dueAt}
            onChange={(event) => setDueAt(event.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          <Alert severity="info" icon={<CalendarMonthOutlinedIcon />}>Defina início e fim para exibir o atendimento no calendário.</Alert>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField label="Início agendado" type="datetime-local" value={startAt}
              onChange={(event) => setStartAt(event.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Fim agendado" type="datetime-local" value={endAt}
              onChange={(event) => setEndAt(event.target.value)} fullWidth slotProps={{ inputLabel: { shrink: true } }} />
          </Stack>
        </Stack></DialogContent>
        <DialogActions sx={{ p: 2.5 }}><Button onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={saving || Boolean(startAt) !== Boolean(endAt)}>
            {saving ? "Salvando..." : "Salvar planejamento"}</Button></DialogActions>
      </Box>
    </Dialog>
  );
}

const eventLabels: Record<string, string> = {
  SERVICE_ORDER_CREATED: "Ordem criada",
  SERVICE_ORDER_STATUS_CHANGED: "Status alterado",
  SERVICE_ORDER_QUOTE_UPDATED: "Orçamento atualizado",
  SERVICE_ORDER_PLANNING_UPDATED: "Planejamento atualizado",
  SERVICE_ORDER_EMAIL_PROCESSED: "Envio por e-mail processado",
};

function eventDescription(event: ServiceOrderTimelineEvent) {
  try {
    const details = JSON.parse(event.detailsJson) as Record<string, unknown>;
    if (event.action === "SERVICE_ORDER_STATUS_CHANGED" && details.status) return `Novo status: ${String(details.status)}`;
    if (event.action === "SERVICE_ORDER_QUOTE_UPDATED" && details.estimatedValue != null)
      return `Orçamento com ${String(details.lineCount ?? 0)} itens, valor estimado de R$ ${Number(details.estimatedValue).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`;
    if (event.action === "SERVICE_ORDER_PLANNING_UPDATED") {
      if (details.scheduledStartAt) return `Atendimento agendado para ${formatDateTime(String(details.scheduledStartAt))}.`;
      return details.assignedTechnicianId ? "Técnico responsável atualizado." : "Planejamento e atribuição removidos.";
    }
    if (event.action === "SERVICE_ORDER_EMAIL_PROCESSED" && details.recipient) return `Destinatário: ${String(details.recipient)}`;
  } catch {
    return "Alteração registrada na ordem.";
  }
  return "Alteração registrada na ordem.";
}

export function OrderTimelineDialog({ order, onClose }: { order: ServiceOrder | null; onClose: () => void }) {
  const [events, setEvents] = useState<ServiceOrderTimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!order) return;
    setLoading(true);
    setError("");
    apiRequest<ServiceOrderTimelineEvent[]>(`/service-orders/${order.id}/timeline`)
      .then(setEvents)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, [order]);

  const sorted = useMemo(() => [...events].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)), [events]);

  return (
    <Dialog open={Boolean(order)} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Histórico da ordem<Typography variant="body2" color="text.secondary" mt={0.5}>{order?.title}</Typography></DialogTitle>
      <DialogContent dividers sx={{ minHeight: 260 }}>
        {loading && <Stack alignItems="center" py={6}><CircularProgress size={32} /></Stack>}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && sorted.length === 0 && <Alert severity="info">Nenhum evento registrado para esta ordem.</Alert>}
        <Stack spacing={0}>
          {sorted.map((event, index) => <Stack direction="row" spacing={2} key={event.id}>
            <Stack alignItems="center"><Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main" }}><HistoryOutlinedIcon fontSize="small" /></Avatar>
              {index < sorted.length - 1 && <Box sx={{ width: 2, flex: 1, minHeight: 38, bgcolor: "divider" }} />}</Stack>
            <Box pb={3} flex={1}><Typography fontWeight={750}>{eventLabels[event.action] ?? event.action}</Typography>
              <Typography variant="body2" color="text.secondary">{eventDescription(event)}</Typography>
              <Typography variant="caption" color="text.secondary">{formatDateTime(event.occurredAt)} · {event.actorName}</Typography>
            </Box>
          </Stack>)}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5 }}><Button onClick={onClose}>Fechar</Button></DialogActions>
    </Dialog>
  );
}
