import { LegalDocument } from "@/components/legal/legal-document";
import { legalConfig } from "@/lib/legal";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de Uso" };

export default function TermsOfUsePage() {
  return (
    <LegalDocument
      title="Termos de Uso"
      description="Regras para criação da conta e utilização da plataforma Ares. Leia este documento antes de contratar ou utilizar o serviço."
      version={legalConfig.termsVersion}
    >
      <h2>1. Identificação e aceitação</h2>
      <p>
        A plataforma Ares é disponibilizada por {legalConfig.operatorName}, inscrito(a) sob o documento
        {` ${legalConfig.operatorDocument}`}, com endereço em {legalConfig.operatorAddress}. Ao criar uma conta,
        o usuário declara possuir capacidade e poderes para contratar em nome próprio ou da empresa cadastrada,
        aceita estes Termos e confirma que leu a Política de Privacidade.
      </p>

      <h2>2. Finalidade do Ares</h2>
      <p>
        O Ares auxilia profissionais autônomos e empresas na organização de clientes, ativos, serviços,
        orçamentos, ordens de serviço, recibos e documentos relacionados ao atendimento. O usuário continua
        responsável pela exatidão das informações, pela prestação do serviço e pelo cumprimento de suas
        obrigações profissionais, consumeristas, fiscais e tributárias.
      </p>
      <p>
        Ordens de serviço, orçamentos e recibos gerados na plataforma não substituem nota fiscal, laudo técnico,
        contrato ou documento fiscal quando a emissão destes for exigida pela legislação aplicável.
      </p>

      <h2>3. Conta e segurança</h2>
      <ul>
        <li>As informações de cadastro devem ser verdadeiras, atuais e completas.</li>
        <li>Login e senha são pessoais; contas não devem ser compartilhadas entre pessoas.</li>
        <li>O usuário deve comunicar suspeitas de acesso indevido e manter seus dispositivos protegidos.</li>
        <li>O administrador da empresa é responsável por conceder e remover acessos da equipe.</li>
      </ul>

      <h2>4. Uso permitido</h2>
      <p>É proibido utilizar o Ares para praticar fraude, violar direitos de terceiros, distribuir conteúdo ilícito,
        testar vulnerabilidades sem autorização, interferir no funcionamento do serviço ou acessar dados de outra
        empresa. Podemos bloquear preventivamente uma conta quando houver risco concreto à segurança ou indícios
        de uso abusivo, assegurando canal para esclarecimento.</p>

      <h2>5. Planos, pagamentos e cupons</h2>
      <p>
        Recursos, limites, preço e periodicidade são os exibidos no momento da contratação. A ativação pode
        depender da confirmação do pagamento pelo meio escolhido. Em caso de inadimplência, o acesso poderá ser
        suspenso após comunicação, sem apagar imediatamente os dados da conta.
      </p>
      <p>
        Cupons estão sujeitos às regras apresentadas na oferta, validade e elegibilidade. Salvo indicação expressa,
        não são cumulativos, não podem ser convertidos em dinheiro e se aplicam ao preço confirmado na contratação.
        O desconto registrado no resumo da assinatura prevalece sobre materiais promocionais anteriores.
      </p>

      <h2>6. Testes, cancelamento e arrependimento</h2>
      <p>
        Períodos de teste podem ter limites específicos. O assinante pode solicitar o cancelamento a qualquer
        momento. Quando aplicável a uma contratação realizada fora do estabelecimento comercial, respeitaremos o
        direito de arrependimento previsto no Código de Defesa do Consumidor. Valores referentes a períodos já
        utilizados seguirão a legislação e a oferta contratada.
      </p>

      <h2>7. Dados cadastrados</h2>
      <p>
        A empresa assinante controla os dados de seus próprios clientes inseridos no Ares e deve possuir fundamento
        legítimo para tratá-los. O Ares tratará esses dados para executar o serviço, conforme a Política de
        Privacidade e as instruções lícitas do assinante. A exportação e a exclusão da conta estão disponíveis ao
        administrador, observadas retenções exigidas por lei e o ciclo técnico de backups.
      </p>

      <h2>8. Disponibilidade, manutenção e backups</h2>
      <p>
        Empregamos esforços razoáveis para manter o serviço seguro e disponível, mas podem ocorrer manutenções,
        falhas de fornecedores ou eventos fora de nosso controle. Incidentes relevantes serão tratados e
        comunicados conforme a legislação. O usuário deve revisar documentos importantes e manter cópias quando
        isso for necessário para sua atividade.
      </p>

      <h2>9. Propriedade intelectual</h2>
      <p>
        O software, marca, identidade visual e materiais do Ares pertencem aos seus titulares. A assinatura concede
        apenas uma licença limitada, revogável, não exclusiva e intransferível de uso durante a vigência do plano.
        Os dados e conteúdos inseridos pelo usuário permanecem de seus respectivos titulares.
      </p>

      <h2>10. Responsabilidades</h2>
      <p>
        Cada parte responde pelos danos que causar de acordo com a legislação. Nenhuma disposição destes Termos
        exclui garantias, responsabilidades ou direitos que não possam ser afastados, especialmente os previstos na
        legislação consumerista e de proteção de dados.
      </p>

      <h2>11. Alterações</h2>
      <p>
        Estes Termos poderão ser atualizados para refletir mudanças legais ou no serviço. Alterações relevantes serão
        informadas com antecedência razoável e um novo aceite poderá ser solicitado. A versão aplicável ficará
        identificada no início do documento.
      </p>

      <h2>12. Lei aplicável e contato</h2>
      <p>
        Aplicam-se as leis brasileiras. O foro será definido conforme as regras legais aplicáveis, inclusive o foro
        do consumidor quando cabível. Dúvidas podem ser enviadas para {legalConfig.privacyEmail}.
      </p>
    </LegalDocument>
  );
}
