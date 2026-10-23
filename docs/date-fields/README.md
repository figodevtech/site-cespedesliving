# Campos de data no celular

Verificado em 23/10/2026 no build de produção, com Playwright em Chromium e WebKit no Windows.

- Larguras: 320, 390 e 430px.
- Páginas: home, catálogo, detalhe do flat e consulta de hospedagem.
- Valores preenchidos e vazios mantêm a altura; controles ficam dentro do contêiner, sem overflow horizontal.
- Texto de 16px, área de toque de pelo menos 48px e datas empilhadas nas telas pequenas.
- Período preservado entre busca e imóvel e no texto preparado para o WhatsApp; nenhuma mensagem foi enviada.
- Quatro testes específicos e nove testes de regressão aprovados; lint, TypeScript e build aprovados.

`DateInput` preserva o controle nativo e suas propriedades. Borda e espaçamento ficam no contêiner, pois há um [problema documentado de largura de inputs de data com padding no iOS](https://bugs.webkit.org/show_bug.cgi?id=301648). A apresentação da data e o seletor dependem do navegador e do sistema, conforme a [documentação do input date](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date).

Os PNGs registram as quatro páginas a 390px em cada engine, além do formulário vazio. Não substituem uma validação em iPhone físico ou do calendário do sistema iOS.

```powershell
npx.cmd playwright install chromium --only-shell
npx.cmd playwright install webkit
npm.cmd run build
$env:PLAYWRIGHT_PORT = '3003'
npm.cmd run test:dates
```
