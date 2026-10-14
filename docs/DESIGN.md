# Purrvivors — Documento de Design

> Survivors-like (estilo Vampire Survivors / Survivor.io) em pixel art fofinha, para Android (retrato).
> Você é um gatinho aventureiro atravessando 5 terras invadidas por hordas até enfrentar Cérbero, o Cão do Abismo.

## 1. Pilares

1. **Uma mão só**: joystick flutuante (toque em qualquer lugar), armas atiram sozinhas.
2. **Poder crescente**: a cada nível você escolhe 1 de 3 cartas; armas no nível máximo + o passivo certo **evoluem** em versões absurdas.
3. **Roguelite estilo Dead Cells**: uma corrida atravessa 5 zonas em sequência; morrer volta ao início, mas as moedas ficam e compram melhorias permanentes, novas armas (plantas) e novos gatos.
4. **Meta de ~3 horas** para zerar a primeira dificuldade; depois disso 5 níveis de Pesadelo.

## 2. Estrutura da corrida

| Zona | Nome | Duração das ondas | Elite (meio) | Chefe |
|---|---|---|---|---|
| 1 | Prado Florido | 4:00 | Slime Rei-Mirim | **Rei Gosma** (salta, ondas de choque, cospe gosma) |
| 2 | Bosque Sussurrante | 5:00 | Lobo Alfa | **Ancião Carvalho** (raízes em linha, chuva de bolotas, invoca cogumelos) |
| 3 | Picos Nevados | 5:00 | Pinguim Imperador | **Yeti Colossal** (pisão, bolas de neve gigantes, espinhos de gelo, nevasca) |
| 4 | Cripta Assombrada | 5:30 | Abóbora Maldita | **Conde Ratácula** (teleporte, enxame de morcegos, espirais de sangue) |
| 5 | Abismo Vulcânico | 6:00 | Golem de Magma | **Cérbero** (3 cabeças: fogo, gelo e vazio; fase 2 enfurecida) |

- Chefe: ao fim do tempo uma **arena** (cerca de cristais) se fecha ao redor do jogador; ondas normais param.
- Ao derrotar o chefe: baú grande (pode evoluir armas), depois a tela de **Acampamento**: cura 30% e escolha de 1 entre 3 **Bênçãos**. O jogo salva aqui (dá para fechar o app e continuar).
- Corrida completa ≈ 30 min. Morte típica das primeiras corridas: zona 1–2 (6–12 min).

## 3. Combate e progressão dentro da corrida

- 6 espaços de arma + 6 de passivo. Armas e passivos têm 5 níveis.
- **Evolução**: arma nível 5 + passivo par (qualquer nível) → próximo baú (elite/chefe) evolui a arma.
- Level-up: 3 cartas (4 com sorte alta). Recursos limitados: **Rerrolar**, **Pular**, **Banir** (vindos de melhorias permanentes).
- Coletáveis: gemas de XP (azul 1, verde 5, roxa 25), moedas, peixe (cura), ímã, bomba de novelo, relógio (congela), baús.
- Objetos quebráveis (vasos, lanternas, caixotes) espalhados soltam coletáveis.
- Elites são maiores, têm aura e uma habilidade; sempre soltam baú.

## 4. Armas (14) e evoluções

| Arma | Mecânica | Passivo par | Evolução |
|---|---|---|---|
| Garra Felina | Corte em arco na direção do movimento | Afiador (dano) | **Fúria do Tigre** — garras em X ao redor, sangramento |
| Novelo Saltitante | Bolas que quicam nas bordas da tela e nos inimigos | Patinhas Velozes (velocidade) | **Novelo Cósmico** — novelo gigante que se divide a cada acerto |
| Ponteiro Laser | Feixe instantâneo que atravessa tudo em linha | Lupa (área) | **Raio Orbital** — laser do céu varre um círculo ao redor |
| Peixe Bumerangue | Vai e volta atravessando inimigos | Dente de Tubarão (crítico) | **Tubarãorangue** — tubarão gigante em espiral |
| Nuvem de Catnip | Aura de dano que desacelera | Almofada (regeneração) | **Tempestade de Catnip** — aura enorme, empurra, cura ao matar |
| Orbes Lunares | Orbes girando ao redor | Livro de Feitiços (XP) | **Eclipse** — 2 anéis permanentes em sentidos opostos |
| Sino do Trovão | Raios em inimigos aleatórios | Despertador (recarga) | **Sinfonia da Tempestade** — raios em cadeia |
| Garrafa de Leite | Arremessa garrafas que deixam poças de dano | Biscoito (vida máx.) | **Via Láctea** — poças viram galáxias que puxam inimigos |
| Grous de Papel | Projéteis teleguiados | Pena (vel. projétil) | **Mil Tsurus** — fluxo de grous que explodem em confete |
| Shuriken | Rajada rápida na direção do movimento | Bigodes (ímã) | **Tempestade de Lâminas** — espiral em 8 direções que ricocheteia |
| Drone Ratinho | Drones que seguem e atiram | Armadura de Papelão (armadura) | **Esquadrilha Robô** — mísseis teleguiados explosivos |
| Fogos de Artifício | Foguetes que explodem em área | Moeda da Sorte (ouro) | **Grande Final** — explosões em cascata que soltam moedas |
| Sopro Gélido | Cone de gelo que congela | Ampulheta (duração) | **Era do Gelo** — nova congelante + estilhaços |
| Gatos Fantasmas | Gatinhos espectrais que avançam em linha | Trevo (sorte) | **Nove Vidas** — 9 gatos em órbita que investem sem parar |

Desbloqueadas no início: Garra, Novelo, Peixe, Catnip, Orbes, Sino, Garrafa. As outras 7 aparecem como **Plantas** (blueprints) dropadas por chefes/elites e são compradas no Arsenal.

## 5. Passivos (14)

Afiador (+dano), Patinhas Velozes (+velocidade), Lupa (+área), Dente de Tubarão (+crítico), Almofada (+regeneração), Livro de Feitiços (+XP), Despertador (−recarga), Biscoito (+vida máx.), Pena (+vel. projétil), Bigodes (+ímã), Armadura de Papelão (−dano recebido), Moeda da Sorte (+ouro), Ampulheta (+duração), Trevo (+sorte).

## 6. Gatos (personagens)

| Gato | Arma inicial | Bônus | Como desbloquear |
|---|---|---|---|
| Bigode (malhado laranja) | Garra Felina | +10% vida | inicial |
| Luna (bruxa preta) | Orbes Lunares | +10% área | derrotar o Rei Gosma |
| Kenzo (ninja cinza) | Shuriken | +10% velocidade, +5% crítico | derrotar o Ancião Carvalho |
| Mimi (confeiteira branca) | Garrafa de Leite | +0,3 vida/s | 2.500 abates no total |
| Faísca (inventor laranja) | Drone Ratinho | −8% recarga | derrotar o Yeti Colossal |
| Nix (gato fantasma) | Gatos Fantasmas | +15% sorte | derrotar o Conde Ratácula |
| Sir Ronronaldo (realeza) | Novelo Saltitante | +25% ouro, +5% dano | zerar o jogo |

## 7. Meta-progressão

- **Moedas** caem de inimigos, elites, chefes, baús e conquistas; ficam mesmo ao morrer.
- **Melhorias permanentes** (Arranhador): Força, Vitalidade, Armadura, Regeneração, Agilidade, Ímã, Recarga, Alcance, Velocidade de Projétil, Duração, Crescimento, Sorte, Ganância, Crítico, Quantidade, Reviver, Rerrolar, Pular, Banir.
- **Arsenal**: compra das armas/passivos cujas Plantas foram encontradas + livro de receitas de evolução.
- **Conquistas**: metas com recompensas em moedas e desbloqueios.

## 8. Dificuldades

Normal → Pesadelo I…V (desbloqueia a próxima ao zerar a anterior). Cada nível aumenta vida/dano/velocidade dos inimigos, frequência de elites, reduz curas, e multiplica as moedas ganhas.

## 9. Metas de balanceamento

- Sem melhorias: morrer na zona 2 (às vezes 3).
- Primeira vitória após ≈ 2,5 h de corridas (≈ 3 h contando menus), validado por simulação com bot (`npm run sim`).
- Uma corrida vitoriosa ≈ 30 min, ~nível 50, 3–5 evoluções.

## 10. Tecnologia

- Jogo em JavaScript (WebGL próprio com lote de sprites, UI em DOM), empacotado com esbuild.
- APK: WebView nativa servindo os arquivos de `assets/` via `https://appassets.androidplatform.net` (sem internet), salvamento em `SharedPreferences` + `localStorage`.
- Lógica do jogo independente de renderização → roda no Node para simulações de balanceamento.
- Arte: sprites em texto (`art/*.txt`) com paleta nomeada → atlas PNG gerado por `tools/build_art.py`.
- Áudio: efeitos e músicas chiptune sintetizados por código (`tools/audio/`), sem direitos autorais.
