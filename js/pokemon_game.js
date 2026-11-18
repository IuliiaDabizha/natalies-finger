// ============================================================
//  js/pokemon_game.js — The Ultimate Mc'Do Heist Game Engine
//  16-bit Retro Pixel Art • Mc'Do Tassin la Demi-Lune (Lyon), France
//  Interactive Dialogues • Word Fights • Spy Accusations & Kick-Outs
//  7 Traumatized Employees: Clement, Arthur, Clara, Lea, Natan, Raphael, Luca
//  Boss Showdown & Natalie Explosion Detonation Climax
// ============================================================

(function() {
  'use strict';

  // ------------------------------------------------------------
  // 1. CONSTANTS & CONFIGURATION
  // ------------------------------------------------------------
  const TILE_SIZE = 48; // 16px base * 3x scale
  const MAP_COLS = 44;
  const MAP_ROWS = 28;
  const SCREEN_WIDTH = 720;
  const SCREEN_HEIGHT = 540;

  // ------------------------------------------------------------
  // 2. GAME STATE
  // ------------------------------------------------------------
  const state = {
    mode: 'OVERWORLD', // 'OVERWORLD' | 'BATTLE' | 'EXPLODING' | 'VICTORY'
    lang: window.LANG || 'en',
    inventory: new Set(),
    quests: {
      clement_done: false,
      clara_done: false,
      kiosk_sabotaged: false,
      miller_done: false,
      car_pried: false,
      dumpster_pried: false,
      arthur_done: false,
      lea_done: false,
      natan_done: false,
      raphael_done: false,
      luca_done: false,
      freezer_unlocked: false,
      finger_extracted: false,
      gift_packaged: false
    },
    rageLevel: 0,
    dialogActive: false,
    awaitingChoice: false,
    currentChoices: [],
    dialogQueue: [],
    dialogCallback: null,
    typingTimer: null,
    typingIndex: 0,
    currentFullText: '',
    itemPopupActive: false,
    interactionCooldown: false,
    battleStep: 0,
    particles: []
  };

  // ------------------------------------------------------------
  // 3. AUDIO & RENDERER INSTANCES
  // ------------------------------------------------------------
  const canvas = document.getElementById('mainCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;
  ctx.imageSmoothingEnabled = false;

  const audio = window.pokemonAudio || new (window.PokemonAudio || Object)();
  const pixel = new window.PixelArtRenderer(ctx);

  // ------------------------------------------------------------
  // 4. MAP TILES DEFINITION (44 cols x 28 rows)
  // ------------------------------------------------------------
  const TILE_NAMES = [
    'floor',                // 0
    'kitchen_floor',        // 1
    'freezer_floor',        // 2
    'wall',                 // 3
    'counter',              // 4
    'register',             // 5
    'fryer',                // 6
    'table',                // 7
    'chair',                // 8
    'freezer_door',         // 9
    'ice_crate',            // 10
    'ice_cream_machine',    // 11
    'drive_window',         // 12
    'kiosk',                // 13
    'kiosk_broken',         // 14
    'counter_gate_closed',  // 15
    'counter_gate_open',    // 16
    'soda_fountain',        // 17
    'trash_bin',            // 18
    'lockbox',              // 19
    'cctv_desk',            // 20
    'sink',                 // 21
    'asphalt',              // 22
    'parking_line',         // 23
    'sidewalk',             // 24
    'dumpster',             // 25
    'streetlight',          // 26
    'glass_door',           // 27
    'drive_speaker',        // 28
    'grass',                // 29
    'fence'                 // 30
  ];

  // Solid tiles that block movement
  const SOLID_TILES = new Set([
    3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
    17, 18, 19, 20, 21, 25, 26, 28, 30
  ]);

  // Construct Base Map Grid
  const mapLayout = [];
  for (let r = 0; r < MAP_ROWS; r++) {
    mapLayout[r] = new Array(MAP_COLS).fill(22); // Default outdoor asphalt
  }

  // ============================================================
  // ZONE A: NORTH BACK PARKING LOT & DUMPSTER (Rows 0..8)
  // ============================================================
  for (let c = 0; c < MAP_COLS; c++) {
    mapLayout[0][c] = 30; // Perimeter fence
    mapLayout[MAP_ROWS - 1][c] = 30;
  }
  for (let r = 0; r < MAP_ROWS; r++) {
    mapLayout[r][0] = 30;
    mapLayout[r][MAP_COLS - 1] = 30;
  }

  for (let c = 1; c <= 3; c++) mapLayout[1][c] = 29;
  for (let c = 39; c <= 42; c++) mapLayout[1][c] = 29;

  for (let r = 2; r <= 5; r++) {
    mapLayout[r][6] = 23;
    mapLayout[r][10] = 23;
    mapLayout[r][16] = 23;
    mapLayout[r][20] = 23;
    mapLayout[r][26] = 23;
  }

  mapLayout[2][4] = 26;
  mapLayout[2][22] = 26;
  mapLayout[2][36] = 26;

  // Dumpster
  mapLayout[2][31] = 25;
  mapLayout[2][32] = 25;

  // Drive-Thru speaker
  mapLayout[5][41] = 28;

  // Restaurant North Exterior Wall
  for (let c = 4; c <= 39; c++) {
    mapLayout[8][c] = 3;
  }
  // BACK SERVICE DOORS (3 TILES WIDE FOR SMOOTH WALKING!)
  mapLayout[8][16] = 27;
  mapLayout[8][17] = 27;
  mapLayout[8][18] = 27;

  // ============================================================
  // ZONE B: INDOOR MC'DO RESTAURANT (Rows 9..20, cols 4..39)
  // ============================================================
  for (let r = 9; r <= 20; r++) {
    for (let c = 4; c <= 39; c++) {
      mapLayout[r][c] = 0;
    }
  }

  for (let r = 8; r <= 21; r++) {
    mapLayout[r][4] = 3;  // West wall
    mapLayout[r][39] = 3; // East wall
  }

  // 1. Manager's Office (Cols 4..10, Rows 13..20)
  for (let c = 4; c <= 10; c++) mapLayout[12][c] = 3;
  for (let c = 4; c <= 10; c++) mapLayout[21][c] = 3;
  mapLayout[13][10] = 3;
  mapLayout[14][10] = 3;
  mapLayout[15][10] = 3;
  // Wide open 3-tile archway entrance:
  mapLayout[16][10] = 0;
  mapLayout[17][10] = 0;
  mapLayout[18][10] = 0;
  mapLayout[19][10] = 3;
  mapLayout[20][10] = 3;

  mapLayout[15][6] = 4;
  mapLayout[15][7] = 4;
  mapLayout[14][8] = 20; // CCTV bank

  // 2. Kitchen (Cols 11..24, Rows 9..14)
  for (let r = 9; r <= 14; r++) {
    for (let c = 11; c <= 24; c++) {
      mapLayout[r][c] = 1;
    }
  }
  mapLayout[10][13] = 6;  // Fryer with 0:40 LED timer
  mapLayout[10][15] = 6;  // Arthur's Grill
  mapLayout[10][18] = 4;  // Lea's Prep Table
  mapLayout[10][19] = 4;
  mapLayout[10][22] = 21; // Natan's Dish Pit
  mapLayout[10][23] = 21;

  // 3. Breakroom (Cols 25..32, Rows 9..14)
  for (let r = 9; r <= 14; r++) mapLayout[r][24] = 3;
  // WIDE 3-TILE BREAKROOM DOORWAY:
  mapLayout[11][24] = 0;
  mapLayout[12][24] = 0;
  mapLayout[13][24] = 0;

  mapLayout[11][27] = 7;
  mapLayout[11][28] = 7;
  mapLayout[10][27] = 8;
  mapLayout[10][28] = 8;
  mapLayout[12][27] = 8;
  mapLayout[12][28] = 8;

  mapLayout[9][31] = 19; // Wall Lockbox (PIN: 0040)

  // 4. Walk-in Sub-Zero Freezer (Cols 33..39, Rows 9..14)
  for (let c = 33; c <= 39; c++) mapLayout[15][c] = 3;
  for (let r = 9; r <= 14; r++) mapLayout[r][33] = 3;

  // WIDE 2-TILE FREEZER VAULT DOOR:
  mapLayout[12][33] = 9;
  mapLayout[13][33] = 9;

  for (let r = 9; r <= 14; r++) {
    for (let c = 34; c <= 38; c++) {
      mapLayout[r][c] = 2; // Freezer blue ice floor
    }
  }
  mapLayout[10][36] = 10;
  mapLayout[10][37] = 10;
  mapLayout[10][38] = 10;
  mapLayout[13][37] = 10; // McFlurry Crate #4 (Contains Annulaire!)

  // 5. Drive-Thru & Packaging (Cols 33..39, Rows 16..20)
  mapLayout[17][39] = 12;
  mapLayout[18][39] = 12;
  mapLayout[19][39] = 12;
  mapLayout[16][34] = 11; // Ice cream machine (Out of order)
  mapLayout[18][36] = 4;
  mapLayout[18][37] = 4;

  // 6. Front Checkout Counter (Row 16, Cols 11..26)
  for (let c = 13; c <= 26; c++) mapLayout[16][c] = 4;
  mapLayout[16][13] = 5;
  mapLayout[16][19] = 5;
  mapLayout[16][23] = 5; // Clement's Register #3

  // WIDE 3-TILE OPEN COUNTER PASSAGE:
  mapLayout[16][10] = 0;
  mapLayout[16][11] = 0;
  mapLayout[16][12] = 0;

  // 7. Dining Lobby (Cols 11..32, Rows 17..20)
  mapLayout[18][13] = 13;
  mapLayout[18][15] = 13;
  mapLayout[18][17] = 13;
  mapLayout[18][19] = 13; // Kiosk #4 (Sabotage target)

  mapLayout[19][24] = 7; mapLayout[19][25] = 7;
  mapLayout[18][24] = 8; mapLayout[18][25] = 8;
  mapLayout[20][24] = 8; mapLayout[20][25] = 8;

  mapLayout[19][28] = 7; mapLayout[19][29] = 7;
  mapLayout[18][28] = 8; mapLayout[18][29] = 8;
  mapLayout[20][28] = 8; mapLayout[20][28] = 8;

  mapLayout[18][31] = 18;
  mapLayout[20][31] = 17;

  // ============================================================
  // ZONE C: SOUTH FRONT PLAZA & ENTRANCE (Rows 21..27)
  // ============================================================
  for (let c = 4; c <= 39; c++) mapLayout[21][c] = 3;
  // WIDE 3-TILE FRONT SLIDING DOORS:
  mapLayout[21][19] = 27;
  mapLayout[21][20] = 27;
  mapLayout[21][21] = 27;

  for (let c = 4; c <= 39; c++) mapLayout[22][c] = 24;
  mapLayout[24][12] = 26;
  mapLayout[24][28] = 26;

  // ------------------------------------------------------------
  // 5. NPCS DEFINITION (ALL 7 WORKERS + MILLER + NATALIE)
  // ------------------------------------------------------------
  const npcs = {
    // Back Parking Lot:
    police:  { id: 'police',  name: 'Officer Miller', col: 9,  row: 4,  type: 'cop' },
    // Restaurant Lobby & Front Counter:
    clement: { id: 'clement', name: 'Clement',        col: 23, row: 15, type: 'clement' },
    clara:   { id: 'clara',   name: 'Clara',          col: 21, row: 18, type: 'clara' },
    // Kitchen Crew:
    arthur:  { id: 'arthur',  name: 'Arthur',         col: 15, row: 11, type: 'arthur' },
    lea:     { id: 'lea',     name: 'Lea',            col: 18, row: 11, type: 'lea' },
    natan:   { id: 'natan',   name: 'Natan',          col: 22, row: 11, type: 'natan' },
    // Breakroom & Drive-thru:
    raphael: { id: 'raphael', name: 'Raphael',        col: 29, row: 11, type: 'raphael' },
    luca:    { id: 'luca',    name: 'Luca',           col: 39, row: 17, type: 'luca' },
    // Manager's Office:
    natalie: { id: 'natalie', name: 'Natalie',        col: 6,  row: 14, type: 'natalie' }
  };

  // Interactive Points of Interest (POIs)
  const interactables = [
    { id: 'natalie_car',   col: 17, row: 3,  type: 'car_target' },
    { id: 'dumpster',      col: 31, row: 2,  type: 'dumpster_target' },
    { id: 'drive_speaker', col: 41, row: 5,  type: 'speaker_info' },
    { id: 'back_doors',    col: 17, row: 8,  type: 'back_doors_info' },
    { id: 'front_doors',   col: 20, row: 21, type: 'front_doors_info' },
    { id: 'kiosk_4',       col: 19, row: 18, type: 'kiosk_target' },
    { id: 'soda',          col: 31, row: 20, type: 'soda_info' },
    { id: 'fryer_timer',   col: 13, row: 10, type: 'fryer_info' },
    { id: 'lockbox',       col: 31, row: 9,  type: 'lockbox_target' },
    { id: 'freezer_door',  col: 33, row: 12, type: 'door_target' },
    { id: 'deep_crate',    col: 37, row: 13, type: 'crate_target' },
    { id: 'ice_cream',     col: 34, row: 16, type: 'ice_cream_info' },
    { id: 'cctv',          col: 8,  row: 14, type: 'cctv_info' }
  ];

  // ------------------------------------------------------------
  // 6. PLAYER & CAMERA STATE
  // ------------------------------------------------------------
  const player = {
    x: 20 * TILE_SIZE,
    y: 24 * TILE_SIZE,
    dir: 'up',
    frame: 0,
    walkTimer: 0,
    speed: 4.5,
    canMove: true
  };

  const camera = { x: 0, y: 0 };

  function updateCamera() {
    const targetX = player.x + TILE_SIZE / 2 - SCREEN_WIDTH / 2;
    const targetY = player.y + TILE_SIZE / 2 - SCREEN_HEIGHT / 2;
    const maxX = Math.max(0, MAP_COLS * TILE_SIZE - SCREEN_WIDTH);
    const maxY = Math.max(0, MAP_ROWS * TILE_SIZE - SCREEN_HEIGHT);
    camera.x = Math.max(0, Math.min(maxX, targetX));
    camera.y = Math.max(0, Math.min(maxY, targetY));
  }

  // Keyboard tracking
  const keys = {
    w: false, a: false, s: false, d: false,
    ArrowUp: false, ArrowLeft: false, ArrowDown: false, ArrowRight: false
  };

  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    keys[e.key] = true;
    keys[e.key.toLowerCase()] = true;

    // Number keys for dialogue choices
    if (state.awaitingChoice && ['1', '2', '3'].includes(e.key)) {
      selectDialogueChoice(parseInt(e.key, 10) - 1);
      return;
    }

    if (e.key === 'l' || e.key === 'L') toggleLanguage();
    if (e.key === 'm' || e.key === 'M') toggleSound();

    if (e.key === 'e' || e.key === 'E' || e.key === ' ' || e.key === 'Enter') {
      if (state.dialogActive) {
        advanceDialogue();
      } else if (state.mode === 'OVERWORLD' && !state.itemPopupActive && !state.interactionCooldown) {
        checkInteraction();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
    keys[e.key.toLowerCase()] = false;
  });

  // ------------------------------------------------------------
  // 7. DIALOGUE QUEUE SYSTEM & INTERACTIVE CHOICES
  // ------------------------------------------------------------
  const dlgBox = document.getElementById('dialogue-box');
  const dlgSpeaker = document.getElementById('dlg-speaker');
  const dlgText = document.getElementById('dlg-text');
  const dlgChoicesContainer = document.getElementById('dlg-choices-container');
  const dlgArrow = document.getElementById('dlg-arrow');
  const interactPrompt = document.getElementById('interact-prompt');

  function openDialogue(speaker, content, callback = null) {
    audio.init();
    state.dialogActive = true;
    state.awaitingChoice = false;
    state.currentChoices = [];
    player.canMove = false;
    state.dialogCallback = callback;

    dlgSpeaker.textContent = speaker;
    dlgBox.style.display = 'block';
    interactPrompt.style.display = 'none';
    dlgChoicesContainer.innerHTML = '';
    dlgArrow.style.display = 'block';

    // Build the queue
    state.dialogQueue = [];
    if (content && typeof content === 'object' && !Array.isArray(content) && content.choices) {
      if (content.intro && Array.isArray(content.intro)) {
        state.dialogQueue.push(...content.intro);
      }
      state.dialogQueue.push({
        type: 'choice',
        prompt: content.prompt || (state.lang === 'fr' ? 'Choisissez votre réponse :' : 'Choose your response:'),
        choices: content.choices
      });
    } else if (Array.isArray(content)) {
      state.dialogQueue = [...content];
    } else {
      state.dialogQueue = [content];
    }

    advanceDialogue();
  }

  function advanceDialogue() {
    if (state.awaitingChoice) return;

    if (state.typingTimer) {
      clearInterval(state.typingTimer);
      state.typingTimer = null;
      dlgText.textContent = state.currentFullText;
      audio.click();
      return;
    }

    if (state.dialogQueue.length > 0) {
      const nextItem = state.dialogQueue.shift();

      // Check if next item is an interactive choice block
      if (typeof nextItem === 'object' && nextItem.type === 'choice') {
        state.awaitingChoice = true;
        state.currentChoices = nextItem.choices;
        dlgText.textContent = nextItem.prompt;
        dlgArrow.style.display = 'none';
        renderDialogueChoices(nextItem.choices);
        return;
      }

      state.currentFullText = nextItem;
      state.typingIndex = 0;
      dlgText.textContent = '';
      dlgChoicesContainer.innerHTML = '';
      dlgArrow.style.display = 'block';

      state.typingTimer = setInterval(() => {
        if (state.typingIndex < state.currentFullText.length) {
          dlgText.textContent += state.currentFullText[state.typingIndex];
          if (state.typingIndex % 2 === 0) audio.blip();
          state.typingIndex++;
        } else {
          clearInterval(state.typingTimer);
          state.typingTimer = null;
        }
      }, 16);
    } else {
      closeDialogue();
    }
  }

  function renderDialogueChoices(choices) {
    dlgChoicesContainer.innerHTML = '';
    choices.forEach((c, idx) => {
      const btn = document.createElement('button');
      btn.className = 'dlg-choice-btn';
      btn.textContent = c.label;
      btn.onclick = (e) => {
        e.stopPropagation();
        selectDialogueChoice(idx);
      };
      dlgChoicesContainer.appendChild(btn);
    });
  }

  function selectDialogueChoice(idx) {
    if (!state.awaitingChoice || !state.currentChoices[idx]) return;
    const chosen = state.currentChoices[idx];
    state.awaitingChoice = false;
    dlgChoicesContainer.innerHTML = '';
    dlgArrow.style.display = 'block';
    audio.click();

    // 1. If choice is marked as SPY -> KICK OUT!
    if (chosen.isSpy) {
      triggerKickOut(chosen.kickOutReason);
      return;
    }

    // 2. Normal choice -> add reply to queue & advance
    if (chosen.reply && Array.isArray(chosen.reply)) {
      state.dialogQueue.unshift(...chosen.reply);
    }
    advanceDialogue();
  }

  const kickOutState = {
    active: false,
    reason: '',
    startTime: 0,
    duration: 1900,
    startX: 0,
    startY: 0,
    targetX: 20 * TILE_SIZE,
    targetY: 24.5 * TILE_SIZE,
    landed: false,
    particles: []
  };

  function triggerKickOut(reason) {
    if (audio.slapstickYeet) {
      audio.slapstickYeet();
    } else {
      audio.karenCry();
    }

    state.dialogActive = false;
    state.awaitingChoice = false;
    dlgBox.style.display = 'none';
    if (state.typingTimer) {
      clearInterval(state.typingTimer);
      state.typingTimer = null;
    }

    player.canMove = false;
    state.mode = 'KICKOUT_ANIM';

    kickOutState.active = true;
    kickOutState.reason = reason;
    kickOutState.startTime = performance.now();
    kickOutState.duration = 1900;
    kickOutState.startX = player.x;
    kickOutState.startY = player.y;
    kickOutState.targetX = 20 * TILE_SIZE;
    kickOutState.targetY = 24.5 * TILE_SIZE;
    kickOutState.landed = false;
    kickOutState.particles = [];

    // Launch burst particles at takeoff
    for (let i = 0; i < 15; i++) {
      kickOutState.particles.push({
        x: player.x + 24,
        y: player.y + 24,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        r: 3 + Math.random() * 4,
        color: ['#fff', '#f1c40f', '#e74c3c'][Math.floor(Math.random() * 3)],
        life: 1.0
      });
    }
  }

  function renderKickOut(time) {
    const elapsed = time - kickOutState.startTime;
    const flightDuration = kickOutState.duration * 0.65; // ~1235ms in air
    const p = Math.min(1.0, elapsed / flightDuration);

    if (p < 1.0) {
      // In flight: parabolic trajectory
      player.x = kickOutState.startX + (kickOutState.targetX - kickOutState.startX) * p;
      player.y = kickOutState.startY + (kickOutState.targetY - kickOutState.startY) * p;
    } else {
      player.x = kickOutState.targetX;
      player.y = kickOutState.targetY;
      if (!kickOutState.landed) {
        kickOutState.landed = true;
        if (audio.thudImpact) {
          audio.thudImpact();
        } else {
          audio.bump();
        }
        // Impact ground dust ring
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          const spd = 2 + Math.random() * 4;
          kickOutState.particles.push({
            x: player.x + 24,
            y: player.y + 36,
            vx: Math.cos(a) * spd,
            vy: Math.sin(a) * spd * 0.5,
            r: 3 + Math.random() * 3,
            color: '#ecf0f1',
            life: 1.0
          });
        }
        const canvas = document.getElementById('mainCanvas');
        if (canvas) {
          canvas.classList.add('shake-screen');
          setTimeout(() => canvas.classList.remove('shake-screen'), 250);
        }
      }
    }

    updateCamera();
    renderMapAndNPCs();

    ctx.save();
    ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

    // Update & draw kickout particles
    for (let i = kickOutState.particles.length - 1; i >= 0; i--) {
      const pt = kickOutState.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life -= 0.03;
      if (pt.life <= 0) {
        kickOutState.particles.splice(i, 1);
        continue;
      }
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, pt.life);
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;

    if (p < 1.0) {
      // 1. Arc height & spin
      const arcZ = Math.sin(p * Math.PI) * 140;
      const spinAngle = p * Math.PI * 10; // 5 full cartwheel spins

      // 2. Trailing speed lines / wind streaks
      ctx.strokeStyle = 'rgba(241, 196, 15, 0.7)';
      ctx.lineWidth = 3;
      for (let s = 1; s <= 3; s++) {
        const trailP = Math.max(0, p - s * 0.05);
        const tx = kickOutState.startX + (kickOutState.targetX - kickOutState.startX) * trailP;
        const ty = kickOutState.startY + (kickOutState.targetY - kickOutState.startY) * trailP - Math.sin(trailP * Math.PI) * 140;
        ctx.beginPath();
        ctx.moveTo(player.x + 24, player.y + 24 - arcZ);
        ctx.lineTo(tx + 24, ty + 24);
        ctx.stroke();
      }

      // 3. Draw flying shoe / sneaker
      const shoeX = player.x + 24 + Math.cos(spinAngle * 1.5) * 28;
      const shoeY = player.y + 24 - arcZ + Math.sin(spinAngle * 1.5) * 18;
      ctx.fillStyle = '#e74c3c';
      ctx.fillRect(shoeX, shoeY, 8, 5);
      ctx.fillStyle = '#fff';
      ctx.fillRect(shoeX, shoeY + 4, 8, 2);

      // 4. Draw flying french fries
      for (let f = 0; f < 3; f++) {
        const fryAngle = spinAngle + f * 2;
        const fx = player.x + 24 + Math.cos(fryAngle) * (20 + f * 10);
        const fy = player.y + 24 - arcZ + Math.sin(fryAngle) * (15 + f * 6);
        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(fx, fy, 10, 3);
      }

      // 5. Draw rotating flying player
      ctx.save();
      ctx.translate(player.x + 24, player.y + 24 - arcZ);
      ctx.rotate(spinAngle);
      pixel.drawPlayer(-24, -24, 'down', 1);
      ctx.restore();

      // 6. Comic takeoff banner
      if (p < 0.45) {
        ctx.fillStyle = '#f1c40f';
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 3;
        ctx.font = '14px "Press Start 2P", monospace';
        const comicWord = state.lang === 'fr' ? '💥 DÉGAGE !' : '💥 YEET !';
        ctx.strokeText(comicWord, kickOutState.startX - 20, kickOutState.startY - 30);
        ctx.fillText(comicWord, kickOutState.startX - 20, kickOutState.startY - 30);
      }
    } else {
      // Landing: player is flat/dizzy with circling stars and birds
      pixel.drawPlayerDizzy(player.x, player.y, elapsed - flightDuration);

      // Comic splat text bouncing above player
      const bounce = Math.sin((elapsed - flightDuration) * 0.01) * 3;
      ctx.fillStyle = '#ff4757';
      ctx.strokeStyle = '#2f3542';
      ctx.lineWidth = 3;
      ctx.font = '11px "Press Start 2P", monospace';
      const splatWord = state.lang === 'fr' ? '★ SPLAT ! ★' : '★ FLOP ! ★';
      ctx.strokeText(splatWord, player.x - 14, player.y - 18 + bounce);
      ctx.fillText(splatWord, player.x - 14, player.y - 18 + bounce);
    }

    ctx.restore();

    // When kick-out sequence completes -> show Game Over modal!
    if (elapsed >= kickOutState.duration) {
      state.mode = 'OVERWORLD';
      const goScreen = document.getElementById('gameover-screen');
      const goDesc = document.getElementById('gameover-desc');
      if (goDesc) {
        goDesc.innerHTML = `<span style="color:#f1c40f;">🚨 EXPULSÉ DU MC'DO ! / KICKED OUT! 🚨</span><br><br>${kickOutState.reason}<br><br><span style="color:#aaa; font-size:7px;">(Indice : Ne défends jamais la rentabilité corporative de Natalie !)</span>`;
      }
      if (goScreen) goScreen.style.display = 'flex';
      player.canMove = false;
    }
  }

  window.retryAfterKickOut = function() {
    audio.click();
    const goScreen = document.getElementById('gameover-screen');
    if (goScreen) goScreen.style.display = 'none';

    // Respawn safely outside front entrance on sidewalk
    player.x = 20 * TILE_SIZE;
    player.y = 24 * TILE_SIZE;
    player.dir = 'up';
    player.canMove = true;
    state.mode = 'OVERWORLD';
    kickOutState.active = false;
    updateCamera();

    updateMissionHud(state.lang === 'fr'
      ? "🎯 OBJECTIF : RETOURNE DANS LE MC'DO ET MONTRE QUE TU ES DU CÔTÉ DU PEUPLE !"
      : "🎯 OBJECTIVE: RE-ENTER MC'DO & PROVE YOU ARE NOT A CORPORATE SPY!");
  };

  function closeDialogue() {
    if (state.typingTimer) {
      clearInterval(state.typingTimer);
      state.typingTimer = null;
    }
    state.dialogActive = false;
    state.awaitingChoice = false;
    dlgBox.style.display = 'none';
    dlgChoicesContainer.innerHTML = '';
    player.canMove = true;

    if (state.dialogCallback) {
      const cb = state.dialogCallback;
      state.dialogCallback = null;
      cb();
    }
  }

  dlgBox.addEventListener('click', (e) => {
    if (state.dialogActive && !state.awaitingChoice) advanceDialogue();
  });

  // ------------------------------------------------------------
  // 8. ITEM POPUP SYSTEM (WITH DIALOGUE RE-TRIGGER FIX!)
  // ------------------------------------------------------------
  const itemPopup = document.getElementById('item-popup');
  const itemPopupIcon = document.getElementById('item-popup-icon');
  const itemPopupTitle = document.getElementById('item-popup-title');
  const itemPopupDesc = document.getElementById('item-popup-desc');

  function showItemPopup(type, title, desc, onDone) {
    audio.itemFanfare();
    player.canMove = false;
    state.itemPopupActive = true;

    const iconCanvas = document.createElement('canvas');
    iconCanvas.width = 32;
    iconCanvas.height = 32;
    const icCtx = iconCanvas.getContext('2d');
    pixel.drawItemIcon(icCtx, 0, 0, type, 32);

    itemPopupIcon.src = iconCanvas.toDataURL();
    itemPopupTitle.textContent = title;
    itemPopupDesc.textContent = desc;
    itemPopup.classList.add('show');

    function closePopup(e) {
      if (e) {
        if (e.type === 'keydown' && !['e', 'E', ' ', 'Enter'].includes(e.key)) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
      }
      window.removeEventListener('keydown', closePopup);
      itemPopup.removeEventListener('click', closePopup);
      itemPopup.classList.remove('show');

      // CRITICAL FIX: Add a cooldown before any new interaction can be triggered
      state.itemPopupActive = false;
      state.interactionCooldown = true;
      setTimeout(() => {
        state.interactionCooldown = false;
        player.canMove = true;
      }, 350);

      if (onDone) onDone();
    }

    window.closeCurrentItemPopup = () => closePopup();

    window.addEventListener('keydown', closePopup);
    itemPopup.addEventListener('click', closePopup);
  }

  // ------------------------------------------------------------
  // 9. COLLISION & CORNER-SLIDING MOVEMENT ENGINE
  // ------------------------------------------------------------
  function isSolid(tileX, tileY) {
    if (tileX < 0 || tileX >= MAP_COLS || tileY < 0 || tileY >= MAP_ROWS) return true;
    const tile = mapLayout[tileY][tileX];

    // Freezer vault doors unlock with Master Key
    if (tile === 9) return !state.quests.freezer_unlocked;

    // Vehicle bounding boxes in back parking lot
    if (tileX >= 7 && tileX <= 8 && tileY >= 2 && tileY <= 3) return true;
    if (tileX >= 17 && tileX <= 18 && tileY >= 2 && tileY <= 3) return true;

    return SOLID_TILES.has(tile);
  }

  function checkCollision(nextX, nextY) {
    // FEET-ONLY COLLISION BOX: Allows effortless walking through doors!
    const pad = 14;
    const left = Math.floor((nextX + pad) / TILE_SIZE);
    const right = Math.floor((nextX + TILE_SIZE - pad) / TILE_SIZE);
    const top = Math.floor((nextY + 28) / TILE_SIZE); // Only feet touch walls!
    const bottom = Math.floor((nextY + TILE_SIZE - 2) / TILE_SIZE);

    if (isSolid(left, top) || isSolid(right, top) || isSolid(left, bottom) || isSolid(right, bottom)) {
      return true;
    }

    // NPC Collisions
    for (const key in npcs) {
      const n = npcs[key];
      const npcX = n.col * TILE_SIZE;
      const npcY = n.row * TILE_SIZE;
      if (
        nextX < npcX + TILE_SIZE - 12 &&
        nextX + TILE_SIZE > npcX + 12 &&
        nextY + 28 < npcY + TILE_SIZE &&
        nextY + TILE_SIZE > npcY + 16
      ) {
        return true;
      }
    }
    return false;
  }

  function updatePlayerMovement() {
    if (!player.canMove || state.dialogActive || state.itemPopupActive || state.mode !== 'OVERWORLD') return;

    let dx = 0;
    let dy = 0;

    if (keys.w || keys.ArrowUp) { dy -= player.speed; player.dir = 'up'; }
    if (keys.s || keys.ArrowDown) { dy += player.speed; player.dir = 'down'; }
    if (keys.a || keys.ArrowLeft) { dx -= player.speed; player.dir = 'left'; }
    if (keys.d || keys.ArrowRight) { dx += player.speed; player.dir = 'right'; }

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    const isMoving = dx !== 0 || dy !== 0;
    if (isMoving) {
      player.walkTimer++;
      if (player.walkTimer % 7 === 0) {
        player.frame = (player.frame + 1) % 4;
      }
    } else {
      player.frame = 0;
    }

    // Horizontal Movement with corner sliding
    if (dx !== 0) {
      if (!checkCollision(player.x + dx, player.y)) {
        player.x += dx;
      } else {
        // Nudge up/down if bumping doorway corner
        if (!checkCollision(player.x + dx, player.y - 10)) {
          player.y -= 2.5;
        } else if (!checkCollision(player.x + dx, player.y + 10)) {
          player.y += 2.5;
        } else {
          audio.bump();
        }
      }
    }

    // Vertical Movement with corner sliding
    if (dy !== 0) {
      if (!checkCollision(player.x, player.y + dy)) {
        player.y += dy;
      } else {
        // Nudge left/right if bumping doorway corner
        if (!checkCollision(player.x - 10, player.y + dy)) {
          player.x -= 2.5;
        } else if (!checkCollision(player.x + 10, player.y + dy)) {
          player.x += 2.5;
        } else {
          audio.bump();
        }
      }
    }
  }

  // ------------------------------------------------------------
  // 10. INTERACTION DETECTION & DYNAMIC HUD
  // ------------------------------------------------------------
  function updateMissionHud(text) {
    const el = document.getElementById('hud-mission');
    if (el) el.textContent = text;
  }

  function getNearbyInteractable() {
    const pCenter = { x: player.x + TILE_SIZE / 2, y: player.y + TILE_SIZE / 2 };

    // 1. Check NPCs (supports talking across counters & desks)
    for (const key in npcs) {
      const n = npcs[key];
      const nCenter = { x: (n.col + 0.5) * TILE_SIZE, y: (n.row + 0.5) * TILE_SIZE };
      const dist = Math.hypot(pCenter.x - nCenter.x, pCenter.y - nCenter.y);
      if (dist < 110) {
        return { type: 'npc', data: n };
      }
    }

    // 2. Check POIs
    for (const poi of interactables) {
      const poiCenter = { x: (poi.col + 0.5) * TILE_SIZE, y: (poi.row + 0.5) * TILE_SIZE };
      const dist = Math.hypot(pCenter.x - poiCenter.x, pCenter.y - poiCenter.y);
      if (dist < 100) {
        return { type: 'poi', data: poi };
      }
    }

    return null;
  }

  function updatePrompt() {
    if (state.mode !== 'OVERWORLD' || state.dialogActive || state.itemPopupActive) {
      interactPrompt.style.display = 'none';
      return;
    }

    const nearby = getNearbyInteractable();
    if (!nearby) {
      interactPrompt.style.display = 'none';
      return;
    }

    interactPrompt.style.display = 'block';

    if (nearby.type === 'npc') {
      const n = nearby.data;
      if (n.id === 'natalie') {
        interactPrompt.textContent = state.inventory.has('gift_box')
          ? (state.lang === 'fr' ? '💥 [E] OFFRIR LE TROPHÉE & TROLLER NATALIE !' : '💥 [E] PRESENT AWARD & BULLSHIT NATALIE!')
          : (state.lang === 'fr' ? '[E] PARLER À NATALIE (BUREAU OUVERT)' : '[E] TALK TO NATALIE (OFFICE OPEN)');
      } else if (n.id === 'clara' && state.inventory.has('finger') && !state.inventory.has('gift_box')) {
        interactPrompt.textContent = state.lang === 'fr' ? '🎁 [E] EMBALLER L\'ANNULAIRE' : '🎁 [E] PACKAGE THE ANNULAIRE';
      } else {
        interactPrompt.textContent = `[E] ${state.lang === 'fr' ? 'PARLER À' : 'TALK TO'} ${n.name.toUpperCase()}`;
      }
    } else if (nearby.type === 'poi') {
      const poi = nearby.data;
      if (poi.type === 'car_target') {
        interactPrompt.textContent = state.quests.car_pried
          ? (state.lang === 'fr' ? '🚗 MONOSPACE FOUILLÉ' : '🚗 MINIVAN SEARCHED')
          : (state.inventory.has('crowbar')
              ? (state.lang === 'fr' ? '🔧 [E] FORCER LA BOÎTE DU MONOSPACE' : '🔧 [E] PRY MINIVAN GLOVEBOX')
              : (state.lang === 'fr' ? '🚗 [E] INSPECTER LE MONOSPACE' : '🚗 [E] INSPECT MINIVAN'));
      } else if (poi.type === 'dumpster_target') {
        interactPrompt.textContent = state.quests.dumpster_pried
          ? (state.lang === 'fr' ? '🗑️ BENNE OUVERTE' : '🗑️ DUMPSTER OPENED')
          : (state.inventory.has('crowbar')
              ? (state.lang === 'fr' ? '🔧 [E] FORCER LE CADENAS DE LA BENNE' : '🔧 [E] PRY DUMPSTER PADLOCK')
              : (state.lang === 'fr' ? '🗑️ [E] INSPECTER LA BENNE' : '🗑️ [E] INSPECT DUMPSTER'));
      } else if (poi.type === 'kiosk_target') {
        interactPrompt.textContent = state.quests.kiosk_sabotaged
          ? (state.lang === 'fr' ? '⚡ BORNE EN COURT-CIRCUIT' : '⚡ KIOSK SABOTAGED')
          : (state.lang === 'fr' ? '🚨 [E] SABOTER LA BORNE #4' : '🚨 [E] SABOTAGE KIOSK #4');
      } else if (poi.type === 'lockbox_target') {
        interactPrompt.textContent = state.inventory.has('key')
          ? (state.lang === 'fr' ? '🔓 BOÎTIER VIDE' : '🔓 EMPTY LOCKBOX')
          : (state.lang === 'fr' ? '🔢 [E] TAPER LE CODE DU BOÎTIER' : '🔢 [E] ENTER LOCKBOX PIN');
      } else if (poi.type === 'door_target') {
        interactPrompt.textContent = state.quests.freezer_unlocked
          ? (state.lang === 'fr' ? '❄️ CHAMBRE FROIDE OUVERTE' : '❄️ FREEZER UNLOCKED')
          : (state.lang === 'fr' ? '🔑 [E] DÉVERROUILLER LA CHAMBRE FROIDE' : '🔑 [E] UNLOCK FREEZER VAULT');
      } else if (poi.type === 'crate_target') {
        interactPrompt.textContent = state.inventory.has('finger') || state.inventory.has('gift_box')
          ? (state.lang === 'fr' ? '📦 CARTON VIDE' : '📦 EMPTY CRATE')
          : (state.lang === 'fr' ? '✨ [E] EXTRAIRE L\'ANNULAIRE' : '✨ [E] EXTRACT ANNULAIRE');
      } else {
        interactPrompt.textContent = state.lang === 'fr' ? '[E] EXAMINER' : '[E] INSPECT';
      }
    }
  }

  function checkInteraction() {
    if (state.dialogActive || state.itemPopupActive || state.interactionCooldown || !player.canMove) return;

    const nearby = getNearbyInteractable();
    if (!nearby) return;

    const lore = window.GAME_LORE[state.lang];

    // ============================================================
    // NPC INTERACTIONS (RICH INTERACTIVE WORD FIGHT CHAIN)
    // ============================================================
    if (nearby.type === 'npc') {
      const n = nearby.data;

      // 1. Clement (Counter Cashier, Register #3)
      if (n.id === 'clement') {
        if (!state.quests.clement_done) {
          openDialogue(lore.clement.name, lore.clement.dialogue_quest, () => {
            state.quests.clement_done = true;
            updateMissionHud(state.lang === 'fr'
              ? "🎯 OBJECTIF : PARLE À CLARA DANS LE LOBBY POUR OBTENIR LE PASS-BISTRO"
              : "🎯 OBJECTIVE: TALK TO CLARA IN DINING LOBBY FOR BISTRO PASS");
          });
        } else {
          openDialogue(lore.clement.name, lore.clement.dialogue_done);
        }
      }

      // 2. Clara (Lobby Host & Packaging)
      else if (n.id === 'clara') {
        if (!state.quests.clara_done) {
          openDialogue(lore.clara.name, lore.clara.dialogue_quest, () => {
            state.quests.clara_done = true;
            state.inventory.add('pass_bistro');
            updateInventoryUI();
            showItemPopup(
              'pass_bistro',
              lore.items.pass_bistro,
              state.lang === 'fr'
                ? "Clara vous donne son Pass-Bistro ! Allez saboter la borne #4 pour couper l'alarme de la porte arrière, puis sortez sur le parking !"
                : "Clara gives you her Bistro Pass! Sabotage Kiosk #4 to disable the rear alarm, then head out to the back parking lot!",
              () => {
                updateMissionHud(state.lang === 'fr'
                  ? "🎯 OBJECTIF : SABOTE LA BORNE #4 PUIS REJOINS MILLER SUR LE PARKING ARRIÈRE"
                  : "🎯 OBJECTIVE: SABOTAGE KIOSK #4 & MEET OFFICER MILLER IN BACK PARKING LOT");
              }
            );
          });
        } else if (state.inventory.has('finger') && !state.inventory.has('gift_box')) {
          openDialogue(lore.clara.name, lore.clara.dialogue_package, () => {
            state.inventory.delete('finger');
            state.inventory.add('gift_box');
            state.quests.gift_packaged = true;
            updateInventoryUI();
            showItemPopup(
              'gift_box',
              lore.items.gift_box,
              state.lang === 'fr'
                ? "L'annulaire est emballé dans une Boîte Happy Meal Dorée 24K avec ruban rouge et faux Trophée de Directrice du Siècle !"
                : "The severed finger is packaged in a 24K Golden Happy Meal Box with a crimson ribbon and fake Manager of the Century award!",
              () => {
                updateMissionHud(state.lang === 'fr'
                  ? "💥 MISSION FINALE : ENTRE DANS LE BUREAU DE NATALIE ET OFFRE-LUI SON TROPHÉE !"
                  : "💥 FINAL SHOWDOWN: MARCH INTO NATALIE'S OFFICE & PRESENT HER AWARD!");
              }
            );
          });
        } else {
          openDialogue(lore.clara.name, lore.clara.dialogue_done);
        }
      }

      // 3. Officer Miller (Back Parking Lot)
      else if (n.id === 'police') {
        if (!state.quests.miller_done) {
          openDialogue(lore.police.name, lore.police.dialogue_quest, () => {
            state.quests.miller_done = true;
            state.inventory.add('crowbar');
            updateInventoryUI();
            showItemPopup(
              'crowbar',
              lore.items.crowbar,
              state.lang === 'fr'
                ? "L'Officier Miller vous confie le pied-de-biche en acier ! Forcez le monospace de Natalie et la benne à ordures !"
                : "Officer Miller gives you the police crowbar! Pry open Natalie's minivan and the dumpster right here in the back lot!",
              () => {
                updateMissionHud(state.lang === 'fr'
                  ? "🎯 OBJECTIF : FORCE LE MONOSPACE DE NATALIE ET LA BENNE SUR LE PARKING ARRIÈRE"
                  : "🎯 OBJECTIVE: PRY NATALIE'S MINIVAN & THE DUMPSTER IN THE BACK LOT");
              }
            );
          });
        } else {
          openDialogue(lore.police.name, lore.police.dialogue_done);
        }
      }

      // 4. Arthur (Grill Cook)
      else if (n.id === 'arthur') {
        if (!state.quests.arthur_done) {
          openDialogue(lore.arthur.name, lore.arthur.dialogue_quest, () => {
            state.quests.arthur_done = true;
            state.inventory.add('tongs');
            updateInventoryUI();
            showItemPopup(
              'tongs',
              lore.items.tongs,
              state.lang === 'fr'
                ? "Arthur vous donne ses pinces en inox lourd 5000°C pour arracher l'annulaire du bloc de glace !"
                : "Arthur gives you his heavy 5000°F stainless steel tongs to yank the finger from the ice!",
              () => checkKitchenProgress()
            );
          });
        } else {
          openDialogue(lore.arthur.name, lore.arthur.dialogue_done);
        }
      }

      // 5. Lea (Burger Assembly & Sauce)
      else if (n.id === 'lea') {
        if (!state.quests.lea_done) {
          openDialogue(lore.lea.name, lore.lea.dialogue_quest, () => {
            state.quests.lea_done = true;
            state.inventory.add('ladle');
            updateInventoryUI();
            showItemPopup(
              'ladle',
              lore.items.ladle,
              state.lang === 'fr'
                ? "Lea vous donne sa louche d'huile de friture bouillante à 200°C pour faire fondre la glace McFlurry !"
                : "Lea gives you her boiling 400°F fry oil ladle to liquefy the sub-zero McFlurry ice!",
              () => checkKitchenProgress()
            );
          });
        } else {
          openDialogue(lore.lea.name, lore.lea.dialogue_done);
        }
      }

      // 6. Natan (Dishwasher Pit)
      else if (n.id === 'natan') {
        if (!state.quests.natan_done) {
          openDialogue(lore.natan.name, lore.natan.dialogue_quest, () => {
            state.quests.natan_done = true;
            state.inventory.add('gloves');
            updateInventoryUI();
            showItemPopup(
              'gloves',
              lore.items.gloves,
              state.lang === 'fr'
                ? "Natan vous donne ses gros gants industriels en néoprène anti-gel pour survivre au -18°C !"
                : "Natan gives you heavy nuclear-grade hazmat gloves to survive the -18°C freezer!",
              () => checkKitchenProgress()
            );
          });
        } else {
          openDialogue(lore.natan.name, lore.natan.dialogue_done);
        }
      }

      // 7. Raphael (Breakroom Safe)
      else if (n.id === 'raphael') {
        if (!state.quests.raphael_done) {
          openDialogue(lore.raphael.name, lore.raphael.dialogue_quest, () => {
            state.quests.raphael_done = true;
            updateMissionHud(state.lang === 'fr'
              ? "🔢 CODE [ 0040 ] CONNU : TAPE 0040 SUR LE COFFRE MURAL DERRIÈRE RAPHAEL"
              : "🔢 PIN [ 0040 ] REVEALED: PUNCH 0040 ON THE BREAKROOM WALL LOCKBOX");
          });
        } else {
          openDialogue(lore.raphael.name, lore.raphael.dialogue_done);
        }
      }

      // 8. Luca (Drive-Thru Window)
      else if (n.id === 'luca') {
        if (!state.quests.luca_done) {
          openDialogue(lore.luca.name, lore.luca.dialogue_quest, () => {
            state.quests.luca_done = true;
            state.inventory.add('headset');
            updateInventoryUI();
            showItemPopup(
              'headset',
              lore.items.headset,
              state.lang === 'fr'
                ? "Luca vous confie son casque pirate du Drive ! Il brouille le bureau de Natalie avec des fausses commandes !"
                : "Luca gives you his drive-thru jammer headset! It floods Natalie's office with fake vegan orders!",
              () => {
                updateMissionHud(state.lang === 'fr'
                  ? "🎯 OBJECTIF : DÉVERROUILLE LA CHAMBRE FROIDE AVEC LA CLÉ ET EXTRAIS L'ANNULAIRE"
                  : "🎯 OBJECTIVE: UNLOCK FREEZER WITH MASTER KEY & EXTRACT THE ANNULAIRE");
              }
            );
          });
        } else {
          openDialogue(lore.luca.name, lore.luca.dialogue_done);
        }
      }

      // 9. Natalie (Boss Showdown)
      else if (n.id === 'natalie') {
        if (!state.inventory.has('gift_box')) {
          openDialogue(lore.natalie.name, lore.natalie.idle);
        } else {
          startNatalieBattle();
        }
      }
    }

    // ============================================================
    // POI INTERACTIONS (LOGICAL QUEST FORWARDING)
    // ============================================================
    else if (nearby.type === 'poi') {
      const poi = nearby.data;

      // Natalie's Minivan (Back Parking Lot)
      if (poi.type === 'car_target') {
        if (!state.quests.car_pried) {
          if (!state.inventory.has('crowbar')) {
            openDialogue(lore.car.name, lore.car.inspect_locked);
          } else {
            state.quests.car_pried = true;
            state.inventory.add('pin_note');
            updateInventoryUI();
            openDialogue(lore.car.name, lore.car.inspect_pried, () => {
              showItemPopup(
                'handbook',
                state.lang === 'fr' ? "Post-it Secret de Natalie" : "Natalie's Secret PIN Note",
                state.lang === 'fr'
                  ? "« Code coffre mural chambre froide : [ 0040 ] (40 fois où j'ai reculé dans la benne parce que la benne m'a manqué de respect). Retenue sur salaire si quelqu'un se marre. »"
                  : "\"Freezer lockbox PIN: [ 0040 ] (40 times I backed into the dumpster because the dumpster had an attitude). Dock staff wages if they laugh.\"",
                () => checkBackLotProgress()
              );
            });
          }
        } else {
          openDialogue(
            lore.car.name,
            state.lang === 'fr'
              ? "La boîte à gants est fracturée. Vous avez déjà le post-it avec le code [ 0040 ]."
              : "The glovebox is pried open. You already have the sticky note with PIN [ 0040 ]."
          );
        }
      }

      // Industrial Dumpster (Back Parking Lot)
      else if (poi.type === 'dumpster_target') {
        if (!state.quests.dumpster_pried) {
          if (!state.inventory.has('crowbar')) {
            openDialogue(lore.dumpster.name, lore.dumpster.inspect_locked);
          } else {
            state.quests.dumpster_pried = true;
            state.inventory.add('handbook');
            updateInventoryUI();
            openDialogue(lore.dumpster.name, lore.dumpster.inspect_opened, () => {
              showItemPopup(
                'handbook',
                lore.items.handbook,
                state.lang === 'fr'
                  ? "Journal 2019 : L'annulaire est dans le carton McFlurry #4 ! Récupérez pinces, huile chaude et gants auprès des cuistots !"
                  : "2019 Diary: The annulaire is in McFlurry crate #4! Gather tongs, boiling oil, and heavy gloves from the kitchen crew!",
                () => checkBackLotProgress()
              );
            });
          }
        } else {
          openDialogue(
            lore.dumpster.name,
            state.lang === 'fr'
              ? "Un raton-laveur avec une visière Mc'Do mange des frites froides au fond."
              : "A raccoon in a tiny Mc'Do visor is eating cold fries at the bottom."
          );
        }
      }

      // Wall Lockbox (Breakroom)
      else if (poi.type === 'lockbox_target') {
        if (state.inventory.has('key')) {
          openDialogue('LOCKBOX', state.lang === 'fr' ? "Le coffre mural est vide." : "The wall lockbox is empty.");
        } else if (state.quests.raphael_done || state.inventory.has('pin_note')) {
          state.inventory.add('key');
          updateInventoryUI();
          showItemPopup(
            'key',
            lore.items.key,
            state.lang === 'fr'
              ? "Vous tapez [ 0 0 4 0 ] ! Le coffre s'ouvre d'un coup sec. Vous obtenez la Clé Maîtresse de la chambre froide !"
              : "You punch in [ 0 0 4 0 ]! The lockbox clicks open. You obtained the Freezer Master Key!",
            () => {
              updateMissionHud(state.lang === 'fr'
                ? "🎯 OBJECTIF : VA VOIR LUCA AU DRIVE POUR SON CASQUE BROUILLEUR"
                : "🎯 OBJECTIVE: TALK TO LUCA AT DRIVE-THRU FOR HIS JAMMER HEADSET");
            }
          );
        } else {
          openDialogue(
            'LOCKBOX',
            state.lang === 'fr'
              ? "Coffre verrouillé par code à 4 chiffres. Fouillez la boîte à gants du monospace de Natalie ou parlez à Raphael !"
              : "Locked with a 4-digit PIN. Search Natalie's minivan glovebox or talk to Raphael!"
          );
        }
      }

      // Sealed Freezer Vault Door
      else if (poi.type === 'door_target') {
        if (state.quests.freezer_unlocked) {
          openDialogue('FREEZER', state.lang === 'fr' ? "La porte blindée de la chambre froide est grand ouverte." : "The heavy freezer vault door is wide open.");
        } else if (state.inventory.has('key')) {
          state.quests.freezer_unlocked = true;
          mapLayout[12][33] = 0;
          mapLayout[13][33] = 0;
          audio.itemFanfare();
          openDialogue(
            'FREEZER VAULT',
            state.lang === 'fr'
              ? "CLIC ! La clé maîtresse déverrouille la porte blindée. Une vapeur glacée à -18°C s'échappe de la chambre froide !"
              : "CLICK! The master key unlocks the vault door. Sub-zero fog at -18°C pours out of the freezer!",
            () => {
              updateMissionHud(state.lang === 'fr'
                ? "🎯 OBJECTIF : ENTRE DANS LA CHAMBRE FROIDE ET EXTRAIS L'ANNULAIRE DU CARTON #4"
                : "🎯 OBJECTIVE: ENTER WALK-IN FREEZER & EXTRACT ANNULAIRE FROM CRATE #4");
            }
          );
        } else {
          audio.bump();
          openDialogue(
            'FREEZER VAULT',
            state.lang === 'fr'
              ? "Porte blindée cadenassée. Récupérez la clé maîtresse dans le coffre mural en salle de pause !"
              : "Heavy vault door locked. Get the master key from the breakroom wall safe!"
          );
        }
      }

      // Deep McFlurry Crate #4 (Contains the severed annulaire!)
      else if (poi.type === 'crate_target') {
        if (state.inventory.has('finger') || state.inventory.has('gift_box')) {
          openDialogue('MCFLURRY CRATE', state.lang === 'fr' ? "Le carton givré est vide. L'annulaire de Natalie est en votre possession !" : "The frosty crate is empty. You already extracted Natalie's annulaire!");
        } else if (state.inventory.has('tongs') && state.inventory.has('gloves') && state.inventory.has('ladle') && state.inventory.has('headset')) {
          state.inventory.add('finger');
          state.quests.finger_extracted = true;
          updateInventoryUI();
          showItemPopup(
            'finger',
            lore.items.finger,
            state.lang === 'fr'
              ? "Le casque de Luca sature le bureau de Natalie de fausses commandes ! Vous enfilez les gants de Natan, versez l'huile bouillante de Lea et arrachez l'annulaire fossilisé avec les pinces d'Arthur ! La bague 'Meilleure Directrice' brille encore !"
              : "Luca's jammer headset deafens Natalie with fake orders! You put on Natan's gloves, pour Lea's boiling fry oil, and yank Natalie's fossilized annulaire with Arthur's tongs! The 'Best Manager' ring gleams!",
            () => {
              updateMissionHud(state.lang === 'fr'
                ? "🎁 OBJECTIF : APPORTE L'ANNULAIRE À CLARA DANS LE LOBBY POUR UN EMBALLAGE DE LUXE"
                : "🎁 OBJECTIVE: BRING THE ANNULAIRE TO CLARA IN THE LOBBY FOR DELUXE PACKAGING");
            }
          );
        } else {
          openDialogue(
            'MCFLURRY CRATE (-18°C)',
            state.lang === 'fr'
              ? "L'annulaire est pris dans 15 cm de glace dure ! Il vous faut : les Pinces d'Arthur, la Louche de Lea, les Gants de Natan ET le Casque brouilleur de Luca !"
              : "The annulaire is trapped in 15cm of solid McFlurry ice! You need: Arthur's Tongs, Lea's Boiling Ladle, Natan's Gloves, AND Luca's Jammer Headset!"
          );
        }
      }

      // Kiosk #4 Sabotage
      else if (poi.type === 'kiosk_target') {
        if (state.quests.kiosk_sabotaged) {
          openDialogue(
            'KIOSK #4',
            state.lang === 'fr'
              ? "La borne est en court-circuit. L'écran clignote : « COMMANDE ENVOYÉE : 99 TRIPLE CHEESEBURGERS »."
              : "The kiosk is smoking. Screen reads: 'FATAL CRASH: 99 TRIPLE CHEESEBURGERS ORDERED'."
          );
        } else {
          state.quests.kiosk_sabotaged = true;
          mapLayout[18][19] = 14; // Broken kiosk tile
          audio.karenCry();

          openDialogue(
            state.lang === 'fr' ? 'SABOTAGE BORNE #4' : 'KIOSK #4 SABOTAGE',
            state.lang === 'fr'
              ? "Vous spammez une commande de 99 Triple Cheeseburgers avec triple cornichons ! La borne disjoncte et désactive le capteur de la porte arrière !"
              : "You spam an order for 99 Triple Cheeseburgers with extra pickles! The kiosk short-circuits and disables the rear door alarm sensor!",
            () => {
              updateMissionHud(state.lang === 'fr'
                ? "🎯 OBJECTIF : SORS PAR LA PORTE DE SERVICE ARRIÈRE ET PARLE À MILLER SUR LE PARKING"
                : "🎯 OBJECTIVE: EXIT THROUGH REAR SERVICE DOOR TO TALK TO MILLER IN PARKING LOT");
            }
          );
        }
      }

      // Info POIs
      else if (poi.type === 'fryer_info') {
        openDialogue(
          'FRY STATION',
          state.lang === 'fr'
            ? "Le chrono LED clignote : [ 00:40 ]. Natalie a déjà essayé de faire frire son propre smartphone pour détruire les avis 1 étoile sur Google Maps, puis a engueulé Arthur parce que l'huile 'ne dissolvait pas l'écran tactile assez vite' !"
            : "The LED timer blinks [ 00:40 ]. Natalie once tried to deep-fry her own smartphone to destroy negative 1-star reviews on Google Maps, then screamed at Arthur because the oil 'didn't dissolve the touchscreen fast enough'!"
        );
      } else if (poi.type === 'ice_cream_info') {
        openDialogue(
          'ICE CREAM MACHINE',
          state.lang === 'fr'
            ? "Machine scellée au ruban orange. Des traces de cuillère confirment le festin nocturne de Natalie."
            : "Taped shut with 'OUT OF ORDER'. Spoon marks confirm Natalie's midnight ice cream binges."
        );
      } else if (poi.type === 'soda_info') {
        openDialogue(
          'SODA FOUNTAIN',
          state.lang === 'fr'
            ? "Natalie a coupé le sirop à 70% d'eau du robinet de Tassin pour augmenter la marge du restaurant."
            : "Natalie watered down the soda syrup by 70% to maximize store margins."
        );
      } else if (poi.type === 'cctv_info') {
        openDialogue(
          'CCTV DESK',
          state.lang === 'fr'
            ? "3 écrans braqués en direct sur les poubelles, les caisses et le minuteur des frites."
            : "3 surveillance screens spying on employee lockers, the cash registers, and fry timers."
        );
      } else if (poi.type === 'front_doors_info') {
        openDialogue(
          'FRONT ENTRANCE DOORS',
          state.lang === 'fr'
            ? "Grandes portes automatiques vitrées donnant sur la place de Tassin la Demi-Lune."
            : "Automatic sliding glass doors opening onto the plaza of Tassin la Demi-Lune."
        );
      } else if (poi.type === 'back_doors_info') {
        openDialogue(
          'BACK SERVICE DOOR',
          state.lang === 'fr'
            ? "Porte de service menant au parking arrière où sont le monospace de Natalie, la police et la benne."
            : "Service exit leading out to the back parking lot where the police cruiser, minivan, and dumpster are."
        );
      }
    }
  }

  function checkBackLotProgress() {
    if (state.quests.dumpster_pried && (state.quests.car_pried || state.inventory.has('pin_note'))) {
      updateMissionHud(state.lang === 'fr'
        ? "🎯 OBJECTIF : RENTRE EN CUISINE ET RÉCUPÈRE LES 3 OUTILS (ARTHUR, LEA, NATAN)"
        : "🎯 OBJECTIVE: ENTER KITCHEN & GATHER 3 TOOLS (ARTHUR, LEA, NATAN)");
    }
  }

  function checkKitchenProgress() {
    if (state.quests.arthur_done && state.quests.lea_done && state.quests.natan_done) {
      updateMissionHud(state.lang === 'fr'
        ? "🎯 OBJECTIF : VA EN SALLE DE PAUSE PARLER À RAPHAEL POUR LA CLÉ DU CONGÉLATEUR"
        : "🎯 OBJECTIVE: GO TO BREAKROOM & TALK TO RAPHAEL FOR FREEZER MASTER KEY");
    }
  }

  // ------------------------------------------------------------
  // 11. INVENTORY HUD UPDATE
  // ------------------------------------------------------------
  function updateInventoryUI() {
    const invContainer = document.getElementById('hud-inventory');
    if (!invContainer) return;
    invContainer.innerHTML = '';

    const items = [
      { id: 'crowbar',     label: 'Crowbar',     icon: '🪓' },
      { id: 'pass_bistro', label: 'Bistro Pass', icon: '🎟️' },
      { id: 'pin_note',    label: 'PIN Note',    icon: '📝' },
      { id: 'handbook',    label: 'Handbook',    icon: '📖' },
      { id: 'tongs',       label: 'Tongs',       icon: '🥢' },
      { id: 'ladle',       label: 'Hot Ladle',   icon: '🥣' },
      { id: 'gloves',      label: 'Gloves',      icon: '🧤' },
      { id: 'key',         label: 'Master Key',  icon: '🔑' },
      { id: 'headset',     label: 'Jammer',      icon: '🎧' },
      { id: 'finger',      label: 'Annulaire',   icon: '💍' },
      { id: 'gift_box',    label: 'Gift Box',    icon: '🎁' }
    ];

    const collected = items.filter(it => state.inventory.has(it.id));
    if (collected.length === 0) {
      const emptyTag = document.createElement('div');
      emptyTag.style.cssText = 'color: #888; font-size: 7px; padding: 2px 6px; border: 1px dashed #555;';
      emptyTag.textContent = state.lang === 'fr' ? '🎒 SAC VIDE' : '🎒 EMPTY';
      invContainer.appendChild(emptyTag);
      return;
    }

    collected.forEach(it => {
      const div = document.createElement('div');
      div.className = 'hud-inv-slot active';
      div.title = it.label;
      div.textContent = it.icon;
      invContainer.appendChild(div);
    });
  }

  // ------------------------------------------------------------
  // 12. BOSS SHOWDOWN VS NATALIE & EXPLOSION CLIMAX
  // ------------------------------------------------------------
  const battleMenu = document.getElementById('battle-menu-container');
  const flashOverlay = document.getElementById('flash-overlay');
  const comicBanner = document.getElementById('explosion-banner');
  const victoryScreen = document.getElementById('victory-screen');

  function startNatalieBattle() {
    state.mode = 'BATTLE';
    player.canMove = false;
    audio.battleSweep();
    audio.karenCry();

    flashOverlay.style.opacity = '1';
    setTimeout(() => { flashOverlay.style.opacity = '0'; }, 150);

    state.battleStep = 0;
    state.rageLevel = 25;

    const lore = window.GAME_LORE[state.lang];
    const introLine = state.lang === 'fr'
      ? "La Directrice NATALIE vous foudroie du regard depuis son bureau !"
      : "Store Manager NATALIE glares down furiously from her desk!";

    openDialogue(lore.natalie.name, introLine, () => {
      showBattleMenu();
    });
  }

  function showBattleMenu() {
    battleMenu.style.display = 'grid';
    battleMenu.innerHTML = '';

    dlgBox.classList.add('battle-mode-split');
    dlgBox.style.display = 'block';
    dlgSpeaker.textContent = state.lang === 'fr' ? 'VOUS' : 'PLAYER';
    dlgText.textContent = state.lang === 'fr' ? 'Que va faire le TROLL ?' : 'What will TROLL do?';

    const actions = [
      {
        id: 'gift',
        label_en: '🎁 PRESENT AWARD',
        label_fr: '🎁 OFFRIR LE TROPHÉE',
        fn: () => executeBattleAction('gift')
      },
      {
        id: 'bullshit',
        label_en: '💍 ANNULAIRE (2019)',
        label_fr: '💍 ANNULAIRE (2019)',
        fn: () => executeBattleAction('gift')
      },
      {
        id: 'mockery',
        label_en: '🗣️ BAD MOCKERY',
        label_fr: '🗣️ FOUTAGE DE GUEULE',
        fn: () => executeBattleAction('mockery')
      },
      {
        id: 'run',
        label_en: '🏃 RUN',
        label_fr: '🏃 FUIR',
        fn: () => executeBattleAction('run')
      }
    ];

    actions.forEach(act => {
      const btn = document.createElement('button');
      btn.className = 'battle-action-btn';
      btn.textContent = state.lang === 'fr' ? act.label_fr : act.label_en;
      btn.onclick = (e) => {
        e.stopPropagation();
        audio.click();
        act.fn();
      };
      battleMenu.appendChild(btn);
    });
  }

  function hideBattleMenu() {
    battleMenu.style.display = 'none';
    dlgBox.classList.remove('battle-mode-split');
  }

  function executeBattleAction(action) {
    hideBattleMenu();
    const lore = window.GAME_LORE[state.lang];

    if (action === 'run') {
      audio.bump();
      openDialogue(
        lore.natalie.name,
        state.lang === 'fr'
          ? "Impossible de fuir ! Clement, Arthur, Clara, Lea, Natan, Raphael et Luca sont massés dans le couloir pour voir le spectacle !"
          : "Can't run! Clement, Arthur, Clara, Lea, Natan, Raphael, and Luca are crowding the hall with popcorn!",
        () => showBattleMenu()
      );
      return;
    }

    if (action === 'fries' || action === 'mockery' || action === 'troll') {
      state.rageLevel = Math.min(100, state.rageLevel + 25);
      audio.karenCry();
      openDialogue(
        lore.natalie.name,
        state.lang === 'fr'
          ? "« TU OSES TE FOUTRE DE MA GUEULE, DE MA COUPE PAPRIKA ET DE MES 40 BOSSES SUR MON MONOSPACE ?! JE SUIS LA REINE DE TASSIN ! »"
          : "« YOU DARE MOCK ME, MY PAPRIKA HAIRCUT, AND MY 40 MINIVAN DENTS?! I AM THE DICTATOR OF TASSIN! »",
        () => {
          if (state.rageLevel >= 100) {
            runExplosionSequence();
          } else {
            showBattleMenu();
          }
        }
      );
      return;
    }

    if (action === 'gift') {
      state.rageLevel = 45;
      audio.itemFanfare();

      const presentText = state.lang === 'fr'
        ? "Vous tendez la Boîte Happy Meal Dorée 24K : « Félicitations Natalie, pour 5 ans de tyrannie exemplaire à Tassin. »"
        : "You hand the 24K Golden Happy Meal Box to Natalie: \"Happy Anniversary Natalie, for 5 years of exemplary tyranny in Tassin.\"";

      openDialogue(state.lang === 'fr' ? 'VOUS' : 'YOU', presentText, () => {
        runExplosionSequence();
      });
    }
  }

  function runExplosionSequence() {
    const lore = window.GAME_LORE[state.lang];
    const finaleLines = lore.natalie.finale;

    let step = 0;
    function nextLine() {
      if (step < finaleLines.length) {
        state.rageLevel = Math.min(100, 45 + step * 11);
        audio.karenCry();
        canvas.classList.add('shake-screen');
        setTimeout(() => canvas.classList.remove('shake-screen'), 250);

        openDialogue(lore.natalie.name, finaleLines[step], () => {
          step++;
          nextLine();
        });
      } else {
        triggerExplosion();
      }
    }
    nextLine();
  }

  function triggerExplosion() {
    state.mode = 'EXPLODING';
    state.natalieExploded = true;
    audio.explosion();

    document.getElementById('game-screen').classList.add('shake-screen');

    flashOverlay.style.opacity = '1';
    setTimeout(() => { flashOverlay.style.opacity = '0'; }, 350);

    if (comicBanner) {
      comicBanner.style.transform = 'translate(-50%, -50%) scale(1.3)';
    }

    // Spawn highly detailed explosion elements:
    // Nuggets, VIP Coupons, Clumps of Paprika Hair, Shattered Gold Badges, Sauce Splatters, Fiery Embers & Shockwaves
    state.particles = [];
    const originX = 470;
    const originY = 160;

    // 1. Expanding Shockwaves
    for (let i = 0; i < 4; i++) {
      state.particles.push({
        x: originX,
        y: originY,
        vx: 0,
        vy: 0,
        rot: 0,
        vRot: 0,
        radius: 10 + i * 20,
        type: 'shockwave',
        life: 1.0 - i * 0.15
      });
    }

    // 2. Flying Golden McNuggets
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 11;
      state.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.35,
        type: 'nugget',
        life: 1.0
      });
    }

    // 3. 100% OFF VIP Discount Coupons
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      state.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2,
        type: 'coupon',
        life: 1.0
      });
    }

    // 4. Clumps of Spiky Paprika Hair
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 9;
      state.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.4,
        type: 'paprika_hair',
        life: 1.0
      });
    }

    // 5. Shattered Manager Badge Pieces
    for (let i = 0; i < 15; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 10;
      state.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.5,
        type: 'badge_piece',
        life: 1.0
      });
    }

    // 6. Ketchup & Mayo Sauce Splatters
    for (let i = 0; i < 25; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      state.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        r: 3 + Math.random() * 3,
        rot: 0,
        vRot: 0,
        type: i % 2 === 0 ? 'ketchup_splat' : 'mayo_splat',
        life: 1.0
      });
    }

    // 7. Sizzling Fiery Embers
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 12;
      state.particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        rot: 0,
        vRot: 0,
        type: 'ember',
        life: 0.8 + Math.random() * 0.4
      });
    }

    setTimeout(() => {
      document.getElementById('game-screen').classList.remove('shake-screen');
      showVictoryScreen();
    }, 2900);
  }

  function showVictoryScreen() {
    state.mode = 'VICTORY';
    state.natalieExploded = true;
    audio.itemFanfare();
    if (comicBanner) comicBanner.style.transform = 'translate(-50%, -50%) scale(0)';
    victoryScreen.style.display = 'flex';

    // Start victory dance anime video
    const vicVideo = document.getElementById('victory-video');
    if (vicVideo) {
      vicVideo.currentTime = 0;
      vicVideo.play().catch(() => {});
    }
  }

  // ------------------------------------------------------------
  // 13. RENDER LOOP (16-BIT RETRO PIXEL ENGINE)
  // ------------------------------------------------------------
  let lastTime = 0;
  let timerBlink = 0;

  function render(time) {
    const dt = time - lastTime;
    lastTime = time;
    timerBlink += dt;

    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    if (state.mode === 'OVERWORLD') {
      renderOverworld();
    } else if (state.mode === 'KICKOUT_ANIM') {
      renderKickOut(time);
    } else if (state.mode === 'BATTLE' || state.mode === 'EXPLODING') {
      renderBattle();
    } else if (state.mode === 'VICTORY') {
      renderVictoryCelebration();
    }

    renderParticles();
    updatePlayerMovement();
    updatePrompt();

    requestAnimationFrame(render);
  }

  function renderMapAndNPCs() {
    ctx.save();
    ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

    // 1. Draw Map Tiles
    for (let r = 0; r < MAP_ROWS; r++) {
      for (let c = 0; c < MAP_COLS; c++) {
        const tileId = mapLayout[r][c];
        const tileName = TILE_NAMES[tileId] || 'asphalt';
        const x = c * TILE_SIZE;
        const y = r * TILE_SIZE;

        if ((c === 7 || c === 8) && (r === 2 || r === 3)) {
          pixel.drawTile(x, y, 'asphalt');
          continue;
        }
        if ((c === 17 || c === 18) && (r === 2 || r === 3)) {
          pixel.drawTile(x, y, 'asphalt');
          continue;
        }

        pixel.drawTile(x, y, tileName);

        // Blinking 00:40 LED display neatly mounted on kitchen fryer tile
        if (r === 10 && c === 13) {
          const isBlinkOn = Math.floor(timerBlink / 400) % 2 === 0;
          const bezelW = 36;
          const bezelH = 12;
          const bx = x + Math.floor((48 - bezelW) / 2); // exactly x + 6, centered in 48px tile
          const by = y - 3; // neatly sits on upper ledge of fryer
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(bx, by, bezelW, bezelH);
          ctx.strokeStyle = '#e74c3c';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(bx, by, bezelW, bezelH);
          if (isBlinkOn) {
            ctx.fillStyle = '#ff4757';
            ctx.font = '7px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('00:40', x + 24, by + Math.floor(bezelH / 2) + 1);
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
          }
        }

        // Sparkling Annulaire in deep freezer crate #4
        if (r === 13 && c === 37 && !state.inventory.has('finger') && !state.inventory.has('gift_box')) {
          const sparkX = x + 24 + Math.sin(timerBlink / 150) * 8;
          const sparkY = y + 24 + Math.cos(timerBlink / 150) * 8;
          ctx.fillStyle = '#ffd700';
          ctx.fillRect(sparkX, sparkY, 4, 4);
          ctx.fillStyle = '#fff';
          ctx.fillRect(sparkX + 1, sparkY + 1, 2, 2);
        }
      }
    }

    // 2. Draw Vehicles in Back Parking Lot
    pixel.drawVehicle(7 * TILE_SIZE, 2 * TILE_SIZE, 'police_car');
    pixel.drawVehicle(17 * TILE_SIZE, 2 * TILE_SIZE, 'natalie_van');

    // 3. Draw NPCs (All 7 workers + Miller + Natalie)
    for (const key in npcs) {
      const n = npcs[key];
      const x = n.col * TILE_SIZE;
      const y = n.row * TILE_SIZE;

      if (n.type === 'natalie') {
        const isMad = state.rageLevel > 20 || state.inventory.has('gift_box');
        pixel.drawNatalie(x, y, isMad, 1);
        ctx.fillStyle = '#ffd700';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText('NATALIE', x + 2, y - 4);
      } else if (n.type === 'cop') {
        pixel.drawCop(x, y, 'miller');
        ctx.fillStyle = '#54a0ff';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText('OFFICER MILLER', x - 14, y - 4);
      } else {
        pixel.drawWorker(x, y, n.id);
        ctx.fillStyle = '#fff';
        ctx.font = '7px "Press Start 2P", monospace';
        ctx.fillText(n.name.toUpperCase(), x + 4, y - 4);
      }
    }

    ctx.restore();
  }

  function renderOverworld() {
    updateCamera();
    renderMapAndNPCs();

    ctx.save();
    ctx.translate(-Math.round(camera.x), -Math.round(camera.y));

    // 4. Draw Player
    pixel.drawPlayer(player.x, player.y, player.dir, player.frame);

    // Floating indicator over player for first 6 seconds
    if (timerBlink < 6000) {
      const bounceY = Math.sin(timerBlink / 150) * 4;
      ctx.fillStyle = '#ffd700';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('▼ YOU', player.x + 4, player.y - 10 + bounceY);
    }

    ctx.restore();
  }

  function renderBattle() {
    ctx.fillStyle = '#1b1429';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    ctx.fillStyle = 'rgba(241, 196, 15, 0.08)';
    ctx.beginPath();
    ctx.arc(360, 200, 180, Math.PI, 0);
    ctx.fill();

    // Checkered battle floor
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 8; j++) {
        ctx.fillStyle = (i + j) % 2 === 0 ? '#2c1e4a' : '#23153c';
        ctx.fillRect(i * 48, 280 + j * 32, 48, 32);
      }
    }

    // 1. BOSS HUD
    const hudX = 390;
    const hudY = 30;
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(hudX, hudY, 290, 75);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    ctx.strokeRect(hudX, hudY, 290, 75);

    ctx.fillStyle = '#c0392b';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText('NATALIE  Lv.50', hudX + 16, hudY + 24);

    ctx.fillStyle = '#222';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(state.lang === 'fr' ? 'TENSION :' : 'RAGE / BP :', hudX + 16, hudY + 44);

    ctx.fillStyle = '#333';
    ctx.fillRect(hudX + 115, hudY + 34, 150, 14);

    const rageRatio = Math.min(1, state.rageLevel / 100);
    ctx.fillStyle = rageRatio > 0.7 ? '#e74c3c' : rageRatio > 0.4 ? '#f39c12' : '#2ecc71';
    ctx.fillRect(hudX + 117, hudY + 36, 146 * rageRatio, 10);

    ctx.fillStyle = '#555';
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.fillText(`${state.rageLevel * 90} PSI`, hudX + 115, hudY + 62);

    // 2. BOSS SPRITE
    if (!state.natalieExploded && state.mode !== 'VICTORY') {
      let bossShakeX = 0;
      if (state.rageLevel > 40) {
        bossShakeX = (Math.random() - 0.5) * (state.rageLevel / 15);
      }
      pixel.drawNatalieBattle(ctx, 430 + bossShakeX, 110, state.rageLevel, false);
    } else {
      // NATALIE HAS EXPLODED AND COMPLETELY DISAPPEARED!
      ctx.fillStyle = 'rgba(10, 5, 20, 0.75)';
      ctx.beginPath();
      ctx.ellipse(470, 195, 42, 14, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shattered burnt manager badge
      ctx.fillStyle = '#7d6608';
      ctx.fillRect(464, 192, 10, 5);
      ctx.fillStyle = '#b7950b';
      ctx.fillRect(465, 193, 3, 3);

      // Rising carbon smoke particles
      if (Math.random() < 0.35) {
        state.particles.push({
          x: 468 + (Math.random() - 0.5) * 30,
          y: 192,
          vx: (Math.random() - 0.5) * 0.7,
          vy: -1.0 - Math.random() * 1.2,
          rot: 0,
          vRot: 0,
          type: 'smoke',
          life: 0.9
        });
      }
    }

    // 3. PLAYER HUD
    const pHudX = 40;
    const pHudY = 250;
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(pHudX, pHudY, 260, 60);
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    ctx.strokeRect(pHudX, pHudY, 260, 60);

    ctx.fillStyle = '#2980b9';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillText(state.lang === 'fr' ? 'TROLLER  Lv.99' : 'TROLL  Lv.99', pHudX + 16, pHudY + 24);

    ctx.fillStyle = '#222';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('HP: 999/999', pHudX + 16, pHudY + 44);

    // 4. PLAYER BACK SPRITE
    pixel.drawPlayerBack(ctx, 110, 310, 4);
  }

  function renderVictoryCelebration() {
    renderBattle();

    // ALL 7 WORKERS + MILLER CELEBRATING:
    pixel.drawCop(40, 400, 'miller');
    pixel.drawWorker(100, 400, 'clement');
    pixel.drawWorker(160, 410, 'arthur');
    pixel.drawWorker(220, 395, 'clara');
    pixel.drawWorker(280, 415, 'lea');
    pixel.drawWorker(340, 400, 'natan');
    pixel.drawWorker(400, 410, 'raphael');
    pixel.drawWorker(460, 395, 'luca');

    ctx.fillStyle = '#ffd700';
    ctx.font = '8.5px "Press Start 2P", monospace';
    ctx.fillText(state.lang === 'fr'
      ? '🎉 CLEMENT: "NATALIE A EXPLOSÉ COMME DU POP-CORN !"'
      : '🎉 CLEMENT: "NATALIE POPPED LIKE A POPCORN!"', 40, 80);
    ctx.fillText(state.lang === 'fr'
      ? '🍟 CLARA: "90 NUGGETS GRATUITS POUR TOUT LE MONDE !"'
      : '🍟 CLARA: "90 FREE NUGGETS FOR EVERYONE!"', 40, 105);
    ctx.fillText(state.lang === 'fr'
      ? '🍦 LUCA: "LA MACHINE À GLACE DU DRIVE EST RÉPARÉE !"'
      : '🍦 LUCA: "THE DRIVE-THRU ICE CREAM MACHINE IS HEALED!"', 40, 130);
  }

  function renderParticles() {
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const p = state.particles[i];

      if (p.type === 'shockwave') {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 220, 100, ${Math.max(0, p.life)})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        p.radius += 8;
        p.life -= 0.04;
        if (p.life <= 0) {
          state.particles.splice(i, 1);
        }
        continue;
      }

      if (p.type === 'smoke') {
        ctx.save();
        ctx.fillStyle = `rgba(160, 150, 170, ${Math.max(0, p.life * 0.4)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 + (1 - p.life) * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.025;
        if (p.life <= 0) {
          state.particles.splice(i, 1);
        }
        continue;
      }

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22;
      p.rot += p.vRot;

      if (p.type === 'nugget') {
        pixel.drawNugget(p.x, p.y, p.rot);
      } else if (p.type === 'coupon') {
        pixel.drawCoupon(p.x, p.y, p.rot);
      } else if (p.type === 'paprika_hair') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = '#b03a2e';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(4, 2);
        ctx.lineTo(2, 5);
        ctx.lineTo(-3, 4);
        ctx.lineTo(-5, -1);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(-1, -3, 3, 4);
        ctx.restore();
      } else if (p.type === 'badge_piece') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(-5, -4);
        ctx.lineTo(6, -2);
        ctx.lineTo(3, 5);
        ctx.lineTo(-4, 3);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#b7950b';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      } else if (p.type === 'ketchup_splat') {
        ctx.save();
        ctx.fillStyle = '#c0392b';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r || 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(p.x - 1, p.y - 1, 1.5, 1.5);
        ctx.restore();
      } else if (p.type === 'mayo_splat') {
        ctx.save();
        ctx.fillStyle = '#fef9e7';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r || 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'ember') {
        ctx.save();
        ctx.fillStyle = p.life > 0.5 ? '#f39c12' : '#e74c3c';
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillRect(p.x, p.y, 3, 3);
        ctx.restore();
        p.life -= 0.02;
        if (p.life <= 0) {
          state.particles.splice(i, 1);
          continue;
        }
      }

      if (p.y > SCREEN_HEIGHT - 30) {
        p.y = SCREEN_HEIGHT - 30;
        p.vy *= -0.45;
        p.vx *= 0.8;
      }
    }
  }

  // ------------------------------------------------------------
  // 14. LANGUAGE, SOUND & TRAILER TOGGLES
  // ------------------------------------------------------------
  window.toggleLanguage = function() {
    state.lang = state.lang === 'en' ? 'fr' : 'en';
    window.LANG = state.lang;
    const btn = document.getElementById('lang-btn');
    if (btn) btn.textContent = state.lang === 'en' ? '🇫🇷 FR' : '🇬🇧 EN';

    const lore = window.GAME_LORE[state.lang];
    const hudMission = document.getElementById('hud-mission');
    if (hudMission) hudMission.textContent = lore.hudMission;
    const compass = document.getElementById('compass');
    if (compass) compass.textContent = lore.compass;

    const titleSub = document.getElementById('title-sub');
    if (titleSub) {
      titleSub.textContent = state.lang === 'fr'
        ? "Le Braquage Troll Légendaire • Mc'Do Tassin la Demi-Lune (Lyon)"
        : "The Legendary Troll Heist • Mc'Do Tassin la Demi-Lune (Lyon)";
    }
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.textContent = state.lang === 'fr' ? "▶ LANCER LE BRAQUAGE" : "▶ START HEIST";
    }
    audio.click();
  };

  window.toggleSound = function() {
    audio.init();
    audio.muted = !audio.muted;
    const btn = document.getElementById('sound-btn');
    if (btn) btn.textContent = audio.muted ? '🔇 MUTED' : '🔊 SOUND';
  };

  window.toggleTrailerSound = function() {
    const video = document.getElementById('intro-video');
    const btn = document.getElementById('trailer-sound-btn');
    if (!video) return;
    video.muted = !video.muted;
    if (btn) {
      btn.textContent = video.muted ? '🔊 UNMUTE TRAILER' : '🔇 MUTE TRAILER';
    }
  };

  window.startGame = function() {
    audio.init();

    // Pause intro video
    const video = document.getElementById('intro-video');
    if (video) video.pause();

    // Hide title screen, show clean top HUD
    document.getElementById('title-screen').style.display = 'none';
    const topHud = document.getElementById('top-hud');
    if (topHud) topHud.style.display = 'flex';

    player.canMove = true;
    updateInventoryUI();
    updateCamera();

    updateMissionHud(state.lang === 'fr'
      ? "🎯 OBJECTIF : ENTRE DANS LE MC'DO ET PARLE À CLEMENT OU CLARA"
      : "🎯 OBJECTIVE: ENTER MC'DO & TALK TO CLEMENT OR CLARA");
  };

  // ------------------------------------------------------------
  // 15. EXPOSE GLOBALS & START LOOP
  // ------------------------------------------------------------
  window.mapLayout = mapLayout;
  window.player = player;
  window.state = state;
  window.npcs = npcs;
  window.interactables = interactables;
  window.openDialogue = openDialogue;
  window.advanceDialogue = advanceDialogue;
  window.selectDialogueChoice = selectDialogueChoice;
  window.triggerKickOut = triggerKickOut;
  window.getNearbyInteractable = getNearbyInteractable;
  window.checkInteraction = checkInteraction;
  window.showBattleMenu = showBattleMenu;
  window.executeBattleAction = executeBattleAction;
  window.triggerExplosion = triggerExplosion;

  window.triggerBattle = function() {
    state.inventory.add('crowbar');
    state.inventory.add('pass_bistro');
    state.inventory.add('pin_note');
    state.inventory.add('handbook');
    state.inventory.add('tongs');
    state.inventory.add('ladle');
    state.inventory.add('gloves');
    state.inventory.add('key');
    state.inventory.add('headset');
    state.inventory.add('gift_box');
    updateInventoryUI();
    startNatalieBattle();
  };

  function handleHash() {
    const q = window.location.hash + window.location.search;
    if (q.includes('battle')) {
      window.startGame();
      window.triggerBattle();
    } else if (q.includes('autostart')) {
      window.startGame();
    }
  }

  window.addEventListener('hashchange', handleHash);
  handleHash();

  requestAnimationFrame(render);

})();
