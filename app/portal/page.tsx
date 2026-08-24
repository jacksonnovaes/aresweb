"use client";

import { BrandMark } from "@/components/common/brand-mark";
import { PageLoading } from "@/components/common/feedback";
import { useCustomerAuth } from "@/contexts/customer-auth-context";
import { errorMessage } from "@/lib/api";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  Alert, Box, Button, Card, CardContent, Container, IconButton, InputAdornment,
  Link as MuiLink, Stack, TextField, Typography,
} from "@mui/material";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function CustomerLoginPage() {
  const { customer, loading, login } = useCustomerAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault(); setSubmitting(true); setError("");
    try { await login(email, password); }
    catch (err) { setError(errorMessage(err)); }
    finally { setSubmitting(false); }
  }

  if (loading || customer) return <PageLoading label="Preparando o portal do cliente..." />;

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", position: "relative", overflow: "hidden", bgcolor: "#F4F7FB", py: 5,
      "&::before": { content: '\"\"', position: "absolute", width: 520, height: 520, borderRadius: "50%", bgcolor: "primary.main", opacity: 0.08, top: -300, right: -160 },
      "&::after": { content: '\"\"', position: "absolute", width: 340, height: 340, borderRadius: 12, bgcolor: "secondary.main", opacity: 0.07, bottom: -230, left: -130, transform: "rotate(28deg)" },
    }}>
      <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
        <Stack alignItems="center" mb={3}><BrandMark /></Stack>
        <Card sx={{ boxShadow: "0 24px 70px rgba(16,24,40,.11)" }}><CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Typography component="h1" variant="h1" textAlign="center">Portal do cliente</Typography>
          <Typography color="text.secondary" textAlign="center" mt={1} mb={4}>Entre para acompanhar suas ordens de serviço.</Typography>
          <Box component="form" onSubmit={submit}><Stack spacing={2.25}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField label="E-mail" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required fullWidth autoFocus />
            <TextField label="Senha" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required fullWidth slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton type="button" onClick={() => setShowPassword((current) => !current)} edge="end" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}>{showPassword ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}</IconButton></InputAdornment> } }} />
            <Button type="submit" variant="contained" size="large" disabled={submitting} startIcon={<LockOutlinedIcon />}>{submitting ? "Entrando..." : "Acessar minhas ordens"}</Button>
          </Stack></Box>
        </CardContent></Card>
        <Typography variant="body2" color="text.secondary" textAlign="center" mt={3}>Você faz parte da equipe? <MuiLink component={Link} href="/" fontWeight={750}>Acessar área administrativa</MuiLink></Typography>
      </Container>
    </Box>
  );
}
