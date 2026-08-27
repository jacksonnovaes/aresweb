"use client";

import { RelatedCreateButton } from "@/components/quick-create/entity-dialogs";
import { formatMoney } from "@/lib/format";
import type { CatalogService, QuoteCalculationMethod, ServiceOrderQuoteLine } from "@/lib/types";
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
  calculationMethod: QuoteCalculationMethod;
  widthMeters: string;
  lengthMeters: string;
  heightMeters: string;
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

export function emptyQuoteLine(
  calculationMethod: QuoteCalculationMethod = "QUANTITY",
  defaultSquareMeterPrice?: number | null,
  defaultCubicMeterPrice?: number | null,
): QuoteLineDraft {
  const measured = calculationMethod !== "QUANTITY";
  const defaultPrice = calculationMethod === "SQUARE_METER"
    ? defaultSquareMeterPrice : calculationMethod === "CUBIC_METER" ? defaultCubicMeterPrice : null;
  return {
    serviceId: "", description: "", quantity: "1",
    unit: calculationMethod === "SQUARE_METER" ? "M2" : calculationMethod === "CUBIC_METER" ? "M3" : "UN",
    unitPrice: measured && defaultPrice ? String(defaultPrice) : "",
    calculationMethod, widthMeters: "", lengthMeters: "", heightMeters: "",
  };
}

export function storedQuoteLine(line: ServiceOrderQuoteLine): QuoteLineDraft {
  return {
    serviceId: line.serviceId ?? "",
    description: line.description,
    quantity: String(line.quantity),
    unit: line.unit,
    unitPrice: String(line.unitPrice),
    calculationMethod: line.calculationMethod ?? "QUANTITY",
    widthMeters: line.widthMeters == null ? "" : String(line.widthMeters),
    lengthMeters: line.lengthMeters == null ? "" : String(line.lengthMeters),
    heightMeters: line.heightMeters == null ? "" : String(line.heightMeters),
  };
}

export function quoteLineBillableQuantity(line: QuoteLineDraft): number {
  const quantity = Number(line.quantity || 0);
  if (line.calculationMethod === "SQUARE_METER" || line.calculationMethod === "CUBIC_METER") {
    const area = quantity * Number(line.widthMeters || 0) * Number(line.lengthMeters || 0);
    return line.calculationMethod === "CUBIC_METER" ? area * Number(line.heightMeters || 0) : area;
  }
  return quantity;
}

export function quoteDraftTotal(lines: QuoteLineDraft[]): number {
  return lines.reduce((total, line) => total + quoteLineBillableQuantity(line) * Number(line.unitPrice || 0), 0);
}

interface Props {
  lines: QuoteLineDraft[];
  services: CatalogService[];
  onChange: (lines: QuoteLineDraft[]) => void;
  onCreateService?: () => void;
  defaultCalculationMethod?: QuoteCalculationMethod;
  defaultSquareMeterPrice?: number | null;
  defaultCubicMeterPrice?: number | null;
}

export function QuoteLinesEditor({
  lines, services, onChange, onCreateService,
  defaultCalculationMethod = "QUANTITY", defaultSquareMeterPrice, defaultCubicMeterPrice,
}: Props) {
  function update(index: number, patch: Partial<QuoteLineDraft>) {
    onChange(lines.map((line, current) => current === index ? { ...line, ...patch } : line));
  }

  function selectService(index: number, serviceId: string) {
    const service = services.find((item) => item.id === serviceId);
    const current = lines[index];
    update(index, service ? {
      serviceId: service.id,
      description: service.name,
      unit: current.calculationMethod === "SQUARE_METER" ? "M2"
        : current.calculationMethod === "CUBIC_METER" ? "M3" : "SERVICO",
      unitPrice: String(service.basePrice),
    } : { serviceId: "" });
  }

  function changeCalculationMethod(index: number, calculationMethod: QuoteCalculationMethod) {
    const current = lines[index];
    update(index, calculationMethod !== "QUANTITY" ? {
      calculationMethod, unit: calculationMethod === "SQUARE_METER" ? "M2" : "M3",
      unitPrice: current.unitPrice || (calculationMethod === "SQUARE_METER" && defaultSquareMeterPrice
        ? String(defaultSquareMeterPrice) : calculationMethod === "CUBIC_METER" && defaultCubicMeterPrice
          ? String(defaultCubicMeterPrice) : ""),
    } : {
      calculationMethod, unit: "UN", widthMeters: "", lengthMeters: "", heightMeters: "",
    });
  }

  function remove(index: number) {
    if (lines.length === 1) return onChange([emptyQuoteLine(
      defaultCalculationMethod, defaultSquareMeterPrice, defaultCubicMeterPrice,
    )]);
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
            <Grid size={{ xs: 12, sm: line.calculationMethod === "CUBIC_METER" ? 2 : 4 }}><FormControl fullWidth required><InputLabel>Método de cálculo</InputLabel><Select label="Método de cálculo" value={line.calculationMethod} onChange={(event) => changeCalculationMethod(index, event.target.value as QuoteCalculationMethod)}><MenuItem value="QUANTITY">Quantidade × valor</MenuItem><MenuItem value="SQUARE_METER">Área: largura × comprimento</MenuItem><MenuItem value="CUBIC_METER">Volume: largura × comprimento × altura</MenuItem></Select></FormControl></Grid>
            {line.calculationMethod !== "QUANTITY" ? <>
              <Grid size={{ xs: 6, sm: 2 }}><TextField label="Largura (m)" type="number" value={line.widthMeters} onChange={(event) => update(index, { widthMeters: event.target.value })} required fullWidth slotProps={{ htmlInput: { min: 0.001, step: 0.001 } }} /></Grid>
              <Grid size={{ xs: 6, sm: 2 }}><TextField label="Comprimento (m)" type="number" value={line.lengthMeters} onChange={(event) => update(index, { lengthMeters: event.target.value })} required fullWidth slotProps={{ htmlInput: { min: 0.001, step: 0.001 } }} /></Grid>
              {line.calculationMethod === "CUBIC_METER" && <Grid size={{ xs: 6, sm: 2 }}><TextField label="Altura (m)" type="number" value={line.heightMeters} onChange={(event) => update(index, { heightMeters: event.target.value })} required fullWidth slotProps={{ htmlInput: { min: 0.001, step: 0.001 } }} /></Grid>}
              <Grid size={{ xs: 6, sm: 2 }}><TextField label="Peças" type="number" value={line.quantity} onChange={(event) => update(index, { quantity: event.target.value })} required fullWidth slotProps={{ htmlInput: { min: 0.001, step: 0.001 } }} /></Grid>
              <Grid size={{ xs: 6, sm: 2 }}><Box sx={{ height: "100%", px: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}><Typography variant="caption" color="text.secondary">{line.calculationMethod === "CUBIC_METER" ? "Volume calculado" : "Área calculada"}</Typography><Typography fontWeight={850}>{quoteLineBillableQuantity(line).toLocaleString("pt-BR", { maximumFractionDigits: 3 })} {line.calculationMethod === "CUBIC_METER" ? "m³" : "m²"}</Typography></Box></Grid>
            </> : <>
              <Grid size={{ xs: 6, sm: 4 }}><TextField label="Quantidade" type="number" value={line.quantity} onChange={(event) => update(index, { quantity: event.target.value })} required fullWidth slotProps={{ htmlInput: { min: 0.001, step: 0.001 } }} /></Grid>
              <Grid size={{ xs: 6, sm: 4 }}><FormControl fullWidth required><InputLabel>Unidade</InputLabel><Select label="Unidade" value={line.unit} onChange={(event) => update(index, { unit: event.target.value })}>{quoteUnits.map((unit) => <MenuItem value={unit.value} key={unit.value}>{unit.label}</MenuItem>)}</Select></FormControl></Grid>
            </>}
            <Grid size={{ xs: 7, sm: 6 }}><TextField label={line.calculationMethod === "SQUARE_METER" ? "Valor por m²" : line.calculationMethod === "CUBIC_METER" ? "Valor por m³" : "Valor unitário"} type="number" value={line.unitPrice} onChange={(event) => update(index, { unitPrice: event.target.value })} required fullWidth slotProps={{ htmlInput: { min: 0, step: 0.01 }, input: { startAdornment: <InputAdornment position="start">R$</InputAdornment> } }} /></Grid>
            <Grid size={{ xs: 5, sm: 6 }}><Box sx={{ height: "100%", px: 1.5, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end" }}><Typography variant="caption" color="text.secondary">Subtotal</Typography><Typography fontWeight={850}>{formatMoney(quoteLineBillableQuantity(line) * Number(line.unitPrice || 0))}</Typography></Box></Grid>
          </Grid>
        </Card>
      ))}

      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} gap={1}>
        <Button type="button" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => onChange([...lines, emptyQuoteLine(defaultCalculationMethod, defaultSquareMeterPrice, defaultCubicMeterPrice)])}>Adicionar linha</Button>
        {onCreateService && <RelatedCreateButton label="Cadastrar novo serviço" onClick={onCreateService} />}
      </Stack>
    </Stack>
  );
}
