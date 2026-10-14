# Falcon/MotionG — passo a passo

**MotionG** é o motion graphic interativo do Falcon: o resultado do mês contado como uma missão espacial, em 7 capítulos (Ignição, Trajetória, Pulso, Canais, Tripulação, Alcance, Retorno), com o foguete decolando, a mini nave avançando na trilha da missão e pousando no fim. Paleta do tema claro Aurora Suplementos (vermelho `#e60000`, bordô `#7a1414`, fundo claro).

Referência pronta: [`motion/telemetria-2026-09-im.html`](../motion/telemetria-2026-09-im.html) (setembro de 2026).
Prompt para pedir ou recriar: [`PROMPT.md`](PROMPT.md).

## O que tem nesta pasta

| Arquivo | Para quê |
|---|---|
| `template/motiong.tpl.html` | O motion graphic completo, com 3 lacunas: `__DATA__` (dados), `__PERIODO__` (mês) e `{{TITULO}}`/`{{CODIGO}}`/`{{EXTENSO}}` (cabeçalho). Visual, animações e regras de cálculo ficam aqui. |
| `tools/extrair_dados.py` | Lê o HTML exportado do **Resumo Mensal e Anual** e gera `dados.json` (o `D`) e `periodo.json` (o `PER`). |
| `tools/montar.py` | Junta template + dados e grava o HTML final em `motion/`. |
| `tools/verificar.js` | Abre no navegador (Playwright) e confere erros, rolagem lateral, os 7 capítulos e o pouso; com `--ref`, compara textos e números com outro arquivo. |

## Pré-requisitos

- Python 3 (sem bibliotecas extras).
- Para a verificação: Node 18+ e Playwright (`npm i -D playwright` e `npx playwright install chromium` na sua máquina; nas sessões do Claude na nuvem já vem instalado).
- O arquivo exportado do Resumo Mensal e Anual do Controle Geral CDA, no formato `resumo-mensal-anual_AAAA-MM-DD_AAAA-MM.html`.

## Passo a passo

**1. Exporte o resumo do mês.** No Controle Geral CDA, abra o Resumo Mensal e Anual, escolha o mês **fechado** e exporte o HTML.

**2. Extraia os dados.**
```bash
python3 -I MotionG/tools/extrair_dados.py caminho/resumo-mensal-anual_2026-11-05_2026-10.html --mes 2026-10
```
A saída mostra o mês, o número de dias, a quantidade de indicadores e uma conferência (soma diária de pedidos = indicador de pedidos). Se aparecer **(PARCIAL)**, o mês ainda não fechou.

**3. Revise as leituras** (lista abaixo). A maioria se ajusta sozinha; algumas frases são interpretações fixas e precisam de um olhar humano a cada mês.

**4. Monte o HTML.**
```bash
python3 -I MotionG/tools/montar.py
```
Grava em `motion/telemetria-AAAA-MM-im.html` (use `--saida` para outro nome).

**5. Verifique.**
```bash
node MotionG/tools/verificar.js motion/telemetria-2026-10-im.html --fotos /tmp/fotos
```
Tem que terminar em **Tudo certo.** Para conferir que nada de dados mudou depois de mexer só no visual, compare com a versão anterior do mesmo mês: `--ref caminho/da/versao-anterior.html`.

**6. Salve e publique.** Adicione a linha do mês na tabela **Motion** do `README.md` da raiz, faça commit e push no branch de trabalho.

## Revisão das leituras a cada mês

**Já se ajustam sozinhas** (o template escolhe a frase conforme o dado):
- Armazenagem: "Saídas superaram entradas" ou "Entradas superaram saídas".
- Separação: "mais de um turno e meio por item" só aparece se o tempo médio passar de 12 h.
- Tripulação: "queda no almoço (12h)" só aparece se 12h for menor que 11h.
- Alcance: a frase "X concentra…" usa o estado com mais pedidos (em setembro, SP).
- Retorno e estágio Retorno: "têm origem …" usa o maior ofensor do mês.
- Canais: "mas só" vira "e" quando a fatia de unidades do B2C não for menor que a de pedidos.
- Pulso: o relógio usa o número real de dias do mês (28 a 31).

**Confira à mão** (frases interpretativas fixas no template):
- Ignição: "O ponto de atenção é a completude" — continua verdade se os incompletos forem o maior problema.
- Trajetória › Faturamento: "Faturar não é o gargalo; a completude é".
- Canais: subtítulo "B2C domina em pedidos; B2B domina em volume." e "… sozinha soma …% do B2C".
- Tripulação: "mas o maior ritmo é de …" — se o líder em total for o mesmo do ritmo, reescreva.
- Retorno: "Erro de separação são N linhas: pequeno, mas …".
- Canais › órbita: canais B2C sem nome aparecem como "Canal NN"; acima de 8 marketplaces, ajuste `PH` (fases da órbita).
- Alcance › mapa: um código de UF novo precisa de posição em `POS`.

Para mudar uma frase, edite o texto dentro de `template/motiong.tpl.html` (procure pela frase) e monte de novo.

## Pedido rápido ao Claude

Com este repositório aberto, anexe o HTML exportado e escreva:

> Monte o Falcon/MotionG de outubro de 2026 com o arquivo anexo.

O Claude segue este passo a passo (skill `falcon-motiong`), revisa as leituras, gera, verifica, salva no GitHub e te envia o arquivo.

## Onde mexer no template

| Quero mudar | Procure no template |
|---|---|
| Cores | bloco `:root` no início do `<style>` |
| Tempo de cada capítulo no autoplay | `const DUR = [10000, 13000, 16000, 12000, 12000, 12000, 13000]` |
| Transições | `const TX = [` (uma função por troca de capítulo) |
| Contagem, decolagem, pouso | `function ignite`, `function liftoff`, `function landing` |
| Estrelas e warp | `const LAYERS` e `function warp` |
| Limite da qualidade adaptativa | `perf.n * 1000 / (now - perf.t0) < 40` |

## Cuidados

- Esta pasta traz apenas a **documentação** e o HTML de exemplo (`../falcon-motiong/index.html`), com dados fictícios.
- O kit de scripts citado acima (`template/`, `tools/`) roda sobre exportações do sistema de origem e **não está neste repositório**; o HTML publicado é a saída final do processo.
- Não edite o `D` dentro do HTML gerado: corrija na fonte e rode a extração de novo.
