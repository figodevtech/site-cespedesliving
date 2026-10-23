# Verificação — apresentação pública

## Campos de data no celular — 23/10/2026

Consulta de hospedagem, busca e reserva usam o mesmo controle de data nativo, com texto de 16px, altura mínima de 48px e largura limitada ao contêiner. Entrada e saída ficam empilhadas nas telas pequenas. A busca da home acompanha a altura do conteúdo para evitar sobreposição.

Lint, TypeScript e build aprovados. Quatro testes específicos passaram em Chromium e WebKit nas larguras de 320, 390 e 430px: valores preenchidos/vazios, dimensões, ausência de overflow, busca e conteúdo da consulta pelo WhatsApp. Nove testes existentes também passaram: navegação e imagens em desktop/tablet/celular, busca, filtros e acessibilidade em desktop/celular. Capturas e instruções em [`date-fields/README.md`](date-fields/README.md).

WebKit foi executado no Windows com viewport móvel; não houve teste em iPhone físico nem validação do seletor de calendário do sistema iOS.

## Atualização da marca fornecida — 23/10/2026

Marca horizontal no cabeçalho, completa no rodapé e monograma nos favicons. Build, lint e TypeScript aprovados; as cinco verificações existentes de rotas/imagens, responsividade e acessibilidade passaram em 19,2s no build de produção. Ícones HTTP 200 e dimensões verificadas. Cabeçalho conferido de 320px a 1440px. Registro e capturas em `docs/brand-assets/`.

23/10/2026 · Windows · Node.js 24.19.0 · Next.js 16.4.3 · Chromium Headless Shell.

## Resultado

- Lint sem erros ou avisos; TypeScript estrito aprovado.
- Build de produção aprovado.
- 18 testes unitários de datas, capacidade e regras dos adaptadores isolados aprovados.
- 15 testes E2E aprovados no build de produção em 27,3s: sete cenários em desktop, sete em celular e cobertura de rotas em tablet. Executados na porta 3001 para preservar o servidor existente em 3000.

## O que foi verificado

| Fluxo | Evidência |
|---|---|
| Busca e consulta de hospedagem | Bairro e período são preservados; mensagem contém flat, datas e hóspedes |
| WhatsApp oficial | Links apontam para `https://wa.me/5583999123337`; os testes inspecionam destino e texto, sem enviar mensagens |
| Formulários | Contato e parceria preparam o conteúdo para continuar no WhatsApp; não informam envio automático ou confirmação |
| Favoritos e galeria | Persistência, exclusão de dados locais, setas, Escape e restauração do foco aprovados |
| Tarifas e calendário | Cards mostram tarifa sob consulta; calendário artificial não bloqueia a busca pública |
| Conta e portal | Registros locais antigos não são apresentados como contas, reservas ou resultados financeiros reais |
| Serviços sem conexão | Endpoints de acesso, cotação, solicitação e lead não geram registros fictícios; respondem com indisponibilidade |
| Textos públicos | Todas as páginas percorridas foram verificadas contra termos de demonstração, simulação, fictício e demo |
| Navegação e imagens | 22 URLs públicas por viewport e todos os links internos percorridos; imagens carregadas; 404s funcionam |
| Responsividade | Sem overflow horizontal em desktop de 1440px, tablet de 768px e viewport de iPhone 13 |
| Acessibilidade | Axe sem violações encontradas nas sete páginas principais, em desktop e celular, para WCAG 2 A/AA e 2.1 AA |
| Console | Sem erros de página ou console nas rotas válidas percorridas |

Capturas atualizadas de desktop, tablet e celular estão em `docs/screenshots/`.

## Limites

O ERP e a autenticação segura ainda não estão integrados. A consulta acontece pelo atendimento; preencher o formulário não confirma hospedagem. As imagens continuam identificadas como ambientação gerada por IA. O inventário e os documentos jurídicos precisam ser validados pela equipe antes da publicação definitiva.

A validação completa das rotas foi feita em Chromium; os campos de data também foram verificados em WebKit. Firefox, Safari em dispositivo Apple e leitores de tela não foram executados. Não foi realizado envio de mensagens pelo WhatsApp nem implantação pública.

O relatório da fase anterior foi preservado em `VERIFICATION-fase1.md`.
