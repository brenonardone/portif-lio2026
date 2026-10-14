# Falcon/MotionG — prompt

Dois jeitos de pedir. Use o **prompt curto** quando estiver neste repositório (o kit em `MotionG/` faz o trabalho pesado). Use o **prompt mestre** para recriar o MotionG do zero em qualquer lugar, sem o kit.

---

## Prompt curto (com o kit do repositório)

```
Monte o Falcon/MotionG de <MÊS> de <ANO> com o arquivo anexo
(exportação do Resumo Mensal e Anual do Controle Geral CDA).

Siga MotionG/README.md: extraia os dados do mês fechado, revise as
leituras da lista "Confira à mão" e me diga o que precisou ajustar,
monte em motion/telemetria-AAAA-MM-im.html, rode MotionG/tools/verificar.js
até dar "Tudo certo.", atualize a tabela Motion do README, faça commit e
push e me envie o arquivo. Responda em português do Brasil.
```

Variações úteis:
- Só trocar o visual mantendo os dados: "Redesenhe só o visual do MotionG de <mês>; os dados, textos e cálculos ficam iguais. Compare com `--ref` antes de salvar."
- Mês parcial: "Monte o MotionG de <mês> mesmo parcial e marque no título que é parcial."

---

## Prompt mestre (recriar do zero)

Cole o bloco abaixo numa sessão nova, com o HTML exportado do Resumo Mensal e Anual anexado.

```
Crie o Falcon/MotionG: um motion graphic interativo, futurista, que conta o
resultado do mês da expedição do CD Aurora (Aurora Suplementos) como uma missão
espacial. Responda em português do Brasil.

ENTRADA
- HTML exportado do Resumo Mensal e Anual. Os dados estão no objeto
  window.__RESUMO_EXPORT__ → meses["AAAA-M"] → indicadores (61 KPIs) e
  detalhes (séries diárias de pedidos, recebimento, separação, devolução,
  avarias; movimentação por dia/hora/operador; UFs; canais; conferentes;
  motivos e ofensores de devolução; motivos de avaria; transportadoras;
  clientes; produtos). Use o mês fechado mais recente.
- Monte um JSON D compacto com: gerado, k (indicadores; frações < 1,5 com 4
  casas, demais floats com 1 casa), dias, pedidos, receb, sep, devol, avar,
  mov, canalDia, horas, ufs [uf, pedidos, b2b, prazo_mediana], canais
  [base, origem, pedidos], conf [nome sem "aurora.", un, dias, un/dia],
  oper, devMot, devOf, avMot, transp, clientes, produtos. Embuta D no HTML.
  Confira: soma diária de pedidos = indicador de pedidos.

REGRAS TÉCNICAS
- 1 arquivo HTML autocontido: CSS + JS puro + SVG/canvas. Sem CDN, sem
  bibliotecas, sem fontes externas (pilhas: "Oswald","Arial Narrow"… para
  números; "Inter","Segoe UI"… para texto; "JetBrains Mono",Consolas… para
  rótulos).
- Até 60 fps num notebook comum: anime só transform e opacity (Web Animations
  API + CSS), will-change com moderação. Exceção permitida: clip-path na
  transição de radar.
- Qualidade adaptativa: meça o fps nos primeiros 2,5 s; abaixo de 40, tire o
  backdrop-filter dos cards (vidro simulado com gradiente) e reduza estrelas.
- prefers-reduced-motion: sem voo nem transições, só troca com fade curto;
  números aparecem já no valor final.
- Navegação: ◀ ▶, teclado (← → e espaço = pausa), clique nos capítulos;
  autoplay com durações [10, 13, 16, 12, 12, 12, 13] s; clicar em qualquer
  elemento interativo pausa; cliques bloqueados durante as transições.
- Números em pt-BR (toLocaleString). Nenhum texto institucional; cada
  capítulo fecha com uma "Leitura" que explica os números.

VISUAL (tema claro Aurora Suplementos)
- Tokens: vermelho #e60000 (principal), bordô #7a1414 (secundária), texto
  #221a16, texto secundário #6b5f58, verde #1b8a5a, mostarda #b7791f,
  vermelho-escuro #b91c1c, neutro #4a4a4a, papel #f5f2f0.
- Bento grid de 12 colunas; cards com cantos de 24 px, vidro fosco leve
  (backdrop-filter blur 8px + borda de 1 px) e sombras suaves em camadas;
  hover com elevação de 3 px (sombra extra por opacidade de pseudo-elemento).
- Tipografia forte: números principais em clamp(72px, 9vw, 140px), peso 800;
  rótulos pequenos em caixa alta com espaçamento largo.
- Fundo vivo: estrelas em 3 camadas com parallax do mouse, que esticam em
  linhas (warp) nas trocas; grade sutil com máscara radial; um brilho radial
  que muda de posição a cada capítulo.
- HUD: marca "Falcon Telemetria", linha da missão (código AAAA-MM, CD Aurora,
  Aurora Suplementos, mês por extenso), selo "Dados auditados · gerado …",
  relógio T−/T+ com ponto de status (contagem, em voo, em espera, pouso) e
  barra de progresso da missão no topo.
- Rodapé: trilha da missão em arco com 7 marcadores; a mini nave (SVG) anda
  por ela, inclina, acelera e estabiliza a cada troca, com rastro de
  partículas; o trecho já percorrido fica vermelho.
- Foguete em SVG: coifa vermelha, corpo branco com faixas, janela, aletas
  bordô, sino do motor, chama em 3 camadas com flicker, brilho de calor na
  coifa para a reentrada.

CAPÍTULOS
01 Ignição — card herói vermelho com o total de pedidos; 4 KPIs (faturados,
   unidades apontadas, unidades recebidas, acurácia do inventário) com barra;
   faixa com valor B2B, clientes B2B, ticket médio e emissão→romaneio; card
   de lançamento com o foguete no pad e a telemetria (Coifa · Faturamento,
   Estágio 2 · Conferência, Interestágio · Separação, Estágio 1 ·
   Recebimento, Motores · Equipe). Sequência: contagem 3-2-1, fumaça,
   tremor leve da tela, chama crescendo, decolagem acelerando e saindo pelo
   topo com rastro. Leitura: faturados e incompletos.
02 Trajetória — 7 estágios (Recebimento, Armazenagem, Separação,
   Conferência, Faturamento, Transporte, Retorno) ligados por partículas;
   clique abre card com 4 métricas e a leitura do estágio.
03 Pulso — relógio radial com um raio por dia (pedidos por fora, unidades
   apontadas por dentro, fim de semana esmaecido), varredura de radar,
   painel do dia com 6 séries e régua. Leitura: pico, média dias úteis ×
   fim de semana, maior dia de conferência.
04 Canais — barras B2B×B2C (pedidos, linhas, unidades), unidades por pedido
   em número grande, órbita dos marketplaces B2C (área ∝ pedidos), top
   clientes B2B por valor. Leitura: B2C pesa em pedidos, B2B em volume.
05 Tripulação — ranking de conferentes (total / por dia), movimentações por
   hora com o pico destacado, ranking de operadores.
06 Alcance — mapa do Brasil em blocos por UF (intensidade ∝ pedidos),
   detalhe da UF clicada, transportadoras com prazo mediano (verde ≤ 5 d,
   mostarda ≤ 8 d, vermelho > 8 d).
07 Retorno — devoluções (ofensores e motivos), avarias, pedidos incompletos
   e ofensor logística em anéis, card de pouso: reentrada com brilho de
   calor, motor de pouso, toque com poeira e fim da chama; o relógio para.
   Botão "Reiniciar missão".

TRANSIÇÕES (600–900 ms; ao voltar com ◀, tocar o mesmo efeito ao contrário)
- Ignição → Trajetória: decolagem — a cena sobe e sai, a próxima entra por
  baixo, um foguete cruza a tela com brilho de exaustão.
- Trajetória → Pulso: varredura de radar revelando a próxima cena em círculo.
- Pulso → Canais: cortina diagonal vermelha com linhas de velocidade; a troca
  acontece com a tela coberta.
- Canais → Tripulação: separação de estágio — a cena se divide em duas
  metades numa linha incandescente e elas se afastam.
- Tripulação → Alcance: zoom de aproximação com linhas radiais (túnel).
- Alcance → Retorno: desfoque de movimento (cópias fantasmas) + brilho de
  reentrada.
- Em transições com "espera", ponha a curva de aceleração em cada trecho
  dos keyframes e deixe a curva geral linear.
- Dentro de cada capítulo, elementos entram em cascata (40–80 ms) com
  fill "backwards", para não prender o transform do hover.

VERIFICAÇÃO OBRIGATÓRIA
Abra num navegador headless em 1440×900 e 390×800: zero erros de console,
sem rolagem lateral, os 7 capítulos e as 6 transições funcionando nos dois
sentidos, pouso parando o relógio, modo de movimento reduzido sem animação.
Mostre capturas da ignição, de uma transição no meio e do pouso.
```
