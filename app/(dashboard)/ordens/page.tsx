"use client";

import {ErrorAlert, TableEmpty, TableLoading} from "@/components/common/feedback";
import {PageHeader} from "@/components/common/page-header";
import {StatusChip, enumLabel} from "@/components/common/status-chip";
import {ServiceOrderDocumentDialog} from "@/components/orders/service-order-document";
import {
    emptyQuoteLine, QuoteLinesEditor, storedQuoteLine, type QuoteLineDraft,
} from "@/components/orders/quote-lines-editor";
import {
    QuickAssetDialog, QuickCustomerDialog, QuickServiceDialog, QuickTechnicianDialog,
    RelatedCreateButton,
} from "@/components/quick-create/entity-dialogs";
import {useAuth} from "@/contexts/auth-context";
import {apiRequest, errorMessage} from "@/lib/api";
import {formatDate, formatMoney} from "@/lib/format";
import type {
    Asset,
    CatalogService,
    CompanySettings,
    Customer,
    ManagedUser,
    ServiceOrder,
    ServiceOrderDocument,
    ServiceOrderEmailResult,
    ServiceOrderPriority,
    ServiceOrderStatus,
    ServiceOrderStatusDefinition
} from "@/lib/types";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
    Alert, Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton,
    InputAdornment, InputLabel, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, TextField, Tooltip, Typography,
} from "@mui/material";
import {FormEvent, useCallback, useEffect, useMemo, useState} from "react";

const blank = (settings?: CompanySettings) => ({
    customerId: "", assetId: "",
    lines: [emptyQuoteLine(settings?.quoteCalculationMethod, settings?.defaultSquareMeterPrice,
        settings?.defaultCubicMeterPrice)],
    title: "", description: "", priority: "NORMAL" as ServiceOrderPriority,
    assignedTechnicianId: "", dueAt: "",
});

export default function OrdersPage() {
    const {can} = useAuth();
    const [orders, setOrders] = useState<ServiceOrder[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [services, setServices] = useState<CatalogService[]>([]);
    const [users, setUsers] = useState<ManagedUser[]>([]);
    const [statuses, setStatuses] = useState<ServiceOrderStatusDefinition[]>([]);
    const [companySettings, setCompanySettings] = useState<CompanySettings>({
        requireAssets: true, subscriptionPlan: "SOLO", subscriptionBillingCycle: "MONTHLY",
        subscriptionActive: false, subscriptionPaidUntil: null, subscriptionPrice: 29.9,
        couponDiscountPercentage: 0,
        quoteCalculationMethod: "QUANTITY",
        enabledQuoteCalculationMethods: ["QUANTITY", "SQUARE_METER", "CUBIC_METER"],
        defaultSquareMeterPrice: null,
        defaultCubicMeterPrice: null, includedUserLimit: 1, additionalUserSeats: 0,
        userLimit: 1, additionalUserMonthlyPrice: 12.9,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(blank);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [statusOrder, setStatusOrder] = useState<ServiceOrder | null>(null);
    const [nextStatus, setNextStatus] = useState<ServiceOrderStatus | "">("");
    const [finalValue, setFinalValue] = useState("");
    const [quickCustomerOpen, setQuickCustomerOpen] = useState(false);
    const [quickAssetOpen, setQuickAssetOpen] = useState(false);
    const [quickServiceOpen, setQuickServiceOpen] = useState(false);
    const [quickTechnicianOpen, setQuickTechnicianOpen] = useState(false);
    const [printOrder, setPrintOrder] = useState<ServiceOrder | null>(null);
    const [printDocument, setPrintDocument] = useState<ServiceOrderDocument | null>(null);
    const [printLoading, setPrintLoading] = useState(false);
    const [printError, setPrintError] = useState("");
    const [emailOrder, setEmailOrder] = useState<ServiceOrder | null>(null);
    const [recipient, setRecipient] = useState("");
    const [emailResult, setEmailResult] = useState<ServiceOrderEmailResult | null>(null);
    const [emailError, setEmailError] = useState("");
    const [emailSending, setEmailSending] = useState(false);
    const [quoteOrder, setQuoteOrder] = useState<ServiceOrder | null>(null);
    const [quoteLines, setQuoteLines] = useState<QuoteLineDraft[]>([emptyQuoteLine()]);
    const [quoteAssetId, setQuoteAssetId] = useState("");
    const [quoteError, setQuoteError] = useState("");
    const [quoteSaving, setQuoteSaving] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [orderData, customerData, assetData, serviceData, userData, settingsData, statusData] = await Promise.all([
                apiRequest<ServiceOrder[]>("/service-orders"),
                can("CUSTOMER_READ") ? apiRequest<Customer[]>("/customers") : Promise.resolve([]),
                can("ASSET_READ") ? apiRequest<Asset[]>("/assets") : Promise.resolve([]),
                can("SERVICE_READ") ? apiRequest<CatalogService[]>("/services") : Promise.resolve([]),
                can("USER_MANAGE") ? apiRequest<ManagedUser[]>("/users") : Promise.resolve([]),
                apiRequest<CompanySettings>("/company-settings"),
                apiRequest<ServiceOrderStatusDefinition[]>("/service-order-statuses"),
            ]);
            setOrders(orderData);
            setCustomers(customerData);
            setAssets(assetData);
            setServices(serviceData);
            setUsers(userData);
            setCompanySettings(settingsData);
            setStatuses(statusData);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [can]);
    useEffect(() => {
        load();
    }, [load]);
    useEffect(() => {
        if (new URLSearchParams(window.location.search).get("nova") === "1" && can("SERVICE_ORDER_CREATE")) setOpen(true);
    }, [can]);

    const customerMap = useMemo(() => new Map(customers.map((item) => [item.id, item.name])), [customers]);
    const assetMap = useMemo(() => new Map(assets.map((item) => [item.id, item.name])), [assets]);
    const serviceMap = useMemo(() => new Map(services.map((item) => [item.id, item])), [services]);
    const statusMap = useMemo(() => new Map(statuses.map((item) => [item.code, item.name])), [statuses]);
    const statusFilterOptions = useMemo(() => {
        const options = statuses.map((item) => ({code: item.code, name: item.name}));
        for (const order of orders) {
            if (!options.some((item) => item.code === order.status)) {
                options.push({code: order.status, name: enumLabel(order.status)});
            }
        }
        return options;
    }, [orders, statuses]);
    const filteredAssets = assets.filter((asset) => !form.customerId || asset.customerId === form.customerId);
    const formHasMaintenance = form.lines.some((line) => serviceMap.get(line.serviceId)?.type === "MAINTENANCE");
    const quoteHasMaintenance = quoteLines.some((line) => serviceMap.get(line.serviceId)?.type === "MAINTENANCE");
    const formRequiresAsset = companySettings.requireAssets && formHasMaintenance;
    const quoteRequiresAsset = companySettings.requireAssets && quoteHasMaintenance;
    const quoteAssets = assets.filter((asset) => asset.customerId === quoteOrder?.customerId);
    const filtered = useMemo(() => orders.filter((order) => {
        const text = `${order.title} ${customerMap.get(order.customerId) ?? ""} ${order.id}`.toLowerCase();
        return text.includes(search.toLowerCase()) && (statusFilter === "all" || order.status === statusFilter);
    }), [customerMap, orders, search, statusFilter]);
    const set = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) => setForm((current) => ({
        ...current,
        [field]: value
    }));

    function startCreate() {
        setForm(blank(companySettings));
        setFormError("");
        setOpen(true);
    }

    async function submit(event: FormEvent) {
        event.preventDefault();
        setSaving(true);
        setFormError("");
        try {
            const created = await apiRequest<ServiceOrder>("/service-orders", {
                method: "POST", body: {
                    customerId: form.customerId,
                    assetId: formRequiresAsset ? form.assetId : null,
                    lines: form.lines.map((line) => ({
                        serviceId: line.serviceId || null, description: line.description,
                        notes: line.notes || null,
                        quantity: Number(line.quantity), unit: line.unit, unitPrice: Number(line.unitPrice),
                        calculationMethod: line.calculationMethod,
                        widthMeters: line.calculationMethod !== "QUANTITY" ? Number(line.widthMeters) : null,
                        lengthMeters: line.calculationMethod !== "QUANTITY" ? Number(line.lengthMeters) : null,
                        heightMeters: line.calculationMethod === "CUBIC_METER" ? Number(line.heightMeters) : null,
                    })),
                    title: form.title,
                    description: form.description || null,
                    priority: form.priority,
                    assignedTechnicianId: form.assignedTechnicianId || null,
                    dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : null,
                }
            });
            setOrders((current) => [created, ...current]);
            setOpen(false);
        } catch (err) {
            setFormError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    }

    function startStatus(order: ServiceOrder) {
        setStatusOrder(order);
        setNextStatus("");
        setFinalValue(order.finalValue?.toString() ?? "");
        setFormError("");
    }

    async function changeStatus() {
        if (!statusOrder || !nextStatus) return;
        setSaving(true);
        setFormError("");
        try {
            const updated = await apiRequest<ServiceOrder>(`/service-orders/${statusOrder.id}/status`, {
                method: "PATCH",
                body: {status: nextStatus, finalValue: finalValue ? Number(finalValue) : null}
            });
            setOrders((current) => current.map((item) => item.id === updated.id ? updated : item));
            setStatusOrder(null);
        } catch (err) {
            setFormError(errorMessage(err));
        } finally {
            setSaving(false);
        }
    }

    async function loadPrintDocument(order: ServiceOrder) {
        setPrintLoading(true);
        setPrintError("");
        setPrintDocument(null);
        try {
            setPrintDocument(await apiRequest<ServiceOrderDocument>(`/service-orders/${order.id}/document`));
        } catch (err) {
            setPrintError(errorMessage(err));
        } finally {
            setPrintLoading(false);
        }
    }

    function startPrint(order: ServiceOrder) {
        setPrintOrder(order);
        void loadPrintDocument(order);
    }

    function startEmail(order: ServiceOrder) {
        setEmailOrder(order);
        setRecipient(customers.find((customer) => customer.id === order.customerId)?.email ?? "");
        setEmailResult(null);
        setEmailError("");
    }

    async function sendEmail(event: FormEvent) {
        event.preventDefault();
        if (!emailOrder) return;
        setEmailSending(true);
        setEmailError("");
        setEmailResult(null);
        try {
            setEmailResult(await apiRequest<ServiceOrderEmailResult>(`/service-orders/${emailOrder.id}/email`, {
                method: "POST", body: {recipient: recipient || null},
            }));
        } catch (err) {
            setEmailError(errorMessage(err));
        } finally {
            setEmailSending(false);
        }
    }

    function startQuote(order: ServiceOrder) {
        setQuoteOrder(order);
        setQuoteLines(order.quoteLines.length > 0 ? order.quoteLines.map(storedQuoteLine) : [emptyQuoteLine()]);
        setQuoteAssetId(order.assetId ?? "");
        setQuoteError("");
    }

    async function saveQuote() {
        if (!quoteOrder) return;
        setQuoteSaving(true);
        setQuoteError("");
        try {
            const updated = await apiRequest<ServiceOrder>(`/service-orders/${quoteOrder.id}/quote`, {
                method: "PUT", body: {
                    assetId: quoteRequiresAsset ? quoteAssetId : null, lines: quoteLines.map((line) => ({
                        serviceId: line.serviceId || null, description: line.description,
                        notes: line.notes || null,
                        quantity: Number(line.quantity), unit: line.unit, unitPrice: Number(line.unitPrice),
                        calculationMethod: line.calculationMethod,
                        widthMeters: line.calculationMethod !== "QUANTITY" ? Number(line.widthMeters) : null,
                        lengthMeters: line.calculationMethod !== "QUANTITY" ? Number(line.lengthMeters) : null,
                        heightMeters: line.calculationMethod === "CUBIC_METER" ? Number(line.heightMeters) : null,
                    }))
                },
            });
            setOrders((current) => current.map((item) => item.id === updated.id ? updated : item));
            setQuoteOrder(null);
        } catch (err) {
            setQuoteError(errorMessage(err));
        } finally {
            setQuoteSaving(false);
        }
    }

    return (
        <>
            <PageHeader eyebrow="Operação" title="Ordens de serviço"
                        description="Acompanhe cada atendimento do início à conclusão."
                        actionLabel={can("SERVICE_ORDER_CREATE") ? "Nova ordem" : undefined}
                        actionIcon={<AddRoundedIcon/>} onAction={startCreate}/>
            {error && <Box mb={2.5}><ErrorAlert message={error} onRetry={load}/></Box>}
            <Card>
                <Stack direction={{xs: "column", md: "row"}} gap={2}
                       sx={{p: 2.5, borderBottom: "1px solid", borderColor: "divider"}}>
                    <TextField placeholder="Buscar por ordem ou cliente" value={search}
                               onChange={(e) => setSearch(e.target.value)} sx={{flex: 1, maxWidth: 430}} slotProps={{
                        input: {
                            startAdornment: <InputAdornment position="start"><SearchRoundedIcon
                                color="action"/></InputAdornment>
                        }
                    }}/>
                    <FormControl sx={{minWidth: 220}}><InputLabel>Status</InputLabel><Select label="Status"
                                                                                             value={statusFilter}
                                                                                             onChange={(e) => setStatusFilter(e.target.value)}><MenuItem
                        value="all">Todos os status</MenuItem>{statusFilterOptions.map((status) => <MenuItem
                        value={status.code} key={status.code}>{status.name}</MenuItem>)}</Select></FormControl>
                    <Typography variant="body2" color="text.secondary" alignSelf="center"
                                sx={{ml: {md: "auto"}}}>{filtered.length} ordens</Typography>
                </Stack>
                <TableContainer><Table>
                    <TableHead><TableRow><TableCell>Ordem</TableCell><TableCell>Cliente /
                        atendimento</TableCell><TableCell>Prioridade</TableCell><TableCell>Status</TableCell><TableCell>Prazo</TableCell><TableCell
                        align="right">Valor</TableCell>{can("SERVICE_ORDER_UPDATE") &&
                        <TableCell align="right">Próxima etapa</TableCell>}<TableCell
                        align="right">Ações</TableCell></TableRow></TableHead>
                    <TableBody>
                        {loading && <TableLoading colSpan={can("SERVICE_ORDER_UPDATE") ? 8 : 7}/>}
                        {!loading && filtered.length === 0 && <TableEmpty colSpan={can("SERVICE_ORDER_UPDATE") ? 8 : 7}
                                                                          message="Nenhuma ordem de serviço encontrada."/>}
                        {filtered.map((order) => <TableRow key={order.id} hover>
                            <TableCell><Typography variant="body2"
                                                   fontWeight={750}>{order.title}</Typography><Typography
                                variant="caption"
                                color="text.secondary">#{order.id.slice(0, 8).toUpperCase()}</Typography></TableCell>
                            <TableCell><Typography
                                variant="body2">{customerMap.get(order.customerId) ?? "Cliente"}</Typography><Typography
                                variant="caption"
                                color="text.secondary">{order.assetId ? assetMap.get(order.assetId) ?? "Ativo" : "Serviço sem ativo"}</Typography></TableCell>
                            <TableCell><StatusChip value={order.priority}/></TableCell><TableCell><StatusChip
                            value={order.status}
                            label={statusMap.get(order.status)}/></TableCell><TableCell>{formatDate(order.dueAt)}</TableCell><TableCell
                            align="right"
                            sx={{fontWeight: 700}}>{formatMoney(order.finalValue ?? order.estimatedValue)}</TableCell>
                            {can("SERVICE_ORDER_UPDATE") &&
                                <TableCell align="right"><Button size="small" endIcon={<ArrowForwardRoundedIcon/>}
                                                                 onClick={() => startStatus(order)}
                                                                 disabled={!statuses.some((status) => status.code !== order.status)}>Alterar</Button></TableCell>}
                            <TableCell align="right"><Stack direction="row" justifyContent="flex-end"
                                                            spacing={0.25}>{can("SERVICE_ORDER_UPDATE") &&
                                <Tooltip title="Editar orçamento"><IconButton size="small"
                                                                              aria-label={`Editar orçamento da ordem ${order.title}`}
                                                                              onClick={() => startQuote(order)}><RequestQuoteOutlinedIcon
                                    fontSize="small"/></IconButton></Tooltip>}<Tooltip
                                title="Imprimir ordem"><IconButton size="small"
                                                                   aria-label={`Imprimir ordem ${order.title}`}
                                                                   onClick={() => startPrint(order)}><PrintOutlinedIcon
                                fontSize="small"/></IconButton></Tooltip>{can("SERVICE_ORDER_UPDATE") &&
                                <Tooltip title="Enviar por e-mail (simulação)"><IconButton size="small"
                                                                                           aria-label={`Enviar ordem ${order.title} por e-mail`}
                                                                                           onClick={() => startEmail(order)}><EmailOutlinedIcon
                                    fontSize="small"/></IconButton></Tooltip>}</Stack></TableCell>
                        </TableRow>)}
                    </TableBody>
                </Table></TableContainer>
            </Card>
            <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="md"><Box component="form"
                                                                                                       onSubmit={submit}><DialogTitle>Nova
                ordem de serviço<Typography variant="body2" color="text.secondary" mt={0.5}>Registre a demanda, os
                    serviços e o prazo do atendimento.</Typography></DialogTitle><DialogContent dividers><Stack
                spacing={2.25}>
                {formError && <Alert severity="error">{formError}</Alert>}
                <Box><FormControl fullWidth required><InputLabel>Cliente</InputLabel><Select label="Cliente"
                                                                                             value={form.customerId}
                                                                                             onChange={(e) => {
                                                                                                 set("customerId", e.target.value);
                                                                                                 set("assetId", "");
                                                                                             }}>{customers.map((customer) =>
                    <MenuItem value={customer.id}
                              key={customer.id}>{customer.name}</MenuItem>)}</Select></FormControl>{can("CUSTOMER_CREATE") &&
                    <RelatedCreateButton label="Cadastrar novo cliente" onClick={() => setQuickCustomerOpen(true)}/>}
                </Box>
                <TextField label="Título da ordem" value={form.title} onChange={(e) => set("title", e.target.value)}
                           required fullWidth autoFocus/>
                <TextField label="Descrição do problema / solicitação" value={form.description}
                           onChange={(e) => set("description", e.target.value)} multiline minRows={3} fullWidth/>
                <QuoteLinesEditor lines={form.lines} services={services} onChange={(lines) => set("lines", lines)}
                                  onCreateService={can("SERVICE_CREATE") ? () => setQuickServiceOpen(true) : undefined}
                                  defaultCalculationMethod={companySettings.quoteCalculationMethod}
                                  enabledCalculationMethods={companySettings.enabledQuoteCalculationMethods}
                                  defaultSquareMeterPrice={companySettings.defaultSquareMeterPrice}
                                  defaultCubicMeterPrice={companySettings.defaultCubicMeterPrice}/>
                {formRequiresAsset ?
                    <Box><Alert severity="info" sx={{mb: 1.5}}>Uma das linhas é uma manutenção. Selecione o ativo que
                        receberá o serviço.</Alert><FormControl fullWidth required
                                                                disabled={!form.customerId}><InputLabel>Ativo em
                        manutenção</InputLabel><Select label="Ativo em manutenção" value={form.assetId}
                                                       onChange={(e) => set("assetId", e.target.value)}>{filteredAssets.map((asset) =>
                        <MenuItem value={asset.id}
                                  key={asset.id}>{asset.name}</MenuItem>)}</Select></FormControl>{can("ASSET_CREATE") &&
                        <RelatedCreateButton
                            label={form.customerId ? "Cadastrar novo ativo" : "Selecione o cliente para cadastrar um ativo"}
                            disabled={!form.customerId} onClick={() => setQuickAssetOpen(true)}/>}</Box> : <Alert
                        severity="success">{companySettings.requireAssets ? "Serviço sem manutenção de ativo: apenas o cliente e a descrição do atendimento serão registrados." : "A empresa está configurada para não exigir ativos. Apenas o cliente e a descrição serão registrados."}</Alert>}
                <FormControl fullWidth required><InputLabel>Prioridade</InputLabel><Select label="Prioridade"
                                                                                           value={form.priority}
                                                                                           onChange={(e) => set("priority", e.target.value as ServiceOrderPriority)}>{["LOW", "NORMAL", "HIGH", "URGENT"].map((priority) =>
                    <MenuItem key={priority} value={priority}>{enumLabel(priority)}</MenuItem>)}</Select></FormControl>
                <Stack direction={{xs: "column", sm: "row"}} spacing={2}
                       alignItems="flex-start">{(users.length > 0 || can("USER_MANAGE")) &&
                    <Box sx={{width: "100%"}}><FormControl fullWidth><InputLabel>Técnico responsável</InputLabel><Select
                        label="Técnico responsável" value={form.assignedTechnicianId}
                        onChange={(e) => set("assignedTechnicianId", e.target.value)}><MenuItem value="">Não
                        atribuído</MenuItem>{users.filter((user) => user.roles.includes("TECHNICIAN") && user.status === "ACTIVE").map((user) =>
                        <MenuItem value={user.id} key={user.id}>{user.name}</MenuItem>)}
                    </Select></FormControl>{can("USER_MANAGE") && <RelatedCreateButton label="Cadastrar novo técnico"
                                                                                       onClick={() => setQuickTechnicianOpen(true)}/>}
                    </Box>}<TextField label="Prazo" type="datetime-local" value={form.dueAt}
                                      onChange={(e) => set("dueAt", e.target.value)} fullWidth
                                      slotProps={{inputLabel: {shrink: true}}}/></Stack>
            </Stack></DialogContent><DialogActions sx={{p: 2.5}}><Button onClick={() => setOpen(false)}
                                                                         disabled={saving}>Cancelar</Button><Button
                type="submit" variant="contained"
                disabled={saving}>{saving ? "Criando..." : "Criar ordem"}</Button></DialogActions></Box></Dialog>
            <Dialog open={Boolean(statusOrder)} onClose={() => !saving && setStatusOrder(null)} fullWidth maxWidth="xs"><DialogTitle>Alterar
                status da ordem<Typography variant="body2" color="text.secondary"
                                           mt={0.5}>{statusOrder?.title}</Typography></DialogTitle><DialogContent
                dividers><Stack spacing={2.25}>
                {formError && <Alert severity="error">{formError}</Alert>}
                <Box sx={{p: 2, borderRadius: 2.5, bgcolor: "#F8FAFC"}}><Typography variant="caption"
                                                                                    color="text.secondary">Status
                    atual</Typography><Box mt={0.75}>{statusOrder &&
                    <StatusChip value={statusOrder.status} label={statusMap.get(statusOrder.status)}/>}</Box></Box>
                <FormControl fullWidth required><InputLabel>Novo status</InputLabel><Select label="Novo status"
                                                                                            value={nextStatus}
                                                                                            onChange={(e) => setNextStatus(e.target.value as ServiceOrderStatus)}>{statusOrder && statuses.filter((status) => status.code !== statusOrder.status).map((status) =>
                    <MenuItem key={status.code} value={status.code}>{status.name}</MenuItem>)}</Select></FormControl>
                <TextField label="Valor final (opcional)" type="number" value={finalValue}
                           onChange={(e) => setFinalValue(e.target.value)} fullWidth slotProps={{
                    htmlInput: {min: 0, step: 0.01},
                    input: {startAdornment: <InputAdornment position="start">R$</InputAdornment>}
                }}/>
            </Stack></DialogContent><DialogActions sx={{p: 2.5}}><Button onClick={() => setStatusOrder(null)}
                                                                         disabled={saving}>Cancelar</Button><Button
                variant="contained" onClick={changeStatus} disabled={saving || !nextStatus} startIcon={
                <BuildCircleOutlinedIcon/>}>{saving ? "Atualizando..." : "Confirmar etapa"}</Button></DialogActions></Dialog>
            <Dialog open={Boolean(quoteOrder)} onClose={() => !quoteSaving && setQuoteOrder(null)} fullWidth
                    maxWidth="md"><DialogTitle>Editar orçamento<Typography variant="body2" color="text.secondary"
                                                                           mt={0.5}>{quoteOrder?.title}</Typography></DialogTitle><DialogContent
                dividers><Stack spacing={2}>{quoteError &&
                <Alert severity="error">{quoteError}</Alert>}<QuoteLinesEditor lines={quoteLines} services={services}
                                                                               onChange={setQuoteLines}
                                                                               defaultCalculationMethod={companySettings.quoteCalculationMethod}
                                                                               enabledCalculationMethods={companySettings.enabledQuoteCalculationMethods}
                                                                               defaultSquareMeterPrice={companySettings.defaultSquareMeterPrice}
                                                                               defaultCubicMeterPrice={companySettings.defaultCubicMeterPrice}/>{quoteRequiresAsset ?
                <FormControl fullWidth required><InputLabel>Ativo em manutenção</InputLabel><Select
                    label="Ativo em manutenção" value={quoteAssetId}
                    onChange={(event) => setQuoteAssetId(event.target.value)}>{quoteAssets.map((asset) => <MenuItem
                    value={asset.id} key={asset.id}>{asset.name}</MenuItem>)}</Select></FormControl> :
                <Alert severity="info">Este orçamento não exige ativo.</Alert>}</Stack></DialogContent><DialogActions
                sx={{p: 2.5}}><Button onClick={() => setQuoteOrder(null)}
                                      disabled={quoteSaving}>Cancelar</Button><Button variant="contained" startIcon={
                <RequestQuoteOutlinedIcon/>} onClick={saveQuote}
                                                                                      disabled={quoteSaving || (quoteRequiresAsset && !quoteAssetId)}>{quoteSaving ? "Salvando..." : "Salvar orçamento"}</Button></DialogActions></Dialog>
            <ServiceOrderDocumentDialog open={Boolean(printOrder)} document={printDocument} loading={printLoading}
                                        error={printError} onClose={() => !printLoading && setPrintOrder(null)}
                                        onRetry={() => printOrder && loadPrintDocument(printOrder)}/>
            <Dialog open={Boolean(emailOrder)} onClose={() => !emailSending && setEmailOrder(null)} fullWidth
                    maxWidth="sm"><Box component="form" onSubmit={sendEmail}><DialogTitle>Enviar ordem por
                e-mail<Typography variant="body2" color="text.secondary"
                                  mt={0.5}>{emailOrder?.title}</Typography></DialogTitle><DialogContent dividers><Stack
                spacing={2.25}>
                <Alert severity="info">Modo de simulação ativo: a mensagem será montada e registrada no backend, mas
                    nenhum e-mail real será enviado até o SMTP ser configurado.</Alert>
                {emailError && <Alert severity="error">{emailError}</Alert>}
                {emailResult && <Alert severity="success">Simulação concluída para {emailResult.recipient}.</Alert>}
                <TextField label="Destinatário" type="email" value={recipient}
                           onChange={(event) => setRecipient(event.target.value)} required fullWidth
                           disabled={emailSending || Boolean(emailResult)} autoFocus/>
                {emailResult &&
                    <Box sx={{border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden"}}><Box
                        sx={{
                            p: 1.75,
                            bgcolor: "#F7F8FA",
                            borderBottom: "1px solid",
                            borderColor: "divider"
                        }}><Typography variant="caption" color="text.secondary">Assunto</Typography><Typography
                        variant="body2" fontWeight={750}>{emailResult.subject}</Typography></Box><Typography
                        component="pre" variant="body2" sx={{
                        p: 2,
                        m: 0,
                        whiteSpace: "pre-wrap",
                        fontFamily: "inherit",
                        maxHeight: 300,
                        overflow: "auto"
                    }}>{emailResult.body}</Typography></Box>}
            </Stack></DialogContent><DialogActions sx={{p: 2.5}}><Button onClick={() => setEmailOrder(null)}
                                                                         disabled={emailSending}>{emailResult ? "Fechar" : "Cancelar"}</Button>{!emailResult &&
                <Button type="submit" variant="contained" startIcon={<EmailOutlinedIcon/>}
                        disabled={emailSending}>{emailSending ? "Simulando..." : "Simular envio"}</Button>}
            </DialogActions></Box></Dialog>
            <QuickCustomerDialog open={quickCustomerOpen} onClose={() => setQuickCustomerOpen(false)}
                                 onCreated={(customer) => {
                                     setCustomers((current) => [customer, ...current]);
                                     set("customerId", customer.id);
                                     set("assetId", "");
                                 }}/>
            <QuickAssetDialog open={quickAssetOpen} customerId={form.customerId}
                              customerName={customers.find((customer) => customer.id === form.customerId)?.name}
                              onClose={() => setQuickAssetOpen(false)} onCreated={(asset) => {
                setAssets((current) => [asset, ...current]);
                set("assetId", asset.id);
            }}/>
            <QuickServiceDialog open={quickServiceOpen} requireAssets={companySettings.requireAssets}
                                onClose={() => setQuickServiceOpen(false)} onCreated={(service) => {
                setServices((current) => [service, ...current]);
                setForm((current) => {
                    const line = {
                        ...emptyQuoteLine(companySettings.quoteCalculationMethod, companySettings.defaultSquareMeterPrice, companySettings.defaultCubicMeterPrice),
                        serviceId: service.id,
                        description: service.description?.trim()
                            ? `${service.name}\n${service.description.trim()}` : service.name,
                        unit: companySettings.quoteCalculationMethod === "SQUARE_METER" ? "M2" : companySettings.quoteCalculationMethod === "CUBIC_METER" ? "M3" : "SERVICO",
                        unitPrice: String(service.basePrice)
                    };
                    const replaceEmpty = current.lines.length === 1 && !current.lines[0].description && !current.lines[0].unitPrice;
                    return {...current, lines: replaceEmpty ? [line] : [...current.lines, line]};
                });
            }}/>
            <QuickTechnicianDialog open={quickTechnicianOpen} onClose={() => setQuickTechnicianOpen(false)}
                                   onCreated={(technician) => {
                                       setUsers((current) => [technician, ...current]);
                                       set("assignedTechnicianId", technician.id);
                                   }}/>
        </>
    );
}
