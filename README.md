# Controle Geral Arm/cd — BI de armazém

Painel de BI para operação de armazém/CD: recebimento, armazenagem, expedição, devolução, avarias, inventário, condições ambientais e movimentação — tudo alimentado por **planilhas exportadas do WMS/ERP**, sem integração direta com o sistema de origem.

> **Projeto de portfólio.** Esta é uma versão do sistema que uso em produção, com **dados 100% fictícios** (empresa inventada "Aurora Suplementos"; produtos, pedidos, operadores e usuários gerados por script). Nada aqui pertence a uma empresa real.

![Recebimento](docs/img/01-recebimento.png)

## O que ele resolve

A operação exportava planilhas todo dia e acompanhava os números "no olho". O Controle Geral recebe essas planilhas, trata as inconsistências conhecidas (lotes com e sem zero à esquerda, materiais fora de escopo, arquivos do tipo errado…), grava num MySQL e entrega dashboards, mapas e rankings prontos para a gestão — inclusive uma **foto offline em HTML** para enviar por e-mail/WhatsApp.

## Funcionalidades

| Área | O que mostra |
|---|---|
| **Recebimento** | Carretas, paletes, caixas, atraso, resumo do dia, evolução diária, Terceiros (com paletes estimados pelo histórico) |
| **Armazenagem** | Busca de produto somando todas as áreas (armazenagem, GLP, Arm40, bloqueado, marketing) com endereços, lote e ordem FIFO; mapa do galpão com ocupação por corredor; mapa 3D |
| **Arm40 unidades** | Estoque fracionado por unidade |
| **Expedição** | Pedidos, itens, tabela por canal (origem do pedido), atrasos |
| **Conferentes** | Ranking B2B/B2C com dias trabalhados e média por dia |
| **Qualidade** | Avarias, vencidos, devoluções, inventário cíclico, condições ambientais (temperatura/umidade) |
| **Ritmo Operacional** | Evolução diária por operador/atividade, Recebimento Total, movimentação por filial |
| **Administração** | Upload de planilhas, preenchimento manual, exportação Excel/HTML (com escolha de abas), usuários |

### Armazenagem

| Busca de produto | Mapa do galpão |
|---|---|
| ![Busca](docs/img/03-armazenagem-busca.png) | ![Mapa](docs/img/04-armazenagem-mapa.png) |

![Corredor 3D](docs/img/05-armazenagem-corredor-3d.png)

### Mais telas

| | |
|---|---|
| ![Resumo do dia](docs/img/02-recebimento-resumo-do-dia.png) | ![Terceiros](docs/img/10-recebimento-terceiros.png) |
| ![Arm40](docs/img/06-arm40-unidades.png) | ![Condições ambientais](docs/img/11-condicoes-ambientais.png) |
| ![Expedição](docs/img/07-expedicao.png) | ![Expedição por canal](docs/img/08-expedicao-canais.png) |
| ![Conferentes](docs/img/09-conferentes.png) | ![ARM3D](docs/img/12-arm3d.png) |
| ![Ritmo — recebimento total](docs/img/13-ritmo-recebimento-total.png) | ![Ritmo — expedição](docs/img/14-ritmo-expedicao.png) |
| ![Tema escuro](docs/img/17-tema-escuro-armazenagem.png) | ![Login](docs/img/00-login.png) |

### Administração

| Preenchimento manual | Exportar HTML offline |
|---|---|
| ![Admin](docs/img/15-admin-upload.png) | ![Exportar](docs/img/16-admin-exportar-html.png) |

## Decisões de engenharia

- **Ingestão resiliente de planilhas.** Leitura em *streaming* (ExcelJS) para arquivos grandes; um registro de tipos de upload (`server/ingest/registry.ts`) define aba, colunas e tratamento de cada formato. Se nenhuma linha for lida (arquivo/aba errados), o upload **falha com mensagem clara e mantém os dados anteriores**.
- **Substituição por escopo, não acumulação.** Cada tipo de upload substitui o seu escopo (a movimentação, por filial), evitando duplicidade quando a mesma exportação é reenviada.
- **Normalização de lote.** Lotes chegam ora com zero à esquerda, ora sem — o que quebra a ordem FIFO. São normalizados na entrada (a migration 022 corrige o legado).
- **Cubo de dados.** `server/kpis/cube.ts` guarda fatos granulares dia × dimensão; os filtros de período do front recalculam os KPIs sem novas consultas.
- **Estimativa de paletes de Terceiros.** Quando a nota não informa paletes, estima-se pelo histórico do mesmo produto (mínimo de amostras e de consistência, com teto por linha) e o valor aparece marcado com "≈".
- **Caixas.** Calculadas pela quantidade por embalagem do cadastro; para itens sem fator usa-se a média un/cx histórica.
- **HTML offline.** A exportação embute os dados no próprio arquivo — abre em qualquer navegador, sem servidor nem login — e permite escolher quais abas entram.
- **Migrations versionadas** (`server/db/migrations`, 001–023), idempotentes e registradas em `_migrations`.
- **Segurança.** Login com cookie HTTP-only + JWT, senhas com hash (bcrypt), `.env` fora do git, credencial do admin inicial só por variável de ambiente.

## Stack

TypeScript · Node 20+ · Express · MySQL/MariaDB · React + Vite · ExcelJS · dashboards em JS puro servidos como páginas (`server/views`).

## Como rodar com os dados fictícios

Pré-requisitos: Node 20+ e um MySQL/MariaDB local.

```bash
npm install
cp .env.example .env        # ajuste as credenciais do seu MySQL local
npm run migrate             # cria as tabelas
npm run seed                # cria o admin (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD do .env)
npm run dev                 # front em :5173, API em :3070
```

Entre em `http://localhost:5173`, vá em **Administração → Upload de planilhas** e envie os arquivos da pasta [`dados_exemplo/`](dados_exemplo) (um por tipo; a movimentação tem um arquivo por filial). Os dashboards passam a mostrar os números da empresa fictícia.

Para gerar outro conjunto de dados (semente fixa, reproduzível):

```bash
pip install openpyxl
python scripts/gerar_dados_ficticios.py
```

### Build de produção

```bash
npm run build
npm start        # migra o schema e sobe o Express servindo API + front
npm run typecheck
```

## Estrutura

```
server/
  ingest/       leitores de planilha por tipo (+ registry)
  kpis/         indicadores, cubo, paletes, caixas, mapas
  routes/       API (auth, dashboard, uploads, export, usuários)
  views/        dashboards em HTML/JS puro (Controle Geral e Ritmo)
  db/           pool, migrations, seed
src/            app React (login, layout, administração)
dados_exemplo/  planilhas fictícias prontas para upload
scripts/        gerador de dados fictícios
docs/img/       prints
```

## Outros projetos

Além do sistema principal, este repositório reúne dashboards, mapas e análises que montei para a operação de armazém/CD. Cada um é um HTML autocontido (abre direto no navegador) em [`docs/projetos/`](docs/projetos), e a vitrine está em [`docs/index.html`](docs/index.html) (pronta para o GitHub Pages: *Settings → Pages → Branch `main` / pasta `/docs`*).

| Projeto | Área | O que mostra | Tecnologias |
|---|---|---|---|
| [Controle Geral](docs/projetos/controle-geral/index.html) | Operação | Dashboard principal do CD: recebimento, armazenagem, expedição, devoluções, avarias, conferentes e movimentação, com filtros por período, turno e transportadora e três temas visuais. | HTML · JavaScript · cubo de dados dia × dimensão |
| [Orbital Twin](docs/projetos/orbital-twin/index.html) | Gêmeo digital | Gêmeo digital 3D do galpão com ocupação por nível, fluxo de carretas, replay diário e um painel de alertas automáticos ("IA operacional") por regras auditáveis. | HTML · SVG/Canvas · JavaScript |
| [Ritmo Operacional](docs/projetos/ritmo-operacional/index.html) | Produtividade | Evolução diária por conferente e atividade: expedição por canal, pedidos colocados e produtividade da equipe. | HTML · JavaScript |
| [Mapa do Galpão](docs/projetos/mapa-do-galpao/index.html) | Layout e capacidade | Planta baixa interativa com Lado A, E-COM e Lado B, simulador de ocupação e capacidade antes e depois do projeto de extensão. | HTML · SVG · JavaScript |
| [Projeto de Extensão do Galpão (A + B)](docs/projetos/projeto-extensao-galpao/index.html) | Layout e capacidade | Maquete isométrica da extensão dos Lados A e B: capacidade bruta, vagas inoperantes (colunas e túnel) e operantes por rua. | HTML · SVG · JavaScript |
| [Extensão do Galpão O–Y](docs/projetos/extensao-galpao-o-y/index.html) | Layout e capacidade | Versão inicial da maquete: 19 corredores atuais e 17 ruas de extensão, com regra de perda por coluna e túnel. | HTML · SVG · JavaScript |
| [Acuracidade do Inventário](docs/projetos/inventario-acuracidade/index.html) | Qualidade | Acuracidade do inventário por rua (corretos ÷ (sistema + entrada)), com semáforo de meta, rosca geral e tabela de divergências. | HTML · JavaScript |
| [Consolidado do Inventário (1ª e 2ª contagem)](docs/projetos/inventario-consolidado/index.html) | Qualidade | Consolidado de contagem cega: posições a dar entrada e a limpar, por rua e conferente, com detecção de conflitos e reconferência. | HTML · JavaScript |
| [Torre de Classificação de Estoque](docs/projetos/torre-classificacao-estoque/index.html) | Supply chain | Classificação ABC / XYZ / FSN / VED dos SKUs: volume, variabilidade, giro e criticidade, com filtros e combinações de classe. | HTML · JavaScript |
| [Painel Gerencial · Julho](docs/projetos/painel-gerencial-julho/index.html) | Gestão | Painel mensal com visão geral, movimentação, operadores, devoluções (motivos, ofensor, plano de ação) e recebimento entre unidades. | HTML · Chart.js |
| [Painel Gerencial · Junho](docs/projetos/painel-gerencial-junho/index.html) | Gestão | Mesmo painel no mês anterior, para comparação (variação líquida de estoque, devoluções e produtividade). | HTML · Chart.js |
| [Falcon · Guia de Expedição](docs/projetos/falcon-guia-expedicao/index.html) | Documentação | Guia de operação da expedição em formato de manual técnico: do pedido à entrega, com gráficos, SKUs, atrasos e plano de ação. | HTML · CSS · JavaScript |
| [Falcon / MotionG](docs/projetos/falcon-motiong/index.html) | Motion graphic | O resultado do mês contado como uma missão espacial, em 7 capítulos animados (Ignição, Trajetória, Pulso, Canais, Tripulação, Alcance, Retorno). | HTML · CSS · JavaScript · SVG · Web Animations API |
| [Falcon · Resumo Mensal](docs/projetos/falcon-resumo-mensal/index.html) | Gestão | Resumo mensal exportável que alimenta o MotionG: indicadores do mês, canais, transportadoras, UFs e devoluções. | HTML · JavaScript |
| [ORION · Centro de Comando Logístico](docs/projetos/orion-centro-de-comando/index.html) | Conceito visual | Protótipo de centro de comando com estética HUD: KPIs, docas, frota, gêmeo digital do fluxo e insights preditivos (dados simulados). | HTML · CSS · SVG · Canvas |

> Nomes de pessoas, clientes, fornecedores, produtos e marcas desses projetos são fictícios.

## Licença

MIT — veja [LICENSE](LICENSE).

## Aviso

Todos os nomes, códigos, lotes, pedidos, usuários e números são sintéticos. Qualquer semelhança com dados reais é coincidência.
