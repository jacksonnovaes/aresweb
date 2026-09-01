"use client";

import {ErrorAlert, PageLoading} from "@/components/common/feedback";
import {PageHeader} from "@/components/common/page-header";
import {apiRequest, errorMessage} from "@/lib/api";
import {publicMediaUrl, safeProfileColor} from "@/lib/public-profile";
import type {
  PublicProfileManualService, PublicProfileMediaUpload, PublicProfileSettings, PublicServiceSource,
} from "@/lib/types";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import LaunchRoundedIcon from "@mui/icons-material/LaunchRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import UploadRoundedIcon from "@mui/icons-material/UploadRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Alert, Box, Button, Card, CardContent, Chip, Divider, FormControl, FormControlLabel, FormLabel,
  Grid, IconButton, InputAdornment, Radio, RadioGroup, Slider, Stack, Switch, TextField, Typography,
} from "@mui/material";
import {ChangeEvent, FormEvent, useCallback, useEffect, useState} from "react";

const emptySettings: PublicProfileSettings = {
  enabled: false,
  slug: "",
  tradeName: "",
  headline: "",
  description: "",
  whatsapp: "",
  email: "",
  city: "",
  serviceArea: "",
  showPrices: false,
  serviceSource: "CATALOG",
  manualServices: [],
  accentColor: "#2457E6",
  backgroundColor: "#F6F4ED",
  textColor: "#142019",
  logoPath: null,
  backgroundImagePath: null,
  showLogo: true,
  backgroundOverlayPercentage: 18,
};

function ColorField({label, value, onChange}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const validValue = safeProfileColor(value, "#2457E6");
  return <TextField label={label} value={value} onChange={(event) => onChange(event.target.value)} fullWidth
                    slotProps={{input: {startAdornment: <InputAdornment position="start">
                      <Box component="input" type="color" value={validValue}
                           onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
                           aria-label={`Selecionar ${label.toLowerCase()}`}
                           sx={{width: 28, height: 28, p: 0, border: 0, bgcolor: "transparent", cursor: "pointer"}}/>
                    </InputAdornment>}, htmlInput: {maxLength: 7}}}/>;
}

export default function PublicProfileSettingsPage() {
  const [settings, setSettings] = useState<PublicProfileSettings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mediaSaving, setMediaSaving] = useState<"LOGO" | "BACKGROUND" | "">("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const loaded = await apiRequest<PublicProfileSettings>("/public-profile-settings");
      setSettings({...emptySettings, ...loaded, manualServices: loaded.manualServices ?? []});
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function set<K extends keyof PublicProfileSettings>(field: K, value: PublicProfileSettings[K]) {
    setSaved(false);
    setSettings((current) => ({...current, [field]: value}));
  }

  function publicPath() {
    return `/profissional/${settings.slug}`;
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}${publicPath()}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }

  async function uploadMedia(kind: "LOGO" | "BACKGROUND", event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("A imagem deve ter no máximo 5 MB.");
      return;
    }
    setMediaSaving(kind);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch(`/api/backend/public-profile-media/${kind}`, {
        method: "POST", credentials: "include", body,
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null) as {detail?: string} | null;
        throw new Error(problem?.detail ?? "Não foi possível enviar a imagem.");
      }
      const uploaded = await response.json() as PublicProfileMediaUpload;
      set(kind === "LOGO" ? "logoPath" : "backgroundImagePath", uploaded.path);
      setSaved(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setMediaSaving("");
    }
  }

  async function removeMedia(kind: "LOGO" | "BACKGROUND") {
    setMediaSaving(kind);
    setError("");
    try {
      const response = await fetch(`/api/backend/public-profile-media/${kind}`, {
        method: "DELETE", credentials: "include",
      });
      if (!response.ok) {
        const problem = await response.json().catch(() => null) as {detail?: string} | null;
        throw new Error(problem?.detail ?? "Não foi possível remover a imagem.");
      }
      set(kind === "LOGO" ? "logoPath" : "backgroundImagePath", null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setMediaSaving("");
    }
  }

  function chooseServiceSource(source: PublicServiceSource) {
    set("serviceSource", source);
    if (source === "MANUAL" && settings.manualServices.length === 0) {
      set("manualServices", [{name: "", description: "", basePrice: null}]);
    }
  }

  function updateManualService(index: number, patch: Partial<PublicProfileManualService>) {
    set("manualServices", settings.manualServices.map((service, itemIndex) =>
      itemIndex === index ? {...service, ...patch} : service));
  }

  function addManualService() {
    set("manualServices", [...settings.manualServices, {name: "", description: "", basePrice: null}]);
  }

  function removeManualService(index: number) {
    set("manualServices", settings.manualServices.filter((_, itemIndex) => itemIndex !== index));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const updated = await apiRequest<PublicProfileSettings>("/public-profile-settings", {
        method: "PUT",
        body: {
          enabled: settings.enabled,
          headline: settings.headline?.trim() || null,
          description: settings.description?.trim() || null,
          whatsapp: settings.whatsapp?.trim() || null,
          email: settings.email?.trim() || null,
          city: settings.city?.trim() || null,
          serviceArea: settings.serviceArea?.trim() || null,
          showPrices: settings.showPrices,
          serviceSource: settings.serviceSource,
          manualServices: settings.manualServices.map((service) => ({
            name: service.name.trim(),
            description: service.description?.trim() || null,
            basePrice: service.basePrice ?? null,
          })),
          accentColor: settings.accentColor,
          backgroundColor: settings.backgroundColor,
          textColor: settings.textColor,
          showLogo: settings.showLogo,
          backgroundOverlayPercentage: settings.backgroundOverlayPercentage,
        },
      });
      setSettings({...emptySettings, ...updated, manualServices: updated.manualServices ?? []});
      setSaved(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const manualIncomplete = settings.serviceSource === "MANUAL"
    && (settings.manualServices.length === 0 || settings.manualServices.some((service) => !service.name.trim()));
  const incomplete = settings.enabled && (!settings.headline?.trim() || !settings.description?.trim()
    || !settings.whatsapp?.replace(/\D/g, "") || manualIncomplete);
  const logoPreview = publicMediaUrl(settings.logoPath) || settings.logoUrl || "";
  const backgroundPreview = publicMediaUrl(settings.backgroundImagePath);

  return (
    <>
      <PageHeader eyebrow="Divulgação" title="Página pública"
                  description="Personalize sua vitrine, apresente seus serviços e receba pedidos de orçamento.">
        {!loading && settings.slug && <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<ContentCopyRoundedIcon/>} onClick={copyLink}>
            {copied ? "Link copiado" : "Copiar link"}
          </Button>
          <Button variant="contained" startIcon={<LaunchRoundedIcon/>} href={publicPath()} target="_blank"
                  disabled={!settings.enabled}>Visualizar</Button>
        </Stack>}
      </PageHeader>
      {loading && <PageLoading label="Carregando página pública..."/>}
      {!loading && error && !settings.slug && <ErrorAlert message={error} onRetry={load}/>} 
      {!loading && settings.slug && <Box component="form" onSubmit={submit} sx={{maxWidth: 980}}>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}
          {saved && <Alert severity="success">Página atualizada. As alterações já estão disponíveis no link público.</Alert>}

          <Card><CardContent sx={{p: {xs: 2.5, sm: 3.5}}}><Stack spacing={2.5}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{width: 44, height: 44, borderRadius: 2.25, bgcolor: "primary.main", color: "white",
                display: "grid", placeItems: "center"}}><PublicRoundedIcon/></Box>
              <Box><Typography variant="h3">Publicação</Typography><Typography variant="body2" color="text.secondary">
                Seu endereço público termina em {publicPath()}.</Typography></Box>
            </Stack>
            <Box sx={{p: 2.5, border: "1px solid", borderColor: settings.enabled ? "success.light" : "divider",
              borderRadius: 2.5, bgcolor: settings.enabled ? "success.50" : "#F8FAFC"}}>
              <FormControlLabel control={<Switch checked={settings.enabled}
                                                onChange={(event) => set("enabled", event.target.checked)}/>}
                                label={<Box><Typography fontWeight={800}>Disponibilizar minha página</Typography>
                                  <Typography variant="body2" color="text.secondary">Quando desligada, o perfil não pode ser acessado pelo link.</Typography></Box>}
                                sx={{m: 0, gap: 1, alignItems: "flex-start"}}/>
            </Box>
            {incomplete && <Alert severity="warning">Preencha a apresentação, o WhatsApp e todos os serviços manuais para publicar.</Alert>}
          </Stack></CardContent></Card>

          <Card><CardContent sx={{p: {xs: 2.5, sm: 3.5}}}><Stack spacing={2.5}>
            <Box><Typography variant="h3">Apresentação profissional</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>Explique seus diferenciais e a região onde atende.</Typography></Box>
            <TextField label="Título da página" value={settings.headline ?? ""}
                       onChange={(event) => set("headline", event.target.value)} required={settings.enabled}
                       placeholder="Ex.: Serviços elétricos com segurança e agilidade"
                       slotProps={{htmlInput: {maxLength: 180}}} helperText={`${settings.headline?.length ?? 0}/180 caracteres`}/>
            <TextField label="Sobre o profissional ou empresa" value={settings.description ?? ""}
                       onChange={(event) => set("description", event.target.value)} required={settings.enabled}
                       multiline minRows={5} placeholder="Conte sua experiência, diferenciais e como você trabalha."
                       slotProps={{htmlInput: {maxLength: 1200}}} helperText={`${settings.description?.length ?? 0}/1200 caracteres`}/>
            <Stack direction={{xs: "column", sm: "row"}} spacing={2}>
              <TextField label="Cidade" value={settings.city ?? ""} fullWidth onChange={(event) => set("city", event.target.value)}
                         placeholder="Ex.: Campinas - SP" slotProps={{htmlInput: {maxLength: 120}}}/>
              <TextField label="Região atendida" value={settings.serviceArea ?? ""} fullWidth
                         onChange={(event) => set("serviceArea", event.target.value)} placeholder="Ex.: Campinas e região"
                         slotProps={{htmlInput: {maxLength: 180}}}/>
            </Stack>
            <TextField label="WhatsApp" value={settings.whatsapp ?? ""}
                       onChange={(event) => set("whatsapp", event.target.value)} required={settings.enabled}
                       placeholder="(11) 99999-9999" slotProps={{htmlInput: {maxLength: 25}, input: {
                         startAdornment: <InputAdornment position="start"><WhatsAppIcon color="success"/></InputAdornment>,
                       }}} helperText="Será usado no botão de solicitar orçamento."/>
            <TextField label="E-mail público (opcional)" type="email" value={settings.email ?? ""}
                       onChange={(event) => set("email", event.target.value)} placeholder="contato@suaempresa.com.br"
                       slotProps={{htmlInput: {maxLength: 254}}}/>
          </Stack></CardContent></Card>

          <Card><CardContent sx={{p: {xs: 2.5, sm: 3.5}}}><Stack spacing={2.5}>
            <Box><Typography variant="h3">Serviços exibidos</Typography><Typography variant="body2" color="text.secondary" mt={0.5}>
              Use o catálogo da operação ou escreva uma lista exclusiva para divulgação.</Typography></Box>
            <FormControl>
              <FormLabel>Fonte dos serviços</FormLabel>
              <RadioGroup row value={settings.serviceSource}
                          onChange={(event) => chooseServiceSource(event.target.value as PublicServiceSource)}>
                <FormControlLabel value="CATALOG" control={<Radio/>} label="Usar catálogo cadastrado"/>
                <FormControlLabel value="MANUAL" control={<Radio/>} label="Descrever manualmente"/>
              </RadioGroup>
            </FormControl>
            {settings.serviceSource === "CATALOG"
              ? <Alert severity="info">Todos os serviços ativos do catálogo serão exibidos automaticamente.</Alert>
              : <Stack spacing={2}>
                {settings.manualServices.map((service, index) => <Box key={index} sx={{p: 2.25, border: "1px solid",
                  borderColor: "divider", borderRadius: 2.5, bgcolor: "#FBFCFE"}}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography fontWeight={850}>Serviço {index + 1}</Typography>
                    <IconButton aria-label={`Remover serviço ${index + 1}`} onClick={() => removeManualService(index)}
                                disabled={settings.manualServices.length === 1}><DeleteOutlineRoundedIcon/></IconButton>
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid size={{xs: 12, sm: 8}}><TextField label="Nome do serviço" value={service.name} required fullWidth
                      onChange={(event) => updateManualService(index, {name: event.target.value})}
                      placeholder="Ex.: Instalação de chuveiro" slotProps={{htmlInput: {maxLength: 160}}}/></Grid>
                    <Grid size={{xs: 12, sm: 4}}><TextField label="Preço inicial (opcional)" type="number" fullWidth
                      value={service.basePrice ?? ""} onChange={(event) => updateManualService(index, {
                        basePrice: event.target.value ? Number(event.target.value) : null,
                      })} slotProps={{htmlInput: {min: 0, step: 0.01}, input: {
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      }}}/></Grid>
                    <Grid size={{xs: 12}}><TextField label="Descrição" value={service.description ?? ""} fullWidth multiline minRows={2}
                      onChange={(event) => updateManualService(index, {description: event.target.value})}
                      placeholder="Explique resumidamente o que está incluído." slotProps={{htmlInput: {maxLength: 1000}}}/></Grid>
                  </Grid>
                </Box>)}
                <Button variant="outlined" startIcon={<AddRoundedIcon/>} onClick={addManualService}
                        disabled={settings.manualServices.length >= 24} sx={{alignSelf: "flex-start"}}>Adicionar serviço</Button>
              </Stack>}
            <Divider/>
            <FormControlLabel control={<Switch checked={settings.showPrices}
                                              onChange={(event) => set("showPrices", event.target.checked)}/>}
                              label={<Box><Typography fontWeight={800}>Exibir preços</Typography><Typography variant="body2" color="text.secondary">
                                Mostra o valor base como “a partir de”; deixe desligado quando o preço exigir avaliação.</Typography></Box>}
                              sx={{m: 0, gap: 1, alignItems: "flex-start"}}/>
          </Stack></CardContent></Card>

          <Card><CardContent sx={{p: {xs: 2.5, sm: 3.5}}}><Stack spacing={3}>
            <Box><Typography variant="h3">Imagens e aparência</Typography><Typography variant="body2" color="text.secondary" mt={0.5}>
              As imagens são armazenadas no servidor e o caminho fica registrado no banco de dados.</Typography></Box>
            <Grid container spacing={2.5}>
              <Grid size={{xs: 12, md: 5}}><Box sx={{p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 3}}>
                <Typography fontWeight={850}>Logo público</Typography><Typography variant="body2" color="text.secondary" mt={0.5} mb={2}>
                  PNG, JPG ou WebP de até 5 MB.</Typography>
                <Box sx={{height: 150, display: "grid", placeItems: "center", borderRadius: 2.5, bgcolor: "#F4F6FA",
                  border: "1px dashed", borderColor: "divider", overflow: "hidden"}}>
                  {logoPreview ? <Box component="img" src={logoPreview} alt="Prévia do logo" sx={{width: "100%", height: "100%", objectFit: "contain", p: 2}}/>
                    : <ImageOutlinedIcon sx={{fontSize: 42, color: "text.disabled"}}/>}
                </Box>
                <Stack direction="row" spacing={1} mt={2}>
                  <Button component="label" variant="outlined" startIcon={<UploadRoundedIcon/>}
                          disabled={Boolean(mediaSaving)}>{mediaSaving === "LOGO" ? "Enviando..." : "Enviar logo"}
                    <input hidden type="file" accept="image/png,image/jpeg,image/webp"
                           onChange={(event) => void uploadMedia("LOGO", event)}/></Button>
                  {settings.logoPath && <Button color="inherit" onClick={() => void removeMedia("LOGO")}
                                                disabled={Boolean(mediaSaving)}>Remover</Button>}
                </Stack>
                <FormControlLabel control={<Switch checked={settings.showLogo}
                                                  onChange={(event) => set("showLogo", event.target.checked)}/>}
                                  label="Exibir logo na página" sx={{mt: 2, mb: 0}}/>
              </Box></Grid>
              <Grid size={{xs: 12, md: 7}}><Box sx={{p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 3}}>
                <Typography fontWeight={850}>Imagem de fundo</Typography><Typography variant="body2" color="text.secondary" mt={0.5} mb={2}>
                  Prefira uma imagem horizontal com boa resolução.</Typography>
                <Box sx={{height: 150, borderRadius: 2.5, bgcolor: settings.backgroundColor, overflow: "hidden",
                  border: "1px dashed", borderColor: "divider", backgroundImage: backgroundPreview ? `linear-gradient(${settings.backgroundColor}${Math.round(settings.backgroundOverlayPercentage * 2.55).toString(16).padStart(2, "0")}, ${settings.backgroundColor}${Math.round(settings.backgroundOverlayPercentage * 2.55).toString(16).padStart(2, "0")}), url("${backgroundPreview}")` : "none",
                  backgroundSize: "cover", backgroundPosition: "center", display: "grid", placeItems: "center"}}>
                  {!backgroundPreview && <ImageOutlinedIcon sx={{fontSize: 42, color: "text.disabled"}}/>}
                </Box>
                <Stack direction="row" spacing={1} mt={2}>
                  <Button component="label" variant="outlined" startIcon={<UploadRoundedIcon/>}
                          disabled={Boolean(mediaSaving)}>{mediaSaving === "BACKGROUND" ? "Enviando..." : "Enviar fundo"}
                    <input hidden type="file" accept="image/png,image/jpeg,image/webp"
                           onChange={(event) => void uploadMedia("BACKGROUND", event)}/></Button>
                  {settings.backgroundImagePath && <Button color="inherit" onClick={() => void removeMedia("BACKGROUND")}
                                                           disabled={Boolean(mediaSaving)}>Remover</Button>}
                </Stack>
              </Box></Grid>
            </Grid>
            <Divider/>
            <Box><Typography fontWeight={850} mb={2}>Cores da página</Typography>
              <Grid container spacing={2}>
                <Grid size={{xs: 12, sm: 4}}><ColorField label="Cor de destaque" value={settings.accentColor}
                  onChange={(value) => set("accentColor", value)}/></Grid>
                <Grid size={{xs: 12, sm: 4}}><ColorField label="Cor de fundo" value={settings.backgroundColor}
                  onChange={(value) => set("backgroundColor", value)}/></Grid>
                <Grid size={{xs: 12, sm: 4}}><ColorField label="Cor do texto" value={settings.textColor}
                  onChange={(value) => set("textColor", value)}/></Grid>
              </Grid>
            </Box>
            {settings.backgroundImagePath && <Box><Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={800}>Intensidade da camada sobre a imagem</Typography>
              <Chip label={`${settings.backgroundOverlayPercentage}%`} size="small"/>
            </Stack><Slider value={settings.backgroundOverlayPercentage} min={0} max={90} step={5}
                            onChange={(_, value) => set("backgroundOverlayPercentage", Number(value))} sx={{mt: 1}}/></Box>}
          </Stack></CardContent></Card>

          <Button type="submit" variant="contained" size="large" startIcon={<SaveRoundedIcon/>}
                  disabled={saving || Boolean(incomplete) || Boolean(mediaSaving)} sx={{alignSelf: "flex-end"}}>
            {saving ? "Salvando..." : "Salvar página pública"}
          </Button>
        </Stack>
      </Box>}
    </>
  );
}
