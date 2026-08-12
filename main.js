(function () {
  'use strict';

  // ---------- Setup ----------
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const CW = canvas.width,
    CH = canvas.height;
  const groundH = 66;
  const groundY = CH - groundH;
  const PIXELS_PER_METER = 12;

  const STORAGE_KEY = 'bistroDash_highScore_v1';
  let highScore = parseFloat(localStorage.getItem(STORAGE_KEY) || '0');
  document.getElementById('bestVal').textContent = Math.floor(highScore);

  // ---------- Avatar selection ----------
  let selectedAvatar = 'boy';
  let playerName = '';
  const cardBoy = document.getElementById('cardBoy');
  const cardGirl = document.getElementById('cardGirl');
  const playerNameInput = document.getElementById('playerName');

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
  // Draws at (baseX, baseY = feet position on ground), state: 'run'|'jump'|'crawl', frame: animation counter
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
      // low, horizontal pose
      c.translate(0, -14);
      // legs
      c.fillStyle = '#2b3a3f';
      c.fillRect(-16, -2, 14, 8);
      c.fillRect(6, -2, 14, 8);
      // body (apron)
      c.fillStyle = outfit;
      c.fillRect(-20, -16, 40, 16);
      // head
      c.fillStyle = skin;
      c.fillRect(14, -24, 16, 14);
      // hair
      c.fillStyle = hair;
      if (type === 'boy') {
        c.fillRect(14, -26, 16, 6);
      } else {
        c.fillRect(12, -26, 20, 8);
        c.fillRect(10, -20, 4, 10);
      }
      // arm forward
      c.fillStyle = skin;
      c.fillRect(20, -10, 14, 6);
      c.restore();
      return;
    }

    // running / jumping upright pose
    const legSwing = state === 'jump' ? 8 : Math.sin(frame * 0.5) * 10;
    c.strokeStyle = outfit;
    c.fillStyle = outfit;

    // back leg
    c.fillStyle = '#2b3a3f';
    c.save();
    c.translate(-4, -2);
    c.rotate(legSwing / 60);
    c.fillRect(-4, 0, 9, 26);
    c.restore();
    // front leg
    c.save();
    c.translate(4, -2);
    c.rotate(-legSwing / 60);
    c.fillRect(-5, 0, 9, 26);
    c.restore();

    // torso (apron/uniform)
    c.fillStyle = outfit;
    c.fillRect(-13, -46 + bob, 26, 32);
    // apron strap accent
    c.fillStyle = 'rgba(255,255,255,.25)';
    c.fillRect(-13, -46 + bob, 26, 6);

    // back arm
    c.save();
    c.translate(-10, -40 + bob);
    c.rotate(-legSwing / 50);
    c.fillStyle = skin;
    c.fillRect(-4, 0, 8, 22);
    c.restore();
    // front arm
    c.save();
    c.translate(10, -40 + bob);
    c.rotate(legSwing / 50);
    c.fillStyle = skin;
    c.fillRect(-4, 0, 8, 22);
    c.restore();

    // head
    c.fillStyle = skin;
    c.fillRect(-11, -70 + bob, 22, 20);
    // hair
    c.fillStyle = hair;
    if (type === 'boy') {
      c.fillRect(-12, -73 + bob, 24, 9);
    } else {
      c.fillRect(-13, -73 + bob, 26, 10);
      c.fillRect(-15, -63 + bob, 5, 20);
      c.fillRect(10, -63 + bob, 5, 20);
    }
    // eye
    c.fillStyle = '#22160a';
    c.fillRect(4, -60 + bob, 3, 3);

    c.restore();
  }

  // ---------- Obstacle / pastry art (SVG-based) ----------
  let chairImage = null;
  let deskImage = null;
  let binImage = null;

  function loadSVGFromFile(filePath) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => console.error(`Failed to load SVG: ${filePath}`);
      img.src = filePath;
    });
  }

  // Initialize SVG images from files
  Promise.all([
    loadSVGFromFile('public/chair.svg'),
    loadSVGFromFile('public/desk.svg'),
    loadSVGFromFile('public/bin.svg')
  ]).then(([chair, desk, bin]) => {
    chairImage = chair;
    deskImage = desk;
    binImage = bin;
  });

  function drawChair(c, x, y, w, h) {
    if (chairImage) {
      // y is topY, draw from y down to groundY
      c.drawImage(chairImage, x, y, w, groundY - y);
    } else {
      // Fallback to simple rectangle if SVG not loaded
      c.fillStyle = '#5a7a8f';
      c.fillRect(x, y, w, groundY - y);
    }
  }

  function drawBin(c, x, y, w, h) {
    if (binImage) {
      // y is topY, draw from y down to groundY
      c.drawImage(binImage, x, y, w, groundY - y);
    } else {
      // Fallback to simple rectangle if SVG not loaded
      c.fillStyle = '#2a2a2a';
      c.fillRect(x, y, w, groundY - y);
    }
  }

  function drawTable(c, x, topY, w, gapTopY) {
    if (deskImage) {
      // Draw from topY down to groundY
      c.drawImage(deskImage, x, topY - 8, w, groundY - (topY - 8));
    } else {
      // Fallback to simple rectangle if SVG not loaded
      c.fillStyle = '#8b7355';
      c.fillRect(x, topY - 8, w, groundY - (topY - 8));
    }
  }

  function drawCake(c, x, y, r, wobble) {
    c.save();
    c.translate(x, y + Math.sin(wobble) * 4);

    // Cake base - brown/tan (larger)
    c.fillStyle = '#8b6914';
    c.beginPath();
    c.rect(-r * 1.1, -r * 0.5, r * 2.2, r * 1.2);
    c.fill();

    // Frosting top - pink/red
    c.fillStyle = '#ff6b9d';
    c.beginPath();
    c.ellipse(0, -r * 0.5, r * 1.2, r * 0.4, 0, 0, Math.PI * 2);
    c.fill();

    // Frosting swirls
    c.strokeStyle = '#ff9dc3';
    c.lineWidth = r * 0.25;
    c.lineCap = 'round';
    for (let i = -2; i <= 2; i++) {
      c.beginPath();
      c.arc(i * r * 0.35, -r * 0.4, r * 0.35, 0, Math.PI * 2);
      c.stroke();
    }

    // Cake outline
    c.strokeStyle = '#5a4a0a';
    c.lineWidth = 1.5;
    c.strokeRect(-r * 1.1, -r * 0.5, r * 2.2, r * 1.2);

    c.restore();
  }

  function drawCroissant(c, x, y, r, wobble) {
    c.save();
    c.translate(x, y + Math.sin(wobble) * 4);
    c.rotate(Math.sin(wobble * 0.5) * 0.1);

    // Outer croissant crescent
    c.fillStyle = '#d4a85d';
    c.beginPath();
    c.arc(0, 0, r * 1.2, Math.PI * 0.3, Math.PI * 1.7, false);
    c.arc(0, 0, r * 0.6, Math.PI * 1.7, Math.PI * 0.3, true);
    c.fill();

    // Inner highlight for depth
    c.fillStyle = '#f0d79e';
    c.beginPath();
    c.arc(0, -r * 0.3, r * 0.5, Math.PI * 0.4, Math.PI * 1.6, false);
    c.arc(0, -r * 0.3, r * 0.2, Math.PI * 1.6, Math.PI * 0.4, true);
    c.fill();

    // Layer details
    c.strokeStyle = '#9d7b3a';
    c.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      c.beginPath();
      const angle1 = Math.PI * 0.5 + i * 0.3;
      const angle2 = angle1 + 0.2;
      c.arc(0, 0, r * (1 - i * 0.15), angle1, angle2, false);
      c.stroke();
    }

    c.restore();
  }

  function drawPastry(c, x, y, r, wobble, type = 'croissant') {
    if (type === 'cake') {
      drawCake(c, x, y, r, wobble);
    } else {
      drawCroissant(c, x, y, r, wobble);
    }
  }

  // ---------- Floor / background ----------
  let bgOffset = 0;
  function drawScene(speed) {
    ctx.clearRect(0, 0, CW, CH);
    // back wall gradient already via CSS canvas bg; add ambient string-light dots
    ctx.save();
    for (let i = 0; i < 10; i++) {
      const x = i * 110 - ((bgOffset * 0.3) % 110);
      ctx.fillStyle = 'rgba(227,165,63,.5)';
      ctx.beginPath();
      ctx.arc(x, 60 + Math.sin(i) * 10, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // floor checker
    const tile = 40;
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, groundY, CW, groundH);
    ctx.clip();
    const startX = -(bgOffset % (tile * 2));
    for (let x = startX; x < CW + tile * 2; x += tile) {
      for (let row = 0; row < 2; row++) {
        const isDark = (Math.floor(x / tile) + row) % 2 === 0;
        ctx.fillStyle = isDark ? 'var(--floor-a)'.trim() : '#3a1f22';
        ctx.fillStyle = isDark ? '#3a1f22' : '#e8dcc4';
        ctx.fillRect(x, groundY + row * (groundH / 2), tile, groundH / 2);
      }
    }
    ctx.restore();
    // floor edge line
    ctx.fillStyle = '#e3a53f';
    ctx.fillRect(0, groundY - 3, CW, 3);

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
    mode: 'run', // run | jump | crawl
    frame: 0,
  };
  const GRAVITY = 0.85;
  const JUMP_V = -16.5;

  let speed = 6.2;
  let distanceM = 0;
  let pastryCount = 0;
  let meter = 0; // 0-100
  let croissantMeter = 0; // 0-100
  let cakeMeter = 0; // 0-100

  let obstacles = []; // {type:'chair'|'table', x, w, ...}
  let pastries = []; // {x, y, r, collected}
  let spawnCooldown = 0;
  let elapsedFrames = 0;

  function resetGame() {
    player.w = 30;
    player.h = 56;
    player.y = groundY - player.h;
    player.vy = 0;
    player.onGround = true;
    player.mode = 'run';
    speed = 6.2;
    distanceM = 0;
    pastryCount = 0;
    meter = 0;
    croissantMeter = 0;
    cakeMeter = 0;
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
      // chair
      const h = 70;
      obstacles.push({
        type: 'chair',
        x: CW + 40,
        w: 50,
        topY: groundY - h,
        h,
      });
    } else if (roll < 0.65) {
      // bin (trash can)
      const h = 70;
      obstacles.push({
        type: 'bin',
        x: CW + 40,
        w: 40,
        topY: groundY - h,
        h,
      });
    } else if (roll < 0.95) {
      // table
      const gap = 85; // clearance under table
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
    } else {
      // small obstacle-free stretch, spawn a couple of pastries instead
    }
    // pastries: sometimes cluster a few, at varying heights
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
          py = groundY - 20; // very low, easy grab while running/crawling
        else if (heightChoice < 0.75)
          py = groundY - 90; // mid-high, requires full jump
        else py = groundY - 150; // high, requires good timing on jump
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

    // difficulty ramp
    speed = 6.2 + Math.min(9, distanceM * 0.012);

    // physics
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

    // auto-activate effects when meters are full
    if (cakeMeter >= 100) {
      speed = Math.min(15.2, speed + 0.8);
      cakeMeter = 0;
    }
    if (croissantMeter >= 100) {
      speed = Math.max(4, speed - 0.6);
      croissantMeter = 0;
    }

    // distance
    distanceM += curSpeed / PIXELS_PER_METER;

    // spawn
    spawnCooldown--;
    if (spawnCooldown <= 0) {
      spawnObstacleOrPastry();
    }

    // move obstacles
    for (const o of obstacles) {
      o.x -= curSpeed;
    }
    obstacles = obstacles.filter((o) => o.x + o.w > -20);

    // move pastries
    for (const p of pastries) {
      p.x -= curSpeed;
    }
    pastries = pastries.filter((p) => p.x > -40 && !p.collected);

    // collisions: obstacles
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
        // Allow crawling under tables, but not running/jumping
        let collisionBottom = o.hitBottom;
        if (player.mode === 'crawl') {
          // When crawling, only collide with the top part of desk, not the gap
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

    // collisions: pastries
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
          player.y,
          player.w,
          player.h,
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

  function render() {
    const curSpeed = speed;
    drawScene(curSpeed);

    // obstacles
    for (const o of obstacles) {
      if (o.type === 'chair') {
        drawChair(ctx, o.x, o.topY, o.w, o.h);
      } else if (o.type === 'bin') {
        drawBin(ctx, o.x, o.topY, o.w, o.h);
      } else {
        drawTable(ctx, o.x, o.topY, o.w, o.gapTopY);
      }
    }
    // pastries
    for (const p of pastries) {
      if (!p.collected)
        drawPastry(ctx, p.x, p.y, p.r, elapsedFrames * 0.1 + p.wob, p.type);
    }
    // player
    player.frame += 1;
    drawCharacter(
      ctx,
      player.x + player.w / 2,
      player.y + player.h,
      selectedAvatar,
      player.mode,
      player.frame,
    );
  }

  let rafId = null;
  function loop() {
    if (gameState === State.PLAYING) {
      update();
      render();
      rafId = requestAnimationFrame(loop);
    }
  }

  // keep crawl state synced with held key each frame via keyDown map
  window.addEventListener('keydown', (e) => {
    keyDown[e.key] = true;
  });
  window.addEventListener('keyup', (e) => {
    keyDown[e.key] = false;
  });

  // ---------- Screens ----------
  const menuScreen = document.getElementById('menuScreen');
  const overScreen = document.getElementById('overScreen');

  function startGame() {
    playerName = playerNameInput.value.trim() || 'Player';
    menuScreen.classList.add('hidden');
    overScreen.classList.add('hidden');
    resetGame();
    gameState = State.PLAYING;
    loop();
  }

  function gameOver() {
    gameState = State.OVER;
    if (rafId) cancelAnimationFrame(rafId);
    const isNew = distanceM > highScore;
    if (isNew) {
      highScore = distanceM;
      localStorage.setItem(STORAGE_KEY, String(highScore));
    }
    document.getElementById('playerNameDisplay').textContent =
      `${playerName}'s Shift Ended`;
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

  // initial idle render behind menu
  player.y = groundY - player.h;
  drawScene(0);
  render();
})();
