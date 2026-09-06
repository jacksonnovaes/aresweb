"use client";

import {ErrorAlert, PageLoading} from "@/components/common/feedback";
import {apiRequest, errorMessage} from "@/lib/api";
import type {CommunicationSettings} from "@/lib/types";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
    Alert, Box, Button, Card, CardContent, Chip, Divider, FormControlLabel, Grid, Stack, Switch,
    TextField, Typography,
} from "@mui/material";
import {FormEvent, useCallback, useEffect, useState} from "react";

interface CommunicationSettingsForm extends CommunicationSettings {
    whatsappToken: string;
    smtpPassword: string;
}

function toForm(settings: CommunicationSettings): CommunicationSettingsForm {
    return {...settings, whatsappToken: "", smtpPassword: ""};
}

export function CommunicationSettingsCard() {
    const [form, setForm] = useState<CommunicationSettingsForm | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            setForm(toForm(await apiRequest<CommunicationSettings>("/communication-settings")));
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    function set<K extends keyof CommunicationSettingsForm>(field: K, value: CommunicationSettingsForm[K]) {
        setSaved(false);
        setForm((current) => current ? {...current, [field]: value} : current);
    }

    async function submit(event: FormEvent) {
        event.preventDefault();
        if (!form) return;
        setSaving(true);
        setSaved(false);
        setError("");
        try {
            const updated = await apiRequest<CommunicationSettings>("/communication-settings", {
                method: "PUT",
                body: {
                    whatsappEnabled: form.whatsappEnabled,
                    whatsappNumber: form.whatsappNumber || null,
                    whatsappToken: form.whatsappToken.trim() || null,
                    smtpEnabled: form.smtpEnabled,
                    smtpHost: form.smtpHost || null,
                    smtpPort: form.smtpPort || null,
                    smtpUsername: form.smtpUsername || null,
                    smtpPassword: form.smtpPassword.trim() || null,
                    smtpFromEmail: form.smtpFromEmail || null,
                    smtpStartTls: form.smtpStartTls,
                },
            });
            setForm(toForm(updated));
            setSaved(true);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    }

    const whatsappReady = !form?.whatsappEnabled || Boolean(form.whatsappNumber?.trim()
        && (form.whatsappTokenConfigured || form.whatsappToken.trim()));
    const smtpReady = !form?.smtpEnabled || Boolean(form.smtpHost?.trim() && form.smtpPort
        && form.smtpUsername?.trim() && (form.smtpPasswordConfigured || form.smtpPassword.trim())
        && form.smtpFromEmail?.trim());

    return <Card><CardContent sx={{p: {xs: 2.5, sm: 3.5}}}>
        <Stack spacing={2.5}>
            <Box>
                <Typography variant="h3">Canais de comunicação</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Cadastre as credenciais usadas pela empresa para WhatsApp e envio de e-mails.
                </Typography>
            </Box>
            {loading && <PageLoading label="Carregando canais..."/>}
            {!loading && error && !form && <ErrorAlert message={error} onRetry={load}/>}
            {!loading && form && <Box component="form" onSubmit={submit}>
                <Stack spacing={3}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {saved && <Alert severity="success">Configurações de comunicação salvas.</Alert>}

                    <Stack spacing={2}>
                        <Stack direction={{xs: "column", sm: "row"}} spacing={1.5}
                               alignItems={{sm: "center"}} justifyContent="space-between">
                            <Stack direction="row" spacing={1.25} alignItems="center">
                                <Box sx={{width: 42, height: 42, display: "grid", placeItems: "center",
                                    borderRadius: 2, bgcolor: "success.main", color: "white"}}>
                                    <WhatsAppIcon/>
                                </Box>
                                <Box><Typography fontWeight={850}>WhatsApp</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Número e token da integração.
                                    </Typography></Box>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                {form.whatsappTokenConfigured && <Chip label="Token configurado" size="small"
                                                                       color="success" variant="outlined"/>}
                                <FormControlLabel sx={{m: 0}} label="Habilitado" labelPlacement="start"
                                                  control={<Switch checked={form.whatsappEnabled}
                                                                   onChange={(event) => set("whatsappEnabled",
                                                                       event.target.checked)}/>}/>
                            </Stack>
                        </Stack>
                        <Grid container spacing={2}>
                            <Grid size={{xs: 12, sm: 5}}><TextField label="Número do WhatsApp" type="tel"
                                placeholder="55 11 99999-9999" value={form.whatsappNumber ?? ""}
                                onChange={(event) => set("whatsappNumber", event.target.value)}
                                required={form.whatsappEnabled} fullWidth
                                slotProps={{htmlInput: {maxLength: 30}}}
                                helperText="Inclua o código do país e o DDD."/></Grid>
                            <Grid size={{xs: 12, sm: 7}}><TextField label="Token do WhatsApp" type="password"
                                value={form.whatsappToken}
                                onChange={(event) => set("whatsappToken", event.target.value)}
                                required={form.whatsappEnabled && !form.whatsappTokenConfigured} fullWidth
                                slotProps={{htmlInput: {maxLength: 4096, autoComplete: "new-password"}}}
                                helperText={form.whatsappTokenConfigured
                                    ? "Deixe vazio para manter o token cadastrado." : "Informe o token da integração."}/></Grid>
                        </Grid>
                    </Stack>

                    <Divider/>

                    <Stack spacing={2}>
                        <Stack direction={{xs: "column", sm: "row"}} spacing={1.5}
                               alignItems={{sm: "center"}} justifyContent="space-between">
                            <Stack direction="row" spacing={1.25} alignItems="center">
                                <Box sx={{width: 42, height: 42, display: "grid", placeItems: "center",
                                    borderRadius: 2, bgcolor: "primary.main", color: "white"}}>
                                    <EmailRoundedIcon/>
                                </Box>
                                <Box><Typography fontWeight={850}>Servidor SMTP</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Servidor usado para enviar e-mails da empresa.
                                    </Typography></Box>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                {form.smtpPasswordConfigured && <Chip label="Senha configurada" size="small"
                                                                     color="success" variant="outlined"/>}
                                <FormControlLabel sx={{m: 0}} label="Habilitado" labelPlacement="start"
                                                  control={<Switch checked={form.smtpEnabled}
                                                                   onChange={(event) => set("smtpEnabled",
                                                                       event.target.checked)}/>}/>
                            </Stack>
                        </Stack>
                        <Grid container spacing={2}>
                            <Grid size={{xs: 12, sm: 8}}><TextField label="Host SMTP"
                                placeholder="smtp.seudominio.com" value={form.smtpHost ?? ""}
                                onChange={(event) => set("smtpHost", event.target.value)}
                                required={form.smtpEnabled} fullWidth slotProps={{htmlInput: {maxLength: 255}}}/></Grid>
                            <Grid size={{xs: 12, sm: 4}}><TextField label="Porta" type="number"
                                value={form.smtpPort ?? ""}
                                onChange={(event) => set("smtpPort", event.target.value
                                    ? Number(event.target.value) : null)} required={form.smtpEnabled} fullWidth
                                slotProps={{htmlInput: {min: 1, max: 65535}}}/></Grid>
                            <Grid size={{xs: 12, sm: 6}}><TextField label="Usuário SMTP"
                                value={form.smtpUsername ?? ""}
                                onChange={(event) => set("smtpUsername", event.target.value)}
                                required={form.smtpEnabled} fullWidth slotProps={{htmlInput: {maxLength: 254}}}/></Grid>
                            <Grid size={{xs: 12, sm: 6}}><TextField label="Senha SMTP" type="password"
                                value={form.smtpPassword}
                                onChange={(event) => set("smtpPassword", event.target.value)}
                                required={form.smtpEnabled && !form.smtpPasswordConfigured} fullWidth
                                slotProps={{htmlInput: {maxLength: 4096, autoComplete: "new-password"}}}
                                helperText={form.smtpPasswordConfigured ? "Vazio mantém a senha atual." : undefined}/></Grid>
                            <Grid size={{xs: 12, sm: 8}}><TextField label="E-mail remetente" type="email"
                                placeholder="contato@seudominio.com" value={form.smtpFromEmail ?? ""}
                                onChange={(event) => set("smtpFromEmail", event.target.value)}
                                required={form.smtpEnabled} fullWidth slotProps={{htmlInput: {maxLength: 254}}}/></Grid>
                            <Grid size={{xs: 12, sm: 4}} sx={{display: "flex", alignItems: "center"}}>
                                <FormControlLabel label="Usar STARTTLS" control={<Switch checked={form.smtpStartTls}
                                    onChange={(event) => set("smtpStartTls", event.target.checked)}/>}/>
                            </Grid>
                        </Grid>
                    </Stack>

                    <Alert severity="info">
                        Tokens e senhas cadastrados não são exibidos novamente. Digite um novo valor somente para substituí-los.
                    </Alert>
                    <Button type="submit" variant="contained" startIcon={<SaveRoundedIcon/>}
                            disabled={saving || !whatsappReady || !smtpReady} sx={{alignSelf: "flex-end"}}>
                        {saving ? "Salvando..." : "Salvar canais"}
                    </Button>
                </Stack>
            </Box>}
        </Stack>
    </CardContent></Card>;
}
