export const faq = [
  [
    "Como faço para solicitar uma hospedagem?",
    "Explore o catálogo, abra um flat e escolha as datas e os hóspedes. Prepare sua consulta e continue no WhatsApp para enviá-la ao atendimento. A reserva é confirmada pela equipe após validar a disponibilidade e as condições da estadia.",
  ],
  [
    "Como confirmo fotos, tarifas e disponibilidade?",
    "Consulte nosso atendimento para receber fotos atualizadas, características, tarifas e disponibilidade do imóvel. As imagens de ambientação do site são geradas por IA e não substituem fotos verificadas da acomodação.",
  ],
  [
    "O que acontece depois da solicitação?",
    "Ao continuar no WhatsApp, envie a mensagem preparada para nossa equipe analisar seu período e informar os próximos passos. A consulta não bloqueia o imóvel nem confirma a hospedagem.",
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
    "Entre em contato com a equipe para acompanhar a gestão do seu imóvel. O acesso à área do proprietário será disponibilizado individualmente.",
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
    eyebrow: "Sobre a Céspedes Living",
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
      "Entenda como funcionam os favoritos e os canais de contato do site.",
  },
  "termos-de-uso": {
    eyebrow: "Termos de uso",
    title: "Transparência desde o primeiro contato.",
    description: "Informações sobre consultas de hospedagem e uso do site.",
  },
} as const;
export type ContentPage = keyof typeof contentPages;
