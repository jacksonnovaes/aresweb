"use client";

import { useAuth } from "@/contexts/auth-context";
import { apiRequest, errorMessage } from "@/lib/api";
import type { ApiProblem, DataDeletionResult } from "@/lib/types";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import PolicyRoundedIcon from "@mui/icons-material/PolicyRounded";
import {
  Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent,
  DialogTitle, Link as MuiLink, Stack, TextField, Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DataManagementCard() {
  const { user } = useAuth();
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!user?.roles.includes("ADMIN")) return null;

  const tenantSlug = user.tenant.slug;
  const expectedConfirmation = `EXCLUIR ${tenantSlug}`;

  async function exportData() {
    setExporting(true); setError("");
    try {
      const response = await fetch("/api/backend/privacy/export", { credentials: "include" });
      if (!response.ok) {
        const problem = await response.json().catch(() => undefined) as ApiProblem | undefined;
        throw new Error(problem?.detail ?? "Não foi possível exportar os dados.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `ares-${tenantSlug}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setExporting(false);
    }
  }

  async function deleteAccount() {
    setDeleting(true); setError("");
    try {
      const result = await apiRequest<DataDeletionResult>("/privacy/account", {
        method: "DELETE", body: { currentPassword: password, confirmation },
      });
      sessionStorage.setItem("ares.deletionReceipt", result.receiptId);
      router.replace("/?conta=excluida");
    } catch (err) {
      setError(errorMessage(err));
      setDeleting(false);
    }
  }

  function closeDialog() {
    if (deleting) return;
    setDialogOpen(false); setPassword(""); setConfirmation(""); setError("");
  }

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 2.25, bgcolor: "info.main", color: "white" }}><PolicyRoundedIcon /></Box>
            <Box><Typography variant="h3">Privacidade e dados</Typography><Typography variant="body2" color="text.secondary">Exporte uma cópia ou exclua definitivamente a empresa.</Typography></Box>
          </Stack>
          {error && !dialogOpen && <Alert severity="error">{error}</Alert>}
          <Alert severity="info">
            A exportação inclui empresa, usuários sem senhas, clientes, ativos, serviços, ordens e trilha de auditoria em JSON.
          </Alert>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={exportData} disabled={exporting}>
              {exporting ? "Preparando..." : "Exportar meus dados"}
            </Button>
            <Button color="error" variant="outlined" startIcon={<DeleteForeverRoundedIcon />} onClick={() => { setError(""); setDialogOpen(true); }}>
              Excluir empresa e dados
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Consulte os <MuiLink component={Link} href="/termos-de-uso" target="_blank">Termos de Uso</MuiLink> e a <MuiLink component={Link} href="/politica-de-privacidade" target="_blank">Política de Privacidade</MuiLink>.
          </Typography>
        </Stack>
      </CardContent>

      <Dialog open={dialogOpen} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>Excluir empresa permanentemente?</DialogTitle>
        <DialogContent>
          <Stack spacing={2} pt={1}>
            <Alert severity="error">
              Esta ação remove usuários, clientes, ativos, serviços, ordens e sessões. Ela não pode ser desfeita. Exporte os dados antes de continuar.
            </Alert>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="Senha atual" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required fullWidth />
            <TextField label={`Digite ${expectedConfirmation}`} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required fullWidth helperText="A frase diferencia maiúsculas e minúsculas." />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={closeDialog} disabled={deleting}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={deleteAccount} disabled={deleting || !password || confirmation !== expectedConfirmation}>
            {deleting ? "Excluindo..." : "Excluir permanentemente"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
