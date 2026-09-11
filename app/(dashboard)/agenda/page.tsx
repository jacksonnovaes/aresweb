"use client";

import { ErrorAlert } from "@/components/common/feedback";
import { PageHeader } from "@/components/common/page-header";
import { StatusChip } from "@/components/common/status-chip";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest, errorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import type { Customer, ServiceOrder, ServiceOrderTechnician } from "@/lib/types";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import {
  Box, Button, Card, Chip, CircularProgress, FormControl, IconButton, InputLabel, MenuItem, Select,
  Stack, Tooltip, Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const monthTitle = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });
const time = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });

function dayKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export default function SchedulePage() {
  const router = useRouter();
  const { can } = useAuth();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [technicians, setTechnicians] = useState<ServiceOrderTechnician[]>([]);
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [technicianFilter, setTechnicianFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [orderData, customerData, technicianData] = await Promise.all([
        apiRequest<ServiceOrder[]>("/service-orders"),
        apiRequest<Customer[]>("/customers"),
        can("SERVICE_ORDER_UPDATE") ? apiRequest<ServiceOrderTechnician[]>("/service-orders/technicians") : Promise.resolve([]),
      ]);
      setOrders(orderData);
      setCustomers(customerData);
      setTechnicians(technicianData);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [can]);

  useEffect(() => { void load(); }, [load]);

  const customerMap = useMemo(() => new Map(customers.map((customer) => [customer.id, customer.name])), [customers]);
  const technicianMap = useMemo(() => new Map(technicians.map((technician) => [technician.id, technician.name])), [technicians]);
  const visibleOrders = useMemo(() => orders.filter((order) => order.scheduledStartAt &&
    (technicianFilter === "all" || order.assignedTechnicianId === technicianFilter)), [orders, technicianFilter]);
  const ordersByDay = useMemo(() => {
    const grouped = new Map<string, ServiceOrder[]>();
    visibleOrders.forEach((order) => {
      const key = dayKey(new Date(order.scheduledStartAt!));
      grouped.set(key, [...(grouped.get(key) ?? []), order]);
    });
    grouped.forEach((items) => items.sort((a, b) => a.scheduledStartAt!.localeCompare(b.scheduledStartAt!)));
    return grouped;
  }, [visibleOrders]);
  const days = useMemo(() => monthGrid(month), [month]);
  const unscheduled = orders.filter((order) => !order.scheduledStartAt && order.status !== "COMPLETED" &&
    (technicianFilter === "all" || order.assignedTechnicianId === technicianFilter));

  function moveMonth(offset: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return <>
    <PageHeader eyebrow="Operação" title="Agenda de atendimentos"
      description="Visualize os serviços agendados, responsáveis e horários em um único calendário."
      actionLabel="Ver ordens" actionIcon={<CalendarMonthOutlinedIcon />} onAction={() => router.push("/ordens")} />
    {error && <Box mb={2.5}><ErrorAlert message={error} onRetry={load} /></Box>}
    <Card>
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} gap={2}
        sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Tooltip title="Mês anterior"><IconButton onClick={() => moveMonth(-1)}><ChevronLeftRoundedIcon /></IconButton></Tooltip>
          <Typography variant="h3" sx={{ minWidth: 190, textTransform: "capitalize", textAlign: "center" }}>{monthTitle.format(month)}</Typography>
          <Tooltip title="Próximo mês"><IconButton onClick={() => moveMonth(1)}><ChevronRightRoundedIcon /></IconButton></Tooltip>
          <Button size="small" onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Hoje</Button>
        </Stack>
        <FormControl sx={{ minWidth: 230, ml: { md: "auto" } }}><InputLabel>Técnico</InputLabel><Select
          label="Técnico" value={technicianFilter} onChange={(event) => setTechnicianFilter(event.target.value)}>
          <MenuItem value="all">Todos os técnicos</MenuItem>
          {technicians.map((technician) => <MenuItem key={technician.id} value={technician.id}>{technician.name}</MenuItem>)}
        </Select></FormControl>
      </Stack>
      {loading ? <Stack alignItems="center" py={10}><CircularProgress /></Stack> :
      <Box sx={{ overflowX: "auto" }}><Box sx={{ minWidth: 900 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {weekDays.map((day) => <Box key={day} sx={{ p: 1.25, textAlign: "center", borderBottom: "1px solid", borderColor: "divider", bgcolor: "action.hover" }}><Typography variant="caption" fontWeight={800}>{day}</Typography></Box>)}
          {days.map((date) => {
            const key = dayKey(date);
            const dayOrders = ordersByDay.get(key) ?? [];
            const outside = date.getMonth() !== month.getMonth();
            const today = key === dayKey(new Date());
            return <Box key={key} sx={{ minHeight: 132, p: 1, borderRight: "1px solid", borderBottom: "1px solid", borderColor: "divider", bgcolor: outside ? "action.hover" : "background.paper", opacity: outside ? 0.62 : 1 }}>
              <Chip label={date.getDate()} size="small" color={today ? "primary" : "default"} variant={today ? "filled" : "outlined"} sx={{ mb: 0.75, height: 25 }} />
              <Stack spacing={0.75}>{dayOrders.map((order) => <Box component={Link} href="/ordens" key={order.id}
                sx={{ display: "block", textDecoration: "none", color: "inherit", p: 0.8, borderRadius: 1.5, bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}>
                <Typography variant="caption" color="primary.contrastText" fontWeight={800} display="block">{time.format(new Date(order.scheduledStartAt!))} · {order.title}</Typography>
                <Typography variant="caption" color="primary.contrastText" sx={{ opacity: 0.82 }} noWrap>{technicianMap.get(order.assignedTechnicianId ?? "") ?? "Sem técnico"}</Typography>
              </Box>)}</Stack>
            </Box>;
          })}
        </Box>
      </Box></Box>}
    </Card>
    {!loading && <Card sx={{ mt: 3, p: 2.5 }}><Stack direction={{ xs: "column", md: "row" }} gap={2} alignItems={{ md: "center" }} mb={2}>
      <Box><Typography variant="h3">Aguardando agendamento</Typography><Typography variant="body2" color="text.secondary">Ordens abertas que ainda não possuem início e fim definidos.</Typography></Box>
      <Chip label={`${unscheduled.length} pendentes`} sx={{ ml: { md: "auto" } }} />
    </Stack>
    {unscheduled.length === 0 ? <Typography variant="body2" color="text.secondary">Todas as ordens ativas estão agendadas.</Typography> :
      <Stack spacing={1}>{unscheduled.slice(0, 8).map((order) => <Stack key={order.id} direction={{ xs: "column", sm: "row" }} gap={1.5} alignItems={{ sm: "center" }} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Box flex={1}><Typography fontWeight={750}>{order.title}</Typography><Typography variant="body2" color="text.secondary">{customerMap.get(order.customerId) ?? "Cliente"} · prazo {formatDateTime(order.dueAt)}</Typography></Box>
        <StatusChip value={order.status} /><Button component={Link} href="/ordens" size="small">Planejar</Button>
      </Stack>)}</Stack>}
    </Card>}
  </>;
}
