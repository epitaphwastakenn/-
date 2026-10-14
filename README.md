# Purrvivors 🐾

**Purrvivors** é um *survivors-like* (no estilo Vampire Survivors / Survivor.io) em pixel art fofinha para Android.
Você controla gatinhos aventureiros que atravessam 5 terras invadidas por hordas de monstros até enfrentar **Cérbero, o Cão do Abismo**.

- 🎮 Uma mão só: arraste o dedo em qualquer lugar da tela para andar; as armas atacam sozinhas.
- ⚔️ 14 armas, cada uma com uma **evolução** (arma no nível 5 + passivo certo → próximo baú).
- 👑 5 chefes com padrões de ataque próprios (Rei Gosma, Ancião Carvalho, Yeti Colossal, Conde Ratácula e Cérbero) + 5 elites.
- 🐱 7 gatos jogáveis, cada um com arma inicial e bônus.
- 🔁 Roguelite estilo Dead Cells: morrer volta ao início, mas as moedas compram **melhorias permanentes**, novas armas (plantas) e desbloqueiam gatos.
- ⏱️ Primeira vitória em ~3 horas (validado com simulações de campanha), depois 5 níveis de **Pesadelo**.
- 🇧🇷 Português e inglês.

## Instalar

O APK pronto está em [`dist/Purrvivors.apk`](dist/Purrvivors.apk). No celular, abra o arquivo e permita “instalar apps de fontes desconhecidas” quando o Android pedir (Android 7.0 ou mais recente).

## Como jogar

| Ação | Como |
|---|---|
| Andar | arraste o dedo (joystick aparece onde você tocar) |
| Pausar | botão `II` ou botão Voltar do Android |
| Subir de nível | escolha 1 de 3 cartas (rerrolar/pular/banir vêm das melhorias) |
| Evoluir arma | arma nível 5 + passivo par → abra um baú de elite/chefe (a partir da zona 2) |
| Entre zonas | acampamento: cura 40% e escolha de uma bênção (o progresso é salvo aqui) |

## Estrutura do projeto

```
game/            jogo (JavaScript, WebGL próprio, UI em DOM)
  src/sim/       lógica pura do jogo (roda no navegador e no Node)
  src/view/      renderização e partículas
  src/ui/        telas, HUD e modais
  src/data/      armas, inimigos, zonas, chefes, melhorias, conquistas
art/             sprites em texto (pixel art) → atlas
tools/           build de arte, áudio, web e APK + simuladores de balanceamento
android/         app nativo (WebView) que serve os arquivos do jogo
docs/            design e guia de arte
```

## Compilar

Requer Node 20+, Python 3 com Pillow, Java 17+ e ffmpeg.

```bash
npm install
npm run build        # arte + ícones + áudio + bundle web + APK assinado em dist/
```

Ferramentas úteis:

```bash
npm run web:dev && npm run shots tour   # capturas no Chromium em modo celular
npm run sim -- --runs=10                # corridas simuladas por um bot
npm run campaign                        # campanhas completas: tempo até a 1ª vitória
npm run stress                          # testa todas as armas e evoluções
```

O APK é montado sem Android Studio: `aapt2` (do Apktool), `dx` e `apksig` (Maven Central) e o `android.jar` da API 34 são baixados por `tools/setup-sdk.sh`. A assinatura usa uma chave de depuração (`android/debug.keystore`).

## Créditos

- Arte, música e efeitos sonoros: gerados por código para este projeto.
- Fontes: [Jersey 10](https://fonts.google.com/specimen/Jersey+10) e [Pixelify Sans](https://fonts.google.com/specimen/Pixelify+Sans), SIL Open Font License 1.1 (veja `game/fonts/`).
