// ============================================================
//  js/main.js — Main Game Controller, Quest Logic & Natalie Explosion
// ============================================================

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const art = new ArtEngine(ctx);

  // Resolution
  const W = 1000, H = 600;
  canvas.width = W;
  canvas.height = H;

  // Game State
  const state = {
    screen: 'title', // title, game, explosion, victory
    inventory: [],
    natalieRage: 10,
    natalieSwell: 1,
    isExploding: false,
    explosionTime: 0,
    particles: [],
    activeDialogue: null,
    dialogueQueue: [],
    typeTimer: null,
    onComplete: null,
    quests: {
      clementTalked: false,
      arthurTalked: false,
      lucaTalked: false,
      fingerFound: false,
      natalieTrolled: false
    }
  };

  // Player
  const player = {
    x: 500,
    y: 490,
    vx: 0,
    facing: 1,
    speed: 5.2,
    walkFrame: 0,
    isMoving: false,
    canMove: true
  };

  // NPCs
  const npcs = [
    { id: 'clement', x: 780, y: 350, r: 65, type: 'clement' },
    { id: 'arthur', x: 200, y: 350, r: 65, type: 'arthur' },
    { id: 'luca', x: 330, y: 490, r: 65, type: 'luca' },
    { id: 'chef', x: 500, y: 380, r: 65, type: 'chef' },
    { id: 'natalie', x: 500, y: 280, r: 85, type: 'natalie' },
    { id: 'freezer', x: 90, y: 490, r: 65, type: 'freezer' }
  ];

  // Keyboard
  const keys = {};
  window.addEventListener('keydown', e => {
    window.soundEngine.init();
    keys[e.code] = true;

    if (e.code === 'KeyL') toggleLanguage();
    if (e.code === 'KeyM') toggleSound();

    if (e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') {
      if (state.activeDialogue) {
        advanceDialogue();
        e.preventDefault();
        return;
      }
      checkInteract();
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', e => {
    keys[e.code] = false;
  });

  // UI Handlers
  window.toggleLanguage = () => {
    window.LANG = window.LANG === 'en' ? 'fr' : 'en';
    const lang = window.GAME_LORE[window.LANG];
    document.getElementById('hud-mission').textContent = lang.hudMission;
    document.getElementById('rage-label').textContent = lang.rageLabel;
    document.getElementById('compass').textContent = lang.compass;
    document.getElementById('lang-btn').textContent = window.LANG === 'en' ? '🇫🇷 FRANÇAIS' : '🇬🇧 ENGLISH';
    const syn = document.getElementById('synopsis-card');
    if (syn) {
      syn.innerHTML = window.LANG === 'en'
        ? "Years ago, Natalie — the 50yo, short, chubby, aggressive manager with a haircut like a butch lesbian — lost a chunk of her <b>annulaire</b> (ring finger). She doesn't care. She isn't looking for it. She's just busy terrorizing <b>Clement, Arthur, and Luca</b>, pulling fries 40 seconds early, and banning post-shift staff discounts.<br><br><b>You are the legend who just walked into Mc'Do to find that ancient fossilized finger and gift it to her face just to bullshit her.</b>"
        : "Il y a des années, Natalie — la manager de 50 ans, petite, rondelette, agressive avec une coupe courte de lesbienne butch — a perdu un bout de son <b>annulaire</b>. Elle s'en tape complètement. Elle ne le cherche même pas. Elle passe son temps à pourrir la vie de <b>Clement, Arthur et Luca</b>, à sortir les frites 40 secondes en avance et à interdire les réductions employé.<br><br><b>Tu es le héros qui vient d'entrer au Mc'Do pour retrouver ce doigt fossilisé et lui ramener en cadeau juste pour te foutre de sa gueule.</b>";
    }
    window.soundEngine.click();
    updateInventoryHUD();
  };

  window.toggleSound = () => {
    const isMuted = !window.soundEngine.toggle();
    document.getElementById('sound-btn').textContent = isMuted ? '🔇 MUTED' : '🔊 SOUND';
    window.soundEngine.click();
  };

  window.startGame = () => {
    window.soundEngine.init();
    window.soundEngine.click();
    document.getElementById('title-screen').style.display = 'none';
    state.screen = 'game';

    // Clement automatic welcome shout
    setTimeout(() => {
      triggerNPC('clement');
    }, 500);
  };

  // Inventory Management
  function addItem(id) {
    if (!state.inventory.includes(id)) {
      state.inventory.push(id);
      window.soundEngine.pickup();
      updateInventoryHUD();
    }
  }

  function hasItem(id) {
    return state.inventory.includes(id);
  }

  function updateInventoryHUD() {
    const items = window.GAME_LORE[window.LANG].items;
    const icons = { tongs: '🥢', key: '🔑', gloves: '🧤', finger: '👆' };
    const container = document.getElementById('inv-container');
    container.innerHTML = '';

    for (let k of ['tongs', 'key', 'gloves', 'finger']) {
      const slot = document.createElement('div');
      slot.className = 'inv-slot' + (hasItem(k) ? ' active' : '');
      slot.textContent = hasItem(k) ? icons[k] : '·';
      slot.title = hasItem(k) ? items[k] : 'Empty';
      container.appendChild(slot);
    }
  }

  // Dialogue Engine
  function startDialogueQueue(speakerData, lines, onComplete = null) {
    state.activeDialogue = true;
    player.canMove = false;
    player.vx = 0;
    state.dialogueQueue = [...lines];
    state.onComplete = onComplete;

    const box = document.getElementById('dialogue-box');
    box.style.display = 'block';
    document.getElementById('dlg-avatar').textContent = speakerData.avatar;
    document.getElementById('dlg-speaker').textContent = speakerData.name;
    document.getElementById('dlg-role').textContent = speakerData.role;

    showNextLine();
  }

  function showNextLine() {
    // Support interactive choice objects
    if (state.dialogueQueue.length > 0) {
        const line = state.dialogueQueue.shift();
        const textEl = document.getElementById('dlg-text');
        textEl.innerHTML = '';
        window.soundEngine.blip();
        // If line is an object with choices, render them
        if (typeof line === 'object' && line !== null && line.text && line.choices) {
            // Show the prompt text
            let idx = 0;
            clearInterval(state.typeTimer);
            state.typeTimer = setInterval(() => {
                if (idx < line.text.length) {
                    textEl.textContent += line.text[idx];
                    idx++;
                } else {
                    clearInterval(state.typeTimer);
                    // After the text finishes, render choice buttons
                    const choicesContainer = document.createElement('div');
                    choicesContainer.id = 'dlg-choices';
                    choicesContainer.style.marginTop = '8px';
                    line.choices.forEach((c, i) => {
                        const btn = document.createElement('button');
                        btn.textContent = c.label;
                        btn.className = 'btn-skew';
                        btn.style.marginRight = '6px';
                        btn.onclick = () => {
                            // Replace the queue with the selected branch
                            state.dialogueQueue = c.next.concat(state.dialogueQueue);
                            // Remove old choices UI
                            const old = document.getElementById('dlg-choices');
                            if (old) old.remove();
                            showNextLine();
                        };
                        choicesContainer.appendChild(btn);
                    });
                    textEl.parentNode.appendChild(choicesContainer);
                }
            }, 16);
        } else {
            // Existing simple string line handling
            const text = line;
            let idx = 0;
            clearInterval(state.typeTimer);
            state.typeTimer = setInterval(() => {
                if (idx < text.length) {
                    textEl.textContent += text[idx];
                    idx++;
                } else {
                    clearInterval(state.typeTimer);
                }
            }, 16);
        }
        return;
    }
    // Finished all queued lines
    clearInterval(state.typeTimer);
    document.getElementById('dialogue-box').style.display = 'none';
    state.activeDialogue = false;
    player.canMove = true;
    if (state.onComplete) state.onComplete();
    if (state.dialogueQueue.length > 0) {
      const text = state.dialogueQueue.shift();
      const textEl = document.getElementById('dlg-text');
      textEl.textContent = '';
      window.soundEngine.blip();

      let idx = 0;
      clearInterval(state.typeTimer);
      state.typeTimer = setInterval(() => {
        if (idx < text.length) {
          textEl.textContent += text[idx];
          idx++;
        } else {
          clearInterval(state.typeTimer);
        }
      }, 16);
    } else {
      // Finished all queued lines
      clearInterval(state.typeTimer);
      document.getElementById('dialogue-box').style.display = 'none';
      state.activeDialogue = false;
      player.canMove = true;
      if (state.onComplete) state.onComplete();
    }
  }

  function advanceDialogue() {
    showNextLine();
  }

  document.getElementById('dialogue-box').addEventListener('click', advanceDialogue);

  // Interaction Logic
  function getNearbyNPC() {
    for (let npc of npcs) {
      const dist = Math.hypot(player.x - npc.x, player.y - npc.y);
      if (dist <= npc.r + 30) {
        return npc;
      }
    }
    return null;
  }

  function checkInteract() {
    const nearby = getNearbyNPC();
    if (!nearby) return;
    triggerNPC(nearby.id);
  }

  function triggerNPC(id) {
    const lore = window.GAME_LORE[window.LANG];

    if (id === 'clement') {
      state.quests.clementTalked = true;
      startDialogueQueue(lore.clement, lore.clement.dialogues);
    }
    else if (id === 'arthur') {
      state.quests.arthurTalked = true;
      startDialogueQueue(lore.arthur, lore.arthur.dialogues, () => {
        addItem('tongs');
        addItem('key');
      });
    }
    else if (id === 'luca') {
      state.quests.lucaTalked = true;
      startDialogueQueue(lore.luca, lore.luca.dialogues, () => {
        addItem('gloves');
      });
    }
    else if (id === 'freezer') {
      if (!hasItem('key')) {
        startDialogueQueue(
          { name: "Freezer Door", role: "Locked", avatar: "🔒" },
          [window.LANG === 'en' ? "The heavy freezer door is locked! Talk to Arthur by the kitchen grill to get the key!" : "La porte du congélo est verrouillée ! Parle à Arthur au grill pour avoir la clé !"]
        );
      } else if (!hasItem('tongs') || !hasItem('gloves')) {
        startDialogueQueue(
          { name: "Sub-Zero Crates", role: "Freezer Interior", avatar: "❄️" },
          [window.LANG === 'en' ? "You have the key, but the crates are frozen solid! You need the Metal Tongs from Arthur and Heavy Gloves from Luca to pry it out!" : "Tu as la clé, mais les cartons sont collés par le gel ! Il te faut les pinces d'Arthur et les gros gants de Luca !"]
        );
      } else if (!hasItem('finger')) {
        addItem('finger');
        state.quests.fingerFound = true;
        startDialogueQueue(
          { name: "Relic Acquired!", role: "Ancient Fossil", avatar: "👆" },
          [window.LANG === 'en' ? "Using the heavy gloves and tongs, you yank Natalie's fossilized annulaire free from the McFlurry ice! Time to bring it to Natalie and bullshit her!" : "Avec les gants et les pinces, tu arraches l'annulaire fossilisé de Natalie de la glace ! C'est l'heure d'aller lui offrir pour lui foutre la honte !"]
        );
      }
    }
    else if (id === 'natalie') {
      if (hasItem('finger')) {
        // TRIGGER THE ULTIMATE BULLSHIT & EXPLOSION!
        triggerNatalieExplosion();
      } else {
        startDialogueQueue(lore.natalie, lore.natalie.idle);
      }
    }
  }

  // ============================================================
  //  THE EXPLOSIVE FINALE: NATALIE EXPLODES!
  // ============================================================
  function triggerNatalieExplosion() {
    const lore = window.GAME_LORE[window.LANG];
    const rageEl = document.getElementById('rage-inner');

    // Dialogue sequence escalating her blood pressure
    state.activeDialogue = true;
    player.canMove = false;

    // Line 1: Surprise (Rage 40%)
    state.natalieRage = 45;
    rageEl.style.width = '45%';
    state.natalieSwell = 1.2;

    startDialogueQueue(lore.natalie, [lore.natalie.finale[0]], () => {
      // Line 2: Realization (Rage 75%)
      state.natalieRage = 75;
      rageEl.style.width = '75%';
      state.natalieSwell = 1.5;
      window.soundEngine.siren(1);

      startDialogueQueue(lore.natalie, [lore.natalie.finale[1]], () => {
        // Line 3: Peak Fury (Rage 95%)
        state.natalieRage = 98;
        rageEl.style.width = '98%';
        state.natalieSwell = 1.9;
        window.soundEngine.siren(1.4);

        startDialogueQueue(lore.natalie, [lore.natalie.finale[2], lore.natalie.finale[3]], () => {
          // DETONATION SEQUENCE!
          detonateNatalie();
        });
      });
    });
  }

  function detonateNatalie() {
    state.isExploding = true;
    state.natalieRage = 100;
    document.getElementById('rage-inner').style.width = '100%';

    const vp = document.getElementById('game-viewport');
    vp.classList.add('shake-screen');

    const overlay = document.getElementById('explosion-overlay');
    overlay.style.opacity = '1';

    const banner = document.getElementById('comic-banner');
    banner.style.transform = 'translate(-50%, -50%) rotate(-6deg) scale(1.1)';

    window.soundEngine.explosion();

    // Spawn 180 explosion debris particles (nuggets, fries, coupons)
    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 14;
      state.particles.push({
        x: 500,
        y: 280,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 5,
        rot: Math.random() * 6,
        rotSpeed: (Math.random() - 0.5) * 0.3,
        type: i % 3 === 0 ? 'coupon' : (i % 2 === 0 ? 'nugget' : 'fry'),
        life: 180 + Math.random() * 100
      });
    }

    setTimeout(() => {
      overlay.style.opacity = '0';
    }, 150);

    setTimeout(() => {
      vp.classList.remove('shake-screen');
      banner.style.transform = 'translate(-50%, -50%) rotate(-6deg) scale(0)';
      state.screen = 'victory';
      window.soundEngine.victory();
      showVictoryScreen();
    }, 1800);
  }

  function showVictoryScreen() {
    const lore = window.GAME_LORE[window.LANG];
    const vic = document.getElementById('victory-screen');
    vic.style.display = 'flex';
    document.getElementById('victory-title').textContent = lore.victory.title;
    document.getElementById('victory-desc').textContent = lore.victory.desc;
  }

  // ============================================================
  //  MAIN GAME LOOP
  // ============================================================
  function update() {
    // Player controls
    if (player.canMove && state.screen === 'game' && !state.activeDialogue) {
      let dx = 0;
      if (keys['KeyA'] || keys['ArrowLeft']) { dx -= 1; player.facing = -1; }
      if (keys['KeyD'] || keys['ArrowRight']) { dx += 1; player.facing = 1; }

      player.vx = dx * player.speed;
      player.x += player.vx;
      player.isMoving = dx !== 0;

      if (player.isMoving) {
        player.walkFrame++;
        if (player.walkFrame % 15 === 0) window.soundEngine.step();
      } else {
        player.walkFrame = 0;
      }

      player.x = Math.max(60, Math.min(W - 60, player.x));
    }

    // Interaction prompt update
    const nearby = getNearbyNPC();
    const promptEl = document.getElementById('interact-prompt');
    if (nearby && !state.activeDialogue && state.screen === 'game') {
      const lore = window.GAME_LORE[window.LANG];
      let targetName = nearby.id;
      if (nearby.id === 'clement') targetName = lore.clement.name;
      if (nearby.id === 'arthur') targetName = lore.arthur.name;
      if (nearby.id === 'luca') targetName = lore.luca.name;
      if (nearby.id === 'natalie') targetName = lore.natalie.name;
      if (nearby.id === 'freezer') targetName = window.LANG === 'en' ? "Walk-In Freezer" : "Chambre Froide";

      promptEl.textContent = `[E] ${targetName}`;
      promptEl.style.display = 'block';
    } else {
      promptEl.style.display = 'none';
    }

    // Particle physics (Explosion debris)
    state.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Gravity
      p.rot += p.rotSpeed;
      p.life--;
    });
    state.particles = state.particles.filter(p => p.life > 0);
  }

  function render() {
    ctx.clearRect(0, 0, W, H);

    // 1. Draw cel-shaded restaurant environment
    art.drawEnvironment('counter');

    // 2. Draw Walk-In Freezer Entrance on left
    ctx.save();
    ctx.fillStyle = '#2d3436';
    ctx.beginPath();
    ctx.roundRect(40, 420, 80, 130, 8);
    ctx.fill();
    art.comicStroke('#00cec9', 3);
    ctx.fillStyle = '#00cec9';
    ctx.font = 'bold 12px "Bangers", cursive';
    ctx.textAlign = 'center';
    ctx.fillText("FREEZER (-18°C)", 80, 450);
    ctx.restore();

    // 3. Draw NPCs
    art.drawWorker(780, 360, 'clement');
    art.drawWorker(200, 360, 'arthur');
    art.drawWorker(330, 500, 'luca');

    // 4. Draw Natalie behind the counter (unless exploded!)
    if (!state.isExploding || state.screen !== 'victory') {
      art.drawNatalie(
        500,
        280,
        state.natalieRage > 30,
        state.natalieSwell
      );
    }

    // 5. Draw Player Character
    art.drawPlayer(
      player.x,
      player.y,
      player.facing,
      player.walkFrame,
      player.isMoving,
      hasItem('finger')
    );

    // 6. Draw Explosion Debris Particles
    state.particles.forEach(p => {
      if (p.type === 'coupon') {
        art.drawCoupon(p.x, p.y, p.rot);
      } else {
        art.drawNugget(p.x, p.y, p.rot, 16);
      }
    });
  }

  function loop() {
    update();
    render();
    requestAnimationFrame(loop);
  }

  // Initialize HUD
  updateInventoryHUD();
  requestAnimationFrame(loop);
});
