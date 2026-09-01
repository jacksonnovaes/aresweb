import type {PublicProfile} from "@/lib/types";
import {colorWithOpacity, publicMediaUrl, safeProfileColor} from "@/lib/public-profile";
import type {Metadata} from "next";
import type {CSSProperties} from "react";
import Link from "next/link";
import {notFound} from "next/navigation";
import styles from "./profile.module.css";

const API_URL = (process.env.API_URL ?? "http://localhost:8080").replace(/\/$/, "");
const currency = new Intl.NumberFormat("pt-BR", {style: "currency", currency: "BRL"});

type Props = {params: Promise<{slug: string}>};

async function getProfile(slug: string): Promise<PublicProfile | null> {
  const response = await fetch(`${API_URL}/api/v1/public/profiles/${encodeURIComponent(slug)}`, {
    headers: {Accept: "application/json"},
    cache: "no-store",
  });
  if (response.status === 404 || response.status === 400) return null;
  if (!response.ok) throw new Error("Não foi possível carregar a página profissional.");
  return response.json() as Promise<PublicProfile>;
}

function whatsappTarget(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length <= 11 ? `55${digits}` : digits;
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  try {
    const {slug} = await params;
    const profile = await getProfile(slug);
    if (!profile) return {title: "Profissional não encontrado"};
    const description = profile.description.slice(0, 155);
    return {
      title: profile.tradeName,
      description,
      openGraph: {
        title: `${profile.tradeName} — ${profile.headline}`,
        description,
        type: "website",
        images: profile.logoUrl ? [{url: profile.logoUrl, alt: `Logo de ${profile.tradeName}`}] : undefined,
      },
    };
  } catch {
    return {title: "Página profissional"};
  }
}

export default async function ProfessionalPage({params}: Props) {
  const {slug} = await params;
  const profile = await getProfile(slug);
  if (!profile) notFound();

  const color = safeProfileColor(profile.accentColor || profile.primaryColor, "#2457E6");
  const backgroundColor = safeProfileColor(profile.backgroundColor, "#F6F4ED");
  const textColor = safeProfileColor(profile.textColor, "#142019");
  const uploadedLogo = publicMediaUrl(profile.logoPath);
  const logo = uploadedLogo || profile.logoUrl || "";
  const backgroundImage = publicMediaUrl(profile.backgroundImagePath);
  const whatsappUrl = `https://wa.me/${whatsappTarget(profile.whatsapp)}?text=${encodeURIComponent(
    `Olá! Encontrei a página de ${profile.tradeName} e gostaria de solicitar um orçamento.`,
  )}`;
  const location = [profile.city, profile.serviceArea].filter(Boolean).join(" · ");

  return (
    <main className={styles.page} style={{
      "--profile-color": color,
      "--profile-background": backgroundColor,
      "--profile-text": textColor,
    } as CSSProperties}>
      <header className={styles.header}>
        <a className={styles.brand} href="#inicio" aria-label={`Ir ao início da página de ${profile.tradeName}`}>
          {profile.showLogo && logo
            // A origem do logo é configurável por tenant, por isso não há uma allowlist estática para next/image.
            // eslint-disable-next-line @next/next/no-img-element
            ? <img className={styles.logo} src={logo} alt={`Logo de ${profile.tradeName}`}/>
            : profile.showLogo
              ? <span className={styles.logoFallback}>{profile.tradeName.charAt(0).toUpperCase()}</span>
              : null}
          <span>{profile.tradeName}</span>
        </a>
        <nav className={styles.nav} aria-label="Navegação da página profissional">
          {profile.services.length > 0 && <a href="#servicos">Serviços</a>}
          <a href="#sobre">Sobre</a>
          <a className={styles.headerCta} href={whatsappUrl} target="_blank" rel="noreferrer">Falar no WhatsApp</a>
        </nav>
      </header>

      <section className={`${styles.hero} ${backgroundImage ? styles.heroWithImage : ""}`} id="inicio"
               style={backgroundImage ? {backgroundImage: `linear-gradient(${colorWithOpacity(backgroundColor, profile.backgroundOverlayPercentage)}, ${colorWithOpacity(backgroundColor, Math.min(90, profile.backgroundOverlayPercentage + 18))}), url("${backgroundImage}")`} : undefined}>
        <div className={styles.heroGlow}/>
        <div className={styles.heroContent}>
          {profile.showLogo && logo
            // O logo pode vir de qualquer tenant ou do armazenamento local protegido pelo proxy.
            // eslint-disable-next-line @next/next/no-img-element
            && <img className={styles.heroLogo} src={logo} alt={`Logo de ${profile.tradeName}`}/>}
          <span className={styles.eyebrow}>Atendimento profissional</span>
          <h1>{profile.headline}</h1>
          <p>{profile.description}</p>
          {location && <div className={styles.location}><span aria-hidden="true">●</span>{location}</div>}
          <div className={styles.heroActions}>
            <a className={styles.primaryCta} href={whatsappUrl} target="_blank" rel="noreferrer">
              Solicitar orçamento <span aria-hidden="true">↗</span>
            </a>
            {profile.email && <a className={styles.secondaryCta} href={`mailto:${profile.email}`}>Enviar e-mail</a>}
          </div>
        </div>
        <aside className={styles.contactCard}>
          <span className={styles.contactLabel}>Atendimento direto</span>
          <strong>Conte o que você precisa</strong>
          <p>Envie uma mensagem e receba orientação para o seu serviço.</p>
          <a href={whatsappUrl} target="_blank" rel="noreferrer">Conversar agora</a>
          {profile.serviceArea && <small>Área atendida<br/><b>{profile.serviceArea}</b></small>}
        </aside>
      </section>

      {profile.services.length > 0 && <section className={styles.servicesSection} id="servicos">
        <div className={styles.sectionHeading}>
          <span>O que fazemos</span>
          <h2>{profile.serviceSource === "MANUAL" ? "Como podemos ajudar" : "Serviços disponíveis"}</h2>
          <p>Escolha o que precisa e fale diretamente para solicitar uma avaliação.</p>
        </div>
        <div className={styles.serviceGrid}>
          {profile.services.map((service, index) => (
            <article className={styles.serviceCard} key={`${service.name}-${index}`}>
              <span className={styles.serviceNumber}>{String(index + 1).padStart(2, "0")}</span>
              <h3>{service.name}</h3>
              {service.description && <p>{service.description}</p>}
              <div className={styles.serviceMeta}>
                {profile.showPrices && service.basePrice != null
                  ? <strong>A partir de {currency.format(service.basePrice)}</strong>
                  : <span>Valor sob avaliação</span>}
                {service.estimatedMinutes && <small>Tempo estimado: {service.estimatedMinutes} min</small>}
              </div>
            </article>
          ))}
        </div>
      </section>}

      <section className={styles.aboutSection} id="sobre">
        <div>
          <span className={styles.eyebrow}>Sobre</span>
          <h2>{profile.tradeName}</h2>
        </div>
        <div>
          <p>{profile.description}</p>
          {profile.city && <strong>Base de atendimento: {profile.city}</strong>}
        </div>
      </section>

      <section className={styles.finalCta}>
        <span>Vamos conversar?</span>
        <h2>Solicite seu orçamento de forma rápida.</h2>
        <a href={whatsappUrl} target="_blank" rel="noreferrer">Chamar no WhatsApp <span aria-hidden="true">↗</span></a>
      </section>

      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} {profile.tradeName}</span>
        <Link href="/cadastro">Crie sua página profissional no Ares</Link>
      </footer>
    </main>
  );
}
