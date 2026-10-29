export const faq = [
  [
    "Como faço para solicitar uma hospedagem?",
    "Abra um imóvel de temporada, escolha datas e hóspedes e confira a cotação. Entre com sua conta de cliente e confirme a reserva. O sistema valida o período e bloqueia o imóvel quando a confirmação é concluída.",
  ],
  [
    "Como confirmo fotos, tarifas e disponibilidade?",
    "As características e fotos de cada imóvel aparecem no catálogo. A cotação consulta disponibilidade e tarifas no sistema. Imagens institucionais de ambientação estão identificadas; fale com a equipe se precisar de informações adicionais.",
  ],
  [
    "O que acontece depois da solicitação?",
    "Após confirmar uma reserva de temporada, você recebe o código e pode acompanhá-la em Minha conta. O pagamento é combinado com a equipe. Formulários de interesse e visita são solicitações comerciais e dependem de retorno do atendimento.",
  ],
  [
    "Existe pagamento online pelo site?",
    "O site não recebe pagamentos nem solicita dados de cartão. Confirme as condições e os meios de pagamento diretamente com o atendimento antes de concluir sua reserva.",
  ],
  [
    "Como funcionam os favoritos?",
    "Toque no coração de um flat para guardá-lo nos favoritos deste navegador. Você pode remover cada escolha ou apagar os dados salvos na página Favoritos.",
  ],
  [
    "Quais serviços estão previstos para proprietários?",
    "A proposta inclui coordenação da operação, atendimento, limpeza, manutenção e acompanhamento de resultados. O escopo final depende da avaliação do imóvel e do contrato.",
  ],
  [
    "Como acompanho os resultados do meu imóvel?",
    "Entre na Área do proprietário com a conta criada pela equipe. Você pode consultar seus imóveis, reservas, receitas, despesas, repasses e demonstrativos. Esse acesso é separado da conta de cliente.",
  ],
  [
    "Como são contadas as noites?",
    "A estadia é contada entre a entrada e a saída. A data de saída não ocupa uma noite adicional. Confirme horários e regras específicas do imóvel com o atendimento.",
  ],
];
export const contentPages = {
  servicos: {
    eyebrow: "Nossos serviços",
    title: "Gestão presente. Hospitalidade em cada detalhe.",
    description:
      "Uma proposta de cuidado com o imóvel, com quem se hospeda e com quem confia seu patrimônio.",
  },
  sobre: {
    eyebrow: "Sobre a Cespedes Living",
    title: "A arte de receber. O cuidado de gerir.",
    description:
      "Uma proposta de hospitalidade e administração de flats em João Pessoa, com atenção às pessoas e aos detalhes.",
  },
  contato: {
    eyebrow: "Contato",
    title: "Toda boa experiência começa com uma conversa.",
    description:
      "Uma dúvida sobre hospedagem ou uma nova possibilidade para seu imóvel? Encontre o caminho por aqui.",
  },
  "perguntas-frequentes": {
    eyebrow: "Perguntas frequentes",
    title: "Para planejar com tranquilidade.",
    description:
      "Encontre respostas sobre hospedagem, consultas e gestão de imóveis.",
  },
  "politica-de-privacidade": {
    eyebrow: "Privacidade",
    title: "Seus dados, com clareza.",
    description:
      "Entenda como funcionam sua conta, reservas, favoritos e canais de contato.",
  },
  "termos-de-uso": {
    eyebrow: "Termos de uso",
    title: "Transparência desde o primeiro contato.",
    description: "Informações sobre consultas de hospedagem e uso do site.",
  },
} as const;
export type ContentPage = keyof typeof contentPages;
