"use client";

import { ErrorAlert, PageLoading, TableEmpty } from "@/components/common/feedback";
import { PageHeader } from "@/components/common/page-header";
import { useAuth } from "@/contexts/auth-context";
import { apiRequest, errorMessage } from "@/lib/api";
import { formatDate, maskDocument } from "@/lib/format";
import type { AdminTenant } from "@/lib/types";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Alert, Avatar, Box, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent,
  DialogTitle, Grid, InputAdornment, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";

const planLabels = { SOLO: "Essencial", PRO: "Profissional", BUSINESS: "Empresa" } as const;

export default function AdminCompaniesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<AdminTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminTenant | null>(null);
  const [saving, setSaving] = useState(false);

  const superAdmin = user?.roles.includes("SUPER_ADMIN") ?? false;
  const load = useCallback(async () => {
    if (!superAdmin) { setLoading(false); return; }
    setLoading(true); setError("");
    try { setItems(await apiRequest<AdminTenant[]>("/admin/tenants")); }
    catch (err) { setError(errorMessage(err)); }
    finally { setLoading(false); }
  }, [superAdmin]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    if (!term) return items;
    return items.filter((item) => [item.tradeName, item.legalName, item.document, item.slug]
      .some((value) => value.toLocaleLowerCase("pt-BR").includes(term)));
  }, [items, search]);

  const activeCount = items.filter((item) => item.accessEnabled).length;
  const blockedCount = items.length - activeCount;

  async function changeAccess() {
    if (!selected) return;
    setSaving(true); setError("");
    try {
      const updated = await apiRequest<AdminTenant>(`/admin/tenants/${selected.id}/access`, {
        method: "PATCH", body: { enabled: !selected.accessEnabled },
      });
      setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
      setSelected(null);
    } catch (err) { setError(errorMessage(err)); }
    finally { setSaving(false); }
  }

  if (!user || loading) return <PageLoading label="Carregando empresas..." />;
  if (!superAdmin) return <Alert severity="error">Esta área é exclusiva para superadministradores.</Alert>;

  return (
    <>
      <PageHeader eyebrow="Administração da plataforma" title="Empresas"
        description="Ative ou suspenda o acesso das empresas enquanto a confirmação de pagamento for manual." />
      {error && <Box mb={2.5}><ErrorAlert message={error} onRetry={load} /></Box>}
      <Grid container spacing={2.5} mb={2.5}>
        {[
          { label: "Empresas cadastradas", value: items.length, color: "primary.main", icon: <BusinessRoundedIcon /> },
          { label: "Com acesso ativo", value: activeCount, color: "success.main", icon: <CheckCircleRoundedIcon /> },
          { label: "Acesso suspenso", value: blockedCount, color: "warning.main", icon: <BlockRoundedIcon /> },
        ].map((stat) => <Grid key={stat.label} size={{ xs: 12, sm: 4 }}>
          <Card><CardContent><Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box><Typography variant="body2" color="text.secondary" fontWeight={650}>{stat.label}</Typography>
              <Typography fontSize={30} fontWeight={800} mt={0.5}>{stat.value}</Typography></Box>
            <Avatar sx={{ bgcolor: stat.color, width: 46, height: 46 }}>{stat.icon}</Avatar>
          </Stack></CardContent></Card>
        </Grid>)}
      </Grid>
      <Card>
        <Box sx={{ p: 2.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <TextField value={search} onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por empresa, razão social, documento ou slug" fullWidth
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon /></InputAdornment> } }} />
        </Box>
        <TableContainer><Table>
          <TableHead><TableRow><TableCell>Empresa</TableCell><TableCell>Documento</TableCell>
            <TableCell>Plano</TableCell><TableCell>Cadastro</TableCell><TableCell>Status</TableCell>
            <TableCell align="right">Ação</TableCell></TableRow></TableHead>
          <TableBody>
            {filtered.length === 0 && <TableEmpty colSpan={6} message={search ? "Nenhuma empresa encontrada." : "Nenhuma empresa cadastrada."} />}
            {filtered.map((tenant) => {
              const ownTenant = tenant.id === user.tenant.id;
              return <TableRow key={tenant.id} hover>
                <TableCell><Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main", fontWeight: 800 }}>{tenant.tradeName.slice(0, 1).toUpperCase()}</Avatar>
                  <Box><Typography variant="body2" fontWeight={750}>{tenant.tradeName}</Typography>
                    <Typography variant="caption" color="text.secondary">{tenant.legalName} · /{tenant.slug}</Typography></Box>
                </Stack></TableCell>
                <TableCell>{maskDocument(tenant.document)}</TableCell>
                <TableCell><Typography variant="body2" fontWeight={700}>{planLabels[tenant.subscriptionPlan]}</Typography>
                  <Typography variant="caption" color="text.secondary">{tenant.subscriptionBillingCycle === "ANNUAL" ? "Anual" : "Mensal"}</Typography></TableCell>
                <TableCell>{formatDate(tenant.createdAt)}</TableCell>
                <TableCell><Chip size="small" color={tenant.accessEnabled ? "success" : "warning"}
                  label={tenant.accessEnabled ? "Ativa" : "Suspensa"} sx={{ fontWeight: 750 }} /></TableCell>
                <TableCell align="right"><Button variant={tenant.accessEnabled ? "outlined" : "contained"}
                  color={tenant.accessEnabled ? "warning" : "success"} disabled={ownTenant && tenant.accessEnabled}
                  startIcon={tenant.accessEnabled ? <BlockRoundedIcon /> : <CheckCircleRoundedIcon />}
                  onClick={() => setSelected(tenant)}>
                  {tenant.accessEnabled ? "Desativar" : "Ativar"}
                </Button></TableCell>
              </TableRow>;
            })}
          </TableBody>
        </Table></TableContainer>
      </Card>
      <Dialog open={Boolean(selected)} onClose={() => !saving && setSelected(null)} fullWidth maxWidth="xs">
        <DialogTitle>{selected?.accessEnabled ? "Desativar empresa?" : "Ativar empresa?"}</DialogTitle>
        <DialogContent><Typography color="text.secondary">
          {selected?.accessEnabled
            ? `Os usuários de ${selected.tradeName} perderão o acesso imediatamente.`
            : `Os usuários de ${selected?.tradeName} poderão entrar novamente no sistema.`}
        </Typography></DialogContent>
        <DialogActions sx={{ p: 2.5 }}><Button onClick={() => setSelected(null)} disabled={saving}>Cancelar</Button>
          <Button variant="contained" color={selected?.accessEnabled ? "warning" : "success"}
            onClick={changeAccess} disabled={saving}>{saving ? "Salvando..." : "Confirmar"}</Button></DialogActions>
      </Dialog>
    </>
  );
}
