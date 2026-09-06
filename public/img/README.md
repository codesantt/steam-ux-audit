# Capturas de tela (feitas pelo grupo)

Coloque aqui os screenshots citados no site. **Não** faça hotlink de
servidores da Valve — capture você mesmo, para fins de citação acadêmica.

Enquanto um arquivo não existir, o site mostra um retângulo cinza
tracejado no lugar (o `onerror` do `<img>` cuida disso).

## Arquivos referenciados pelo `index.html`

| arquivo | onde aparece | status | o que é |
|---|---|---|---|
| `steam-home.png` | Seção 03 — Contexto ("a home é um leilão de atenção") | **OK** (Igor, 6 set 2026) | Home da loja Steam, várias faixas de conteúdo competindo. |
| `steam-product-page.png` | Pergunta 2 — hotspots | **provisório** | Página de produto de **Red Dead Redemption 2** (`store.steampowered.com/app/1174180`), **em promoção**, em pt-BR, **sem sessão iniciada**. 1280×1089. Mostra: barra de análises, marcadores da comunidade, o aviso de "Inicie a sessão…" no lugar dos botões de lista de desejos, e o bloco de compra com selo -75%, preço riscado R$ 299,90 e botão verde. |

### Pergunta 2 — a captura é UMA só

É um print de **uma** página de produto (a página de um jogo específico na
loja). Sobre ela ficam 5 pontos numerados; clicar em cada um abre a crítica
daquele elemento:

1. barra de análises ("Extremamente positivas / Muito positivas …")
2. botão verde de compra
3. lista de desejos / seguir / ignorar
4. preço (e o preço riscado, quando em promoção)
5. marcadores da comunidade (as tags)

A que está no repositório (RDR2 em promoção) cobre 4 dos 5 pontos com
elemento real, incluindo o preço riscado. O único que fica no aviso "Inicie
a sessão…" é o ponto 3 (lista de desejos / seguir / ignorar), porque a
captura é **deslogada**. Se quiserem os três botões reais, refaçam **logados
no Steam** e substituam `steam-product-page.png` — a promoção acaba em
8 de setembro, então tem que ser antes disso para manter o preço riscado.

As posições dos 5 pontos são porcentagens (`--x` / `--y` em cada
`<button class="hotspot">` no `index.html`) e o recorte da moldura é
`.img-frame--product { aspect-ratio: 1280 / 1089 }` no `css/styles.css`.
Se a nova captura tiver outra proporção, ajustem esses dois pontos — me
peçam que eu faço.

## Formato

- WebP ou AVIF de preferência (menor); PNG serve.
- Largura ~1600–1920px basta. Comprimir antes de commitar (o `steam-home.png`
  atual tem 2,3 MB — dá para reduzir bastante).
- Se adicionar mais capturas, referencie com `<img src="public/img/arquivo.ext"
  alt="descrição objetiva" loading="lazy">` e um `figcaption` dizendo que é
  captura do grupo, com a data.
