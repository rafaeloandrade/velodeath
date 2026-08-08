# VELODEATH KEIRIN

**v0.1.0 — Death Pacer Test**

Primeira base funcional em Phaser 3.90.0.

## Já funciona
- Velódromo superior e sentido anti-horário corrigido.
- 7 ciclistas em fila única.
- Morte em chopper como pacer.
- Rider 4 (azul) é o jogador nesta versão.
- `←` e `→` alternados geram potência.
- Cadência, stamina e Flow.
- Pacer acelera progressivamente de 36 a 48 km/h.
- Objetivo: acompanhar a Morte durante 3 voltas.
- HUD compacto em uma única tela.

## Controles
- `ESPAÇO` iniciar.
- `←` `→` pedalar alternadamente.
- `R` reiniciar.

## Teste local
Esta versão não carrega imagens ou sons locais; o Phaser é carregado pela internet via CDN. Por isso, em muitos navegadores você ainda consegue abrir `index.html` diretamente.

Para o fluxo definitivo, use um servidor local:

```bash
python3 -m http.server 8000
```

Depois abra `http://localhost:8000`.

## GitHub Pages — primeira publicação
1. Crie um repositório chamado, por exemplo, `velodeath-keirin`.
2. Faça upload **do conteúdo desta pasta**, não da pasta ZIP.
3. Abra `Settings` → `Pages`.
4. Em `Build and deployment`, selecione `Deploy from a branch`.
5. Branch: `main`.
6. Folder: `/ (root)`.
7. `Save`.
8. Aguarde a URL aparecer.

Exemplo:
`https://SEU-USUARIO.github.io/velodeath-keirin/`

## Como atualizar versões
Quando eu gerar uma atualização, vou informar quais arquivos:
- substituir;
- adicionar;
- manter.

Use commits separados. Exemplo:
- `v0.1.0 - Death Pacer`
- `v0.2.0 - Tutorial e Fate Draw`
- `v0.3.0 - Player Select`

## Estrutura
```text
velodeath-keirin/
├── index.html
├── style.css
├── README.md
├── CHANGELOG.md
└── js/
    ├── main.js
    └── scenes/
        ├── BootScene.js
        └── PacerScene.js
```
