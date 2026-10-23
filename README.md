# Céspedes Living Hospedagens

Site em Next.js App Router, React, TypeScript estrito e Tailwind CSS. A interface pública usa a identidade navy/dourada e não exibe rótulos de demonstração.

## Executar

Ambiente validado: Node.js 24.19.0, Next.js 16.4.3 e React 19.3.1.

```bash
npm ci
npm run dev
# http://localhost:3000
```

No PowerShell com scripts bloqueados, utilize `npm.cmd` em vez de `npm`.

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run start
```

Para os testes E2E, instale o navegador uma vez. O Playwright inicia um servidor de produção na porta 3000 quando ela está livre.

```bash
npx playwright install chromium --only-shell
npm run build
npm run test:e2e
```

Se já houver um servidor de desenvolvimento em 3000, defina `PLAYWRIGHT_PORT=3001` para testar o build de produção em uma porta separada. No PowerShell: `$env:PLAYWRIGHT_PORT = '3001'` antes de executar o comando de testes.

## Atendimento e consultas

**WhatsApp oficial: +55 (83) 99912-3337**, configurado em `src/lib/contact.ts`. Pode ser substituído por `NEXT_PUBLIC_CONTACT_WHATSAPP`, com código do país e apenas dígitos. `.env.example` registra a configuração. `NEXT_PUBLIC_CONTACT_EMAIL` permite configurar um canal alternativo.

- A consulta de hospedagem prepara uma mensagem com o flat, entrada, saída e hóspedes.
- Os formulários de contato e parceria preparam a mensagem com os campos preenchidos pelo visitante.
- Depois de preparar, o visitante clica em **Continuar no WhatsApp** e envia a mensagem naquele aplicativo.
- Preparar a mensagem não significa enviá-la, e o site não informa entrega ou reserva confirmada. Os testes verificam o link e o conteúdo; não enviam mensagens.
- Disponibilidade, características e tarifas devem ser confirmadas pelo atendimento. Enquanto não existe fonte tarifária integrada, os cards mostram **Tarifa sob consulta**.

## Rotas

| Rotas | Funcionamento atual |
|---|---|
| `/` | Apresentação, busca, flats em destaque e gestão de imóveis |
| `/flats` | Busca por bairro, hóspedes, datas, facilidades e ordenação; filtros em URL |
| `/flats/[slug]` | Galeria acessível, características e consulta pelo WhatsApp |
| `/reservar/[slug]` | Preparação da consulta de hospedagem para o atendimento |
| `/favoritos` | Escolhas salvas neste navegador e exclusão dos dados locais |
| `/proprietarios` | Serviços de gestão e mensagem de interesse pelo WhatsApp |
| `/contato` | Número oficial, acesso direto ao WhatsApp e preparação de mensagem |
| `/servicos`, `/sobre`, `/perguntas-frequentes` | Páginas institucionais |
| `/entrar`, `/cadastro`, `/minha-conta` | Orientação ao atendimento enquanto a autenticação segura não está disponível |
| `/painel-proprietario` | Acesso orientado pela equipe; não expõe números ou registros fictícios |
| `/reserva-confirmada` | Orientação para consultar a solicitação com o atendimento; não inventa confirmação |
| `/politica-de-privacidade`, `/termos-de-uso` | Informações sobre o funcionamento do site, sujeitas à validação jurídica da empresa |
| Endereços ou slugs inexistentes | Página 404 com navegação de recuperação |

## Dados e integrações

O ERP e a autenticação real **ainda não estão conectados**. Retirar os rótulos de demonstração não cria essas integrações. Para não apresentar dados fabricados como transações reais:

- Perfis locais não são usados como autenticação, e não há formulário que simule login.
- O painel público não exibe indicadores financeiros fictícios.
- Registros locais antigos não são mostrados como reservas ou contas reais.
- As rotas internas de cotação, reserva e lead respondem com indisponibilidade enquanto `DATA_ADAPTER=mock` (padrão).
- A antiga rota de acesso demonstrativo também está desativada.
- As datas do calendário artificial não bloqueiam a busca pública.

Os adaptadores e testes de domínio da fase anterior permanecem isolados em `src/services/adapters/` e `tests/unit/`. O catálogo em `src/data/flats.ts` é o inventário de apresentação fornecido no projeto: a validação e substituição por dados de imóveis reais ainda cabem à equipe. A interface orienta a confirmar informações e valores no atendimento.

Para integrar o ERP, revisar o contrato em `src/services/contracts.ts`, configurar `DATA_ADAPTER=api`, `ERP_API_BASE_URL` e, se necessário, `ERP_API_TOKEN` no servidor e reconstruir. Nunca colocar credenciais administrativas em variáveis `NEXT_PUBLIC_`. O adaptador de API usa `server-only`, timeout e uma lista explícita de campos públicos, sem `ownerId`.

Autenticação, dados privados, histórico de reservas, autorização por proprietário e prevenção transacional de dupla reserva exigem implementação e validação próprias antes de serem habilitados.

## Imagens, marca e publicação

- As 28 fotografias em `public/images/` foram geradas por IA e continuam identificadas como imagens de ambientação. Não substituem fotografias verificadas de cada imóvel.
- Manifesto por imóvel e tamanhos: [`public/images/image-manifest.json`](public/images/image-manifest.json). Prompts: [`docs/image-generation/`](docs/image-generation/).
- Imagens locais WebP e variantes de 720px usam `next/image`. Fontes Playfair Display e DM Sans são locais.
- As logos fornecidas pela equipe estão preservadas em `public/logos/`. O cabeçalho usa uma adaptação horizontal transparente; o rodapé usa a marca completa. Os arquivos otimizados e os ícones ficam em `public/logos/optimized/`, além de `public/favicon.ico`. As adaptações foram criadas com image_gen a partir da marca fornecida; os registros ficam em `docs/brand-assets/`.
- O site mantém `noindex, nofollow` até a validação do inventário, das imagens reais e dos documentos oficiais. A implantação pública não foi executada neste trabalho.

## Revisão

Veja [`CHANGELOG.md`](CHANGELOG.md), [`docs/VERIFICATION.md`](docs/VERIFICATION.md) e [`docs/screenshots/`](docs/screenshots/).

O histórico da fase anterior está em [`docs/README-fase1.md`](docs/README-fase1.md), [`docs/VERIFICATION-fase1.md`](docs/VERIFICATION-fase1.md) e [`docs/PROTOTYPE_AUDIT.md`](docs/PROTOTYPE_AUDIT.md). O protótipo HTML original continua preservado e não é executado pela aplicação Next.js.
