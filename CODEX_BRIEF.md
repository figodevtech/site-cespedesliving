# Prompt de implementação para Codex — Cespedes Living Hospedagens

## Contexto

Você é um engenheiro front-end sênior com atenção excepcional a UI/UX e performance. Vamos construir o site profissional e público da **Cespedes Living Hospedagens**, empresa de administração de flats próprios de terceiros em João Pessoa, Paraíba. A empresa administra flats de diversos proprietários, recebe reservas e acompanha os resultados dos imóveis por meio de um ERP.

**Este repositório contém um protótipo navegável em HTML/CSS/JS, com assets ilustrativos. Inspecione `index.html`, `styles.css`, `app.js` e `assets/` e preserve os conceitos visuais e fluxos ao migrar.** A imagem original de marca e a apresentação visual são referências aprovadas para o estilo; a logomarca vetorial oficial deve ser solicitada à equipe, e NÃO substituída por uma marca inventada.

## Meta da fase 1

Implementar um **front-end real em Next.js + TypeScript**, navegável, acessível, responsivo e pronto para demonstração, com todas as páginas funcionando e um adaptador de dados `mock` que posteriormente seja trocado pela API do ERP sem refazer componentes.

- Next.js (App Router), React, TypeScript estrito, Tailwind CSS, shadcn/ui ou componentes equivalentes; versão compatível e estável do ambiente.
- Layout premium, alto padrão de hospedagem com fundo navy, detalhes dourados, áreas off-white e títulos serifados.
- Sem exagero de animações. Respeitar `prefers-reduced-motion`.
- SEO por página, semântica, acessibilidade de teclado, estados de loading/erro/vazio.
- Imagens locais otimizadas, `next/image`, lazy loading, placeholders.
- Testes unitários para preço e datas e testes E2E dos principais fluxos.
- Não implementar autenticação por simples `localStorage` em produção; manter mock explicitamente isolado na fase 1.

## Sitemap obrigatório (todas as rotas renderizáveis)

1. `/` — Home: hero com interior sofisticado, busca por destino/datas/hóspedes, flats em destaque, benefícios, gestão para proprietários, localização e CTA.
2. `/flats` — Catálogo: filtro bairro, hóspedes, datas, faixa de preço, facilidades; ordenação; layout grid; chips ativos; URL com filtros; empty states.
3. `/flats/[slug]` — Detalhe: galeria com lightbox, descrição, comodidades, regras, contexto da localização, datas e preço discriminado, CTA reservar.
4. `/reservar/[slug]` — Jornada de solicitação: datas, hóspedes, identificação, resumo; validar período e capacidade; mensagem clara de etapa de confirmação.
5. `/reserva-confirmada` — Estado de sucesso, número da solicitação (no mock indicado como fictício).
6. `/cadastro` e `/entrar` — Formulários de criação e acesso. Mock na fase 1; auth real depois.
7. `/minha-conta` e `/favoritos` — Área do hóspede, solicitações e favoritos.
8. `/proprietarios` — Landing comercial com benefícios, etapas e formulário de captação de imóvel.
9. `/painel-proprietario` — Visual do futuro portal: ocupação, reservas, receitas, despesas, repasses e manutenções; dados ilustrativos até integração.
10. `/servicos`, `/sobre`, `/contato`, `/perguntas-frequentes`.
11. `/politica-de-privacidade`, `/termos-de-uso`, `not-found`.

Todas as páginas devem ser acessíveis por menus, botões e links, sem caminhos sem saída, e sem erros de compilação ou console.

## Design system

| Token | Cor | Uso |
|---|---|---|
| Navy | `#0F2D3D` | Cabeçalho, seções institucionais, rodapé |
| Dourado | `#C9A96A` | Botões principais, detalhes, ícones |
| Off-white | `#F6F6F1` | Seções alternadas e fundos claros |
| Cinza | `#6B6F76` | Legendas, metadados |
| Text | `#1A2830` | Tipografia em fundos claros |

Títulos: editorial serifado (ex.: Playfair Display). Corpo: DM Sans ou Manrope. Cards com raio suave, fotos amplas, respiro horizontal, fotografia de arquitetura e experiência mobile cuidadosa. NÃO produzir uma estética genérica de dashboard SaaS no site público. O painel pode ser mais funcional, mantendo a identidade.

## Geração de imagens ultra-realistas

Gerar ativos novos com uma ferramenta de geração de imagens realmente disponível no ambiente do Codex (ou via API específica devidamente configurada). **Codex é o agente de desenvolvimento, não uma garantia de geração de imagens por si só:** se não houver ferramenta/API de imagens, preparar os prompts e a estrutura `/public/images` para renderização posterior e informar claramente os assets pendentes. Não usar imagens recortadas do mockup como fotos finais.

Criar **uma série consistente de fotografias realistas de interiores** com aparência de fotografia imobiliária real, localizadas no litoral urbano de João Pessoa. Especificações:

- **Sem pessoas, sem textos, sem marcas-d'água, sem placas, sem logotipos nem UI embutida.**
- Câmera e perspectiva plausíveis, geometria correta, luz natural de fim de tarde / manhã, alto alcance dinâmico sem HDR artificial, superfícies realistas, sombras coerentes, móveis contemporâneos, paleta areia, madeira clara, pedra e tecidos sofisticados.
- Evitar arquitetura fantasiosa, proporções incorretas e exageros de piscinas/vista-mar.
- Uniformidade fotográfica, porém imóveis com ambientes e decoração distintos. Fotos de cada imóvel precisam parecer do MESMO imóvel ao alternar ângulo/cômodo.
- Imagens do site **devem ser rotuladas como ilustrativas** até serem substituídas por fotos verificadas dos flats reais. Nunca apresentar imagens artificiais como retratos fiéis de propriedades que já estão à venda ou reserva.
- Formatos `.webp`/`.avif`, versões responsivas e arquivos otimizados.

### Prompts de imagem sugeridos

**Hero desktop (1920 × 1100, composição ampla):**
> Ultra-photorealistic architectural editorial photograph of a sophisticated modern serviced flat living room in João Pessoa, Brazil. Floor-to-ceiling windows facing an architecturally plausible coastal urban skyline and distant sea, warm neutral sofa, travertine accents, natural wood, tasteful indoor plants, subdued architectural lighting, authentic daylight, 24mm full-frame architectural lens, realistic textures, straight verticals, refined luxury hospitality atmosphere. Wide composition with usable shadowed negative space on the left for overlay typography. No text, no people, no logo, no watermark, no surreal objects.

**Flat Tambaú (capa + 3 ângulos coerentes):**
> Ultra-realistic residential architecture photoshoot in a bright, compact high-end apartment near Tambaú Beach, João Pessoa: living room with small balcony and soft ocean glimpse, bedroom with cream linen bedding, full kitchen in warm wood and off-white cabinets, bathroom in light stone. Maintain identical materials and furniture between all views. Morning daylight, architectural photography, no text, no people.

**Flat Manaíra (capa + 3 ângulos):**
> Ultra-realistic residential architecture photoshoot of an upscale two-bedroom serviced flat in Manaíra, João Pessoa, carefully furnished with honey-colored wood cabinetry, natural stone counters, warm lamps, contemporary Brazilian interior design, neutral upholstery. Images: living-dining area, master bedroom, second bedroom, kitchen. Consistent single property and credible dimensions. No text or people.

**Flat Cabo Branco (capa + 3 ângulos):**
> Ultra-realistic editorial real-estate images of a contemporary apartment near Cabo Branco in João Pessoa with modest coastal skyline view, well-proportioned floor-to-ceiling windows, tasteful natural materials, airy living room, bedroom, kitchen and balcony. Authentic realistic daylight and physical geometry, no text, no people.

**Outros imóveis:** gerar séries próprias para Bessa, Intermares e Altiplano, sem repetir o mesmo cenário. **Institucional:** recepção de edifício residencial sofisticado sem logotipo; panorâmica do litoral de João Pessoa geometricamente plausível; detalhes de hospitalidade (cama arrumada, café, amenities discretos).

Priorizar fotos horizontais de **mínimo 1600 px** para heros e 1200 px para cards, com crops para celular. Manter um `imageManifest` por imóvel.

## Modelo de dados (contrato provisório)

```ts
type Flat = {
  id: string;
  slug: string;
  title: string;
  neighborhood: string;
  city: string;
  state: 'PB';
  description: string;
  coverImage: string;
  gallery: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  areaSqm?: number;
  amenities: string[];
  active: boolean;
  published: boolean;
  ownerId: string;  // privado, nunca expor na API pública
  fromPrice?: number; // no mock apenas; em produção consultar calendário tarifário
};

type AvailabilityQuery = {
  flatId: string;
  checkin: string;  // YYYY-MM-DD
  checkout: string; // YYYY-MM-DD, exclusivo
  guests: number;
};

type ReservationQuote = {
  available: boolean;
  nightlyBreakdown: { date: string; amount: number }[];
  subtotal: number;
  fees: number;
  taxes: number;
  total: number;
  currency: 'BRL';
  expiresAt?: string;
};
```

## Integração futura com ERP

Implementar `services/flats.ts`, `services/availability.ts`, `services/reservations.ts`, `services/auth.ts`, `services/owners.ts`, com interface desacoplada e adaptadores `mock` e `api` trocáveis por variável de ambiente. APIs REST preliminares sujeitas a revisão:

- `GET /public/flats` — Apenas imóveis `published=true`, filtros e paginação.
- `GET /public/flats/:slug` — Ficha pública e galeria.
- `GET /public/flats/:id/quote?checkin=...&checkout=...&guests=...` — Fonte da verdade de tarifas e disponibilidade.
- `POST /public/booking-requests` — Reserva sob validação atômica no servidor, número e status `PENDING`.
- `GET /me/reservations` — Reservas do hóspede autenticado.
- `POST /public/owner-leads` — Captação comercial com antispam/rate limiting.
- `GET /owner/dashboard`, `/owner/flats`, `/owner/statements` — Portal restrito por proprietário.

Segurança obrigatória antes da fase real:

- Separação entre informação pública e privada; autenticação segura no servidor; RBAC/RLS para evitar que um proprietário visualize dados de outro.
- **Nunca conectar o navegador diretamente às tabelas administrativas do ERP usando chave service-role.** Preferir endpoints server-side e dados públicos restritos; se compartilhar Supabase, RLS estrita por tenant, views sanitizadas e estratégias de cache.
- Evitar dupla reserva com transação/conflitos de calendário; validar datas, hóspedes, regras, bloqueios e preço no servidor antes de confirmar.
- Pagamento só em fase específica com provedor autorizado, webhooks validados, idempotência e política de cancelamento.
- Logs, monitoramento, LGPD, consentimento, termos jurídicos oficiais, proteção antispam, imagens autorizadas, acessibilidade WCAG.

## Critérios de aceite

1. Todos os links do cabeçalho, rodapé, cards e CTAs levam a rotas reais e navegam corretamente.
2. Desktop, tablet e celular sem overflow horizontal. Fotos preservam proporções e não estouram layout.
3. Listagem filtra por bairro, hóspedes e período, e comunica quando não existem resultados.
4. Tela de imóvel muda resumo de preço conforme noites; valida checkout após checkin.
5. Fluxo de reserva mock percorre início → detalhes → dados do hóspede → confirmação → minha conta.
6. Favoritos e cadastro demo persistem no navegador, identificados como temporários; nenhuma senha fica salva em localStorage.
7. Painel proprietário e formulários de parceria são acessíveis e têm dados claramente fictícios.
8. Não existem botões decorativos sem ação real; todas as interações têm resposta visível.
9. Telas usam landmarks, labels, textos alternativos úteis, foco visível e navegação por teclado.
10. `npm run lint`, `npm run build` e testes passam; README descreve o modo mock e onde trocar pelas APIs.

## Ordem de execução para o Codex

1. Auditar o protótipo fornecido e mapear telas/estados.
2. Criar estrutura Next.js e componentes reutilizáveis de design system.
3. Migrar home, catálogo, detalhe, proprietários e páginas institucionais mantendo o visual.
4. Migrar conta, favoritos, reserva demonstrativa e painel.
5. Criar/revisar imagens com a ferramenta de geração disponibilizada, assegurando a indicação de material ilustrativo.
6. Implementar tests, responsividade, acessibilidade, SEO e refinamento.
7. Entregar build validado, lista de rotas, screenshots desktop/mobile e changelog objetivo.

**Não depender de aprovação por etapa para finalizar o front-end mock. Não conectar o ERP nem processar pagamentos nesta fase.**
