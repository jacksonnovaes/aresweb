"use client";

import { ErrorAlert } from "@/components/common/feedback";
import { enumLabel } from "@/components/common/status-chip";
import { formatDateTime, formatMoney, maskDocument } from "@/lib/format";
import type { ServiceOrderDocument } from "@/lib/types";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import {
  Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, Divider, Stack,
  Table, TableBody, TableCell, TableHead, TableRow, Typography,
} from "@mui/material";

interface Props {
  open: boolean;
  document: ServiceOrderDocument | null;
  loading: boolean;
  error: string;
  onClose: () => void;
  onRetry: () => void;
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 700 }}>{label}</Typography>
      <Typography variant="body2" mt={0.25}>{children || "—"}</Typography>
    </Box>
  );
}

export function ServiceOrderDocumentDialog({ open, document, loading, error, onClose, onRetry }: Props) {
  const primaryColor = document?.company.primaryColor || "#2457E6";
  const assetDescription = document?.asset
    ? [document.asset.brand, document.asset.model].filter(Boolean).join(" ")
    : "";

  return (
    <Dialog className="service-order-print-dialog" open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogContent sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: "#EEF1F5" }}>
        {loading && <Stack alignItems="center" justifyContent="center" minHeight={360} spacing={2}><CircularProgress /><Typography color="text.secondary">Preparando a ordem para impressão...</Typography></Stack>}
        {!loading && error && <Box py={4}><ErrorAlert message={error} onRetry={onRetry} /></Box>}
        {!loading && document && (
          <Box className="service-order-print" sx={{ bgcolor: "white", color: "#172033", p: { xs: 2.5, sm: 5 }, mx: "auto", maxWidth: 850, minHeight: 720, boxShadow: "0 12px 34px rgba(16,24,40,.12)" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={3}>
              <Stack direction="row" spacing={2} alignItems="center">
                {document.company.logoUrl ? <Box component="img" src={document.company.logoUrl} alt={`Logo ${document.company.tradeName}`} sx={{ width: 58, height: 58, objectFit: "contain" }} /> : <Box sx={{ width: 54, height: 54, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: primaryColor, color: "white", fontWeight: 900, fontSize: 24 }}>{document.company.tradeName.charAt(0).toUpperCase()}</Box>}
                <Box><Typography variant="h6" fontWeight={850}>{document.company.tradeName}</Typography><Typography variant="caption" color="text.secondary">{document.company.legalName}</Typography>{document.company.document && <Typography variant="caption" display="block" color="text.secondary">{maskDocument(document.company.document)}</Typography>}</Box>
              </Stack>
              <Box textAlign="right"><Typography variant="overline" color="text.secondary" fontWeight={800}>Ordem de serviço</Typography><Typography variant="h5" fontWeight={900} sx={{ color: primaryColor }}>#{document.order.id.slice(0, 8).toUpperCase()}</Typography><Typography variant="caption" color="text.secondary">Emitida em {formatDateTime(new Date().toISOString())}</Typography></Box>
            </Stack>

            <Box sx={{ height: 4, bgcolor: primaryColor, my: 3, borderRadius: 99 }} />

            <Stack direction={{ xs: "column", sm: "row" }} gap={3} justifyContent="space-between">
              <Box flex={1}><Typography variant="overline" fontWeight={800} color="text.secondary">Cliente</Typography><Typography variant="h6" fontWeight={800}>{document.customer.name}</Typography><Typography variant="body2" color="text.secondary">{[document.customer.email, document.customer.phone].filter(Boolean).join(" • ") || "Contato não informado"}</Typography>{document.customer.document && <Typography variant="body2" color="text.secondary">{maskDocument(document.customer.document)}</Typography>}</Box>
              {document.asset ? <Box flex={1}><Typography variant="overline" fontWeight={800} color="text.secondary">Ativo em manutenção</Typography><Typography variant="h6" fontWeight={800}>{document.asset.name}</Typography><Typography variant="body2" color="text.secondary">{document.asset.typeName}{assetDescription ? ` • ${assetDescription}` : ""}</Typography>{document.asset.serialNumber && <Typography variant="body2" color="text.secondary">Série: {document.asset.serialNumber}</Typography>}</Box> : <Box flex={1}><Typography variant="overline" fontWeight={800} color="text.secondary">Tipo de atendimento</Typography><Typography variant="h6" fontWeight={800}>Serviço sem ativo</Typography><Typography variant="body2" color="text.secondary">Atendimento identificado pela descrição e pelos itens do orçamento.</Typography></Box>}
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={850}>{document.order.title}</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.75} sx={{ whiteSpace: "pre-wrap" }}>{document.order.description || "Sem descrição adicional."}</Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 2, p: 2.25, bgcolor: "#F7F8FA", borderRadius: 2, my: 3 }}>
              <Detail label="Status">{document.order.statusName || enumLabel(document.order.status)}</Detail>
              <Detail label="Prioridade">{enumLabel(document.order.priority)}</Detail>
              <Detail label="Abertura">{formatDateTime(document.order.openedAt)}</Detail>
              <Detail label="Prazo">{formatDateTime(document.order.dueAt)}</Detail>
            </Box>

            <Typography variant="subtitle1" fontWeight={850} mb={1}>Orçamento</Typography>
            <Table size="small" sx={{ border: "1px solid #E5E9F2" }}>
              <TableHead><TableRow sx={{ bgcolor: "#F7F8FA" }}><TableCell>Descrição</TableCell><TableCell align="right">Qtd./área</TableCell><TableCell>Un.</TableCell><TableCell align="right">Valor unitário</TableCell><TableCell align="right">Total</TableCell></TableRow></TableHead>
              <TableBody>{document.quoteLines.map((line, index) => <TableRow key={`${line.serviceId ?? "custom"}-${index}`}><TableCell><Typography variant="body2" fontWeight={700}>{line.description}</Typography>{line.calculationMethod !== "QUANTITY" && <Typography variant="caption" color="text.secondary">{line.quantity} peça(s) × {line.widthMeters} m × {line.lengthMeters} m{line.calculationMethod === "CUBIC_METER" ? ` × ${line.heightMeters} m` : ""}</Typography>}</TableCell><TableCell align="right">{line.billableQuantity ?? line.quantity}</TableCell><TableCell>{line.calculationMethod === "SQUARE_METER" ? "m²" : line.calculationMethod === "CUBIC_METER" ? "m³" : line.unit}</TableCell><TableCell align="right">{formatMoney(line.unitPrice)}</TableCell><TableCell align="right" sx={{ fontWeight: 750 }}>{formatMoney(line.total)}</TableCell></TableRow>)}</TableBody>
            </Table>

            <Stack alignItems="flex-end" mt={3} spacing={0.75}>
              <Stack direction="row" justifyContent="space-between" width={{ xs: "100%", sm: 310 }}><Typography color="text.secondary">Valor estimado</Typography><Typography fontWeight={750}>{formatMoney(document.order.estimatedValue)}</Typography></Stack>
              {document.order.finalValue !== undefined && <Stack direction="row" justifyContent="space-between" width={{ xs: "100%", sm: 310 }}><Typography fontWeight={800}>Valor final</Typography><Typography fontWeight={900} fontSize="1.1rem" sx={{ color: primaryColor }}>{formatMoney(document.order.finalValue)}</Typography></Stack>}
            </Stack>

            <Stack direction="row" spacing={5} mt={8}>
              <Box flex={1} sx={{ borderTop: "1px solid #98A2B3", pt: 1, textAlign: "center" }}><Typography variant="caption">Responsável pelo atendimento</Typography></Box>
              <Box flex={1} sx={{ borderTop: "1px solid #98A2B3", pt: 1, textAlign: "center" }}><Typography variant="caption">Cliente</Typography></Box>
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions className="print-hide" sx={{ p: 2.5 }}><Button onClick={onClose}>Fechar</Button><Button variant="contained" startIcon={<PrintOutlinedIcon />} onClick={() => window.print()} disabled={!document || loading}>Imprimir</Button></DialogActions>
    </Dialog>
  );
}
