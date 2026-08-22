(() => {
  const status = document.getElementById('boot-status');
  const bootMessage = document.getElementById('boot-message');
  const errorBox = document.getElementById('load-error');
  const errorMessage = document.getElementById('error-message');

  const PHASER_SOURCES = [
    'https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js',
    'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/phaser/3.90.0/phaser.min.js'
  ];

  const GAME_SCRIPTS = [
    'js/scenes/BootScene.js',
    'js/scenes/TitleScene.js',
    'js/scenes/HowToPlayScene.js',
    'js/scenes/CreditsScene.js',
    'js/scenes/RiderSelectScene.js',
    'js/scenes/FateScene.js',
    'js/scenes/PacerScene.js',
    'js/main.js'
  ];

  function setStatus(message) {
    bootMessage.textContent = message;
    console.log('[VELODEATH]', message);
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = false;

      script.onload = () => resolve(src);
      script.onerror = () => {
        script.remove();
        reject(new Error(`Falha ao carregar: ${src}`));
      };

      document.head.appendChild(script);
    });
  }

  async function loadPhaser() {
    if (window.Phaser) return;

    for (let i = 0; i < PHASER_SOURCES.length; i++) {
      const src = PHASER_SOURCES[i];
      try {
        setStatus(`Carregando Phaser... tentativa ${i + 1}/${PHASER_SOURCES.length}`);
        await loadScript(src);

        if (window.Phaser) {
          console.log('[VELODEATH] Phaser carregado de:', src);
          return;
        }
      } catch (error) {
        console.warn(error.message);
      }
    }

    throw new Error(
      'Nenhuma das três fontes de Phaser pôde ser carregada. ' +
      'Como o endereço do jsDelivr abre normalmente no navegador, teste também esta pasta pelo GitHub Pages ou por um servidor local.'
    );
  }

  async function start() {
    try {
      await loadPhaser();

      setStatus(`Phaser ${Phaser.VERSION} carregado.`);
      await new Promise(resolve => setTimeout(resolve, 180));

      for (const src of GAME_SCRIPTS) {
        setStatus(`Carregando ${src}...`);
        await loadScript(src);
      }

      status.hidden = true;
    } catch (error) {
      console.error(error);
      status.hidden = true;
      errorBox.hidden = false;
      errorMessage.textContent = error.message;
    }
  }

  start();
})();
