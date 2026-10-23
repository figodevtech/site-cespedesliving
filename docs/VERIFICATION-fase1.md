# Verificação — fase 1

Data: 23/10/2026. Ambiente: Windows, Node.js 24.19.0, Next.js 16.4.3, React 19.3.1, Chromium Headless Shell 156.

## Jornada verificada

O visitante busca uma estadia → abre um flat → consulta a cotação na rota interna → o adaptador mock valida o calendário e calcula diárias → preenche dados fictícios → envia uma solicitação revalidada no servidor → recebe um identificador fictício → acompanha o registro em Minha conta, salvo apenas no navegador.

| Verificação | Resultado e evidência |
|---|---|
| `npm run lint` | Aprovado, sem avisos |
| `npm run typecheck` | Aprovado em TypeScript estrito |
| `npm test` | 18 testes unitários aprovados |
| `npm run build` | Build de produção aprovado; todas as rotas do brief renderizáveis |
| `npm run test:e2e` | 19 cenários aprovados em 32,5s: 9 em desktop, 9 em celular, 1 de cobertura de rotas em tablet |
| Cotação e solicitação | Datas inválidas, capacidade excessiva e ausência de consentimento rejeitadas pelo servidor; total recalculado pelo adaptador |
| Rede e interface | Falha de cotação simulada, ação de nova tentativa e recuperação verificadas |
| Persistência | Favoritos, perfil demo e solicitações sobrevivem ao reload; exclusão e fallback em memória verificados |
| Galeria | Abertura, setas de teclado, Escape e restauração do foco aprovados |
| Rotas e links | 22 URLs públicas por viewport, seis detalhes de imóvel, navegação interna e 404s verificadas |
| Imagens | Todas as imagens dos percursos carregadas com largura natural válida; nenhum arquivo ausente |
| Console | Nenhuma exceção de página ou erro de console nas rotas válidas percorridas |
| Responsividade | Sem overflow horizontal em 1440px, 768px e viewport de iPhone 13 |
| Acessibilidade automatizada | Sem violações encontradas pelo axe nas sete páginas principais, em desktop e celular, para WCAG 2 A/AA e 2.1 AA |

## Pontos revisados visualmente

- Home, catálogo, detalhe, landing de proprietários e painel em desktop, tablet e celular.
- Hierarquia dos títulos, contraste, proporção das fotos, respiro, formulário de busca e rodapé.
- Séries fotográficas por imóvel: cores, materiais, arquitetura, ausência de pessoas/textos e coerência entre ambientes.
- Uma imagem de hospitalidade foi corrigida para retirar relevo incompatível com João Pessoa; o site consome a versão revisada.
- A disposição dos campos da busca em tablet recebeu um ajuste final e nova verificação do cenário de rotas nesse viewport.

As capturas completas e de viewport estão em `docs/screenshots/`, com prefixos `desktop-`, `tablet-` e `mobile-`.

## Limites da validação

Testes automatizados de acessibilidade não substituem avaliação manual com leitores de tela e usuários. Os testes de navegador usam Chromium; Safari e Firefox não foram executados. O cenário de tablet usa viewport de 768px no Chromium.

O modo API permanece sem ERP conectado. Autenticação real, autorização por proprietário, dados reais, antispam/rate limiting de produção, controle transacional de disponibilidade, pagamentos e documentos jurídicos oficiais estão fora da fase 1. Os registros mock não bloqueiam inventário nem evitam duas solicitações fictícias para o mesmo período.

O resultado é uma demonstração de front-end navegável, não uma operação comercial ativada.
