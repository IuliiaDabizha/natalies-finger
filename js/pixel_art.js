// ============================================================
//  js/pixel_art.js — Authentic 16-bit GBA Pokémon Style Pixel Art Engine
//  Generates true pixel sprites & tiles with authentic palettes.
//  NO GEOMETRIC 3D SHAPES OR PRIMITIVES.
// ============================================================

class PixelArtRenderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.scale = 3; // 16x16 tiles rendered at 48x48
    this.spriteCache = {};
    this.initPalettes();
  }

  initPalettes() {
    this.pal = {
      // Skin
      skinLight: '#ffd3b6',
      skinMid: '#e5aa85',
      skinDark: '#be7856',

      // Hair
      hairDarkBrown: '#3a1f14',
      hairMidBrown: '#563122',
      hairRedStreak: '#a92828',
      hairRedBright: '#d63031',
      hairBlack: '#191919',

      // Mc'Do Uniforms
      mcdoMaroon: '#78111e',
      mcdoMaroonDark: '#500912',
      mcdoRed: '#c72c41',
      mcdoYellow: '#f1c40f',
      mcdoGold: '#ffd700',
      mcdoGrey: '#393e46',
      mcdoDarkGrey: '#222831',

      // Player clothes
      playerBlue: '#0984e3',
      playerDarkBlue: '#06528d',
      playerRed: '#ff4757',
      playerWhite: '#ffffff',
      playerBlack: '#1e272e',

      // Environment
      floorLight: '#c8b69b',
      floorDark: '#a38f73',
      floorGrid: '#7c6950',
      kitchenTile: '#747d8c',
      kitchenTileDark: '#57606f',
      steelLight: '#ced6e0',
      steelMid: '#a4b0be',
      steelDark: '#57606f',
      fryOil: '#e67e22',
      fryOilBright: '#f1c40f',
      iceLight: '#dff9fb',
      iceMid: '#c7ecee',
      iceDark: '#7ed6df',
      outline: '#111111'
    };
  }

  // Draw a grid of pixels from a string array
  drawPixelMatrix(c, x, y, matrix, colorMap, pixelSize = 3) {
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r];
      for (let col = 0; col < row.length; col++) {
        const char = row[col];
        if (char !== ' ' && char !== '.' && colorMap[char]) {
          c.fillStyle = colorMap[char];
          c.fillRect(x + col * pixelSize, y + r * pixelSize, pixelSize, pixelSize);
        }
      }
    }
  }

  // ------------------------------------------------------------
  // 1. PLAYER OVERWORLD SPRITE (4 Directions with Walk Frames)
  // ------------------------------------------------------------
  drawPlayer(x, y, dir = 'down', frame = 0) {
    const c = this.ctx;
    const p = this.pal;

    // Palette mapping
    const map = {
      'O': p.outline,
      'S': p.skinLight,
      'D': p.skinMid,
      'C': p.playerRed,     // Cap
      'J': p.playerBlue,    // Jacket
      'B': p.playerDarkBlue,
      'P': p.playerBlack,   // Pants
      'W': p.playerWhite,   // Sneaker soles
      'H': p.hairDarkBrown
    };

    // 16x20 matrix for DOWN facing
    let matrix;
    if (dir === 'down') {
      const walkShift = (frame % 2 === 1) ? 1 : 0;
      matrix = [
        "   OOOOOOOO   ",
        "  OCCCCCCCCCO ",
        "  OCCCCCCCCCO ",
        "  OCCCOOOOCCC ",
        "  OHSSSSSSDHO ",
        "  OHSOOSSOOHO ",
        "  OHSSSSSSDHO ",
        "   ODDSSSODD  ",
        "  OOJJJJJJOO  ",
        " OJJBJJJJBJJ  ",
        " OJJJJJJJJJJO ",
        " OJJJJJJJJJJO ",
        "  OOJJJJJJOO  ",
        "   OPPPPPOO   ",
        walkShift ?
        "   OPP  PPO   " :
        "   OPP  PPO   ",
        walkShift ?
        "   OPP  PPO   " :
        "   OPP  PPO   ",
        walkShift ?
        "   OWW  OPPO  " :
        "  OPPO  OWW   ",
        walkShift ?
        "   OWW  OWWO  " :
        "  OWWO  OWW   "
      ];
    } else if (dir === 'up') {
      matrix = [
        "   OOOOOOOO   ",
        "  OCCCCCCCCCO ",
        "  OCCCCCCCCCO ",
        "  OHHHHHHHHHO ",
        "  OHHHHHHHHHO ",
        "  OHHHHHHHHHO ",
        "   ODDSSSODD  ",
        "  OOJJJJJJOO  ",
        " OJJBJJJJBJJ  ",
        " OJJJJJJJJJJO ",
        " OJJJJJJJJJJO ",
        "  OOJJJJJJOO  ",
        "   OPPPPPOO   ",
        "   OPP  PPO   ",
        "   OPP  PPO   ",
        "  OWWO  OWWO  "
      ];
    } else {
      // Left / Right
      const isLeft = dir === 'left';
      c.save();
      if (isLeft) {
        c.translate(x + 48, y);
        c.scale(-1, 1);
        x = 0; y = 0;
      }
      matrix = [
        "   OOOOOOOO   ",
        "  OCCCCCCCCCO ",
        "  OCCCCCCCCCO ",
        "  OHSOOOOOOO  ",
        "  OHSSSSSOHO  ",
        "  OHSOOSSSHO  ",
        "  OHSSSSSDHO  ",
        "   ODDSSSODD  ",
        "  OOJJJJJJOO  ",
        " OJJBJJJJJJ   ",
        " OJJJJJJJJJO  ",
        "  OOJJJJJJOO  ",
        "   OPPPPPOO   ",
        "   OPP  PPO   ",
        "   OPP  PPO   ",
        "  OWWO  OWWO  "
      ];
      this.drawPixelMatrix(c, x, y, matrix, map, 3);
      c.restore();
      return;
    }

    this.drawPixelMatrix(c, x, y, matrix, map, 3);
  }

  // ------------------------------------------------------------
  // 1B. PLAYER DIZZY & KNOCKED OUT (Slapstick Kick-Out Landing)
  // ------------------------------------------------------------
  drawPlayerDizzy(x, y, timer = 0) {
    const c = this.ctx;
    const p = this.pal;

    // Palette mapping
    const map = {
      'O': p.outline,
      'S': p.skinLight,
      'D': p.skinMid,
      'C': p.playerRed,     // Cap
      'J': p.playerBlue,    // Jacket
      'B': p.playerDarkBlue,
      'P': p.playerBlack,   // Pants
      'W': p.playerWhite,   // Sneaker soles
      'H': p.hairDarkBrown,
      'X': '#e74c3c'        // Dizzy eye cross
    };

    // Knocker-out slumped matrix with "X" eyes
    const matrix = [
      "   OOOOOOOO   ",
      "  OCCCCCCCCCO ",
      "  OCCCCCCCCCO ",
      "  OCCCOOOOCCC ",
      "  OHSSSSSSDHO ",
      "  OHSXSODSXHO ", // X eyes!
      "  OHSSSSSSDHO ",
      "   ODDSSSODD  ",
      "  OOJJJJJJOO  ",
      " OJJBJJJJBJJ  ",
      " OJJJJJJJJJJO ",
      "  OOJJJJJJOO  ",
      "   OPPPPPOO   ",
      "   OPP  PPO   ",
      "  OWWO  OWWO  "
    ];

    c.save();
    // Dust puff / impact skid marks under player
    c.fillStyle = 'rgba(0, 0, 0, 0.25)';
    c.beginPath();
    c.ellipse(x + 24, y + 42, 26, 8, 0, 0, Math.PI * 2);
    c.fill();

    // Draw slumped body
    this.drawPixelMatrix(c, x, y + 6, matrix, map, 3);

    // Tilted flying cap detached on the pavement beside player
    c.fillStyle = '#e74c3c';
    c.fillRect(x - 10, y + 26, 14, 8);
    c.fillStyle = '#c0392b';
    c.fillRect(x - 14, y + 30, 8, 4);
    c.fillStyle = '#000';
    c.strokeRect(x - 14, y + 26, 18, 8);

    // Orbiting Cartoon Stars and Birds
    const baseAngle = timer * 0.005;
    for (let i = 0; i < 4; i++) {
      const a = baseAngle + (i * Math.PI * 2 / 4);
      const sx = x + 24 + Math.cos(a) * 24;
      const sy = y - 4 + Math.sin(a) * 9;

      if (i % 2 === 0) {
        // Yellow 4-point Star
        c.fillStyle = '#ffd700';
        c.fillRect(sx - 2, sy - 2, 5, 5);
        c.fillStyle = '#fff';
        c.fillRect(sx, sy, 2, 2);
        c.fillStyle = '#f39c12';
        c.fillRect(sx - 4, sy, 2, 1);
        c.fillRect(sx + 3, sy, 2, 1);
        c.fillRect(sx, sy - 4, 1, 2);
        c.fillRect(sx, sy + 3, 1, 2);
      } else {
        // Little Blue Cartoon Bird
        c.fillStyle = '#54a0ff';
        c.fillRect(sx - 3, sy - 2, 6, 4);
        c.fillStyle = '#f1c40f'; // beak
        c.fillRect(sx + 3, sy - 1, 2, 2);
        c.fillStyle = '#fff'; // eye
        c.fillRect(sx + 1, sy - 2, 2, 2);
        c.fillStyle = '#000';
        c.fillRect(sx + 2, sy - 2, 1, 1);
      }
    }

    // Little steam/sweat drop
    c.fillStyle = '#74b9ff';
    c.fillRect(x + 36, y + 10, 3, 4);
    c.fillStyle = '#fff';
    c.fillRect(x + 37, y + 11, 1, 2);

    c.restore();
  }

  // ------------------------------------------------------------
  // 2. NATALIE OVERWORLD SPRITE (50yo Short Chubby Manager)
  // ------------------------------------------------------------
  drawNatalie(x, y, isAngry = false, swell = 1) {
    const c = this.ctx;
    const p = this.pal;

    const map = {
      'O': p.outline,
      'S': isAngry ? '#ff7979' : p.skinLight,
      'D': isAngry ? '#d63031' : p.skinDark,
      'H': p.hairDarkBrown,
      'R': p.hairRedBright, // Chunk red streaks
      'M': isAngry ? '#c72c41' : p.mcdoMaroon, // Polo
      'G': p.mcdoGold,      // Badge
      'P': p.playerBlack,   // Slacks
      'B': '#ffffff',       // Bandaged stump on annulaire
      'X': '#e74c3c'        // Blood spot
    };

    // Short & Chubby pear shape
    const matrix = [
      "   OOHRHRHHOO   ",
      "  OHRRHHHRRHHO  ",
      "  OHHHHHHHHHHO  ",
      "  OHSDSSSSDSHO  ",
      "  OHSOOSSOOHHO  ",
      "  OHDSDDDSDHHO  ",
      "   ODSSSSSSD    ", // Double chin
      "  OOMMMMMMMMOO  ",
      " OMMGGMGGMMMMMO ", // Name badge
      " OMMMMMMMMMMMMO ", // Fat belly
      " OMMMMMMMMMMMMO ",
      " OMMMMMMMMMMMMO ",
      "  OOMMMMMMMMOO  ",
      "   OBB   OPPO   ", // Bandaged hand on right side!
      "   OXX   OPPO   ",
      "   OPP   OPPO   ",
      "  OPPO   OPPO   "
    ];

    c.save();
    if (swell > 1) {
      c.translate(x + 24, y + 24);
      c.scale(swell, swell);
      x = -24; y = -24;
    }
    this.drawPixelMatrix(c, x, y, matrix, map, 3);
    c.restore();
  }

  // ------------------------------------------------------------
  // 3. WORKER SPRITES (Clement, Arthur, Karim, Maxime, Enzo, Julien, Luca, Chloe)
  // ------------------------------------------------------------
  drawWorker(x, y, type = 'clement') {
    const c = this.ctx;
    const p = this.pal;

    let capColor = p.mcdoRed;
    let shirtColor = p.mcdoGrey;
    let apronColor = p.mcdoMaroon;
    let pantsColor = p.playerBlack;
    let handItem = p.playerWhite;
    let hairColor = p.hairDarkBrown;

    if (type === 'karim' || type === 'clara') {
      capColor = '#e84393';       // Pink cap
      hairColor = '#f5cd79';      // Blonde hair
      apronColor = '#fd79a8';     // Pink apron
      shirtColor = '#6c5ce7';     // Purple shirt
      handItem = '#ffd700';       // Golden pass / gift
    } else if (type === 'arthur') {
      capColor = p.mcdoRed;
      apronColor = p.mcdoMaroon;
      handItem = '#bdc3c7';       // Stainless spatula
    } else if (type === 'maxime' || type === 'lea') {
      capColor = '#d63031';
      hairColor = '#e17055';      // Auburn hair
      apronColor = '#ecf0f1';     // White sauce-stained apron
      shirtColor = '#c0392b';
      handItem = '#f39c12';       // Oil ladle
    } else if (type === 'enzo' || type === 'natan') {
      capColor = '#7f8c8d';
      hairColor = '#2d3436';      // Dark hair
      apronColor = '#f1c40f';     // Yellow rubber apron
      shirtColor = '#34495e';
      handItem = '#e67e22';       // Heavy rubber gloves
    } else if (type === 'julien' || type === 'raphael') {
      capColor = '#2c3e50';       // Dark hoodie
      shirtColor = '#34495e';
      apronColor = '#2c3e50';
      hairColor = '#e74c3c';      // Red dye
      handItem = '#bdc3c7';       // Safe keys
    } else if (type === 'luca') {
      capColor = p.mcdoRed;
      shirtColor = '#2c3e50';
      apronColor = p.mcdoMaroon;
      handItem = '#2ed573';       // Green headset
    } else if (type === 'chloe') {
      capColor = '#e84393';       // Pink headset ribbon
      hairColor = '#f5cd79';      // Blonde hair
      apronColor = '#fd79a8';
      shirtColor = '#6c5ce7';
      handItem = '#ffd700';       // Golden gift box
    }

    const map = {
      'O': p.outline,
      'S': p.skinLight,
      'D': p.skinMid,
      'C': capColor,
      'M': shirtColor,
      'A': apronColor,
      'P': pantsColor,
      'W': handItem,
      'H': hairColor,
      'Y': p.mcdoYellow
    };

    const matrix = [
      "   OOOOOOOO   ",
      "  OCCCCCCCCCO ",
      "  OCCCOOOOCCC ",
      "  OHSSSSSSDHO ",
      "  OHSOOSSOOHO ",
      "  OHSSSSSSDHO ",
      "   ODDSSSODD  ",
      "  OOMMMMMMOO  ",
      " OMMAMMMMMMMO ",
      " OAAAAAAAAAAO ",
      " OAAAAAAAAAAO ",
      "  OOAAAAAAOO  ",
      "   OPPPPPOO   ",
      "   OPP  PPO   ",
      "   OPP  PPO   ",
      "  OWWO  OPPO  "
    ];

    this.drawPixelMatrix(c, x, y, matrix, map, 3);
  }

  // ------------------------------------------------------------
  // 4. NATALIE BATTLE SPRITE (FULL 48x48 POKEMON BOSS SPRITE)
  // ------------------------------------------------------------
  drawNatalieBattle(c, x, y, rageLevel = 0, isExploding = false) {
    const p = this.pal;
    const map = {
      'O': p.outline,
      'S': rageLevel > 50 ? '#ff7675' : p.skinLight,
      'D': rageLevel > 50 ? '#d63031' : p.skinMid,
      'H': p.hairDarkBrown,
      'R': p.hairRedBright,
      'M': rageLevel > 70 ? '#e74c3c' : p.mcdoMaroon,
      'G': p.mcdoGold,
      'B': '#ffffff', // Bandage
      'X': '#eb2f06', // Blood spot
      'W': '#ffffff', // Eyeball whites
      'P': '#111111'  // Pupils
    };

    // Detailed 28x32 boss sprite matrix
    const matrix = [
      "      OOOOOOHHRRRHHHOOOOOO      ",
      "    OOHHRRRHHHHHHHHHHHRRHHOO    ",
      "   OHRRHHHHHHHHHHHHHHHHHHRRHO   ",
      "  OHRHHHHHHHHHHHHHHHHHHHHHHRHO  ",
      "  OHHHHHHHHHHHHHHHHHHHHHHHHHHO  ",
      "  OHHHSSSSSSSSSSSSSSSSSSSSSHHO  ",
      "  OHHSSSSSSSSSSSSSSSSSSSSSSHHO  ",
      "  OHHSOOWWPOOOOOOOOOOWWPOSSHHO  ", // Bulging furious eyes!
      "  OHHSOOWWPOOOOOOOOOOWWPOSSHHO  ",
      "  OHHSSSSSSSSSSSSSSSSSSSSSSHHO  ",
      "  OHHSSSDDDDDDDDDDDDDDDDSSSHHO  ",
      "  OHHSSSOOOOOOOOOOOOOOOSSSSHHO  ", // Yelling mouth
      "   ODDSSOOWWWWWWWWWWOOSSSDDDO   ", // Teeth
      "    ODDSSOOOOOOOOOOOOOSSSDDD    ",
      "     ODDDDDDDDDDDDDDDDDDDD      ", // Heavy double chin!
      "    OOOOOMMMMMMMMMMMMMOOOOO     ",
      "   OMMMMMMMMMMMMMMMMMMMMMMMMO   ",
      "  OMMMMMGGGGGGGGGGGGMMMMMMMMMO  ", // Store Manager Badge
      "  OMMMMMG NATALIE  GMMMMMMMMMO  ",
      " OMMMMMMGGGGGGGGGGGGMMMMMMMMMMO ",
      " OMMMMMMMMMMMMMMMMMMMMMMMMMMMMO ", // Fat belly
      " OMMMMMMMMMMMMMMMMMMMMMMMMMMMMO ",
      " OMMMMMMMMMMMMMMMMMMMMMMMMMMMMO ",
      "  OMMMMMMMMMMMMMMMMMMMMMMMMMMO  ",
      "   OOOOOBBBBOOOOOOOOOOOOOOOOO   ", // Waving bandaged stump!
      "       OBXXBO                   ",
      "       OBBBBO                   "
    ];

    this.drawPixelMatrix(c, x, y, matrix, map, 4);
  }

  // ------------------------------------------------------------
  // 5. TILE RENDERING (Counters, Fryers, Tables, Ice Crates)
  // ------------------------------------------------------------
  drawTile(x, y, type = 'counter') {
    const c = this.ctx;
    const p = this.pal;
    const s = 48; // 16px * 3

    if (type === 'floor') {
      c.fillStyle = p.floorLight;
      c.fillRect(x, y, s, s);
      c.fillStyle = p.floorDark;
      c.fillRect(x + 2, y + 2, s - 4, s - 4);
      c.strokeStyle = p.floorGrid;
      c.strokeRect(x, y, s, s);
    } else if (type === 'kitchen_floor') {
      c.fillStyle = p.kitchenTile;
      c.fillRect(x, y, s, s);
      c.fillStyle = p.kitchenTileDark;
      c.fillRect(x + 4, y + 4, s - 8, s - 8);
      c.strokeStyle = '#2f3542';
      c.strokeRect(x, y, s, s);
    } else if (type === 'freezer_floor') {
      c.fillStyle = p.iceLight;
      c.fillRect(x, y, s, s);
      c.fillStyle = p.iceMid;
      c.fillRect(x + 2, y + 2, s - 4, s - 4);
      c.strokeStyle = p.iceDark;
      c.strokeRect(x, y, s, s);
    } else if (type === 'counter') {
      c.fillStyle = '#784212';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#a0522d';
      c.fillRect(x, y, s, 14);
      c.strokeStyle = '#2d1502';
      c.lineWidth = 2;
      c.strokeRect(x, y, s, s);
    } else if (type === 'fryer') {
      c.fillStyle = p.steelDark;
      c.fillRect(x, y, s, s);
      c.fillStyle = p.fryOil;
      c.fillRect(x + 6, y + 10, s - 12, s - 16);
      c.fillStyle = p.fryOilBright;
      c.fillRect(x + 12, y + 16, 12, 10);
      c.strokeStyle = '#111';
      c.strokeRect(x, y, s, s);
    } else if (type === 'ice_crate') {
      c.fillStyle = p.iceMid;
      c.fillRect(x, y, s, s);
      c.fillStyle = p.iceLight;
      c.fillRect(x + 4, y + 4, s - 8, s - 8);
      c.strokeStyle = p.iceDark;
      c.strokeRect(x, y, s, s);
    } else if (type === 'wall') {
      c.fillStyle = '#2c2c54';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#40407a';
      c.fillRect(x + 2, y + 2, s - 4, s - 4);
      c.strokeStyle = '#1e1e38';
      c.strokeRect(x, y, s, s);
      // Top baseboard
      c.fillStyle = '#ffb142';
      c.fillRect(x, y + s - 6, s, 6);
    } else if (type === 'register') {
      c.fillStyle = '#784212';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#333';
      c.fillRect(x + 10, y + 10, 28, 24);
      c.fillStyle = '#2ed573';
      c.fillRect(x + 14, y + 14, 20, 10);
      c.strokeStyle = '#111';
      c.strokeRect(x, y, s, s);
    } else if (type === 'table') {
      c.fillStyle = p.floorLight;
      c.fillRect(x, y, s, s);
      c.fillStyle = '#f1c40f';
      c.fillRect(x + 4, y + 6, s - 8, s - 12);
      c.strokeStyle = '#d68910';
      c.lineWidth = 2;
      c.strokeRect(x + 4, y + 6, s - 8, s - 12);
    } else if (type === 'chair') {
      c.fillStyle = p.floorLight;
      c.fillRect(x, y, s, s);
      c.fillStyle = '#e74c3c';
      c.fillRect(x + 12, y + 10, 24, 28);
      c.fillStyle = '#c0392b';
      c.fillRect(x + 12, y + 10, 24, 8);
    } else if (type === 'freezer_door') {
      c.fillStyle = '#747d8c';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#a4b0be';
      c.fillRect(x + 4, y + 4, s - 8, s - 8);
      c.fillStyle = '#2ed573';
      c.fillRect(x + s - 14, y + 20, 6, 12); // Handle
      c.strokeStyle = '#2f3542';
      c.strokeRect(x, y, s, s);
    } else if (type === 'ice_cream_machine') {
      c.fillStyle = '#ced6e0';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#70a1ff';
      c.fillRect(x + 6, y + 4, s - 12, 14);
      c.fillStyle = '#e74c3c';
      c.fillRect(x + 8, y + 22, s - 16, 10); // "OUT OF ORDER" sticker
      c.strokeStyle = '#2f3542';
      c.strokeRect(x, y, s, s);
    } else if (type === 'drive_window') {
      c.fillStyle = '#2f3542';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#70a1ff';
      c.fillRect(x + 6, y + 6, s - 12, s - 12);
      c.strokeStyle = '#1e90ff';
      c.strokeRect(x + 6, y + 6, s - 12, s - 12);
    } else if (type === 'kiosk') {
      // Touchscreen Self-Order Kiosk
      c.fillStyle = '#1e272e';
      c.fillRect(x + 6, y + 2, s - 12, s - 4);
      c.fillStyle = '#2ed573'; // Green screen
      c.fillRect(x + 10, y + 6, s - 20, 24);
      c.fillStyle = '#ffffff'; // Kiosk logo
      c.fillRect(x + 14, y + 10, 8, 4);
      c.fillStyle = '#ff4757'; // Big touch button
      c.fillRect(x + 12, y + 22, s - 24, 6);
      c.strokeStyle = '#ffd700';
      c.strokeRect(x + 6, y + 2, s - 12, s - 4);
    } else if (type === 'kiosk_broken') {
      // Glitching / Smoking Kiosk #4
      c.fillStyle = '#1e272e';
      c.fillRect(x + 6, y + 2, s - 12, s - 4);
      c.fillStyle = '#ff4757'; // Red error screen
      c.fillRect(x + 10, y + 6, s - 20, 24);
      c.fillStyle = '#ffffff';
      c.font = '6px monospace';
      c.fillText('ERR!', x + 12, y + 18);
      c.strokeStyle = '#e74c3c';
      c.strokeRect(x + 6, y + 2, s - 12, s - 4);
    } else if (type === 'counter_gate_closed') {
      c.fillStyle = '#784212';
      c.fillRect(x, y, s, 10);
      c.fillStyle = '#e74c3c'; // Red electronic lock
      c.fillRect(x + 8, y + 16, s - 16, 16);
      c.strokeStyle = '#2d1502';
      c.strokeRect(x + 8, y + 16, s - 16, 16);
    } else if (type === 'counter_gate_open') {
      c.fillStyle = p.floorLight;
      c.fillRect(x, y, s, s);
      c.fillStyle = '#2ed573'; // Green open latch
      c.fillRect(x + 4, y + 10, 8, 28);
      c.strokeStyle = '#111';
      c.strokeRect(x + 4, y + 10, 8, 28);
    } else if (type === 'soda_fountain') {
      c.fillStyle = '#747d8c';
      c.fillRect(x + 4, y + 4, s - 8, s - 8);
      c.fillStyle = '#2ed573'; // Sprite
      c.fillRect(x + 8, y + 12, 6, 12);
      c.fillStyle = '#c72c41'; // Coke
      c.fillRect(x + 18, y + 12, 6, 12);
      c.fillStyle = '#e67e22'; // Fanta
      c.fillRect(x + 28, y + 12, 6, 12);
      c.strokeStyle = '#2f3542';
      c.strokeRect(x + 4, y + 4, s - 8, s - 8);
    } else if (type === 'trash_bin') {
      c.fillStyle = '#2c3e50';
      c.fillRect(x + 6, y + 6, s - 12, s - 10);
      c.fillStyle = '#f1c40f'; // "THANK YOU" flap
      c.fillRect(x + 10, y + 10, s - 20, 14);
      c.strokeStyle = '#111';
      c.strokeRect(x + 6, y + 6, s - 12, s - 10);
    } else if (type === 'lockbox') {
      c.fillStyle = '#2f3542';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#7f8c8d';
      c.fillRect(x + 8, y + 8, s - 16, s - 16);
      c.fillStyle = '#2ed573'; // Digital keypad
      c.fillRect(x + 14, y + 14, 20, 10);
      c.strokeStyle = '#f1c40f';
      c.strokeRect(x + 8, y + 8, s - 16, s - 16);
    } else if (type === 'cctv_desk') {
      c.fillStyle = '#341f97';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#0be881'; // 3 Glowing CCTV screens
      c.fillRect(x + 4, y + 6, 10, 10);
      c.fillRect(x + 18, y + 6, 10, 10);
      c.fillRect(x + 32, y + 6, 10, 10);
      c.strokeStyle = '#111';
      c.strokeRect(x, y, s, s);
    } else if (type === 'sink') {
      c.fillStyle = '#bdc3c7';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#70a1ff'; // Soapy water
      c.fillRect(x + 8, y + 8, s - 16, s - 16);
      c.fillStyle = '#ffffff'; // Bubbles
      c.fillRect(x + 12, y + 12, 4, 4);
      c.fillRect(x + 22, y + 18, 5, 5);
      c.strokeStyle = '#2c3e50';
      c.strokeRect(x, y, s, s);
    } else if (type === 'asphalt') {
      c.fillStyle = '#2f3542';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#1e272e';
      c.fillRect(x + 8, y + 12, 4, 4);
      c.fillRect(x + 28, y + 32, 4, 4);
    } else if (type === 'parking_line') {
      c.fillStyle = '#2f3542';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#f1c40f'; // Yellow parking stall line
      c.fillRect(x + 2, y, 6, s);
    } else if (type === 'sidewalk') {
      c.fillStyle = '#a4b0be';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#747d8c';
      c.fillRect(x, y + s - 4, s, 4);
      c.strokeStyle = '#57606f';
      c.strokeRect(x, y, s, s);
    } else if (type === 'dumpster') {
      c.fillStyle = '#10ac84'; // Green industrial dumpster
      c.fillRect(x + 2, y + 6, s - 4, s - 8);
      c.fillStyle = '#1e272e'; // Black lid
      c.fillRect(x, y + 4, s, 6);
      c.fillStyle = '#bdc3c7'; // Silver lock hasp
      c.fillRect(x + 20, y + 16, 8, 10);
      c.strokeStyle = '#006266';
      c.strokeRect(x + 2, y + 6, s - 4, s - 8);
    } else if (type === 'streetlight') {
      c.fillStyle = '#2f3542'; // Ground asphalt
      c.fillRect(x, y, s, s);
      c.fillStyle = '#ffd700'; // Warm light glow pool
      c.beginPath();
      c.arc(x + 24, y + 24, 22, 0, Math.PI * 2);
      c.fillStyle = 'rgba(241, 196, 15, 0.25)';
      c.fill();
      c.fillStyle = '#bdc3c7'; // Metal pole
      c.fillRect(x + 22, y + 4, 4, 38);
      c.fillStyle = '#fff';
      c.fillRect(x + 18, y + 2, 12, 6);
    } else if (type === 'glass_door') {
      c.fillStyle = '#74b9ff';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#ffd700'; // Golden arches sticker
      c.fillRect(x + 12, y + 14, 24, 18);
      c.fillStyle = '#74b9ff';
      c.fillRect(x + 18, y + 18, 12, 14);
      c.strokeStyle = '#0984e3';
      c.lineWidth = 2;
      c.strokeRect(x, y, s, s);
    } else if (type === 'drive_speaker') {
      c.fillStyle = '#2f3542';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#57606f'; // Speaker post
      c.fillRect(x + 12, y + 6, 24, 36);
      c.fillStyle = '#ff4757'; // Call button
      c.fillRect(x + 18, y + 26, 12, 6);
      c.strokeStyle = '#1e272e';
      c.strokeRect(x + 12, y + 6, 24, 36);
    } else if (type === 'grass') {
      c.fillStyle = '#20bf6b';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#26de81';
      c.fillRect(x + 6, y + 10, 4, 6);
      c.fillRect(x + 24, y + 22, 4, 6);
    } else if (type === 'fence') {
      c.fillStyle = '#2f3542';
      c.fillRect(x, y, s, s);
      c.fillStyle = '#ced6e0';
      c.fillRect(x, y + 16, s, 4);
      c.fillRect(x, y + 28, s, 4);
      c.fillRect(x + 12, y + 8, 4, 34);
      c.fillRect(x + 32, y + 8, 4, 34);
    }
  }

  // ------------------------------------------------------------
  // 5b. POLICE OFFICERS & VEHICLES
  // ------------------------------------------------------------
  drawCop(x, y, type = 'miller') {
    const c = this.ctx;
    const p = this.pal;
    const map = {
      'O': p.outline,
      'S': p.skinLight,
      'D': p.skinMid,
      'C': '#1e3799', // Police Cap
      'M': '#0c2461', // Police Uniform Shirt
      'B': '#f6b93b', // Gold Police Badge
      'P': '#1e272e', // Slacks
      'W': type === 'miller' ? '#f8a5c2' : '#f1c40f', // Donut or Flashlight!
      'H': '#2f3542',
      'G': '#2f3542'  // Sunglasses
    };
    const matrix = [
      "   OOOOOOOO   ",
      "  OCCCCCCCCCO ",
      "  OCCCOOOOCCC ",
      "  OGGGGGGGGG  ",
      "  OHSOOSSOOHO ",
      "  OHSSSSSSDHO ",
      "   ODDSSSODD  ",
      "  OOMMMMMMOO  ",
      " OMMBMMMMMMMO ",
      " OMMMMMMMMMMO ",
      " OMMMMMMMMMMO ",
      "  OOMMMMMMOO  ",
      "   OPPPPPOO   ",
      "   OPP  PPO   ",
      "   OPP  PPO   ",
      "  OWWO  OPPO  "
    ];
    this.drawPixelMatrix(c, x, y, matrix, map, 3);
  }

  drawVehicle(x, y, type = 'natalie_van') {
    const c = this.ctx;
    c.save();
    if (type === 'police_car') {
      c.fillStyle = '#0c2461';
      c.fillRect(x, y + 12, 96, 32);
      c.fillStyle = '#ffffff';
      c.fillRect(x + 24, y + 12, 48, 32);
      c.fillStyle = '#74b9ff';
      c.fillRect(x + 16, y + 14, 20, 12);
      c.fillRect(x + 42, y + 14, 20, 12);
      c.fillStyle = '#1e272e';
      c.fillRect(x + 12, y + 36, 18, 12);
      c.fillRect(x + 66, y + 36, 18, 12);
      const flash = Math.floor(Date.now() / 250) % 2 === 0;
      c.fillStyle = flash ? '#ff4757' : '#0984e3';
      c.fillRect(x + 36, y + 6, 10, 6);
      c.fillStyle = flash ? '#0984e3' : '#ff4757';
      c.fillRect(x + 48, y + 6, 10, 6);
      c.fillStyle = '#0c2461';
      c.font = '7px "Press Start 2P", monospace';
      c.fillText('POLICE', x + 28, y + 32);
    } else {
      // Natalie's Dented Minivan
      c.fillStyle = '#78111e';
      c.fillRect(x, y + 10, 96, 34);
      c.fillStyle = '#500912'; // Rust dent
      c.fillRect(x + 14, y + 24, 18, 8);
      c.fillStyle = '#81ecec';
      c.fillRect(x + 14, y + 14, 22, 12);
      c.fillRect(x + 42, y + 14, 26, 12);
      c.fillStyle = '#2d3436';
      c.fillRect(x + 10, y + 38, 18, 10);
      c.fillRect(x + 68, y + 38, 18, 10);
      c.fillStyle = '#f1c40f'; // Mc'Do 0% discount bumper sticker
      c.fillRect(x + 74, y + 28, 18, 8);
      c.fillStyle = '#111';
      c.font = '5px "Press Start 2P", monospace';
      c.fillText('0% OFF', x + 75, y + 34);
    }
    c.strokeStyle = '#111';
    c.lineWidth = 2;
    c.strokeRect(x, y + 10, 96, 34);
    c.restore();
  }

  // ------------------------------------------------------------
  // 6. PLAYER BATTLE BACK SPRITE (GBA Trainer seen from behind)
  // ------------------------------------------------------------
  drawPlayerBack(c, x, y, scale = 4) {
    const p = this.pal;
    const map = {
      'O': p.outline,
      'C': p.playerRed,       // Cap backwards
      'H': p.hairDarkBrown,   // Hair under cap
      'S': p.skinLight,       // Neck/arms
      'J': p.playerBlue,      // Blue jacket
      'B': p.playerDarkBlue,  // Jacket fold
      'P': p.playerBlack,     // Pants
      'W': p.playerWhite      // Sleeve cuffs
    };

    const matrix = [
      "      OOOOOOOOOO      ",
      "    OCCCCCCCCCCCCO    ",
      "   OCCCCCCCCCCCCCC    ",
      "   OCCCCCCCCCCCCCC    ",
      "    OHHHHHHHHHHHHO    ",
      "     OSSSSSSSSSSO     ",
      "    OOJJJJJJJJJJOO    ",
      "   OJJBJJJJJJJJBJOO   ",
      "  OJJJJJJJJJJJJJJOO   ",
      "  OJJJJJJJJJJJJJJJO   ",
      "  OJJJJJJJJJJJJJJJO   ",
      "  OJJJJJJJJJJJJJJJO   ",
      "   OWWJJJJJJJJWWOO    ",
      "   OSSPPPPPPPSSO      ",
      "    OPPPPPPPPPPO      ",
      "    OPP      PPO      "
    ];

    this.drawPixelMatrix(c, x, y, matrix, map, scale);
  }

  // ------------------------------------------------------------
  // 7. PIXEL ITEM ICONS
  // ------------------------------------------------------------
  drawItemIcon(c, x, y, type = 'finger', size = 32) {
    c.save();
    if (type === 'tongs') {
      c.fillStyle = '#bdc3c7';
      c.fillRect(x + 6, y + 4, 4, 24);
      c.fillRect(x + 18, y + 4, 4, 24);
      c.fillRect(x + 8, y + 22, 12, 5);
      c.strokeStyle = '#2c3e50';
      c.lineWidth = 1.5;
      c.strokeRect(x + 6, y + 4, 16, 24);
    } else if (type === 'key') {
      c.fillStyle = '#f1c40f';
      c.fillRect(x + 6, y + 6, 12, 12);
      c.clearRect(x + 9, y + 9, 6, 6);
      c.fillRect(x + 15, y + 10, 12, 4);
      c.fillRect(x + 23, y + 14, 4, 6);
      c.fillRect(x + 19, y + 14, 4, 4);
    } else if (type === 'gloves') {
      c.fillStyle = '#e67e22';
      c.fillRect(x + 6, y + 6, 18, 20);
      c.fillStyle = '#d35400';
      c.fillRect(x + 6, y + 20, 18, 6);
      c.fillStyle = '#f39c12';
      c.fillRect(x + 22, y + 10, 6, 8);
    } else if (type === 'crowbar') {
      c.fillStyle = '#bdc3c7'; // Heavy steel crowbar
      c.fillRect(x + 8, y + 4, 4, 20);
      c.fillRect(x + 6, y + 20, 10, 4);
      c.fillRect(x + 14, y + 22, 6, 4);
      c.strokeStyle = '#2c3e50';
      c.lineWidth = 1.5;
      c.strokeRect(x + 8, y + 4, 4, 20);
    } else if (type === 'handbook') {
      c.fillStyle = '#c0392b'; // 2019 Handbook
      c.fillRect(x + 6, y + 6, 20, 22);
      c.fillStyle = '#ffd700'; // Mc'Do Arch
      c.fillRect(x + 12, y + 10, 8, 6);
      c.fillStyle = '#fff'; // Loose diary paper sticking out
      c.fillRect(x + 8, y + 22, 14, 4);
      c.strokeStyle = '#111';
      c.strokeRect(x + 6, y + 6, 20, 22);
    } else if (type === 'ladle') {
      c.fillStyle = '#bdc3c7';
      c.fillRect(x + 18, y + 4, 4, 18);
      c.fillStyle = '#f39c12'; // Glowing hot fry oil
      c.beginPath();
      c.arc(x + 14, y + 22, 8, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#d35400';
      c.stroke();
    } else if (type === 'gift_box') {
      c.fillStyle = '#ffd700'; // Golden box
      c.fillRect(x + 4, y + 8, 24, 20);
      c.fillStyle = '#e74c3c'; // Red silk ribbon
      c.fillRect(x + 14, y + 8, 4, 20);
      c.fillRect(x + 4, y + 16, 24, 4);
      c.strokeStyle = '#c0392b';
      c.lineWidth = 1.5;
      c.strokeRect(x + 4, y + 8, 24, 20);
    } else if (type === 'finger') {
      // The Legendary Annulaire!
      c.fillStyle = '#c7ecee'; // Frost block
      c.fillRect(x + 2, y + 2, 28, 28);
      c.strokeStyle = '#7ed6df';
      c.lineWidth = 1.5;
      c.strokeRect(x + 2, y + 2, 28, 28);

      // Pale dried finger chunk
      c.fillStyle = '#d1ccc0';
      c.fillRect(x + 10, y + 8, 12, 16);
      c.fillStyle = '#c0392b'; // Severed base
      c.fillRect(x + 10, y + 20, 12, 4);
      // Gold 'BEST MANAGER' ring around annulaire
      c.fillStyle = '#f1c40f';
      c.fillRect(x + 9, y + 12, 14, 4);
      c.fillStyle = '#ffffff'; // Ring sparkle
      c.fillRect(x + 13, y + 11, 2, 2);
    } else if (type === 'pass_bistro') {
      c.fillStyle = '#9b59b6'; // Purple pass card
      c.fillRect(x + 5, y + 6, 22, 18);
      c.fillStyle = '#f1c40f';
      c.fillRect(x + 8, y + 9, 8, 4);
      c.fillStyle = '#ecf0f1';
      c.fillRect(x + 8, y + 15, 14, 2);
      c.fillRect(x + 8, y + 19, 10, 2);
      c.strokeStyle = '#2c3e50';
      c.lineWidth = 1.5;
      c.strokeRect(x + 5, y + 6, 22, 18);
    } else if (type === 'headset') {
      c.fillStyle = '#2ed573'; // Green headset arc
      c.beginPath();
      c.arc(x + 16, y + 16, 11, Math.PI, 0, false);
      c.lineWidth = 3;
      c.strokeStyle = '#2ed573';
      c.stroke();
      c.fillStyle = '#2f3542';
      c.fillRect(x + 5, y + 14, 4, 8);
      c.fillRect(x + 23, y + 14, 4, 8);
      c.strokeStyle = '#111';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(x + 7, y + 20);
      c.lineTo(x + 15, y + 24);
      c.stroke();
      c.fillStyle = '#ff4757';
      c.fillRect(x + 14, y + 23, 3, 3);
    }
    c.restore();
  }

  // Draw Chicken Nugget Particle
  drawNugget(x, y, rot) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.fillStyle = '#f39c12';
    c.fillRect(-8, -5, 16, 10);
    c.fillStyle = '#d35400';
    c.fillRect(-6, -3, 4, 3);
    c.fillRect(2, 1, 3, 3);
    c.strokeStyle = '#111';
    c.lineWidth = 1.5;
    c.strokeRect(-8, -5, 16, 10);
    c.restore();
  }

  // Draw 100% OFF VIP Coupon Particle
  drawCoupon(x, y, rot) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.fillStyle = '#ffd700';
    c.fillRect(-12, -7, 24, 14);
    c.strokeStyle = '#c0392b';
    c.lineWidth = 1.5;
    c.strokeRect(-12, -7, 24, 14);
    c.restore();
  }

  // Draw Flying Cheeseburger Particle (Absurd!)
  drawBurger(x, y, rot) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    // Bun top
    c.fillStyle = '#e67e22';
    c.fillRect(-9, -6, 18, 5);
    // Sesame seeds
    c.fillStyle = '#fff';
    c.fillRect(-4, -5, 2, 2);
    c.fillRect(3, -5, 2, 2);
    // Patty
    c.fillStyle = '#6d4c41';
    c.fillRect(-9, -1, 18, 4);
    // Melted Cheese
    c.fillStyle = '#f1c40f';
    c.fillRect(-10, 2, 20, 2);
    // Bun bottom
    c.fillStyle = '#d35400';
    c.fillRect(-9, 4, 18, 4);
    c.strokeStyle = '#111';
    c.lineWidth = 1;
    c.strokeRect(-9, -6, 18, 14);
    c.restore();
  }

  // Draw Flying Pickle Slice Particle (Absurd!)
  drawPickle(x, y, rot) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.fillStyle = '#27ae60';
    c.beginPath();
    c.ellipse(0, 0, 7, 4, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = '#2ecc71';
    c.fillRect(-3, -1, 3, 2);
    c.fillRect(1, 0, 2, 2);
    c.strokeStyle = '#1e824c';
    c.lineWidth = 1;
    c.stroke();
    c.restore();
  }
}

window.PixelArtRenderer = PixelArtRenderer;
