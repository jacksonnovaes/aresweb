"use client";

import {AuthShell} from "@/components/auth/auth-shell";
import {useAuth} from "@/contexts/auth-context";
import {errorMessage} from "@/lib/api";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
    Alert,
    Box,
    Button,
    IconButton,
    InputAdornment,
    Link as MuiLink,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import Link from "next/link";
import {FormEvent, useEffect, useState} from "react";

export default function LoginPage() {
    const {login} = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [registrationStatus, setRegistrationStatus] = useState<"sucesso" | "pendente" | "excluida" | null>(null);

    useEffect(() => {
        const status = new URLSearchParams(window.location.search).get("cadastro");
        const accountStatus = new URLSearchParams(window.location.search).get("conta");
        setRegistrationStatus(accountStatus === "excluida" ? "excluida" : status === "sucesso" || status === "pendente" ? status : null);
    }, []);

    async function submit(event: FormEvent) {
        event.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(errorMessage(err));
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <AuthShell title="Bem-vindo de volta" subtitle="Entre para continuar gerenciando sua operação.">
            <Box component="form" onSubmit={submit}>
                <Stack spacing={2.25}>
                    {registrationStatus === "sucesso" && <Alert severity="success">Empresa criada e primeira mensalidade aprovada. Você já pode entrar.</Alert>}
                    {registrationStatus === "pendente" && <Alert severity="warning">Empresa criada. O acesso será liberado após a confirmação da mensalidade.</Alert>}
                    {registrationStatus === "excluida" && <Alert severity="success">A empresa e seus dados operacionais foram excluídos.</Alert>}
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField label="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                               autoComplete="email" required fullWidth autoFocus/>
                    <TextField
                        label="Senha" type={showPassword ? "text" : "password"} value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password" required fullWidth
                        slotProps={{
                            input: {
                                endAdornment: <InputAdornment position="end"><IconButton
                                    onClick={() => setShowPassword(!showPassword)} edge="end"
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ?
                                    <VisibilityOffOutlinedIcon/> :
                                    <VisibilityOutlinedIcon/>}</IconButton></InputAdornment>
                            }
                        }}
                    />
                    <Box sx={{display: "flex", justifyContent: "flex-end"}}><MuiLink component={Link}
                                                                                     href="/recuperar-senha"
                                                                                     underline="hover" fontWeight={700}>Esqueci
                        minha senha</MuiLink></Box>
                    <Button type="submit" variant="contained" size="large" disabled={submitting}
                            startIcon={<LockOutlinedIcon/>}>{submitting ? "Entrando..." : "Entrar"}</Button>
                </Stack>
            </Box>
            <Typography color="text.secondary" textAlign="center" mt={4}>Ainda não tem uma conta? <MuiLink
                component={Link} href="/cadastro" fontWeight={800} underline="hover">Criar
                empresa</MuiLink></Typography>
            <Typography color="text.secondary" textAlign="center" mt={1.5}>É cliente de uma empresa? <MuiLink
                component={Link} href="/portal" fontWeight={800} underline="hover">Acompanhar minhas ordens</MuiLink></Typography>
        </AuthShell>
    );
}
