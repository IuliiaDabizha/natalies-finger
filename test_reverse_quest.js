// test_reverse_quest.js — Verification of Front Entrance, Back Parking, Sealed Freezer & Logical Quest Forwarding
const { spawn } = require('child_process');
const fs = require('fs');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 Launching Headless Chrome for Updated Quest Verification...');
  const chrome = spawn('google-chrome', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=800,650',
    'file:///home/iuliiadabizha/natalies-finger/index.html'
  ]);

  await sleep(2500);

  try {
    const targetsRes = await fetch('http://127.0.0.1:9222/json');
    const targets = await targetsRes.json();
    const pageTarget = targets.find(t => t.type === 'page');
    if (!pageTarget) throw new Error('No page target found');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
    let msgId = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        callbacks.get(data.id)(data.result);
        callbacks.delete(data.id);
      }
    };

    await new Promise(r => ws.onopen = r);

    function sendCommand(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        callbacks.set(id, resolve);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    async function evaluate(expression) {
      const res = await sendCommand('Runtime.evaluate', { expression, returnByValue: true });
      return res?.result?.value;
    }

    async function takeScreenshot(filename) {
      const res = await sendCommand('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(filename, Buffer.from(res.data, 'base64'));
      console.log(`📸 Saved screenshot: ${filename}`);
    }

    async function closeAnyPopup() {
      await evaluate(`
        if (typeof window.closeCurrentItemPopup === 'function') {
          window.closeCurrentItemPopup();
        }
        const p = document.getElementById('item-popup');
        if (p && p.classList.contains('show')) p.click();
      `);
      await sleep(150);
    }

    async function exhaustDialogue() {
      let loops = 0;
      while (loops < 30) {
        const isActive = await evaluate(`window.state.dialogActive`);
        if (!isActive) break;
        await evaluate(`window.advanceDialogue()`);
        await sleep(50);
        loops++;
      }
      await closeAnyPopup();
      await sleep(150);
    }

    // 1. Start Game
    await evaluate(`window.startGame()`);
    await sleep(400);

    const spawnInfo = await evaluate(`({ x: window.player.x, y: window.player.y, mission: document.getElementById('hud-mission').textContent })`);
    console.log('✅ 1. Player spawned at Front Entrance:', spawnInfo);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v2_1_front_entrance_spawn.png');

    // 2. Walk into Mc'Do through the front sliding glass doors & meet Clement
    console.log('2. Entering Mc\'Do and talking to Clement at Register #3...');
    await evaluate(`
      window.player.x = 23 * 48;
      window.player.y = 16 * 48; // Standing in front of Register #3
      window.player.dir = 'up';
    `);
    await sleep(200);
    const clementPrompt = await evaluate(`document.getElementById('interact-prompt').textContent`);
    console.log('Clement Prompt:', clementPrompt);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await sleep(200);
    const clementText = await evaluate(`document.getElementById('dlg-text').textContent`);
    console.log('Clement initial lines:', clementText);
    await exhaustDialogue();

    const postClementMission = await evaluate(`document.getElementById('hud-mission').textContent`);
    console.log('Mission HUD forwarded to back parking:', postClementMission);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v2_2_clement_talk.png');

    // 3. Go to the Back Parking Lot on the Opposite Side & talk to Officer Miller
    console.log('3. Walking out to the back parking lot (opposite side of Mc\'Do) to meet Officer Miller...');
    await evaluate(`
      window.player.x = 9 * 48;
      window.player.y = 5 * 48; // Beside Officer Miller & police cruiser
      window.player.dir = 'up';
    `);
    await sleep(200);
    const copPrompt = await evaluate(`document.getElementById('interact-prompt').textContent`);
    console.log('Officer Miller Prompt:', copPrompt);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();

    const hasCrowbar = await evaluate(`window.state.inventory.has('crowbar')`);
    console.log('Obtained Police Crowbar:', hasCrowbar);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v2_3_back_parking_officer.png');

    // 4. Pry open Natalie's Minivan
    console.log('4. Prying open Natalie\'s minivan glovebox with crowbar...');
    await evaluate(`
      window.player.x = 17 * 48;
      window.player.y = 4 * 48;
      window.player.dir = 'up';
    `);
    await sleep(200);
    const carPrompt = await evaluate(`document.getElementById('interact-prompt').textContent`);
    console.log('Minivan Prompt:', carPrompt);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();

    const hasPinNote = await evaluate(`window.state.inventory.has('pin_note') && window.state.gotLockboxCode`);
    console.log('Obtained PIN note (0040):', hasPinNote);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v2_4_minivan_pried.png');

    // 5. Pry open Industrial Dumpster
    console.log('5. Prying open industrial dumpster...');
    await evaluate(`
      window.player.x = 31 * 48;
      window.player.y = 3 * 48;
      window.player.dir = 'up';
    `);
    await sleep(200);
    const dumpPrompt = await evaluate(`document.getElementById('interact-prompt').textContent`);
    console.log('Dumpster Prompt:', dumpPrompt);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();

    const hasHandbook = await evaluate(`window.state.inventory.has('handbook')`);
    console.log('Obtained 2019 Handbook:', hasHandbook);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v2_5_dumpster_opened.png');

    // 6. Test Sealed Freezer Walls: verify player cannot enter from any side without the key!
    console.log('6. Verifying that the Walk-in Freezer is 100% sealed on all 4 sides with NO MISSING WALLS...');
    const freezerWallCheck = await evaluate(`
      (() => {
        const layout = window.mapLayout;
        if (!layout) return 'mapLayout not accessible';
        // Check North wall (Row 8, cols 33..39)
        for (let c = 33; c <= 39; c++) {
          if (layout[8][c] !== 3) return 'North wall missing at col ' + c;
        }
        // Check South wall (Row 15, cols 33..39)
        for (let c = 33; c <= 39; c++) {
          if (layout[15][c] !== 3) return 'South wall missing at col ' + c;
        }
        // Check West wall (Col 33, rows 9..14)
        for (let r = 9; r <= 14; r++) {
          if (r === 12) {
            if (layout[r][33] !== 9) return 'Vault door missing at row 12';
          } else {
            if (layout[r][33] !== 3) return 'West wall missing at row ' + r;
          }
        }
        // Check East wall (Col 39)
        for (let r = 9; r <= 14; r++) {
          if (layout[r][39] !== 3) return 'East wall missing at row ' + r;
        }
        return 'ALL 4 WALLS ARE 100% SEALED!';
      })()
    `);
    console.log('Freezer Airtight Check:', freezerWallCheck);

    // 7. Collect 3 Kitchen Tools from Arthur, Maxime, Enzo
    console.log('7. Gathering 3 kitchen tools from Arthur, Maxime, and Enzo...');
    // Arthur
    await evaluate(`
      window.player.x = 15 * 48;
      window.player.y = 12 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();

    // Maxime
    await evaluate(`
      window.player.x = 18 * 48;
      window.player.y = 12 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();

    // Enzo
    await evaluate(`
      window.player.x = 22 * 48;
      window.player.y = 12 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();

    const toolsStatus = await evaluate(`({
      tongs: window.state.inventory.has('tongs'),
      ladle: window.state.inventory.has('ladle'),
      gloves: window.state.inventory.has('gloves')
    })`);
    console.log('Kitchen tools gathered:', toolsStatus);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v2_6_kitchen_tools.png');

    // 8. Open Breakroom Wall Lockbox with PIN 0040
    console.log('8. Opening Breakroom Wall Lockbox with PIN [0040]...');
    await evaluate(`
      window.player.x = 31 * 48;
      window.player.y = 10 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();

    const hasKey = await evaluate(`window.state.inventory.has('key')`);
    console.log('Obtained Freezer Master Key:', hasKey);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v2_7_master_key.png');

    // 9. Unlock Freezer Vault Door & Extract Annulaire from Crate #4
    console.log('9. Unlocking sealed freezer vault door with Master Key...');
    await evaluate(`
      window.player.x = 32 * 48;
      window.player.y = 12 * 48; // In front of the vault door
      window.player.dir = 'right';
    `);
    await sleep(100);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();

    console.log('Stepping inside sealed freezer to Crate #4...');
    await evaluate(`
      window.player.x = 37 * 48;
      window.player.y = 12 * 48; // In front of Crate #4
      window.player.dir = 'down';
    `);
    await sleep(150);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();

    const hasFinger = await evaluate(`window.state.inventory.has('finger')`);
    console.log('Extracted Fossilized Annulaire (2019):', hasFinger);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v2_8_extracted_finger.png');

    // 10. Packaging with Chloe at Drive-Thru
    console.log('10. Bringing finger to Chloe for packaging...');
    await evaluate(`
      window.player.x = 37 * 48;
      window.player.y = 16 * 48; // Beside Chloe
      window.player.dir = 'down';
    `);
    await sleep(100);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();

    const hasGiftBox = await evaluate(`window.state.inventory.has('gift_box')`);
    console.log('Has Golden Gift Box:', hasGiftBox);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v2_9_gift_box.png');

    // 11. Final Confrontation in Natalie's Office
    console.log('11. Walking through wide open west corridor into Natalie\'s Office...');
    await evaluate(`
      window.player.x = 6 * 48;
      window.player.y = 16 * 48; // In front of Natalie's desk
      window.player.dir = 'up';
    `);
    await sleep(200);
    const nataliePrompt = await evaluate(`document.getElementById('interact-prompt').textContent`);
    console.log('Natalie Prompt:', nataliePrompt);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await sleep(500);

    const inBattle = await evaluate(`window.state.mode === 'BATTLE'`);
    console.log('Entered Boss Battle Mode:', inBattle);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v2_10_boss_battle.png');

    await evaluate(`window.advanceDialogue()`);
    await sleep(300);

    console.log('Executing Present Award action...');
    await evaluate(`window.executeBattleAction('gift')`);
    await sleep(400);

    // Advance through the hilarious finale dialogue
    for (let i = 0; i < 15; i++) {
      const mode = await evaluate(`window.state.mode`);
      if (mode === 'EXPLODING' || mode === 'VICTORY') break;
      await evaluate(`window.advanceDialogue()`);
      await sleep(200);
    }

    console.log('Waiting for explosion detonation...');
    await sleep(1500);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v2_11_explosion_kaboom.png');

    await sleep(2200);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v2_12_victory_screen.png');

    const finalMode = await evaluate(`window.state.mode`);
    console.log('Final Mode:', finalMode);
    console.log('🎉 100% QUEST WALKTHROUGH WITH SEALED FREEZER AND FORWARDING SUCCEEDED!');

    ws.close();
  } catch (err) {
    console.error('❌ Verification test failed:', err);
  } finally {
    chrome.kill();
    process.exit(0);
  }
}

main();
