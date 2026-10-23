# Céspedes Living Hospedagens

Front-end de demonstração em **Next.js 16.4.3, React 19.3.1, TypeScript estrito e Tailwind CSS 4**. Implementa a fase 1 do `CODEX_BRIEF.md`, com seis flats fictícios, navegação real e identidade navy/dourada.

**Nenhuma reserva, pagamento, mensagem à empresa ou conexão com o ERP é efetuada no modo padrão.** Imóveis, imagens, preços, calendário, perfis e indicadores são ilustrativos.

## Executar

Ambiente validado: Node.js 24.19.0. O Next.js exige Node.js 20.9 ou superior; prefira uma versão LTS suportada. Referência: [instalação oficial do Next.js](https://nextjs.org/docs/app/getting-started/installation).

```bash
npm ci
npm run dev
# http://localhost:3000
```

No PowerShell com execução de scripts bloqueada, use `npm.cmd` no lugar de `npm`.

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

Para os testes de navegador, instale o Chromium uma vez e execute o suite contra o build de produção. O Playwright inicia e encerra o servidor automaticamente quando a porta 3000 está livre.

```bash
npx playwright install chromium --only-shell
npm run build
npm run test:e2e
```

## Rotas

| Caminho | Conteúdo e estados |
|---|---|
| `/` | Hero, busca, flats em destaque, hospitalidade, proprietários e localização |
| `/flats` | Bairro, hóspedes, período, preços, facilidade, ordenação, chips e filtros em URL |
| `/flats/[slug]` | Quatro fotos por imóvel, lightbox com teclado, informações, regras e cotação |
| `/reservar/[slug]` | Datas, capacidade, identificação e envio demonstrativo sem pagamento |
| `/reserva-confirmada` | Identificador fictício, status pendente e resumo; estado vazio sem solicitação |
| `/cadastro`, `/entrar` | Perfil temporário sem senha ou autenticação real |
| `/minha-conta`, `/favoritos` | Histórico fictício, favoritos, saída e exclusão de dados demo |
| `/proprietarios` | Proposta de gestão, etapas e formulário demonstrativo |
| `/painel-proprietario` | Ocupação, reservas, receitas, despesas, repasses, manutenção e CSV fictício |
| `/servicos`, `/sobre`, `/contato` | Serviços, apresentação e formulário local demonstrativo |
| `/perguntas-frequentes` | Respostas em elementos expansíveis acessíveis |
| `/politica-de-privacidade`, `/termos-de-uso` | Minutas explicitamente provisórias |
| Endereços ou slugs inexistentes | Página 404 com navegação de recuperação |

Os slugs são `flat-tambau-master`, `flat-manaira-premium`, `flat-cabo-branco-exclusive`, `flat-bessa-confort`, `flat-intermares-design` e `flat-altiplano-executive`. Intermares pertence a **Cabedelo**, corretamente indicado no catálogo.

## Modo mock

Não é necessário criar um `.env.local`: `DATA_ADAPTER` assume `mock`. `.env.example` descreve a configuração futura.

- O servidor valida datas, capacidade, consentimento e dados do hóspede ao gerar a cotação e registrar uma solicitação fictícia. Um total enviado pelo cliente não é usado no cálculo.
- Check-out é exclusivo; noites são calculadas em UTC, sem erros de horário de verão. A data corrente segue `America/Fortaleza`.
- O mock admite até 60 noites; dias **15 e 16** de cada mês estão bloqueados. Sair no dia 15 não ocupa essa noite.
- Sexta e sábado têm acréscimo ilustrativo de 10%. A taxa de limpeza é R$ 99, uma vez por estadia. Tributos demonstrativos são zero; a discriminação é exibida.
- Solicitações usam identificadores `CL-DEMO-*` e status `PENDING`. Não bloqueiam calendário e não constituem reserva real. Não existe garantia contra duas solicitações fictícias no mesmo período.
- Favoritos, perfil e histórico fictício ficam no `localStorage` sob `cespedes-demo-v1:*`. Nenhuma senha é pedida ou armazenada. Quando o armazenamento está indisponível, há fallback em memória, perdido ao recarregar.
- O perfil demo não é uma sessão de autenticação e não autoriza acesso a dados privados. O painel é uma apresentação pública com valores fictícios.
- O formulário de parceria valida uma simulação no servidor. O de contato responde apenas na própria tela. Nenhum dos dois envia mensagens ou grava leads em um ERP.
- Use exclusivamente dados fictícios. Em **Minha conta → Apagar dados demo**, todos os registros desta demonstração são removidos do navegador.

## Estrutura e integração futura

```text
src/app/                         App Router, metadados, loading, error e not-found
src/app/api/                     Cotação, solicitação, acesso demo e leads
src/components/                  Componentes de UI, formulários e layouts
src/domain/                      Contratos públicos, datas e regras tarifárias mock
src/data/                        Inventário e conteúdo ilustrativos
src/services/contracts.ts        Interface DataAdapter
src/services/{flats,availability,reservations,auth,owners}.ts
src/services/adapters/{mock,api}.ts
src/lib/demo-storage.ts          Persistência exclusivamente demonstrativa
public/images/                   Fotografias WebP e variantes responsivas
tests/unit/                      Datas, preços, calendário e validação
tests/e2e/                       Fluxos, rotas, imagens e acessibilidade
docs/screenshots/                Desktop, tablet e celular
```

`services/adapter.ts` seleciona os adaptadores no servidor. O adaptador `api` está preparado para os endpoints públicos preliminares do brief, **mas não foi conectado nem validado contra um ERP real**. As rotas de cotação, reserva e parceria já usam a interface; componentes públicos recebem o mesmo contrato de dados.

Quando a fase de integração for autorizada, configurar `DATA_ADAPTER=api`, `ERP_API_BASE_URL` e, se necessário, `ERP_API_TOKEN` em `.env.local` ou no ambiente seguro de hospedagem e reconstruir o projeto. As duas últimas variáveis nunca devem usar prefixo `NEXT_PUBLIC_`. A listagem provisoriamente espera `{ items: Flat[] }`; a ficha espera `Flat`. Revisar o contrato real, paginação, erros e domínios autorizados de imagens antes de ativar.

O adaptador de API usa `server-only`, timeout de 10s e uma lista explícita de campos públicos. `ownerId` não faz parte do contrato público. O navegador não recebe tokens administrativos.

**Autenticação e áreas privadas falham de forma fechada no adaptador API.** Não há login real nem acesso a dados reais do proprietário. Antes de habilitá-los, implementar sessão segura no servidor, autorização por usuário/tenant e a consulta autenticada de `/me/reservations` e `/owner/*`; substituir a persistência demonstrativa do perfil/histórico nessa integração. Também são necessários disponibilidade e preço atômicos no ERP, prevenção de dupla reserva, antispam/rate limiting, observabilidade e documentos oficiais. A seleção de `api` sozinha não torna o produto pronto para produção.

## Imagens e marca

As fotos finais desta fase são **28 fotografias novas geradas com o recurso image_gen**, sem recortar o mockup original. Quatro ambientes por imóvel usam a própria capa como referência; há hero e fotografias institucionais. Todos os usos indicam material ilustrativo, sem alegação de retratar um imóvel real.

- Arquivos consumidos pelo site: `public/images/`, com versões WebP principais e de 720px. `next/image` fornece tamanhos responsivos e negociação WebP/AVIF, lazy loading e placeholders.
- Manifesto por grupo/imóvel: [`public/images/image-manifest.json`](public/images/image-manifest.json), com dimensões, bytes, versões e referência do prompt.
- Prompts e proveniência: [`docs/image-generation/`](docs/image-generation/). As fontes originais permanecem no diretório local de imagens geradas; o build depende apenas dos arquivos em `public/`.
- `scripts/prepare-images.mjs` reconverte as fontes quando disponíveis; não é necessário executá-lo para instalar, compilar ou iniciar.
- A foto institucional de hospitalidade foi revisada para remover relevo incompatível com João Pessoa; a versão usada é `hospitality-v2.webp`.
- O site usa o nome da empresa como texto. **Vetor oficial da logomarca, contatos comerciais e fotos verificadas dos imóveis reais continuam pendentes da equipe.**

As fontes Playfair Display e DM Sans são servidas localmente. A demonstração usa `noindex, nofollow` até o lançamento do catálogo real, preservando títulos e descrições por página.

## Validação e entrega

Veja [`docs/VERIFICATION.md`](docs/VERIFICATION.md), [`docs/PROTOTYPE_AUDIT.md`](docs/PROTOTYPE_AUDIT.md) e [`CHANGELOG.md`](CHANGELOG.md). As capturas ficam em [`docs/screenshots/`](docs/screenshots/).

O protótipo legado permanece em `index.html`, `styles.css`, `app.js` e `assets/`. A documentação original foi preservada em [`docs/README-prototipo.md`](docs/README-prototipo.md). A aplicação Next.js não usa esses recortes nem o mecanismo de navegação por hash.
