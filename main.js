(function () {
  'use strict';

  if (!window.PIXI) {
    console.error('PixiJS failed to load');
    return;
  }

  // ---------- PixiJS Setup ----------
  const gameContainer = document.getElementById('gameWrap');
  const originalCanvas = gameContainer.querySelector('#game');

  // Canvas dimensions
  const CW = 960;
  const CH = 480;

  // Create PixiJS app and let it create its own canvas
  const app = new PIXI.Application({
    width: CW,
    height: CH,
    backgroundColor: 0x1a1820,
    antialias: true,
    resolution: 1,
    preferWebGL: true
  });

  // Replace original canvas with PixiJS canvas
  originalCanvas.style.display = 'none';
  gameContainer.insertBefore(app.view, originalCanvas);

  // Style the canvas
  app.view.style.display = 'block';
  app.view.style.imageRendering = 'pixelated';
  app.view.style.cursor = 'pointer';

  const groundH = 66;
  const groundY = CH - groundH;
  const PIXELS_PER_METER = 12;

  // Create render layers
  const bgLayer = new PIXI.Container();
  const gameLayer = new PIXI.Container();
  const playerLayer = new PIXI.Container();
  app.stage.addChild(bgLayer, gameLayer, playerLayer);

  // Motion blur filter
  const motionBlurFilter = new PIXI.BlurFilter();
  gameLayer.filters = [motionBlurFilter];

  const STORAGE_KEY = 'bistroDash_highScore_v1';
  let highScore = parseFloat(localStorage.getItem(STORAGE_KEY) || '0');
  document.getElementById('bestVal').textContent = Math.floor(highScore);

  // ---------- Avatar selection ----------
  let selectedAvatar = 'boy';
  const cardBoy = document.getElementById('cardBoy');
  const cardGirl = document.getElementById('cardGirl');

  function drawAvatarPreview(cv, type) {
    const c = cv.getContext('2d');
    c.clearRect(0, 0, 90, 90);
    drawCharacter(c, 45, 78, type, 'run', 0);
  }
  drawAvatarPreview(cardBoy.querySelector('canvas'), 'boy');
  drawAvatarPreview(cardGirl.querySelector('canvas'), 'girl');

  cardBoy.addEventListener('click', () => selectAvatar('boy'));
  cardGirl.addEventListener('click', () => selectAvatar('girl'));
  function selectAvatar(type) {
    selectedAvatar = type;
    cardBoy.classList.toggle('selected', type === 'boy');
    cardGirl.classList.toggle('selected', type === 'girl');
  }

  // ---------- Character drawing ----------
  function drawCharacter(c, baseX, baseY, type, state, frame) {
    c.save();
    c.translate(baseX, baseY);
    const skin = '#e8b98a';
    const hairBoy = '#3d2b1f';
    const hairGirl = '#7a3327';
    const outfitBoy = '#3fa89b';
    const outfitGirl = '#e2665a';
    const outfit = type === 'boy' ? outfitBoy : outfitGirl;
    const hair = type === 'boy' ? hairBoy : hairGirl;
    const bob = Math.sin(frame * 0.35) * (state === 'run' ? 3 : 0);

    if (state === 'crawl') {
      c.translate(0, -14);
      c.fillStyle = '#2b3a3f';
      c.fillRect(-16, -2, 14, 8);
      c.fillRect(6, -2, 14, 8);
      c.fillStyle = outfit;
      c.fillRect(-20, -16, 40, 16);
      c.fillStyle = skin;
      c.fillRect(14, -24, 16, 14);
      c.fillStyle = hair;
      if (type === 'boy') {
        c.fillRect(14, -26, 16, 6);
      } else {
        c.fillRect(12, -26, 20, 8);
        c.fillRect(10, -20, 4, 10);
      }
      c.fillStyle = skin;
      c.fillRect(20, -10, 14, 6);
      c.restore();
      return;
    }

    const legSwing = state === 'jump' ? 8 : Math.sin(frame * 0.5) * 10;
    c.strokeStyle = outfit;
    c.fillStyle = outfit;

    c.fillStyle = '#2b3a3f';
    c.save();
    c.translate(-4, -2);
    c.rotate(legSwing / 60);
    c.fillRect(-4, 0, 9, 26);
    c.restore();
    c.save();
    c.translate(4, -2);
    c.rotate(-legSwing / 60);
    c.fillRect(-5, 0, 9, 26);
    c.restore();

    c.fillStyle = outfit;
    c.fillRect(-13, -46 + bob, 26, 32);
    c.fillStyle = 'rgba(255,255,255,.25)';
    c.fillRect(-13, -46 + bob, 26, 6);

    c.save();
    c.translate(-10, -40 + bob);
    c.rotate(-legSwing / 50);
    c.fillStyle = skin;
    c.fillRect(-4, 0, 8, 22);
    c.restore();
    c.save();
    c.translate(10, -40 + bob);
    c.rotate(legSwing / 50);
    c.fillStyle = skin;
    c.fillRect(-4, 0, 8, 22);
    c.restore();

    c.fillStyle = skin;
    c.fillRect(-11, -70 + bob, 22, 20);
    c.fillStyle = hair;
    if (type === 'boy') {
      c.fillRect(-12, -73 + bob, 24, 9);
    } else {
      c.fillRect(-13, -73 + bob, 26, 10);
      c.fillRect(-15, -63 + bob, 5, 20);
      c.fillRect(10, -63 + bob, 5, 20);
    }
    c.fillStyle = '#22160a';
    c.fillRect(4, -60 + bob, 3, 3);

    c.restore();
  }

  // Create player sprite cache
  const playerSpriteCache = {};
  function getPlayerSprite(type, state, frame) {
    const key = `${type}-${state}-${frame}`;
    if (!playerSpriteCache[key]) {
      const cv = document.createElement('canvas');
      cv.width = 100;
      cv.height = 100;
      const c = cv.getContext('2d');
      c.fillStyle = 'rgba(0,0,0,0)';
      c.fillRect(0, 0, 100, 100);
      drawCharacter(c, 50, 78, type, state, frame);
      playerSpriteCache[key] = PIXI.Texture.from(cv);
    }
    return playerSpriteCache[key];
  }

  // ---------- Obstacle / pastry art ----------
  let chairImage = null;
  let deskImage = null;
  let binImage = null;
  let obstacleSprites = {};

  function loadSVGFromFile(filePath) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.error(`Failed to load SVG: ${filePath}`);
        resolve(null);
      };
      img.src = filePath;
    });
  }

  // Some browsers (notably Firefox over file://) refuse to upload locally
  // loaded images to WebGL textures ("The operation is insecure"). Verify a
  // texture actually uploads before trusting it, so a broken upload can't
  // crash the real render loop later - we just keep the rectangle fallback.
  // Uses TextureSystem.bind directly (no RenderTexture/framebuffer target
  // swap) so a failed upload can't leave the main canvas's render target
  // in a bad state.
  function textureIsRenderable(texture) {
    try {
      app.renderer.texture.bind(texture);
      return true;
    } catch (e) {
      console.warn('Obstacle texture failed to upload, using shape fallback:', e.message);
      return false;
    }
  }

  Promise.all([
    loadSVGFromFile('public/chair.svg'),
    loadSVGFromFile('public/desk.svg'),
    loadSVGFromFile('public/bin.svg')
  ]).then(([chair, desk, bin]) => {
    chairImage = chair;
    deskImage = desk;
    binImage = bin;
    if (chair) {
      const t = PIXI.Texture.from(chair);
      if (textureIsRenderable(t)) obstacleSprites.chair = t;
    }
    if (desk) {
      const t = PIXI.Texture.from(desk);
      if (textureIsRenderable(t)) obstacleSprites.desk = t;
    }
    if (bin) {
      const t = PIXI.Texture.from(bin);
      if (textureIsRenderable(t)) obstacleSprites.bin = t;
    }
  });

  // ---------- Background rendering ----------
  let bgOffset = 0;

  // Static gradient backdrop, matching the original CSS canvas gradient
  // (#0f1b21 -> #1d323a -> #24413a). Built once via a 2D canvas gradient
  // and used as a texture, since PixiJS Graphics fills can't do a smooth
  // linear gradient directly - a flat dark fill here was reading as
  // uniformly murky.
  function buildGradientTexture() {
    const cv = document.createElement('canvas');
    cv.width = CW;
    cv.height = CH;
    const c = cv.getContext('2d');
    const grad = c.createLinearGradient(0, 0, 0, CH);
    grad.addColorStop(0, '#0f1b21');
    grad.addColorStop(0.55, '#1d323a');
    grad.addColorStop(1, '#24413a');
    c.fillStyle = grad;
    c.fillRect(0, 0, CW, CH);
    return PIXI.Texture.from(cv);
  }
  const bgGradientSprite = new PIXI.Sprite(buildGradientTexture());
  bgLayer.addChild(bgGradientSprite);

  // Reused every frame instead of allocating new Graphics (which leaks GPU
  // buffers if not destroyed, eventually killing the WebGL context)
  const bgG = new PIXI.Graphics();
  bgLayer.addChild(bgG);

  function drawScene(speed) {
    bgG.clear();

    // Ambient lights - warm glow over the gradient backdrop
    bgG.globalAlpha = 0.45;
    for (let i = 0; i < 10; i++) {
      const x = i * 110 - ((bgOffset * 0.3) % 110);
      bgG.beginFill(0xe0a458);
      bgG.drawCircle(x, 60 + Math.sin(i) * 10, 3);
      bgG.endFill();
    }
    bgG.globalAlpha = 1;

    // Floor - solid fill instead of an alternating tile pattern. Even a
    // low-contrast checkerboard still strobes at speed since it's a
    // repeating pattern crossing the whole screen every frame; a flat
    // floor with a couple of static shading bands avoids that entirely.
    // Sparse, widely-spaced seam lines (not a tight repeating grid) give a
    // subtle sense of forward motion without the flicker.
    bgG.beginFill(0x55403a);
    bgG.drawRect(0, groundY, CW, groundH);
    bgG.endFill();

    bgG.globalAlpha = 0.25;
    bgG.beginFill(0x3f2f2a);
    bgG.drawRect(0, groundY + groundH * 0.55, CW, groundH * 0.45);
    bgG.endFill();
    bgG.globalAlpha = 1;

    const seamSpacing = 240;
    const seamStartX = -(bgOffset % seamSpacing);
    bgG.lineStyle(2, 0x3f2f2a, 0.5);
    for (let x = seamStartX; x < CW + seamSpacing; x += seamSpacing) {
      bgG.moveTo(x, groundY + 4);
      bgG.lineTo(x, groundY + groundH - 4);
    }
    bgG.lineStyle(0);

    // Floor edge line
    bgG.beginFill(0xa87f4f);
    bgG.drawRect(0, groundY - 3, CW, 3);
    bgG.endFill();

    bgOffset += speed;
  }

  // ---------- Game state ----------
  const State = { MENU: 'menu', PLAYING: 'playing', OVER: 'over' };
  let gameState = State.MENU;

  const player = {
    x: 110,
    y: 0,
    w: 30,
    h: 56,
    vy: 0,
    onGround: true,
    mode: 'run',
    frame: 0,
  };
  const GRAVITY = 0.85;
  const JUMP_V = -16.5;

  // Speed is a base pace that creeps up slowly with distance, plus big
  // swings from what you eat - treats are meant to be the main driver of
  // pace, not a minor nudge on top of an already-steep automatic ramp.
  const BASE_SPEED = 6.2;
  const MAX_SPEED = 17;
  const MIN_SPEED = 3.5;
  const RAMP_CAP = 3; // max contribution from distance alone
  const RAMP_RATE = 0.006; // reaches RAMP_CAP at ~500m
  const CAKE_BOOST = 2;
  const CROISSANT_SLOWDOWN = 1.5;

  let speed = BASE_SPEED;
  let treatModifier = 0;
  let distanceM = 0;
  let pastryCount = 0;
  let meter = 0;
  let croissantMeter = 0;
  let cakeMeter = 0;

  let obstacles = [];
  let pastries = [];
  let spawnCooldown = 0;
  let elapsedFrames = 0;

  // Player sprite - create with initial texture
  const initialTexture = PIXI.Texture.WHITE;
  let playerSprite = new PIXI.Sprite(initialTexture);
  playerLayer.addChild(playerSprite);

  function resetGame() {
    player.w = 30;
    player.h = 56;
    player.y = groundY - player.h;
    player.vy = 0;
    player.onGround = true;
    player.mode = 'run';
    speed = BASE_SPEED;
    treatModifier = 0;
    distanceM = 0;
    pastryCount = 0;
    meter = 0;
    croissantMeter = 0;
    cakeMeter = 0;
    for (const o of obstacles) {
      if (o.displayObj) {
        gameLayer.removeChild(o.displayObj);
        o.displayObj.destroy();
      }
    }
    for (const p of pastries) {
      if (p.gfx) {
        gameLayer.removeChild(p.gfx);
        p.gfx.destroy();
      }
    }
    obstacles = [];
    pastries = [];
    spawnCooldown = 40;
    elapsedFrames = 0;
    updateHud();
  }

  function updateHud() {
    document.getElementById('scoreVal').textContent =
      Math.floor(distanceM);
    document.getElementById('bestVal').textContent = Math.floor(
      Math.max(highScore, distanceM),
    );
    document.getElementById('croissantPct').textContent =
      Math.floor(croissantMeter) + '%';
    document.getElementById('croissantFill').style.width = croissantMeter + '%';
    document.getElementById('cakePct').textContent =
      Math.floor(cakeMeter) + '%';
    document.getElementById('cakeFill').style.width = cakeMeter + '%';
  }

  // ---------- Input ----------
  let keyDown = {};
  function tryJump() {
    if (gameState !== State.PLAYING) return;
    if (player.onGround && player.mode !== 'crawl') {
      player.vy = JUMP_V;
      player.onGround = false;
      player.mode = 'jump';
    }
  }
  function setCrawl(active) {
    if (gameState !== State.PLAYING) return;
    if (active && player.onGround) {
      player.mode = 'crawl';
    } else if (!active && player.mode === 'crawl') {
      player.mode = 'run';
    }
  }

  window.addEventListener('keydown', (e) => {
    if (
      ['ArrowUp', 'ArrowDown', 'Space', ' '].includes(e.key) ||
      e.code === 'Space'
    ) {
      e.preventDefault();
    }
    if (e.repeat) {
      if (e.key === 'ArrowDown') setCrawl(true);
      return;
    }
    if (e.key === 'ArrowUp' || e.code === 'Space' || e.key === ' ') {
      tryJump();
    }
    if (e.key === 'ArrowDown') {
      setCrawl(true);
    }
    if (e.key === 'Enter') {
      if (gameState === State.MENU) startGame();
      else if (gameState === State.OVER) startGame();
    }
  });
  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowDown') {
      setCrawl(false);
    }
  });

  // Tracks held keys so the jump-landing transition (update()) knows
  // whether Down is still held, to land straight into crawl instead of run.
  window.addEventListener('keydown', (e) => {
    keyDown[e.key] = true;
  });
  window.addEventListener('keyup', (e) => {
    keyDown[e.key] = false;
  });

  // Touch controls
  const tJump = document.getElementById('tbtnJump');
  const tCrawl = document.getElementById('tbtnCrawl');
  function bindTouch(el, downFn, upFn) {
    el.addEventListener(
      'touchstart',
      (e) => {
        e.preventDefault();
        downFn();
      },
      { passive: false },
    );
    el.addEventListener(
      'touchend',
      (e) => {
        e.preventDefault();
        if (upFn) upFn();
      },
      { passive: false },
    );
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      downFn();
    });
    el.addEventListener('mouseup', (e) => {
      e.preventDefault();
      if (upFn) upFn();
    });
  }
  bindTouch(tJump, tryJump);
  bindTouch(
    tCrawl,
    () => setCrawl(true),
    () => setCrawl(false),
  );

  if ('ontouchstart' in window) {
    document.getElementById('touchControls').classList.add('show');
  }

  // ---------- Spawning ----------
  function isSafeSpawnX(x, pastryRadius = 12) {
    const SAFE_DISTANCE = 60 + speed * 5;
    for (const o of obstacles) {
      const obstacleLeft = o.x;
      const obstacleRight = o.x + o.w;
      const pastryLeft = x - pastryRadius;
      const pastryRight = x + pastryRadius;
      if (!(pastryRight + SAFE_DISTANCE < obstacleLeft || pastryLeft - SAFE_DISTANCE > obstacleRight)) {
        return false;
      }
    }
    return true;
  }

  function spawnObstacleOrPastry() {
    const roll = Math.random();
    const minGap = Math.max(320, 400 - speed * 4);
    if (roll < 0.35) {
      const h = 70;
      obstacles.push({
        type: 'chair',
        x: CW + 40,
        w: 50,
        topY: groundY - h,
        h,
      });
    } else if (roll < 0.65) {
      const h = 70;
      obstacles.push({
        type: 'bin',
        x: CW + 40,
        w: 40,
        topY: groundY - h,
        h,
      });
    } else if (roll < 0.95) {
      const gap = 85;
      const topY = groundY - gap - 8;
      const gapTopY = groundY - 200;
      obstacles.push({
        type: 'table',
        x: CW + 40,
        w: 160,
        topY,
        gap,
        gapTopY,
        hitTop: gapTopY,
        hitBottom: groundY,
      });
    }
    if (Math.random() < 0.75) {
      const count = 1 + Math.floor(Math.random() * 3);
      let baseX = CW + 90 + Math.random() * 60;
      let attempts = 0;
      while (!isSafeSpawnX(baseX) && attempts < 10) {
        baseX += 40;
        attempts++;
      }
      if (isSafeSpawnX(baseX)) {
        const heightChoice = Math.random();
        let py;
        if (heightChoice < 0.45)
          py = groundY - 20;
        else if (heightChoice < 0.75)
          py = groundY - 90;
        else py = groundY - 150;
        for (let i = 0; i < count; i++) {
          const type = Math.random() < 0.5 ? 'cake' : 'croissant';
          pastries.push({
            x: baseX + i * 34,
            y: py,
            r: 12,
            collected: false,
            wob: Math.random() * 10,
            type,
          });
        }
      }
    }
    spawnCooldown = minGap / (speed * 0.6);
  }

  // ---------- Collision ----------
  function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
  }

  // ---------- Update loop ----------
  function update() {
    elapsedFrames++;
    const curSpeed = speed;

    if (!player.onGround) {
      player.vy += GRAVITY;
      player.y += player.vy;
      if (player.y >= groundY - player.h) {
        player.y = groundY - player.h;
        player.vy = 0;
        player.onGround = true;
        player.mode = keyDown['ArrowDown'] ? 'crawl' : 'run';
      }
    } else {
      if (player.mode === 'crawl') {
        player.w = 46;
        player.h = 30;
      } else {
        player.w = 30;
        player.h = 56;
      }
      player.y = groundY - player.h;
    }
    if (player.mode === 'jump') {
      player.w = 30;
      player.h = 56;
    }

    // treatModifier is a persistent offset (unlike the ramp, which is
    // recomputed from scratch every frame) so a boost/slowdown actually
    // lasts instead of being wiped out by the next frame's ramp calc.
    if (cakeMeter >= 100) {
      treatModifier = Math.min(MAX_SPEED - BASE_SPEED, treatModifier + CAKE_BOOST);
      cakeMeter = 0;
    }
    if (croissantMeter >= 100) {
      treatModifier = Math.max(MIN_SPEED - BASE_SPEED, treatModifier - CROISSANT_SLOWDOWN);
      croissantMeter = 0;
    }

    const rampSpeed = BASE_SPEED + Math.min(RAMP_CAP, distanceM * RAMP_RATE);
    speed = Math.max(MIN_SPEED, Math.min(MAX_SPEED, rampSpeed + treatModifier));

    distanceM += curSpeed / PIXELS_PER_METER;

    spawnCooldown--;
    if (spawnCooldown <= 0) {
      spawnObstacleOrPastry();
    }

    for (const o of obstacles) {
      o.x -= curSpeed;
    }
    for (const o of obstacles) {
      if (o.x + o.w <= -20 && o.displayObj) {
        gameLayer.removeChild(o.displayObj);
        o.displayObj.destroy();
        o.displayObj = null;
      }
    }
    obstacles = obstacles.filter((o) => o.x + o.w > -20);

    for (const p of pastries) {
      p.x -= curSpeed;
    }
    for (const p of pastries) {
      if ((p.x <= -40 || p.collected) && p.gfx) {
        gameLayer.removeChild(p.gfx);
        p.gfx.destroy();
        p.gfx = null;
      }
    }
    pastries = pastries.filter((p) => p.x > -40 && !p.collected);

    for (const o of obstacles) {
      if (o.type === 'chair' || o.type === 'bin') {
        if (
          rectsOverlap(
            player.x,
            player.y,
            player.w,
            player.h,
            o.x,
            o.topY,
            o.w,
            o.h,
          )
        ) {
          return gameOver();
        }
      } else if (o.type === 'table') {
        let collisionBottom = o.hitBottom;
        if (player.mode === 'crawl') {
          collisionBottom = o.hitBottom - o.gap - 10;
        }
        if (
          rectsOverlap(
            player.x,
            player.y,
            player.w,
            player.h,
            o.x,
            o.hitTop,
            o.w,
            collisionBottom - o.hitTop,
          )
        ) {
          return gameOver();
        }
      }
    }

    // Pastry pickup uses a taller hitbox than the gameplay collision box:
    // the drawn character's head extends well above player.y (it's part
    // of the art, not the movement/obstacle hitbox), so without this,
    // treats that visually touch the head don't register while running.
    // Crawl's head already sits inside the normal hitbox, so no extra
    // reach is needed there.
    const headReach = player.mode === 'crawl' ? 0 : 38;

    for (const p of pastries) {
      if (p.collected) continue;
      const buffer = 8;
      const px = p.x - p.r - buffer,
        py = p.y - p.r - buffer,
        pw = p.r * 2 + buffer * 2,
        ph = p.r * 2 + buffer * 2;
      if (
        rectsOverlap(
          player.x,
          player.y - headReach,
          player.w,
          player.h + headReach,
          px,
          py,
          pw,
          ph,
        )
      ) {
        p.collected = true;
        pastryCount++;
        if (p.type === 'cake') {
          cakeMeter = Math.min(100, cakeMeter + 15);
        } else if (p.type === 'croissant') {
          croissantMeter = Math.min(100, croissantMeter + 15);
        }
      }
    }

    updateHud();
  }

  let renderCount = 0;
  function render() {
    renderCount++;
    const curSpeed = speed;

    // Update motion blur based on speed
    const blurIntensity = Math.max(0, (curSpeed - BASE_SPEED) * 0.15);
    motionBlurFilter.blur = blurIntensity;

    drawScene(curSpeed);

    // Draw obstacles using the original SVG art, with a rectangle fallback
    // until the SVGs finish loading. Reuse each obstacle's display object
    // across frames instead of allocating a new one every frame - creating
    // and discarding Graphics/Sprites 60x/sec leaks GPU memory and kills
    // the WebGL context after a few seconds.
    for (const o of obstacles) {
      let spriteY, spriteH, fallbackColor, outlineColor;

      if (o.type === 'chair') {
        spriteY = o.topY;
        spriteH = groundY - o.topY;
        fallbackColor = 0x5a7488;
        outlineColor = 0x7d96a6;
      } else if (o.type === 'bin') {
        spriteY = o.topY;
        spriteH = groundY - o.topY;
        // Was near-black and blended into the dark background - needs to
        // read clearly at a glance, so it's a mid-tone warm gray instead.
        fallbackColor = 0x7a6f6a;
        outlineColor = 0xa89890;
      } else {
        spriteY = o.topY - 8;
        spriteH = groundY - (o.topY - 8);
        fallbackColor = 0x8b7355;
        outlineColor = 0xac8f6d;
      }

      const texture = obstacleSprites[o.type === 'table' ? 'desk' : o.type];

      if (!o.displayObj) {
        if (texture) {
          o.displayObj = new PIXI.Sprite(texture);
        } else {
          o.displayObj = new PIXI.Graphics();
        }
        gameLayer.addChild(o.displayObj);
      }

      if (o.displayObj instanceof PIXI.Sprite) {
        o.displayObj.x = o.x;
        o.displayObj.y = spriteY;
        o.displayObj.width = o.w;
        o.displayObj.height = spriteH;
      } else {
        o.displayObj.clear();
        o.displayObj.lineStyle(2, outlineColor, 1);
        o.displayObj.beginFill(fallbackColor);
        o.displayObj.drawRect(o.x, spriteY, o.w, spriteH);
        o.displayObj.endFill();
      }
    }

    // Draw pastries - reuse each pastry's Graphics object across frames
    for (const p of pastries) {
      if (p.collected) continue;

      if (!p.gfx) {
        p.gfx = new PIXI.Graphics();
        gameLayer.addChild(p.gfx);
      }

      const g = p.gfx;
      g.clear();
      const wobbleY = Math.sin(elapsedFrames * 0.1 + p.wob) * 4;

      if (p.type === 'cake') {
        // Layered slice: sponge + filling + frosting cap, stacked bottom to
        // top, plus piped dollops and a cherry - reads as "cake" rather
        // than a plain circle-on-a-box.
        const w = p.r * 2;
        const layerH = p.r * 0.45;
        const bottomY = p.y + p.r * 0.55 + wobbleY;
        const left = p.x - w / 2;

        g.lineStyle(1, 0x4a3520, 1);
        g.beginFill(0x8b6a3f);
        g.drawRoundedRect(left, bottomY - layerH, w, layerH, 2);
        g.endFill();

        g.lineStyle(1, 0x8a6a3a, 1);
        g.beginFill(0xead9ae);
        g.drawRoundedRect(left, bottomY - layerH * 2, w, layerH, 2);
        g.endFill();

        g.lineStyle(1, 0xa85f72, 1);
        g.beginFill(0xd97d94);
        g.drawRoundedRect(left, bottomY - layerH * 3, w, layerH, 4);
        g.endFill();

        g.lineStyle(0);
        g.beginFill(0xe8a8ba);
        for (let i = -1; i <= 1; i++) {
          g.drawCircle(p.x + i * p.r * 0.6, bottomY - layerH * 3, p.r * 0.18);
        }
        g.endFill();

        g.beginFill(0xc23b4a);
        g.drawCircle(p.x, bottomY - layerH * 3 - p.r * 0.2, p.r * 0.16);
        g.endFill();
      } else {
        // Croissant: a curved "horn" traced directly as two meeting
        // curves (tapered tips, puffy top), rather than circle-hole
        // subtraction - gives reliable control over the silhouette
        // instead of depending on how holes render at this scale.
        const cx = p.x;
        const cy = p.y + wobbleY;
        // Drawn larger than the collision radius (p.r) - the shape read as
        // too small/indistinct at the actual hitbox size, but we don't
        // want to change collectible collision behavior to fix that.
        const r = p.r * 1.5;

        g.lineStyle(1, 0x9d7b3a, 1);
        g.beginFill(0xd4a85d);
        g.moveTo(cx - r * 1.05, cy + r * 0.2);
        g.quadraticCurveTo(cx, cy - r * 1.15, cx + r * 1.05, cy + r * 0.2);
        g.quadraticCurveTo(cx, cy - r * 0.35, cx - r * 1.05, cy + r * 0.2);
        g.closePath();
        g.endFill();

        // Golden highlight along the top ridge
        g.lineStyle(0);
        g.beginFill(0xf0d79e, 0.75);
        g.moveTo(cx - r * 0.7, cy - r * 0.15);
        g.quadraticCurveTo(cx, cy - r * 0.95, cx + r * 0.7, cy - r * 0.15);
        g.quadraticCurveTo(cx, cy - r * 0.55, cx - r * 0.7, cy - r * 0.15);
        g.closePath();
        g.endFill();

        // Fold-line ridges
        g.lineStyle(1, 0x9d7b3a, 0.7);
        g.moveTo(cx - r * 0.5, cy - r * 0.75);
        g.quadraticCurveTo(cx - r * 0.1, cy - r * 0.55, cx - r * 0.15, cy - r * 0.05);
        g.moveTo(cx + r * 0.1, cy - r * 0.8);
        g.quadraticCurveTo(cx + r * 0.35, cy - r * 0.5, cx + r * 0.3, cy - r * 0.05);
      }
    }

    // Draw player using the original hand-drawn character sprite
    const animFrame = player.frame % 20;
    const texture = getPlayerSprite(selectedAvatar, player.mode, animFrame);
    playerSprite.texture = texture;
    // drawCharacter's baseY (78 on the cached 100x100 canvas) is a hip/torso
    // reference point, not the actual bottom pixel of the art: run/jump legs
    // are drawn extending ~24px below it, while the crawl pose is drawn
    // entirely ~8px above it. Using baseY directly as "the floor line" sinks
    // running/jumping feet into the floor tiles and floats the crawl pose
    // above them. Offset per mode so the actual drawn feet land on groundY,
    // flush with obstacles.
    const feetOffset = player.mode === 'crawl' ? -8 : 24;
    playerSprite.x = player.x + player.w / 2 - 50;
    playerSprite.y = player.y + player.h - 78 - feetOffset;

    player.frame += 1;
  }

  // ---------- Screens ----------
  const menuScreen = document.getElementById('menuScreen');
  const overScreen = document.getElementById('overScreen');

  function startGame() {
    menuScreen.classList.add('hidden');
    overScreen.classList.add('hidden');
    resetGame();
    gameState = State.PLAYING;
  }

  function gameLoop(delta) {
    if (gameState === State.PLAYING) {
      try {
        update();
        render();
        app.render();
      } catch (e) {
        console.error('Game loop error:', e);
      }
    }
  }
  // Register once: the ticker just runs continuously and gameLoop no-ops
  // when not PLAYING. Calling app.ticker.add() again on every retry would
  // stack duplicate listeners, and app.ticker.stop() never gets restarted
  // by add() alone - both bugs made "Try Again" freeze the game.
  app.ticker.add(gameLoop);

  function gameOver() {
    gameState = State.OVER;
    const isNew = distanceM > highScore;
    if (isNew) {
      highScore = distanceM;
      localStorage.setItem(STORAGE_KEY, String(highScore));
    }
    document.getElementById('finalScore').textContent =
      Math.floor(distanceM);
    document.getElementById('finalBest').textContent =
      Math.floor(highScore);
    document.getElementById('finalPastries').textContent = pastryCount;
    document
      .getElementById('newBestTag')
      .classList.toggle('hidden', !isNew);
    overScreen.classList.remove('hidden');
    updateHud();
  }

  document
    .getElementById('startBtn')
    .addEventListener('click', startGame);
  document
    .getElementById('retryBtn')
    .addEventListener('click', startGame);
  document.getElementById('menuBtn').addEventListener('click', () => {
    overScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    gameState = State.MENU;
  });

  // Initial render
  player.y = groundY - player.h;
  drawScene(0);
  try {
    render();
    app.render();
  } catch (e) {
    console.error('Render error:', e);
  }
})();
