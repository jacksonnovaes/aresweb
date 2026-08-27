import { LegalDocument } from "@/components/legal/legal-document";
import { legalConfig } from "@/lib/legal";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      title="Política de Privacidade"
      description="Como o Ares coleta, utiliza, protege, compartilha e elimina dados pessoais, em conformidade com a LGPD."
      version={legalConfig.privacyVersion}
    >
      <h2>1. Responsável e papéis</h2>
      <p>
        {legalConfig.operatorName}, documento {legalConfig.operatorDocument}, localizado(a) em
        {` ${legalConfig.operatorAddress}`}, é responsável pelos dados de cadastro, autenticação, assinatura,
        suporte e segurança da plataforma. Para os dados de clientes, funcionários e prestadores inseridos pela
        empresa assinante, a empresa normalmente atua como controladora e o Ares como operador, seguindo suas
        instruções lícitas.
      </p>

      <h2>2. Dados tratados</h2>
      <ul>
        <li>Cadastro: nome, e-mail, telefone, CPF/CNPJ, empresa, cargo e identificadores da conta.</li>
        <li>Operação: clientes, ativos, serviços, orçamentos, ordens, valores, status e documentos gerados.</li>
        <li>Assinatura: plano, preço, cupom, situação da cobrança e referências fornecidas pelo processador de pagamento.</li>
        <li>Segurança: IP, agente do navegador, horários de acesso, registros de auditoria e tentativas de autenticação.</li>
        <li>Comunicação: solicitações de suporte, recuperação de senha e mensagens relacionadas ao serviço.</li>
      </ul>
      <p>Não solicitamos dados pessoais sensíveis para o funcionamento regular da plataforma. O assinante deve evitar
        inseri-los em campos livres salvo quando estritamente necessário e juridicamente autorizado.</p>

      <h2>3. Finalidades e fundamentos</h2>
      <ul>
        <li>Executar o contrato, criar a conta e prestar os recursos solicitados.</li>
        <li>Cumprir obrigações legais ou regulatórias e exercer direitos em processos.</li>
        <li>Prevenir fraude, proteger contas, manter auditoria e melhorar a confiabilidade do serviço.</li>
        <li>Atender solicitações e enviar comunicações essenciais sobre a conta.</li>
        <li>Realizar cobranças e administrar planos, descontos e cancelamentos.</li>
      </ul>
      <p>Quando uma atividade depender de consentimento, ele será solicitado de forma específica e poderá ser revogado.
        O aceite dos Termos e a ciência desta Política não são utilizados como autorização genérica para marketing.</p>

      <h2>4. Cookies</h2>
      <p>
        Utilizamos cookies essenciais, inclusive cookies seguros e inacessíveis ao JavaScript para manter a sessão e
        renovar a autenticação. Eles são necessários ao funcionamento da conta. Esta versão do Ares não utiliza
        cookies de publicidade comportamental; caso isso mude, esta Política e os controles de escolha serão atualizados.
      </p>

      <h2>5. Compartilhamento e operadores</h2>
      <p>
        Dados podem ser tratados por fornecedores de hospedagem e banco de dados, envio de e-mail ou mensagens,
        monitoramento, suporte e processamento de pagamentos. Compartilhamos somente o necessário, mediante medidas
        contratuais e de segurança. Também poderemos atender ordens legais de autoridades competentes. Não vendemos
        dados pessoais.
      </p>

      <h2>6. Transferência internacional</h2>
      <p>
        Alguns fornecedores de infraestrutura podem processar dados fora do Brasil. Nesses casos, adotaremos os
        mecanismos admitidos pela LGPD e salvaguardas compatíveis, considerando a localização configurada para a
        infraestrutura e os contratos aplicáveis.
      </p>

      <h2>7. Retenção e eliminação</h2>
      <p>
        Os dados são mantidos durante a conta e pelo tempo necessário às finalidades descritas. Após a exclusão,
        registros podem permanecer temporariamente em backups protegidos até sua substituição, sem uso operacional.
        Informações específicas poderão ser conservadas para cumprir obrigação legal, prevenir fraude ou exercer
        direitos, com acesso restrito e eliminação ao final do prazo aplicável.
      </p>

      <h2>8. Direitos dos titulares</h2>
      <p>Nos termos da LGPD, o titular pode solicitar, conforme aplicável:</p>
      <ul>
        <li>confirmação e acesso aos dados;</li>
        <li>correção de informações incompletas, inexatas ou desatualizadas;</li>
        <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados irregularmente;</li>
        <li>portabilidade, observadas a regulamentação e os segredos comercial e industrial;</li>
        <li>informações sobre compartilhamentos e consequências de não fornecer determinados dados;</li>
        <li>revogação do consentimento e revisão de decisões automatizadas, quando existentes.</li>
      </ul>
      <p>
        O administrador pode exportar os dados da empresa e excluir a conta pela área de configurações. Titulares
        cadastrados por uma empresa devem contatar primeiro essa empresa, que é a controladora da relação. Também é
        possível escrever para {legalConfig.privacyEmail}. Poderemos solicitar confirmação de identidade para evitar
        acesso indevido.
      </p>

      <h2>9. Segurança e incidentes</h2>
      <p>
        Aplicamos controle de acesso por função, senhas protegidas por hash, sessões com expiração, cookies HTTP-only,
        trilhas de auditoria, segregação lógica entre empresas, conexão criptografada e backups. Mantemos processo de
        correção e resposta a incidentes. Quando um incidente puder causar risco ou dano relevante, realizaremos as
        comunicações exigidas à ANPD e aos titulares afetados.
      </p>

      <h2>10. Crianças e adolescentes</h2>
      <p>
        O Ares é uma ferramenta profissional e não é direcionado a crianças. O assinante não deve criar contas de
        crianças nem inserir seus dados sem observar as regras específicas da LGPD e demais normas aplicáveis.
      </p>

      <h2>11. Atualizações e contato</h2>
      <p>
        Alterações relevantes serão comunicadas e a versão permanecerá identificada no início. Para dúvidas ou
        exercício de direitos, utilize {legalConfig.privacyEmail}. O titular também pode peticionar perante a
        <a href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1" target="_blank" rel="noreferrer"> ANPD</a>.
      </p>
    </LegalDocument>
  );
}
