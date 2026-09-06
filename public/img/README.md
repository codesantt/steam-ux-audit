# Capturas de tela (feitas pelo grupo)

Coloque aqui os screenshots citados no site. **Não** faça hotlink de
servidores da Valve — capture você mesmo, para fins de citação acadêmica.

Enquanto um arquivo não existir, o site mostra um retângulo cinza
tracejado no lugar (o `onerror` do `<img>` cuida disso).

## Arquivos referenciados pelo `index.html`

| arquivo | onde aparece | status | o que é / o que capturar |
|---|---|---|---|
| `steam-home.png` | Seção 03 — Contexto ("a home é um leilão de atenção") | **OK** (Igor, 6 set 2026) | Home da loja Steam, várias faixas de conteúdo competindo. |
| `steam-product-page.png` | Pergunta 2 — hotspots | **FALTA** | Página de **produto** de um jogo (`store.steampowered.com/app/...`). Precisa mostrar, na mesma captura: a barra de avaliações, o botão verde de compra, os botões "Lista de desejos / Seguir / Ignorar", as tags da comunidade e (rolando um pouco) os requisitos de sistema. Enquadrar em ~16:10. Página sem age gate ajuda (ex.: Dota 2, Hades, Stardew Valley). |

Os hotspots numerados da Pergunta 2 estão posicionados por porcentagem
(`--x` / `--y` em cada `<button class="hotspot">` no `index.html`). Depois de
colocar `steam-product-page.png`, ajuste esses valores para cada número cair
sobre o elemento certo.

## Formato

- WebP ou AVIF de preferência (menor); PNG serve.
- Largura ~1600–1920px basta. Comprimir antes de commitar (o `steam-home.png`
  atual tem 2,3 MB — dá para reduzir bastante).
- Se adicionar mais capturas, referencie com `<img src="public/img/arquivo.ext"
  alt="descrição objetiva" loading="lazy">` e um `figcaption` dizendo que é
  captura do grupo, com a data.
