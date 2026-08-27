"use client";

import { BrandMark } from "@/components/common/brand-mark";
import { ErrorAlert, PageLoading } from "@/components/common/feedback";
import { StatusChip } from "@/components/common/status-chip";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import { customerApiRequest, errorMessage } from "@/lib/api";
import { formatDateTime, formatMoney } from "@/lib/format";
import type { CustomerServiceOrder } from "@/lib/types";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import {
  AppBar, Box, Button, Card, CardContent, Container, Divider, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";

export default function CustomerOrdersPage() {
  const { customer, loading: authLoading, logout } = useCustomerAuth();
  const [orders, setOrders] = useState<CustomerServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!customer) return;
    setLoading(true); setError("");
    try { setOrders(await customerApiRequest<CustomerServiceOrder[]>("/service-orders")); }
    catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }, [customer]);

  useEffect(() => { void load(); }, [load]);

  if (authLoading || !customer) return <PageLoading label="Validando seu acesso..." />;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F7FB" }}>
      <AppBar position="sticky" color="inherit" elevation={0} sx={{ borderBottom: "1px solid", borderColor: "divider", bgcolor: "rgba(255,255,255,.94)", backdropFilter: "blur(14px)" }}>
        <Toolbar sx={{ minHeight: { xs: 68, sm: 76 } }}><Container maxWidth="lg" disableGutters sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <BrandMark />
          <Box sx={{ flex: 1 }} />
          <Box textAlign="right" sx={{ display: { xs: "none", sm: "block" } }}><Typography variant="body2" fontWeight={750}>{customer.name}</Typography><Typography variant="caption" color="text.secondary">{customer.tenant.name}</Typography></Box>
          <Button color="inherit" startIcon={<LogoutRoundedIcon />} onClick={() => void logout()}>Sair</Button>
        </Container></Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: { xs: 3, sm: 5 } }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} mb={3.5}>
          <Box><Typography variant="overline" color="primary.main" fontWeight={850}>Acompanhamento</Typography><Typography component="h1" variant="h1">Minhas ordens de serviço</Typography><Typography color="text.secondary" mt={0.75}>Consulte o andamento, os prazos e os itens de cada atendimento.</Typography></Box>
          <Card sx={{ minWidth: 180, alignSelf: { sm: "flex-end" } }}><CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}><Typography variant="caption" color="text.secondary">Total de ordens</Typography><Typography variant="h4" fontWeight={850}>{orders.length}</Typography></CardContent></Card>
        </Stack>

        {error && <ErrorAlert message={error} onRetry={load} />}
        {loading && <PageLoading label="Carregando suas ordens..." />}
        {!loading && !error && orders.length === 0 && <Card><CardContent sx={{ py: 8, textAlign: "center" }}><ReceiptLongOutlinedIcon sx={{ fontSize: 48, color: "text.disabled" }} /><Typography variant="h3" mt={1.5}>Nenhuma ordem encontrada</Typography><Typography color="text.secondary" mt={0.75}>Quando houver um atendimento vinculado ao seu cadastro, ele aparecerá aqui.</Typography></CardContent></Card>}

        {!loading && <Stack spacing={2.5}>{orders.map((order) => (
          <Card key={order.id}><CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
              <Box><Typography variant="caption" color="text.secondary">ORDEM #{order.id.slice(0, 8).toUpperCase()}</Typography><Typography variant="h2" mt={0.5}>{order.title}</Typography></Box>
              <Stack direction="row" gap={1} alignItems="flex-start"><StatusChip value={order.priority} /><StatusChip value={order.status} label={order.statusName} /></Stack>
            </Stack>
            {order.description && <Typography color="text.secondary" mt={2} sx={{ whiteSpace: "pre-wrap" }}>{order.description}</Typography>}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, p: 2.25, my: 3, borderRadius: 2.5, bgcolor: "#F8FAFC" }}>
              <OrderDetail label="Abertura" value={formatDateTime(order.openedAt)} />
              <OrderDetail label="Prazo" value={formatDateTime(order.dueAt)} />
              <OrderDetail label="Valor estimado" value={formatMoney(order.estimatedValue)} />
              <OrderDetail label="Valor final" value={order.finalValue == null ? "—" : formatMoney(order.finalValue)} />
            </Box>
            <Divider sx={{ mb: 2.5 }} />
            <Typography variant="h3" mb={1.5}>Itens do atendimento</Typography>
            <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}><Table size="small">
              <TableHead><TableRow><TableCell>Descrição</TableCell><TableCell align="right">Qtd.</TableCell><TableCell>Un.</TableCell><TableCell align="right">Valor unitário</TableCell><TableCell align="right">Total</TableCell></TableRow></TableHead>
              <TableBody>{order.quoteLines.map((line, index) => <TableRow key={`${line.serviceId ?? "item"}-${index}`}><TableCell><Typography variant="body2" fontWeight={700}>{line.description}</Typography>{line.calculationMethod !== "QUANTITY" && <Typography variant="caption" color="text.secondary">{line.quantity} peça(s) × {line.widthMeters} m × {line.lengthMeters} m{line.calculationMethod === "CUBIC_METER" ? ` × ${line.heightMeters} m` : ""}</Typography>}</TableCell><TableCell align="right">{line.billableQuantity ?? line.quantity}</TableCell><TableCell>{line.calculationMethod === "SQUARE_METER" ? "m²" : line.calculationMethod === "CUBIC_METER" ? "m³" : line.unit}</TableCell><TableCell align="right">{formatMoney(line.unitPrice)}</TableCell><TableCell align="right" sx={{ fontWeight: 800 }}>{formatMoney(line.total)}</TableCell></TableRow>)}</TableBody>
            </Table></TableContainer>
          </CardContent></Card>
        ))}</Stack>}
      </Container>
    </Box>
  );
}

function OrderDetail({ label, value }: { label: string; value: string }) {
  return <Box><Typography variant="caption" color="text.secondary">{label}</Typography><Typography variant="body2" fontWeight={750} mt={0.35}>{value}</Typography></Box>;
}
