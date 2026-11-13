# Revisão de responsividade — 13/11/2026

A revisão percorreu as páginas públicas, os dois imóveis publicados e suas telas de reserva, além das telas de acesso, recuperação, ativação, cadastro pendente e 404. A área **Minha conta** também foi inspecionada no Chrome com a conta de cliente autenticada, os dados do perfil e suas três reservas existentes, nas sete larguras da matriz, sem estouros e com campos de 16px nas larguras móveis. O **painel do proprietário** foi revisado posteriormente com a conta autenticada, incluindo visão geral, imóveis, reservas, extrato e os dois detalhes de reserva disponíveis. Nenhum dado cadastral, financeiro ou de reserva foi alterado.

## Correções

| Problema observado | Correção |
| --- | --- |
| Inputs de login, cadastro, contato e preços renderizavam com 14px no celular. | Fonte mínima de 16px em campos editáveis, incluindo aparelhos de toque na horizontal. O zoom manual permanece disponível. |
| Compartilhar e favoritar faziam o detalhe do imóvel ultrapassar 320px (conteúdo com 374px). | Ações abaixo do título em telas pequenas; botões com 44px de altura. |
| Menu terminava em 492px numa tela de 390px de altura. | Altura limitada ao espaço abaixo do cabeçalho e rolagem interna; links inferiores acessíveis. Ao ampliar para desktop, o menu móvel fica oculto. |
| Calendário ia de 270px a 671px na orientação horizontal. | Posição limitada à tela, altura máxima com `dvh` e rolagem nos meses, mantendo o botão Concluir visível. |
| Datas completas com ano e a contagem de noites eram cortadas em 320px. | Quebra de linha dentro do campo de período, preservando todos os valores. |
| Controles de busca tinham áreas de toque de 23–26px e o destino do catálogo ficava truncado. | Áreas de toque de pelo menos 44px; destino ocupa a largura do filtro no celular. |
| Opções dos seletores não respondiam ao primeiro toque no WebKit. | Movimento de hover e cancelamento de `pointerdown` limitados ao mouse; toque preserva o clique e permite rolar a lista. |
| Estilos genéricos aumentavam inputs invisíveis usados pelos seletores. | Campos auxiliares mantidos em 1px, sem borda ou preenchimento, preservando envio e validação. |
| Visão geral e extrato do proprietário alargavam a página até 662px no celular. | Contêiner das tabelas com posicionamento relativo e largura limitada; a rolagem horizontal fica dentro da tabela, incluindo os elementos acessíveis invisíveis. |
| Detalhes de reserva do proprietário chegavam a 694px em telas pequenas. | Coluna móvel com `minmax(0, 1fr)` e conteúdo com largura mínima zero, permitindo que os quadros se ajustem à tela. |
| Cabeçalhos e cartões de reserva do proprietário comprimiam títulos, valores e status. | Cabeçalhos podem quebrar linha; cartões móveis usam duas colunas, com valor e status em linhas próprias e título completo. |

A referência técnica para a fonte mínima é o comportamento de [campos no Safari iOS documentado pelo Flutter](https://docs.flutter.dev/ui/accessibility/web-accessibility). Não foram adicionados `maximum-scale` nem `user-scalable=no` ao viewport.

## Verificação reproduzível

```powershell
npm.cmd run build
npm.cmd run test:responsive
```

A suíte usa a porta 3003 por padrão, preservando o servidor de desenvolvimento. `PLAYWRIGHT_PORT` permite escolher outra porta. É necessário acesso ao ERP configurado para revisar o catálogo real e às imagens públicas. Instale os navegadores Chromium e WebKit do Playwright se necessário.

- Chromium e WebKit com emulação de toque.
- Navegação em 320, 375, 390, 430, 768, 844 e 1440px; orientação horizontal de 844 × 390px.
- Calendário, seleção de opções e galeria também em 320 × 568, 390 × 500 e 568 × 320px.
- Verificação de largura do documento, tamanho dos campos, foco, textos de data completos, navegação por todos os links do menu e limites dos painéis.
- As verificações não cadastram usuários, confirmam reservas ou enviam mensagens.

Resultado final: **8 testes de responsividade aprovados** em Chromium e WebKit, com 28 rotas em sete larguras por navegador (392 visitas na matriz principal). **37 testes unitários aprovados**; build de produção, ESLint e TypeScript concluídos sem erros.

### Complemento autenticado do proprietário

No Chrome com emulação de toque, foram feitas **42 conferências**: seis rotas em 320, 375, 390, 430, 768, 844 e 1440px. A primeira varredura encontrou 12 casos com estouros; depois das correções, **nenhuma página ultrapassou a largura disponível**. Os filtros, o calendário e suas ações, além do acesso às quatro abas por rolagem, também passaram em 320 × 568, 390 × 500 e 844 × 390px. Build, ESLint e TypeScript foram conferidos novamente após os ajustes do painel.

A lista de imóveis estava vazia nessa conta, portanto esse estado foi revisado; não havia um detalhe de imóvel vinculado disponível para navegação autenticada. Capturas e resultados dessa revisão ficam em `tmp/mobile-owner/`, fora do controle de versão, por conterem informações da conta.

WebKit emulado não reproduz o teclado nem toda a interface do Safari em um iPhone físico. A prevenção do zoom é verificada pelo tamanho computado da fonte e pelo viewport; a confirmação final em aparelho físico permanece recomendada.

A suíte reconhece somente os diagnósticos nativos de fetches locais de sessão/prefetch descartados durante a substituição de documento no WebKit, comportamento [registrado no Playwright](https://github.com/microsoft/playwright/issues/42823). Os demais erros de página continuam fazendo o teste falhar.

Capturas públicas: [filtros](mobile-responsiveness/catalog-390.png), [contato](mobile-responsiveness/contact-390.png), [ações em 320px](mobile-responsiveness/detail-320.png), [datas completas](mobile-responsiveness/dates-320.png), [calendário horizontal](mobile-responsiveness/calendar-landscape.png) e [menu horizontal](mobile-responsiveness/menu-landscape.png). Capturas da conta autenticada ficam somente em `tmp/`, com dados pessoais mascarados, fora do controle de versão.
