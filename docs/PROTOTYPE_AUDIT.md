# Auditoria e mapa de migração

O protótipo original foi inspecionado em `index.html`, `styles.css`, `app.js`, `assets/` e `conceito-visual.png`. Os arquivos originais continuam preservados na raiz; a aplicação Next.js está em `src/` e não os executa.

## O que foi preservado

- Paleta navy `#0F2D3D`, dourado `#C9A96A`, off-white `#F6F6F1`, títulos Playfair Display e corpo DM Sans.
- Hero fotográfico, busca de hospedagem, cards amplos, hospitalidade, proposta para proprietários e seção de localização.
- Os seis nomes e slugs de imóveis de demonstração e a separação entre hóspedes e proprietários.
- Jornada catálogo → detalhe → solicitação → sucesso demonstrativo → minha conta.

## O que foi corrigido na migração

| Protótipo | Aplicação Next.js |
|---|---|
| SPA por hash e montagem de HTML em strings | App Router, páginas semânticas, React e TypeScript estrito |
| Fotos recortadas do conceito, com baixa resolução | 28 fotografias novas geradas por IA, séries por imóvel, arquivos WebP locais e indicação explícita de ilustração |
| Galerias misturavam fotos de imóveis diferentes | Quatro ambientes por imóvel com materiais e referência visual próprios |
| Preço fixo multiplicado pelas noites no navegador | Cotação no servidor mock, diárias discriminadas, ajuste de fim de semana e taxa de limpeza |
| Filtros visuais com disponibilidade superficial | Filtros em URL, comodidade, preços, ordenação, calendário e estados vazio/erro |
| Login simulava entrada ao salvar usuário | Perfil demo sem senha, explicitamente sem autenticação; sem autorização de dados reais |
| Formulários simulados por eventos globais | Componentes com validação, resposta visível e rotas de serviço isoladas |
| Modal manual sem contenção nativa de foco | `dialog` nativo, Escape, setas e restauração do foco |
| Ausência de testes e build | ESLint, TypeScript, Vitest, Playwright e axe |

## Estados mapeados

- Catálogo: inicial, filtros ativos, resultados ordenados, busca sem resultado e parâmetros inválidos.
- Detalhe/reserva: carregando cotação, período válido, período bloqueado, datas inválidas, capacidade inválida, falha de consulta com nova tentativa e envio em andamento.
- Conta: perfil ausente/presente, solicitações ausentes/presentes, saída e exclusão dos dados demo.
- Favoritos: vazio, item salvo, item removido e persistência após atualização.
- Formulários: validação nativa, processamento, erro do serviço e sucesso demonstrativo.
- Portal: dois cenários financeiros fictícios, reservas, despesas, manutenção e extrato CSV fictício.
- Navegação: desktop, menu mobile, página inexistente e slug inexistente.

## Marca

Nenhuma logomarca foi inventada. O cabeçalho usa uma apresentação textual do nome. O vetor oficial e os contatos comerciais permanecem pendentes da equipe; o ícone simplificado e o monograma do protótipo não foram promovidos a marca oficial.
