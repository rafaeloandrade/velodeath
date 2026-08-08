# VELODEATH KEIRIN — v0.1.1

Esta é a primeira base funcional em **Phaser 3**, preparada para GitHub Pages.

## Por que existe um loader?

Na v0.1.0 o jogo dependia de uma única URL do Phaser.  
A v0.1.1 agora tenta **três fontes**, nesta ordem:

1. `https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js`
2. Phaser 3.90.0 fixo no jsDelivr
3. Phaser 3.90.0 no cdnjs

A primeira é exatamente a URL que foi testada manualmente e abriu corretamente.

O código do jogo só é carregado **depois** que o Phaser estiver disponível.

## Arquivos

```text
velodeath-keirin-v0.1.1/
├── index.html
├── style.css
├── README.md
├── CHANGELOG.md
├── .nojekyll
└── js/
    ├── phaser-loader.js
    ├── main.js
    └── scenes/
        ├── BootScene.js
        └── PacerScene.js
```

## Como subir de novo no GitHub

Como você vai apagar a versão anterior, faça assim pela interface web:

1. Entre no repositório.
2. Remova os arquivos antigos ou crie novamente o repositório.
3. Descompacte este ZIP.
4. Entre **dentro** da pasta `velodeath-keirin-v0.1.1`.
5. No GitHub, use **Add file → Upload files**.
6. Arraste todos os arquivos e a pasta `js`.
7. Confirme com **Commit changes**.

Depois configure:

**Settings → Pages → Deploy from a branch → main → / (root)**.

## Teste

No GitHub Pages, o endereço será parecido com:

`https://SEU-USUARIO.github.io/velodeath-keirin/`

### Teste local

Você ainda pode tentar abrir `index.html` diretamente.

Porém o próprio Phaser recomenda desenvolvimento por `http://`, pois navegadores impõem restrições a páginas abertas via `file://`.

No macOS, a forma mais simples é abrir o Terminal dentro da pasta e executar:

```bash
python3 -m http.server 8000
```

Depois abra:

`http://localhost:8000`

## Controles

- `ESPAÇO`: iniciar.
- `←` + `→`: pedalar alternadamente.
- `R`: reiniciar.

## Objetivo atual

O Rider 4 (azul) deve acompanhar a Morte durante três voltas.

Esta versão testa:

- geometria anti-horária;
- Death Pacer;
- fila de 7 riders;
- cadência;
- stamina;
- flow;
- HUD compacto.

Ainda não existem ultrapassagens ou troca de linha.
