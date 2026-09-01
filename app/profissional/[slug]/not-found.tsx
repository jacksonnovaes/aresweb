import Link from "next/link";

export default function ProfessionalNotFound() {
  return (
    <main style={{minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#f6f4ed"}}>
      <div style={{maxWidth: 520, textAlign: "center"}}>
        <span style={{fontSize: 13, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "#667085"}}>Página indisponível</span>
        <h1 style={{fontFamily: "Georgia, serif", fontSize: 48, margin: "18px 0 12px", color: "#142019"}}>Este perfil não foi encontrado.</h1>
        <p style={{color: "#667085", lineHeight: 1.7}}>Confira o endereço informado ou peça um novo link ao profissional.</p>
        <Link href="/" style={{display: "inline-flex", marginTop: 22, padding: "13px 20px", borderRadius: 12, background: "#142019", color: "white", fontWeight: 750}}>Ir para o Ares</Link>
      </div>
    </main>
  );
}

