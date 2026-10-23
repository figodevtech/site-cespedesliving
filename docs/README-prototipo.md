# Cespedes Living Hospedagens — protótipo navegável

Protótipo visual de um site de hospedagens e gestão de flats em João Pessoa (PB), criado com base na identidade apresentada pelo cliente: azul-marinho, dourado, off-white, tipografia editorial e fotografia de arquitetura.

## Iniciar

**Sem dependências e sem instalação.** Abra o arquivo `index.html` em um navegador atualizado. Para usar um servidor local:

```bash
python -m http.server 8000
# abrir http://localhost:8000
```

O projeto funciona como uma SPA com rotas por `hash` (`#/flats`), permitindo abrir as telas por links sem configurar um servidor ou uma API.

## Páginas e fluxos disponíveis

| Caminho | O que existe |
|---|---|
| `#/` | Home, busca, flats selecionados, proposta de valor, seção proprietários |
| `#/flats` | Catálogo com filtros por região e hóspedes, datas e ordenação |
| `#/flats/flat-tambau-master` | Detalhe de imóvel, galeria, comodidades e estimativa de reserva |
| `#/reservar/flat-tambau-master` | Formulário da jornada de reserva, sem pagamento |
| `#/reserva-confirmada` | Confirmação da simulação (não é reserva real) |
| `#/favoritos` | Favoritos armazenados localmente |
| `#/cadastro` | Cadastro demonstrativo de hóspede ou proprietário |
| `#/entrar` | Entrada demonstrativa sem autenticação real |
| `#/minha-conta` | Solicitações simuladas e atalhos do usuário |
| `#/painel-proprietario` | Painel conceitual com indicadores fictícios |
| `#/servicos` | Serviços de administração |
| `#/proprietarios` | Página de captação de proprietários e formulário de interesse |
| `#/sobre` | Identidade e valores da empresa |
| `#/contato` | Formulário de mensagem demonstrativo |
| `#/perguntas-frequentes` | Perguntas frequentes |
| `#/termos-de-uso` | Texto provisório dos termos do protótipo |
| `#/politica-de-privacidade` | Texto provisório de privacidade do protótipo |

## Observações importantes

- **Todo o inventário é demonstrativo.** Nomes dos imóveis, fotos, valores, ocupação, indicadores financeiros e disponibilidade não são dados reais.
- **Não há ERP conectado, backend, banco de dados, autenticação, pagamentos, e-mail, WhatsApp ou confirmação de reservas.**
- Os fluxos de cadastro, favoritos, reservas simuladas e formulários salvam dados de demonstração no `localStorage` deste navegador. Senhas digitadas não são armazenadas.
- Não forneça dados pessoais reais no protótipo.
- As imagens neste pacote são **recortes provisórios de conceitos visuais gerados por IA**. Têm limitações de resolução e devem ser substituídas por imagens exclusivas em alta qualidade ou fotografias verdadeiras antes da publicação.
- Este material não é um produto pronto para produção. Não reutilizar mecanismos simulados de autenticação ou persistência no sistema real.

## Organização

```
index.html             Estrutura HTML
styles.css             Design system e estilos responsivos
app.js                 Páginas, dados e navegação simulados
assets/*.webp          Fotos de demonstração
assets/favicon.svg     Ícone simplificado
CODEX_BRIEF.md         Instruções para continuar o projeto no Codex
```

## Diretrizes visuais

- Navy `#0F2D3D`, dourado `#C9A96A`, off-white `#F6F6F1`, cinza `#6B6F76`.
- Famílias tipográficas: Playfair Display para títulos, DM Sans para corpo; há fontes substitutas locais.
- Botões arredondados em dourado, superfícies brancas, bordas suaves e fotografia em destaque.
- Componentes e fluxos pensados para desktop e dispositivos móveis.

## Próximo passo

Leia `CODEX_BRIEF.md` para refazer o projeto em Next.js / React, trocar todas as imagens provisórias, conectar o catálogo real ao ERP e implantar as regras de disponibilidade, reserva e autenticação. Este protótipo serve como **referência de experiência e navegação**, não como arquitetura de produção.
