"use client";

import { RelatedCreateButton } from "@/components/quick-create/entity-dialogs";
import { formatMoney } from "@/lib/format";
import type { CatalogService, ServiceOrderQuoteLine } from "@/lib/types";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  Box, Button, Card, FormControl, Grid, IconButton, InputAdornment, InputLabel,
  MenuItem, Select, Stack, TextField, Tooltip, Typography,
} from "@mui/material";

export interface QuoteLineDraft {
  serviceId: string;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
}

export const quoteUnits = [
  { value: "UN", label: "Unidade" },
  { value: "H", label: "Hora" },
  { value: "DIA", label: "Diária" },
  { value: "M", label: "Metro" },
  { value: "M2", label: "Metro²" },
  { value: "M3", label: "Metro³" },
  { value: "KM", label: "Quilômetro" },
  { value: "SERVICO", label: "Serviço" },
];

export function emptyQuoteLine(): QuoteLineDraft {
  return { serviceId: "", description: "", quantity: "1", unit: "UN", unitPrice: "" };
}

export function storedQuoteLine(line: ServiceOrderQuoteLine): QuoteLineDraft {
  return {
    serviceId: line.serviceId ?? "",
    description: line.description,
    quantity: String(line.quantity),
    unit: line.unit,
    unitPrice: String(line.unitPrice),
  };
}

export function quoteDraftTotal(lines: QuoteLineDraft[]): number {
  return lines.reduce((total, line) => total + Number(line.quantity || 0) * Number(line.unitPrice || 0), 0);
}

interface Props {
  lines: QuoteLineDraft[];
  services: CatalogService[];
  onChange: (lines: QuoteLineDraft[]) => void;
  onCreateService?: () => void;
}

export function QuoteLinesEditor({ lines, services, onChange, onCreateService }: Props) {
  function update(index: number, patch: Partial<QuoteLineDraft>) {
    onChange(lines.map((line, current) => current === index ? { ...line, ...patch } : line));
  }

  function selectService(index: number, serviceId: string) {
    const service = services.find((item) => item.id === serviceId);
    update(index, service ? {
      serviceId: service.id,
      description: service.name,
      unit: "SERVICO",
      unitPrice: String(service.basePrice),
    } : { serviceId: "" });
  }

  function remove(index: number) {
    if (lines.length === 1) return onChange([emptyQuoteLine()]);
    onChange(lines.filter((_, current) => current !== index));
  }

  return (
    <Stack spacing={1.5}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}>
        <Box><Typography variant="subtitle1" fontWeight={850}>Itens do orçamento</Typography><Typography variant="body2" color="text.secondary">Cada manutenção, material ou etapa deve ocupar uma linha.</Typography></Box>
        <Box textAlign={{ sm: "right" }}><Typography variant="caption" color="text.secondary">Total estimado</Typography><Typography variant="h6" fontWeight={900} color="primary.main">{formatMoney(quoteDraftTotal(lines))}</Typography></Box>
      </Stack>

      {lines.map((line, index) => (
        <Card key={index} variant="outlined" sx={{ p: 2, bgcolor: "#FBFCFE" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
            <Typography variant="body2" fontWeight={800}>Linha {index + 1}</Typography>
            <Tooltip title="Remover linha"><span><IconButton size="small" onClick={() => remove(index)} aria-label={`Remover linha ${index + 1}`}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton></span></Tooltip>
          </Stack>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 4 }}><FormControl fullWidth><InputLabel>Serviço cadastrado</InputLabel><Select label="Serviço cadastrado" value={line.serviceId} onChange={(event) => selectService(index, event.target.value)}><MenuItem value="">Item personalizado (sem ativo)</MenuItem>{services.filter((service) => service.active).map((service) => <MenuItem value={service.id} key={service.id}>{service.name}{service.type === "MAINTENANCE" ? " • manutenção" : ""}</MenuItem>)}</Select></FormControl></Grid>
            <Grid size={{ xs: 12, md: 8 }}><TextField label="Descrição da linha" value={line.description} onChange={(event) => update(index, { description: event.target.value })} required fullWidth slotProps={{ htmlInput: { maxLength: 500 } }} /></Grid>
            <Grid size={{ xs: 6, sm: 3 }}><TextField label="Quantidade" type="number" value={line.quantity} onChange={(event) => update(index, { quantity: event.target.value })} required fullWidth slotProps={{ htmlInput: { min: 0.001, step: 0.001 } }} /></Grid>
            <Grid size={{ xs: 6, sm: 3 }}><FormControl fullWidth required><InputLabel>Unidade</InputLabel><Select label="Unidade" value={line.unit} onChange={(event) => update(index, { unit: event.target.value })}>{quoteUnits.map((unit) => <MenuItem value={unit.value} key={unit.value}>{unit.label}</MenuItem>)}</Select></FormControl></Grid>
            <Grid size={{ xs: 7, sm: 3 }}><TextField label="Valor unitário" type="number" value={line.unitPrice} onChange={(event) => update(index, { unitPrice: event.target.value })} required fullWidth slotProps={{ htmlInput: { min: 0, step: 0.01 }, input: { startAdornment: <InputAdornment position="start">R$</InputAdornment> } }} /></Grid>
            <Grid size={{ xs: 5, sm: 3 }}><Box sx={{ height: "100%", px: 1.5, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end" }}><Typography variant="caption" color="text.secondary">Subtotal</Typography><Typography fontWeight={850}>{formatMoney(Number(line.quantity || 0) * Number(line.unitPrice || 0))}</Typography></Box></Grid>
          </Grid>
        </Card>
      ))}

      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={1}>
        <Button type="button" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => onChange([...lines, emptyQuoteLine()])}>Adicionar linha</Button>
        {onCreateService && <RelatedCreateButton label="Cadastrar novo serviço" onClick={onCreateService} />}
      </Stack>
    </Stack>
  );
}
