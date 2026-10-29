# Cespedes Living Hospedagens

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

Para verificar especificamente os campos de data em Chromium e WebKit, instale também `npx playwright install webkit` e execute `npm run test:dates`. A cobertura e as capturas estão em [`docs/date-fields/`](docs/date-fields/).

## Atendimento e consultas

**WhatsApp oficial: +55 (83) 99912-3337**, configurado em `src/lib/contact.ts`. Pode ser substituído por `NEXT_PUBLIC_CONTACT_WHATSAPP`, com código do país e apenas dígitos. `.env.example` registra a configuração. `NEXT_PUBLIC_CONTACT_EMAIL` permite configurar um canal alternativo.

- A reserva de temporada consulta disponibilidade e preços no ERP e confirma com a conta de cliente autenticada.
- O formulário de parceria registra o interesse no ERP e permite continuar no WhatsApp. O formulário de contato prepara a mensagem para esse canal.
- Depois de preparar, o visitante clica em **Continuar no WhatsApp** e envia a mensagem naquele aplicativo.
- Preparar uma mensagem não significa enviá-la. Testes automatizados não enviam mensagens nem emails reais.
- Valores e disponibilidade vêm do ERP; pagamento, cancelamento e condições específicas são tratados pelo atendimento.

## Rotas

| Rotas | Funcionamento atual |
|---|---|
| `/` | Apresentação, busca, flats em destaque e gestão de imóveis |
| `/flats` | Busca por bairro, hóspedes, datas, facilidades e ordenação; filtros em URL |
| `/flats/[slug]` | Galeria, características, cotação de temporada e interesse/visita para venda ou locação |
| `/reservar/[slug]` | Cotação e confirmação de temporada com conta de cliente |
| `/favoritos` | Escolhas salvas neste navegador e exclusão dos dados locais |
| `/proprietarios` | Serviços de gestão e mensagem de interesse pelo WhatsApp |
| `/contato` | Número oficial, acesso direto ao WhatsApp e preparação de mensagem |
| `/servicos`, `/sobre`, `/perguntas-frequentes` | Páginas institucionais |
| `/entrar`, `/cadastro`, `/minha-conta` | Autenticação, confirmação de e-mail, perfil e reservas do cliente |
| `/painel-proprietario` | Imóveis, reservas, demonstrativos e repasses do proprietário autenticado |
| `/reserva-confirmada` | Dados reais da reserva do cliente autenticado |
| `/politica-de-privacidade`, `/termos-de-uso` | Informações sobre o funcionamento do site, sujeitas à validação jurídica da empresa |
| Endereços ou slugs inexistentes | Página 404 com navegação de recuperação |

## Dados e integrações

O modo padrão agora é `DATA_ADAPTER=api`: catálogo, cotações, reservas, leads, perfil e portal usam a API do ERP. Veja o contrato e a configuração em [`docs/INTEGRACAO-ERP.md`](docs/INTEGRACAO-ERP.md).

- Autenticação Supabase SSR com cookies exclusivos do site. Cadastro de cliente exige CPF, nome, e-mail, telefone, senha e confirmação do e-mail.
- A conta do proprietário é provisionada exclusivamente no ERP e usa e-mail separado da conta de cliente. O backend do ERP autoriza cada consulta.
- Reserva de temporada confirma no envio com cotação válida, preço esperado e chave de idempotência. Pagamento e cancelamento são tratados pela equipe.
- Venda e locação possuem registro de interesse e solicitação de visita.
- Proprietários acompanham imóveis, reservas, demonstrativos, repasses e comprovantes reais, sem edição pelo portal.

Os adaptadores de demonstração permanecem isolados para testes. O inventário fictício em `src/data/flats.ts` não é cadastrado no banco nem usado no modo API. Sem imóveis publicados, o site mostra um catálogo vazio.

Copie `.env.example` para `.env.local`, configure URL e chave anon do Supabase, e mantenha o ERP em `http://localhost:3000` e o site em `http://localhost:3001` (`npm.cmd run dev -- --port 3001`). Não copie chaves administrativas. Requests privados propagam apenas o token do usuário autenticado; não usam token fixo de administrador.

Configure as URLs de retorno do Supabase para `/auth/confirm`. A aplicação aceita confirmação por PKCE ou token hash e convites padrão com sessão no fragmento, convertida em cookie no servidor. Nenhuma senha ou token de autenticação é salvo em localStorage.

## Imagens, marca e publicação

- As 28 fotografias em `public/images/` foram geradas por IA e continuam identificadas como imagens de ambientação. Não substituem fotografias verificadas de cada imóvel.
- Manifesto por imóvel e tamanhos: [`public/images/image-manifest.json`](public/images/image-manifest.json). Prompts: [`docs/image-generation/`](docs/image-generation/).
- Imagens locais WebP e variantes de 720px usam `next/image`. Fontes Playfair Display e DM Sans são locais.
- As logos fornecidas pela equipe estão preservadas em `public/logos/`. O cabeçalho usa uma adaptação horizontal transparente; o rodapé usa a marca completa. Os arquivos otimizados e os ícones ficam em `public/logos/optimized/`, além de `public/favicon.ico`. As adaptações foram criadas com image_gen a partir da marca fornecida; os registros ficam em `docs/brand-assets/`.
- O site mantém `noindex, nofollow` até a validação do inventário, das imagens reais e dos documentos oficiais. A implantação pública não foi executada neste trabalho.

## Revisão

Veja [`CHANGELOG.md`](CHANGELOG.md), [`docs/VERIFICATION.md`](docs/VERIFICATION.md) e [`docs/screenshots/`](docs/screenshots/).

O histórico da fase anterior está em [`docs/README-fase1.md`](docs/README-fase1.md), [`docs/VERIFICATION-fase1.md`](docs/VERIFICATION-fase1.md) e [`docs/PROTOTYPE_AUDIT.md`](docs/PROTOTYPE_AUDIT.md). O protótipo HTML original continua preservado e não é executado pela aplicação Next.js.
