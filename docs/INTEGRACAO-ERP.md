# Integração ERP e contas do site

O site usa Next.js 16 e Supabase SSR (`@supabase/ssr` 0.12.7 e `@supabase/supabase-js` 2.118.0, versões fixadas no lockfile). A API do ERP concentra autorização e gravações de negócio.

## Configuração local

ERP: porta 3000. Site: `npm.cmd run dev -- --port 3001`. `.env.local` contém somente URL/chave anon do mesmo Supabase e `ERP_API_BASE_URL=http://localhost:3000/api`, com `DATA_ADAPTER=api`. Nunca copiar a chave service-role ou credenciais do banco para o site.

No Supabase Auth, autorize `http://localhost:3001/auth/confirm` e o retorno do convite `http://localhost:3001/auth/confirm?next=/definir-senha`. Em outro ambiente, substitua pelo domínio correspondente e configure `NEXT_PUBLIC_SITE_URL`. Convites são emitidos pelo ERP. O callback suporta PKCE, token_hash/type e o convite padrão com fragmento; a ponte de ativação remove os tokens da URL e armazena a sessão somente em cookie httpOnly.

## Autenticação e cadastros

- `/cadastro`: somente cliente; CPF válido, nome, telefone, e-mail, senha e aceite obrigatórios. Envia apenas dados cadastrais (`nome`, `telefone`, `cpf`, `origem: SITE`) ao Auth; metadados não concedem permissões.
- Confirmação de e-mail obrigatória. O banco prepara o cadastro pendente e a sincronização após verificação cria/vincula o cliente. Conflitos permanecem pendentes para conferência no ERP, com mensagem genérica no site.
- `/entrar?role=guest` e `/entrar?role=owner`: contas separadas, com e-mails diferentes. Conta de proprietário só pode ser criada no ERP e não faz reservas como cliente.
- Recuperação e convite permitem definir senha; depois, o usuário entra na área correspondente.
- Cookies exclusivos `sb-cespedes-site-auth`; `src/proxy.ts` atualiza sessão e cabeçalhos privados. `getUser()` valida identidade; a API do ERP fornece o perfil e as permissões atuais. localStorage armazena apenas favoritos.

## API consumida

| Método e caminho no ERP | Uso |
|---|---|
| GET `/api/public/imoveis` | Catálogo com filtros `modality`, `neighborhood`, `guests`, datas, valores, amenities e sort |
| GET `/api/public/imoveis/:slug` | Detalhe sanitizado |
| GET `/api/public/imoveis/:id/quote` | Disponibilidade e cotação por noite, quoteId, validade e total |
| POST `/api/public/owner-leads` | Interesse em administração do imóvel |
| POST `/api/public/leads`, `/api/public/visitas` | Interesse comercial e solicitação de visita |
| GET/PATCH `/api/site/me`, POST `/api/site/me/sync` | Perfil autorizado e sincronização cadastral |
| GET `/api/site/me/reservas` | Reservas do próprio cliente, paginadas |
| POST `/api/site/reservas` | Reserva com quoteId, expectedTotal e idempotencyKey; cliente derivado do JWT |
| GET `/api/site/proprietario/dashboard`, `/imoveis`, `/extratos` | Dados exclusivos do proprietário; filtros imovelId, inicio, fim |
| GET `/api/site/arquivos/:id` | Link temporário de comprovante autorizado |

Requests públicos não recebem credencial de administrador. Requests privados carregam `Authorization: Bearer <access_token>` verificado. Respostas privadas não são cacheadas. O DTO público usa allowlist e exclui proprietário, documentos e endereço exato.

## Fluxos de negócio

Catálogo oferece temporada, locação e venda, com valores específicos por finalidade. Reservas abrangem apenas temporada e são confirmadas no envio após validação transacional no ERP, com pagamento manual pelo atendimento. Não há gateway, espera automática por pagamento nem expiração automática da reserva. Conflito de calendário ou cotação vencida impede confirmação.

Conta cliente mostra perfil e histórico paginado. Proprietário possui consulta de imóveis, reservas e demonstrativo com recebido, taxa administrativa, despesas, repasses realizados e saldo a repassar. Exportação CSV usa os registros consultados. Comprovantes usam URL assinada após autorização; não há edição financeira pelo site.

## Verificação

`npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd test` e `npm.cmd run build`.

Teste E2E sem emails ou gravações no banco: execute `node tests/fixtures/erp-empty.mjs`; em outro terminal defina `ERP_API_BASE_URL=http://127.0.0.1:3002/api` e `PLAYWRIGHT_PORT=3001`, depois `npx.cmd playwright test tests/e2e/real-integration.spec.ts --project=desktop --project=mobile`. A fixture é somente leitura e serve catálogo vazio para testar identidade, telas de cadastro, bloqueio de rotas privadas e estados vazios. A validação completa de reservas e portal exige o ERP real e contas de teste provisionadas com dados isolados.

Nenhuma implantação foi executada. Os imóveis de demonstração e fotos ilustrativas existentes não foram importados para o banco.
