// ============================================================
//  js/art_engine.js — High-Detail Fortnite-Style Cel-Shaded Art Engine
//  Renders authentic comic/cel-shaded characters with Bézier curves,
//  dynamic bone rigging, facial expressions, and atmospheric lighting.
//  NO GEOMETRIC BLOCKS OR CYLINDERS!
// ============================================================

class ArtEngine {
  constructor(ctx) {
    this.ctx = ctx;
  }

  // Helper for crisp comic-book strokes
  comicStroke(color = '#111', width = 2.5) {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = width;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();
  }

  // ------------------------------------------------------------
  // 1. THE PLAYER (Fortnite-style Streetwear Hero)
  // ------------------------------------------------------------
  drawPlayer(x, y, facing, walkFrame, isMoving, carryingFinger = false) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.scale(facing, 1);

    const bob = isMoving ? Math.sin(walkFrame * 0.4) * 4 : Math.sin(Date.now() * 0.003) * 1.5;
    const legSwing = isMoving ? Math.sin(walkFrame * 0.4) * 0.5 : 0;

    // Contact drop shadow
    c.fillStyle = 'rgba(0,0,0,0.4)';
    c.beginPath();
    c.ellipse(0, 4, 26, 8, 0, 0, Math.PI * 2);
    c.fill();

    // LEGS & SNEAKERS (Fortnite High-Top Sneakers)
    // Left Leg
    c.save();
    c.translate(-8, -26);
    c.rotate(legSwing);
    // Dark Cargo Pants with folds
    c.fillStyle = '#1e272e';
    c.beginPath();
    c.moveTo(-6, 0); c.lineTo(7, 0); c.lineTo(5, 24); c.lineTo(-6, 24);
    c.closePath(); c.fill(); this.comicStroke('#0f1418', 2);
    // Sneaker
    c.fillStyle = '#ff4757';
    c.beginPath();
    c.roundRect(-8, 22, 22, 10, [3, 6, 2, 2]);
    c.fill(); this.comicStroke('#fff', 1.5);
    // White sole
    c.fillStyle = '#ffffff';
    c.fillRect(-8, 30, 22, 3);
    c.restore();

    // Right Leg
    c.save();
    c.translate(8, -26);
    c.rotate(-legSwing);
    c.fillStyle = '#2f3542';
    c.beginPath();
    c.moveTo(-7, 0); c.lineTo(6, 0); c.lineTo(6, 24); c.lineTo(-5, 24);
    c.closePath(); c.fill(); this.comicStroke('#0f1418', 2);
    // Sneaker
    c.fillStyle = '#ff4757';
    c.beginPath();
    c.roundRect(-8, 22, 22, 10, [3, 6, 2, 2]);
    c.fill(); this.comicStroke('#fff', 1.5);
    c.fillStyle = '#ffffff';
    c.fillRect(-8, 30, 22, 3);
    c.restore();

    // TORSO (Bomber jacket + Graphic Hoodie)
    const by = -64 + bob;
    // Hoodie body
    c.fillStyle = '#ffd32a'; // Vibrant yellow streetwear hoodie
    c.beginPath();
    c.roundRect(-18, by, 36, 40, [6, 6, 3, 3]);
    c.fill(); this.comicStroke('#1e272e', 2.5);

    // Blue bomber jacket vest over hoodie
    c.fillStyle = '#3742fa';
    c.beginPath();
    c.moveTo(-18, by + 4); c.lineTo(-7, by + 4); c.lineTo(-9, by + 38); c.lineTo(-18, by + 36);
    c.closePath(); c.fill();
    c.beginPath();
    c.moveTo(18, by + 4); c.lineTo(7, by + 4); c.lineTo(9, by + 38); c.lineTo(18, by + 36);
    c.closePath(); c.fill(); this.comicStroke('#1e272e', 2);

    // Hoodie strings
    c.strokeStyle = '#fff'; c.lineWidth = 1.5;
    c.beginPath(); c.moveTo(-5, by + 8); c.lineTo(-5, by + 22); c.stroke();
    c.beginPath(); c.moveTo(5, by + 8); c.lineTo(5, by + 22); c.stroke();

    // ARMS
    // Left arm
    c.save();
    c.translate(-16, by + 6);
    c.rotate(isMoving ? -legSwing * 1.3 : 0.1);
    c.fillStyle = '#ffd32a';
    c.beginPath(); c.roundRect(-4, 0, 8, 24, 4); c.fill(); this.comicStroke();
    // Hand
    c.fillStyle = '#f5cba7';
    c.beginPath(); c.arc(0, 26, 5, 0, Math.PI * 2); c.fill(); this.comicStroke();
    c.restore();

    // Right arm (Holding tongs or finger gift box!)
    c.save();
    c.translate(16, by + 6);
    c.rotate(isMoving ? legSwing * 1.3 : -0.2);
    c.fillStyle = '#ffd32a';
    c.beginPath(); c.roundRect(-4, 0, 8, 24, 4); c.fill(); this.comicStroke();
    // Hand
    c.fillStyle = '#f5cba7';
    c.beginPath(); c.arc(0, 26, 5, 0, Math.PI * 2); c.fill(); this.comicStroke();

    if (carryingFinger) {
      // Glowy gift box with red ribbon
      c.fillStyle = '#ff4757';
      c.fillRect(-4, 18, 16, 16);
      this.comicStroke('#ffd700', 1.5);
      c.fillStyle = '#ffd700';
      c.fillRect(3, 18, 3, 16);
      c.fillRect(-4, 25, 16, 3);
    }
    c.restore();

    // HEAD & FACE
    const hy = by - 22;
    c.fillStyle = '#f5cba7';
    c.beginPath();
    c.ellipse(0, hy, 14, 15, 0, 0, Math.PI * 2);
    c.fill(); this.comicStroke();

    // Stylish Anime / Fortnite Spiky Hair
    c.fillStyle = '#2f3542';
    c.beginPath();
    c.moveTo(-16, hy - 4);
    c.quadraticCurveTo(-14, hy - 24, 0, hy - 22);
    c.lineTo(4, hy - 26);
    c.lineTo(10, hy - 20);
    c.lineTo(16, hy - 14);
    c.lineTo(18, hy - 2);
    c.lineTo(13, hy - 8);
    c.lineTo(6, hy - 14);
    c.lineTo(-6, hy - 14);
    c.lineTo(-12, hy - 6);
    c.closePath();
    c.fill(); this.comicStroke();

    // Eyes with anime shine
    c.fillStyle = '#111';
    c.beginPath(); c.arc(4, hy - 2, 2.5, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(10, hy - 2, 2.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#fff';
    c.beginPath(); c.arc(5, hy - 3, 0.9, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(11, hy - 3, 0.9, 0, Math.PI * 2); c.fill();

    // Confident smirk
    c.strokeStyle = '#2f3542'; c.lineWidth = 1.8;
    c.beginPath(); c.arc(7, hy + 5, 4, 0.2, Math.PI * 0.8); c.stroke();

    c.restore();
  }

  // ------------------------------------------------------------
  // 2. NATALIE (50yo Short Chubby Manager Caricature)
  // ------------------------------------------------------------
  drawNatalie(x, y, isEnraged = false, swellFactor = 1, explosionProgress = 0) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);

    // If exploding, scale dramatically!
    c.scale(swellFactor, swellFactor);

    const angryWiggle = isEnraged ? Math.sin(Date.now() * 0.03) * 3 : 0;
    c.translate(angryWiggle, 0);

    // Shadow
    c.fillStyle = 'rgba(0,0,0,0.45)';
    c.beginPath();
    c.ellipse(0, 4, 38 * swellFactor, 12, 0, 0, Math.PI * 2);
    c.fill();

    // Short Stumpy Legs in tight polyester black slacks
    c.fillStyle = '#1e1e24';
    c.beginPath();
    c.roundRect(-22, -26, 18, 28, [2, 2, 4, 4]);
    c.roundRect(4, -26, 18, 28, [2, 2, 4, 4]);
    c.fill(); this.comicStroke('#0c0c10', 2.5);

    // Ugly black orthopedic manager work shoes
    c.fillStyle = '#0a0a0e';
    c.beginPath();
    c.roundRect(-26, -2, 24, 10, [4, 6, 2, 2]);
    c.roundRect(2, -2, 24, 10, [4, 6, 2, 2]);
    c.fill(); this.comicStroke('#222', 1.8);

    // WIDE PEAR-SHAPED TORSO (Tight Maroon Manager Polo straining over belly)
    const poloColor = isEnraged ? (swellFactor > 1.3 ? '#e84118' : '#c23616') : '#780c18';
    c.fillStyle = poloColor;

    // Bulging belly shape
    c.beginPath();
    c.moveTo(-36, -82);
    c.bezierCurveTo(-46, -60, -48 * swellFactor, -30, -32, -20);
    c.lineTo(32, -20);
    c.bezierCurveTo(48 * swellFactor, -30, 46, -60, 36, -82);
    c.closePath();
    c.fill(); this.comicStroke('#111', 2.8);

    // Manager Polo buttons & collar
    c.fillStyle = '#4a050d';
    c.beginPath();
    c.moveTo(-16, -85); c.lineTo(0, -70); c.lineTo(16, -85);
    c.lineTo(12, -88); c.lineTo(-12, -88);
    c.closePath(); c.fill();

    // Heavy Gold Name Tag
    c.fillStyle = '#ffd700';
    c.beginPath();
    c.roundRect(-24, -68, 48, 16, 3);
    c.fill(); this.comicStroke('#b8860b', 1.5);
    c.fillStyle = '#000';
    c.font = 'bold 8px sans-serif';
    c.textAlign = 'center';
    c.fillText("NATALIE", 0, -58);
    c.font = '5px sans-serif';
    c.fillText("GENERAL MANAGER", 0, -53);

    // Left Arm (Fist planted on wide hip)
    c.save();
    c.translate(-34, -76);
    c.rotate(0.35);
    c.fillStyle = poloColor;
    c.beginPath(); c.roundRect(-10, 0, 14, 34, 4); c.fill(); this.comicStroke();
    c.fillStyle = isEnraged ? '#ff7979' : '#dca882';
    c.beginPath(); c.arc(-3, 35, 7, 0, Math.PI * 2); c.fill(); this.comicStroke();
    c.restore();

    // Right Arm (Waving the bandaged stump of her ANNULAIRE furiously!)
    c.save();
    c.translate(34, -76);
    const wave = isEnraged ? -0.8 + Math.sin(Date.now() * 0.04) * 0.35 : -0.3;
    c.rotate(wave);
    c.fillStyle = poloColor;
    c.beginPath(); c.roundRect(-4, 0, 14, 36, 4); c.fill(); this.comicStroke();

    // Hand with MISSING CHUNK OF ANNULAIRE
    c.translate(3, 38);
    c.fillStyle = isEnraged ? '#ff7979' : '#dca882';
    c.beginPath(); c.arc(0, 0, 9, 0, Math.PI * 2); c.fill(); this.comicStroke();

    // Thumb, index, middle, pinky fingers
    c.fillStyle = '#b87c54';
    c.fillRect(-7, -10, 3, 9);
    c.fillRect(-3, -14, 3, 13);
    c.fillRect(1, -15, 3, 14);
    c.fillRect(9, -8, 3, 8);

    // THE BANDAGED ANNULAIRE STUMP
    c.fillStyle = '#ffffff';
    c.fillRect(5, -7, 4, 6);
    c.strokeStyle = '#c0392b'; c.lineWidth = 1;
    c.strokeRect(5, -7, 4, 6);
    c.fillStyle = '#eb2f06';
    c.beginPath(); c.arc(7, -7, 2, 0, Math.PI * 2); c.fill();
    c.restore();

    // HEAD, DOUBLE CHIN & SAGGY WRINKLES (50yo Karen Anatomy)
    const faceColor = isEnraged ? (swellFactor > 1.2 ? '#ff3838' : '#e55039') : '#dca882';
    c.fillStyle = faceColor;

    // Neck & double chin
    c.beginPath();
    c.ellipse(0, -90, 22, 12, 0, 0, Math.PI * 2);
    c.fill(); this.comicStroke();

    // Head base
    c.beginPath();
    c.ellipse(0, -106, 26, 22, 0, 0, Math.PI * 2);
    c.fill(); this.comicStroke();

    // Wrinkles (Forehead & Marionette Frown Folds)
    c.strokeStyle = '#8d4726'; c.lineWidth = 1.6;
    c.beginPath(); c.moveTo(-12, -120); c.lineTo(12, -120); c.stroke();
    c.beginPath(); c.moveTo(-10, -100); c.lineTo(-14, -88); c.stroke();
    c.beginPath(); c.moveTo(10, -100); c.lineTo(14, -88); c.stroke();

    // Eyes: Furious Karen squint or bugged out in shock
    if (isEnraged) {
      // Bulging bloodshot cartoon eyes!
      c.fillStyle = '#fff';
      c.beginPath(); c.arc(-10, -108, 8, 0, Math.PI * 2); c.fill(); this.comicStroke();
      c.beginPath(); c.arc(10, -108, 8, 0, Math.PI * 2); c.fill(); this.comicStroke();
      c.fillStyle = '#c0392b';
      c.beginPath(); c.arc(-10, -108, 3.5, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(10, -108, 3.5, 0, Math.PI * 2); c.fill();
    } else {
      c.fillStyle = '#fff';
      c.beginPath(); c.ellipse(-9, -106, 5, 4, 0, 0, Math.PI * 2); c.fill(); this.comicStroke();
      c.beginPath(); c.ellipse(9, -106, 5, 4, 0, 0, Math.PI * 2); c.fill(); this.comicStroke();
      c.fillStyle = '#2d1810';
      c.beginPath(); c.arc(-8, -106, 2.2, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.arc(10, -106, 2.2, 0, Math.PI * 2); c.fill();
    }

    // Fierce slanted angry eyebrows
    c.strokeStyle = '#3d1d12'; c.lineWidth = 3.5;
    c.beginPath(); c.moveTo(-18, -116); c.lineTo(-4, -111); c.stroke();
    c.beginPath(); c.moveTo(18, -116); c.lineTo(4, -111); c.stroke();

    // Mouth: Screaming wide with crooked teeth
    if (isEnraged) {
      c.fillStyle = '#4a050d';
      c.beginPath();
      c.ellipse(0, -96, 14 * swellFactor, 10, 0, 0, Math.PI * 2);
      c.fill(); this.comicStroke();
      c.fillStyle = '#fff';
      c.fillRect(-8, -100, 5, 4);
      c.fillRect(3, -100, 5, 4);
    } else {
      c.strokeStyle = '#5a1219'; c.lineWidth = 3;
      c.beginPath();
      c.moveTo(-12, -95);
      c.quadraticCurveTo(0, -102, 12, -95);
      c.stroke();
    }

    // HAIR: Short butch/lesbian pixie cut with dark chocolate base & chunk burgundy streaks
    const hairDark = '#3d1d12';
    const hairRed = '#922b21';

    c.fillStyle = hairDark;
    c.beginPath();
    c.ellipse(0, -118, 28, 18, 0, Math.PI, 0);
    c.fill();
    c.fillRect(-28, -118, 6, 20);
    c.fillRect(22, -118, 6, 20);
    this.comicStroke();

    // Chunky punk red streaks
    c.fillStyle = hairRed;
    c.fillRect(-16, -132, 7, 15);
    c.fillRect(-4, -134, 7, 16);
    c.fillRect(9, -132, 8, 15);

    // Steam blowing out of ears when enraged!
    if (isEnraged) {
      c.fillStyle = 'rgba(255,255,255,0.75)';
      for (let i = 0; i < 3; i++) {
        const offY = (Date.now() * 0.05 + i * 15) % 35;
        c.beginPath(); c.arc(-34 - i * 6, -108 - offY, 5 + i * 2, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(34 + i * 6, -108 - offY, 5 + i * 2, 0, Math.PI * 2); c.fill();
      }
    }

    c.restore();
  }

  // ------------------------------------------------------------
  // 3. WORKER SPRITES (Clement, Arthur, Luca)
  // ------------------------------------------------------------
  drawWorker(x, y, type = 'clement') {
    const c = this.ctx;
    c.save();
    c.translate(x, y);

    // Shadow
    c.fillStyle = 'rgba(0,0,0,0.35)';
    c.beginPath(); c.ellipse(0, 4, 24, 7, 0, 0, Math.PI * 2); c.fill();

    // Legs
    c.fillStyle = '#222831';
    c.beginPath();
    c.roundRect(-12, -26, 10, 28, 2);
    c.roundRect(2, -26, 10, 28, 2);
    c.fill(); this.comicStroke();

    // Shirt & Apron
    c.fillStyle = '#393e46';
    c.beginPath(); c.roundRect(-16, -68, 32, 44, 4); c.fill(); this.comicStroke();

    // Red Mc'Do Apron
    c.fillStyle = '#c72c41';
    c.fillRect(-14, -54, 28, 30);
    this.comicStroke();

    // Name tag
    c.fillStyle = '#ffd700';
    c.beginPath(); c.roundRect(-12, -50, 24, 8, 2); c.fill();
    c.fillStyle = '#000';
    c.font = 'bold 5px sans-serif';
    c.textAlign = 'center';
    c.fillText(type.toUpperCase(), 0, -44);

    // Head
    c.fillStyle = '#dca882';
    c.beginPath(); c.ellipse(0, -82, 14, 15, 0, 0, Math.PI * 2); c.fill(); this.comicStroke();

    // Red Mc'Do Cap & Visor
    c.fillStyle = '#c72c41';
    c.beginPath(); c.ellipse(0, -90, 16, 7, 0, Math.PI, 0); c.fill();
    c.fillRect(-16, -96, 32, 7);
    c.beginPath(); c.ellipse(4, -89, 18, 5, 0.1, 0, Math.PI); c.fill(); this.comicStroke();
    c.fillStyle = '#ffd700';
    c.font = 'bold 7px sans-serif';
    c.fillText('M', 0, -91);

    // Eyes with dark tired bags
    c.fillStyle = '#111';
    c.beginPath(); c.arc(-5, -82, 2, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(5, -82, 2, 0, Math.PI * 2); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 1.2;
    c.beginPath(); c.arc(-5, -79, 4, 0, Math.PI); c.stroke();
    c.beginPath(); c.arc(5, -79, 4, 0, Math.PI); c.stroke();

    // Props based on character
    if (type === 'clement') {
      // Holding cleaning rag
      c.fillStyle = '#dfe4ea';
      c.fillRect(-18, -45, 10, 12);
    } else if (type === 'arthur') {
      // Holding metal spatula
      c.strokeStyle = '#95a5a6'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(14, -50); c.lineTo(24, -35); c.stroke();
      c.fillStyle = '#bdc3c7';
      c.fillRect(20, -38, 10, 7);
    } else if (type === 'luca') {
      // Tactical Drive-thru Headset
      c.strokeStyle = '#2d3436'; c.lineWidth = 2.5;
      c.beginPath(); c.arc(0, -88, 15, -Math.PI * 0.8, -Math.PI * 0.2); c.stroke();
      c.fillStyle = '#ff4757';
      c.beginPath(); c.arc(-14, -84, 4, 0, Math.PI * 2); c.fill();
      c.strokeStyle = '#111';
      c.beginPath(); c.moveTo(-14, -84); c.lineTo(-4, -76); c.stroke();
    }

    c.restore();
  }

  // ------------------------------------------------------------
  // 4. RESTAURANT ENVIRONMENT (Rich Comic Cel-Shaded Backgrounds)
  // ------------------------------------------------------------
  drawEnvironment(room = 'counter') {
    const c = this.ctx;
    const w = 1000, h = 600;

    // Floor (Warm checkerboard restaurant tiles)
    const floorGrad = c.createLinearGradient(0, 360, 0, h);
    floorGrad.addColorStop(0, '#533827');
    floorGrad.addColorStop(1, '#3b2518');
    c.fillStyle = floorGrad;
    c.fillRect(0, 360, w, h - 360);

    // Tile lines
    c.strokeStyle = 'rgba(0,0,0,0.2)'; c.lineWidth = 2;
    for (let x = 0; x < w; x += 65) {
      for (let y = 360; y < h; y += 45) {
        c.strokeRect(x, y, 65, 45);
      }
    }

    // Walls
    const wallGrad = c.createLinearGradient(0, 0, 0, 360);
    wallGrad.addColorStop(0, '#fff4e3');
    wallGrad.addColorStop(1, '#fad390');
    c.fillStyle = wallGrad;
    c.fillRect(0, 0, w, 360);

    // Iconic Red & Gold Brand Stripes
    c.fillStyle = '#c72c41'; c.fillRect(0, 48, w, 14);
    c.fillStyle = '#ffd700'; c.fillRect(0, 62, w, 6);

    // Glowing Neon Golden Arches
    c.save();
    c.shadowColor = '#ffd700';
    c.shadowBlur = 25;
    c.strokeStyle = '#ffd700'; c.lineWidth = 9;
    c.beginPath();
    c.arc(500 - 24, 160, 24, Math.PI, 0);
    c.arc(500 + 24, 160, 24, Math.PI, 0);
    c.stroke();
    c.restore();

    // Menu Boards with funny items
    c.fillStyle = '#1e272e';
    c.beginPath();
    c.roundRect(80, 95, 230, 115, 6);
    c.roundRect(690, 95, 230, 115, 6);
    c.fill(); this.comicStroke('#ffd700', 2);

    c.fillStyle = '#ffd700';
    c.font = 'bold 15px "Bangers", cursive';
    c.textAlign = 'center';
    c.fillText("🍔 Mc'Do Menu", 195, 120);
    c.fillText("🚫 Natalie's Rules", 805, 120);

    c.fillStyle = '#fff';
    c.font = 'bold 11px sans-serif';
    c.textAlign = 'left';
    c.fillText("Big Mac ............... $5.99", 95, 145);
    c.fillText("Nuggets (x47) ... (FOR NATALIE ONLY)", 95, 165);
    c.fillStyle = '#ff7675';
    c.fillText("Annulaire Combo .... SOLD OUT 2019", 95, 185);

    c.fillStyle = '#ff4d4d';
    c.fillText("1. ZERO EMPLOYEE DISCOUNTS", 705, 145);
    c.fillText("2. FRIES PULLED AT 0:40 SAVE POWER", 705, 165);
    c.fillText("3. BREATHING ON BREAK = WAGE THEFT", 705, 185);

    // Front Counter (Comptoir)
    const counterGrad = c.createLinearGradient(0, 310, 0, 375);
    counterGrad.addColorStop(0, '#784212');
    counterGrad.addColorStop(1, '#4e2808');
    c.fillStyle = counterGrad;
    c.beginPath();
    c.roundRect(60, 310, 880, 65, [8, 8, 0, 0]);
    c.fill(); this.comicStroke('#2d1502', 3);

    // Counter Top Polish
    c.fillStyle = '#a0522d';
    c.fillRect(50, 305, 900, 12);
    this.comicStroke('#2d1502', 2);

    // Registers
    c.fillStyle = '#2f3542';
    c.beginPath();
    c.roundRect(380, 245, 80, 60, 5);
    c.roundRect(580, 245, 80, 60, 5);
    c.fill(); this.comicStroke('#1e272e', 2);

    // Register screen with 0% discount
    c.fillStyle = '#00b894';
    c.fillRect(390, 255, 60, 22);
    c.fillStyle = '#000';
    c.font = 'bold 10px monospace';
    c.textAlign = 'center';
    c.fillText("DISC: 0%", 420, 270);
  }

  // ------------------------------------------------------------
  // 5. CHICKEN NUGGET & DEBRIS EXPLOSION PARTICLES
  // ------------------------------------------------------------
  drawNugget(x, y, rot, size = 18) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.fillStyle = '#f39c12';
    c.beginPath();
    c.roundRect(-size/2, -size/3, size, size * 0.7, 6);
    c.fill();
    this.comicStroke('#d35400', 1.5);
    // Crispy golden speckles
    c.fillStyle = '#e67e22';
    c.beginPath(); c.arc(-size/4, 0, 2, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(size/5, size/6, 1.5, 0, Math.PI * 2); c.fill();
    c.restore();
  }

  drawCoupon(x, y, rot) {
    const c = this.ctx;
    c.save();
    c.translate(x, y);
    c.rotate(rot);
    c.fillStyle = '#ffd700';
    c.fillRect(-15, -9, 30, 18);
    this.comicStroke('#c0392b', 1.5);
    c.fillStyle = '#c0392b';
    c.font = 'bold 7px sans-serif';
    c.textAlign = 'center';
    c.fillText("100% OFF", 0, 3);
    c.restore();
  }
}

window.ArtEngine = ArtEngine;
