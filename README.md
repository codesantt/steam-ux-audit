# Desmontagem — avaliação de UX/UI da Steam

Site de página única, longo, scroll‑driven, que apresenta uma avaliação
crítica de usabilidade e interface da Steam (Valve) como trabalho acadêmico.

O conceito é **desmontagem**: a interface da Steam é aberta em público, da
superfície polida até o esqueleto estrutural. A escala de sentimento da
própria Steam vira o design system do site (veredito = cor + rótulo + ícone),
e cada elemento gráfico exibe uma medição real da avaliação.

## Como rodar

O site é estático, mas usa ES modules e `fetch` de CDN, então precisa de um
servidor local (não abra por `file://`).

```bash
# qualquer um destes, a partir desta pasta:
npx serve .
# ou
npx http-server -p 8080 .
```

Depois abra `http://localhost:8080` (ou a porta indicada).

Nenhuma instalação de dependência é necessária. As bibliotecas
(Lenis, GSAP + ScrollTrigger, Three.js, Embla) são carregadas por `import()`
dinâmico a partir do jsDelivr, cada uma atrás de `try/catch`: se uma CDN
falhar, o conteúdo continua 100% legível, só sem aquela camada de enhancement.

## Estrutura

```
index.html          markup semântico das 11 seções + conteúdo (Parte 2)
css/styles.css       design system: tokens, grid de 12 colunas, componentes
js/main.js           orquestração, interações, progressive enhancement
js/hero-scene.js     cena 3D do hero (parede de "capsules"), import dinâmico
public/img/          screenshots do grupo (ver public/img/README.md)
```

## O que ainda falta preencher

Tudo marcado com o chip `⚑ VERIFICAR` no site:

- Números de escala da Steam (usuários ativos, pico simultâneo, catálogo) —
  com fonte citada (Valve, SteamDB ou Steam Hardware Survey) e data de consulta.
- Contagem de cliques / decisões / tempo dos quatro fluxos de tarefa.
- Resultados medidos da auditoria WCAG 2.2 (contraste, teclado, foco, zoom).
- Notas consolidadas do placar heurístico de Nielsen (a tabela traz uma
  sugestão; ajustar para a avaliação real do grupo).
- Nomes do grupo, disciplina, instituição e data da análise (rodapé).
- Capturas de tela em `public/img/` (ver instruções lá).

## Acessibilidade e performance

- HTML semântico (`main`, `section`, `h1`–`h3` em hierarquia real), skip‑link.
- Anel de foco custom, visível em todos os controles.
- Hotspots, toggles, sliders e carrossel operáveis por teclado, com `aria-label`;
  o carrossel tem botões prev/next além do arrasto.
- `prefers-reduced-motion`: desliga parallax, smooth‑scroll, autoplay e a
  animação da cena 3D; mantém a cena estática e todo estado disparado por clique.
- Cena 3D é `aria-hidden` e decorativa; sem WebGL vira grade estática em CSS.
- Contraste medido: `--paper/--void` 15.9:1, `--muted/--void` 7.4:1.
  `--negative/--void` mede 4.18:1, por isso essa cor só aparece em texto
  grande, borda e ícone — nunca no corpo de texto.
- Auditado com axe‑core 4.10: 0 violações (desktop e mobile, estados estáticos
  e dinâmicos).

## Sem afiliação

Trabalho acadêmico, sem afiliação com a Valve Corporation. Nenhum asset é
hotlink de servidor da Valve; a logo da Valve/Steam não é usada como marca
deste site.
