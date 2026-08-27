"use client";

import { BrandMark } from "@/components/common/brand-mark";
import { legalIdentityConfigured } from "@/lib/legal";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Alert, Box, Button, Container, Divider, Paper, Stack, Typography } from "@mui/material";
import Link from "next/link";

export function LegalDocument({
  title, description, version, children,
}: {
  title: string;
  description: string;
  version: string;
  children: React.ReactNode;
}) {
  const effectiveDate = /^\d{4}-\d{2}-\d{2}$/.test(version)
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" })
      .format(new Date(`${version}T12:00:00Z`))
    : version;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F5F7FB", py: { xs: 2, sm: 5 } }}>
      <Container maxWidth="md">
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
          <BrandMark />
          <Button component={Link} href="/" startIcon={<ArrowBackRoundedIcon />}>Voltar</Button>
        </Stack>
        <Paper component="main" variant="outlined" sx={{ p: { xs: 2.5, sm: 5 }, borderRadius: 4 }}>
          <Typography variant="overline" color="primary.main" fontWeight={850}>Documento legal</Typography>
          <Typography component="h1" variant="h1" sx={{ mt: 0.5 }}>{title}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 720 }}>{description}</Typography>
          <Typography variant="caption" color="text.secondary" display="block" mt={2}>
            Versão {version} · Vigente desde {effectiveDate}
          </Typography>
          {!legalIdentityConfigured && (
            <Alert severity="warning" sx={{ mt: 3 }}>
              Os dados do responsável legal e do canal de privacidade ainda precisam ser configurados antes da publicação.
            </Alert>
          )}
          <Divider sx={{ my: 4 }} />
          <Box sx={{
            "& h2": { mt: 4, mb: 1.25, fontSize: "1.2rem", fontWeight: 850 },
            "& h2:first-of-type": { mt: 0 },
            "& p": { color: "text.secondary", lineHeight: 1.75, my: 1 },
            "& li": { color: "text.secondary", lineHeight: 1.7, mb: 0.75 },
            "& a": { color: "primary.main", textDecoration: "underline" },
          }}>
            {children}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
