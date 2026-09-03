"use client";

import { ErrorAlert } from "@/components/common/feedback";
import { useBrand } from "@/contexts/brand-context";
import { publicMediaUrl } from "@/lib/public-profile";
import { enumLabel } from "@/components/common/status-chip";
import { formatDate, formatDateTime, formatMoney, maskDocument } from "@/lib/format";
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
  const { brand } = useBrand();
  const primaryColor = brand.primaryColor || document?.company.primaryColor || "#2457E6";
  const logoUrl = brand.logoUrl || publicMediaUrl(document?.company.logoUrl);
  const assetDescription = document?.asset
    ? [document.asset.brand, document.asset.model].filter(Boolean).join(" ")
    : "";
  const delivery = document?.delivery;

  return (
    <Dialog className="service-order-print-dialog" open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogContent sx={{ p: { xs: 1.5, sm: 3 }, bgcolor: "#EEF1F5" }}>
        {loading && <Stack alignItems="center" justifyContent="center" minHeight={360} spacing={2}><CircularProgress /><Typography color="text.secondary">Preparando a ordem para impressão...</Typography></Stack>}
        {!loading && error && <Box py={4}><ErrorAlert message={error} onRetry={onRetry} /></Box>}
        {!loading && document && (
          <Box className="service-order-print" sx={{ bgcolor: "white", color: "#172033", p: { xs: 2.5, sm: 5 }, mx: "auto", maxWidth: 850, minHeight: 720, boxShadow: "0 12px 34px rgba(16,24,40,.12)" }}>
            <Box component="header" className="service-order-print-header" sx={{ borderBottom: `4px solid ${primaryColor}`, pb: 2.5, mb: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={3}>
                <Stack direction="row" spacing={2} alignItems="center">
                  {logoUrl ? <Box className="service-order-print-logo" component="img" src={logoUrl} alt={`Logo ${document.company.tradeName}`} sx={{ width: 72, height: 72, objectFit: "contain" }} /> : <Box sx={{ width: 54, height: 54, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: primaryColor, color: "white", fontWeight: 900, fontSize: 24 }}>{document.company.tradeName.charAt(0).toUpperCase()}</Box>}
                  <Box><Typography variant="h6" fontWeight={850}>{document.company.tradeName}</Typography><Typography variant="body2" color="text.secondary">Razão social: {document.company.legalName}</Typography>{document.company.document && <Typography variant="body2" color="text.secondary">CPF/CNPJ: {maskDocument(document.company.document)}</Typography>}</Box>
                </Stack>
                <Box textAlign="right"><Typography variant="overline" color="text.secondary" fontWeight={800}>{delivery ? "Termo de entrega e garantia" : "Orçamento / ordem de serviço"}</Typography><Typography variant="h5" fontWeight={900} sx={{ color: primaryColor }}>#{document.order.id.slice(0, 8).toUpperCase()}</Typography><Typography variant="caption" color="text.secondary">Emitido em {formatDateTime(new Date().toISOString())}</Typography></Box>
              </Stack>
            </Box>

              <Stack direction={{xs: "column", sm: "row"}} gap={3} justifyContent="space-between">
                  <Box flex={1}><Typography variant="overline" fontWeight={800}
                                            color="text.secondary">Cliente</Typography>
                      <Typography variant="h6"fontWeight={800}>{document.customer.name}</Typography><Typography
                      variant="body2"
                      color="text.secondary">{[document.customer.email, document.customer.phone].filter(Boolean).join(" • ") || "Contato não informado"}</Typography>{document.customer.document &&
                      <Typography variant="body2" color="text.secondary">{maskDocument(document.customer.document)}</Typography>}{document.customer.address &&
                      <Typography variant="body2" color="text.secondary" sx={{whiteSpace: "pre-wrap"}}>{document.customer.address}</Typography>}</Box>
                  {document.asset ?
                      <Box flex={1}><Typography variant="overline" fontWeight={800} color="text.secondary">Ativo em manutenção</Typography>
                          <Typography variant="h6" fontWeight={800}>{document.asset.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{document.asset.typeName}{assetDescription ? ` • ${assetDescription}` : ""}
                          </Typography>{document.asset.serialNumber &&
                          <Typography variant="body2" color="text.secondary">Série: {document.asset.serialNumber}</Typography>}</Box> :
                      <Box flex={1}>
                          <Typography variant="overline" fontWeight={800} color="text.secondary">Tipo de atendimento</Typography>
                          <Typography variant="h6" fontWeight={800}>Serviço sem ativo</Typography>
                          <Typography variant="body2" color="text.secondary">Atendimento identificado pela descrição e pelos itens do orçamento.</Typography>
                      </Box>
                  }
              </Stack>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" fontWeight={850}>{document.order.title}</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.75} sx={{ whiteSpace: "pre-wrap" }}>{document.order.description || "Sem descrição adicional."}</Typography>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 2, p: 2.25, bgcolor: "#F7F8FA", borderRadius: 2, my: 3 }}>
              <Detail label="Status">{document.order.statusName || enumLabel(document.order.status)}</Detail>
              <Detail label="Prioridade">{enumLabel(document.order.priority)}</Detail>
              <Detail label="Abertura">{formatDateTime(document.order.openedAt)}</Detail>
              <Detail label={delivery ? "Entrega" : "Prazo"}>{formatDateTime(delivery?.deliveredAt ?? document.order.dueAt)}</Detail>
            </Box>

            <Typography variant="subtitle1" fontWeight={850} mb={1}>Orçamento</Typography>
            <Table size="small" sx={{ border: "1px solid #E5E9F2" }}>
              <TableHead><TableRow sx={{ bgcolor: "#F7F8FA" }}><TableCell>Descrição</TableCell><TableCell align="right">Qtd./área</TableCell><TableCell>Un.</TableCell><TableCell align="right">Valor unitário</TableCell><TableCell align="right">Total</TableCell></TableRow></TableHead>
              <TableBody>{document.quoteLines.map((line, index) => <TableRow key={`${line.serviceId ?? "custom"}-${index}`}><TableCell><Typography variant="body2" fontWeight={700} sx={{ whiteSpace: "pre-wrap" }}>{line.description}</Typography>{line.notes && <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}><strong>Observações:</strong> {line.notes}</Typography>}{line.calculationMethod !== "QUANTITY" && <Typography variant="caption" display="block" color="text.secondary">{line.quantity} peça(s) × {line.widthMeters} m × {line.lengthMeters} m{line.calculationMethod === "CUBIC_METER" ? ` × ${line.heightMeters} m` : ""}</Typography>}</TableCell><TableCell align="right">{line.billableQuantity ?? line.quantity}</TableCell><TableCell>{line.calculationMethod === "SQUARE_METER" ? "m²" : line.calculationMethod === "CUBIC_METER" ? "m³" : line.unit}</TableCell><TableCell align="right">{formatMoney(line.unitPrice)}</TableCell><TableCell align="right" sx={{ fontWeight: 750 }}>{formatMoney(line.total)}</TableCell></TableRow>)}</TableBody>
            </Table>

            <Stack alignItems="flex-end" mt={3} spacing={0.75}>
              <Stack direction="row" justifyContent="space-between" width={{ xs: "100%", sm: 310 }}><Typography color="text.secondary">Valor estimado</Typography><Typography fontWeight={750}>{formatMoney(document.order.estimatedValue)}</Typography></Stack>
              {document.order.finalValue !== undefined && <Stack direction="row" justifyContent="space-between" width={{ xs: "100%", sm: 310 }}><Typography fontWeight={800}>Valor final</Typography><Typography fontWeight={900} fontSize="1.1rem" sx={{ color: primaryColor }}>{formatMoney(document.order.finalValue)}</Typography></Stack>}
            </Stack>

            {delivery && <Box sx={{ mt: 4, p: 2.5, border: `1px solid ${primaryColor}40`, borderLeft: `5px solid ${primaryColor}`, borderRadius: 2, breakInside: "avoid" }}>
              <Typography variant="subtitle1" fontWeight={850} sx={{ color: primaryColor }}>Entrega e garantia</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mt: 1.5 }}>
                <Detail label="Recebido por">{delivery.receivedBy || document.customer.name}</Detail>
                <Detail label="Data da entrega">{formatDateTime(delivery.deliveredAt)}</Detail>
                <Detail label="Garantia">{delivery.warrantyDays > 0
                  ? `${delivery.warrantyDays} dias — até ${formatDate(delivery.warrantyUntil)}`
                  : "Sem garantia adicional informada"}</Detail>
              </Box>
              {delivery.warrantyTerms && <Box mt={2}><Typography variant="caption" color="text.secondary" fontWeight={750}>CONDIÇÕES DA GARANTIA</Typography><Typography variant="body2" mt={0.4} sx={{ whiteSpace: "pre-wrap" }}>{delivery.warrantyTerms}</Typography></Box>}
              {delivery.notes && <Box mt={1.5}><Typography variant="caption" color="text.secondary" fontWeight={750}>OBSERVAÇÕES DA ENTREGA</Typography><Typography variant="body2" mt={0.4} sx={{ whiteSpace: "pre-wrap" }}>{delivery.notes}</Typography></Box>}
            </Box>}

            <Stack direction="row" spacing={5} mt={8}>
              <Box flex={1} sx={{ borderTop: "1px solid #98A2B3", pt: 1, textAlign: "center" }}><Typography variant="caption">Responsável pelo atendimento</Typography></Box>
              <Box flex={1} sx={{ borderTop: "1px solid #98A2B3", pt: 1, textAlign: "center" }}><Typography variant="caption">{delivery ? `Recebedor: ${delivery.receivedBy || document.customer.name}` : "Cliente"}</Typography></Box>
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions className="print-hide" sx={{ p: 2.5 }}><Button onClick={onClose}>Fechar</Button><Button variant="contained" startIcon={<PrintOutlinedIcon />} onClick={() => window.print()} disabled={!document || loading}>{delivery ? "Imprimir termo de entrega" : "Imprimir ordem"}</Button></DialogActions>
    </Dialog>
  );
}
