# Aplicação da marca fornecida

Os quatro PNGs originais enviados pela equipe foram preservados em `public/logos/`.

## Versões em uso

| Local | Arquivo | Preparação |
|---|---|---|
| Cabeçalho | `public/logos/optimized/logo-horizontal.webp` | Adaptação horizontal, fundo transparente, marfim e dourado para fundo navy |
| Rodapé | `public/logos/optimized/logo-stacked.webp` | Marca completa com fundo transparente e composição vertical |
| Navegador | `public/favicon.ico` | Monograma fornecido, mantendo o fundo navy, com resoluções 16, 32 e 48px |
| Ícones PNG | `public/logos/optimized/icon-{16,32,48,192,512}.png` | Tamanhos próprios a partir do monograma |
| Apple | `public/logos/optimized/apple-touch-icon.png` | Ícone de 180px |

As duas adaptações da marca completa foram criadas com a ferramenta integrada **image_gen**, a partir da logo original fornecida. Após a correção da grafia pela equipe, as versões horizontal e vertical foram editadas pela mesma ferramenta para exibir **CESPEDES**, sem acento. Monograma, composição, ornamentos e identidade visual foram mantidos. Os prompts exatos e a proveniência atuais estão em `logo-horizontal.json` e `logo-stacked.json`; os registros anteriores ficam em `history/`.

As fontes PNG corrigidas foram copiadas para `sources/logo-horizontal.png` e `sources/logo-stacked.png`. Os PNGs originais fornecidos pela equipe continuam preservados. Os favicons foram derivados de `Monograma CL Dourado Luxuoso.png`, recortando apenas a margem externa e redimensionando o arquivo; o monograma não contém o nome escrito.

As versões transparentes usam WebP sem perdas. `src/data/brand.json` registra as dimensões reais. O componente `src/components/brand.tsx` reserva o espaço da imagem e fornece nome acessível; o rodapé e o cabeçalho usam variações próprias.

`scripts/prepare-brand.mjs` permite repetir a otimização a partir das fontes locais incluídas no projeto. O build utiliza somente os arquivos preparados em `public/`.

## Verificação

- Build, lint e TypeScript aprovados.
- Sete verificações existentes de rotas, imagens, formulários, responsividade e acessibilidade passaram no build de produção após a correção da grafia.
- Conferência adicional do cabeçalho em 320, 390, 768, 1024 e 1440px, sem overflow horizontal.
- Favicon e PNGs retornam HTTP 200, com dimensões e diretório ICO conferidos.
- Capturas específicas: `header-1440.png`, `header-320.png` e `footer.png`.
