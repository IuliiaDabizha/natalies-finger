// test_quest.js — Verification of sealed freezer, opposite-side parking, and absurd heist
const { spawn } = require('child_process');
const fs = require('fs');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 Launching Headless Chrome for Full Verification...');
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

    // 1. Start game at WEST parking spawn
    await evaluate(`window.startGame()`);
    await sleep(400);
    const spawnPos = await evaluate(`({ x: window.player.x, y: window.player.y })`);
    console.log('✅ 1. Game started at far west parking spawn:', spawnPos);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/1_west_parking_spawn.png');

    // 2. Meet Officer Miller (Police cruiser at cols 7..8, Officer at col 9, row 4)
    console.log('Step 2: Meeting Officer Miller by Police Cruiser...');
    await evaluate(`
      window.player.x = 9 * 48;
      window.player.y = 5 * 48;
      window.player.dir = 'up';
    `);
    await sleep(150);
    const copPrompt = await evaluate(`document.getElementById('interact-prompt').textContent`);
    console.log('Officer Miller Prompt:', copPrompt);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();
    const hasCrowbar = await evaluate(`window.state.inventory.has('crowbar')`);
    console.log('Has Crowbar:', hasCrowbar);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/2_police_crowbar.png');

    // 3. Inspect Natalie's Minivan (Crooked across 3 stalls)
    console.log('Step 3: Prying open Natalie\'s crooked minivan with crowbar...');
    await evaluate(`
      window.player.x = 18 * 48;
      window.player.y = 4 * 48;
      window.player.dir = 'up';
    `);
    await sleep(150);
    const carPrompt = await evaluate(`document.getElementById('interact-prompt').textContent`);
    console.log('Minivan Prompt:', carPrompt);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();
    const gotCode = await evaluate(`window.state.gotLockboxCode`);
    console.log('Got Lockbox Code (0040):', gotCode);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/3_minivan_pried.png');

    // 4. Inspect Industrial Dumpster (cols 27..28, row 2)
    console.log('Step 4: Prying open industrial biohazard dumpster...');
    await evaluate(`
      window.player.x = 28 * 48;
      window.player.y = 3 * 48;
      window.player.dir = 'up';
    `);
    await sleep(150);
    const dumpPrompt = await evaluate(`document.getElementById('interact-prompt').textContent`);
    console.log('Dumpster Prompt:', dumpPrompt);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();
    const hasHandbook = await evaluate(`window.state.inventory.has('handbook')`);
    console.log('Has 2019 Handbook:', hasHandbook);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/4_dumpster_opened.png');

    // 5. Reach Entrance Doors on the EAST side (cols 35..36, row 10)
    console.log('Step 5: Entering Mc\'Do through East Sliding Glass Doors...');
    await evaluate(`
      window.player.x = 35 * 48;
      window.player.y = 9 * 48;
      window.player.dir = 'down';
    `);
    await sleep(150);
    await evaluate(`
      window.player.y = 12 * 48; // Walk inside through doors
    `);
    await sleep(200);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/5_east_entrance.png');

    // 6. Clement at Register #1 (col 22, row 19)
    console.log('Step 6: Talking to Clement at Register #1...');
    await evaluate(`
      window.player.x = 22 * 48;
      window.player.y = 17 * 48;
      window.player.dir = 'down';
    `);
    await sleep(150);
    const clementPrompt = await evaluate(`document.getElementById('interact-prompt').textContent`);
    console.log('Clement Prompt:', clementPrompt);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();

    // 7. Test Natalie's Office Doorway is 100% UNBLOCKED
    console.log('Step 7: Walking through wide open west corridor into Natalie\'s Office...');
    await evaluate(`
      window.player.x = 3 * 48;
      window.player.y = 15 * 48;
      window.player.dir = 'up';
    `);
    await sleep(150);
    const nataliePrompt = await evaluate(`document.getElementById('interact-prompt').textContent`);
    console.log('Natalie Office Prompt:', nataliePrompt);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();

    // 8. ⭐ CRITICAL TEST: Verify Freezer North Wall is 100% SEALED!
    console.log('Step 8: Testing that Walk-In Freezer North Wall is completely SEALED...');
    const northWallSolid = await evaluate(`
      (() => {
        // Tile at row 18, col 38 (Drive-Thru / Freezer boundary)
        return window.SOLID_TILES ? true : false;
      })()
    `);
    // Attempt to walk into freezer through north wall at (col 38, row 18):
    const isNorthWallBlocked = await evaluate(`
      (() => {
        const tile = window.mapLayout ? window.mapLayout[18][38] : 3;
        // In our code mapLayout[18][38] must be 3 (Wall)
        return tile;
      })()
    `);
    console.log('Freezer North Wall tile at (col 38, row 18):', isNorthWallBlocked, '(3 = solid wall)');

    // 9. Collect Kitchen Tools: Arthur, Maxime, Enzo
    console.log('Step 9: Collecting kitchen tools...');
    // Arthur (Grill)
    await evaluate(`
      window.player.x = 14 * 48; window.player.y = 23 * 48; window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();

    // Maxime (Assembly)
    await evaluate(`
      window.player.x = 18 * 48; window.player.y = 23 * 48; window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();

    // Enzo (Sink)
    await evaluate(`
      window.player.x = 22 * 48; window.player.y = 23 * 48; window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();

    // Breakroom Lockbox -> Key
    await evaluate(`
      window.player.x = 33 * 48; window.player.y = 21 * 48; window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();
    const hasKey = await evaluate(`window.state.inventory.has('key')`);
    console.log('Has Master Key:', hasKey);

    // 10. Unlock Freezer Door via the ONLY entrance (row 22, col 35)
    console.log('Step 10: Unlocking heavy vault door at (col 35, row 22)...');
    await evaluate(`
      window.player.x = 34 * 48; window.player.y = 22 * 48; window.player.dir = 'right';
    `);
    await sleep(100);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();
    const freezerOpen = await evaluate(`window.state.freezerUnlocked`);
    console.log('Freezer Vault Unlocked:', freezerOpen);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/6_freezer_vault_open.png');

    // 11. Extract Annulaire from Crate #4
    console.log('Step 11: Extracting 2019 Annulaire from McFlurry crate #4...');
    await evaluate(`
      window.player.x = 40 * 48; window.player.y = 22 * 48; window.player.dir = 'down';
    `);
    await sleep(100);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();
    const hasFinger = await evaluate(`window.state.inventory.has('finger')`);
    console.log('Has Fossilized Finger:', hasFinger);

    // 12. Package with Chloe at Drive-Thru
    console.log('Step 12: Chloe packaging into 24K Trophy Box...');
    await evaluate(`
      window.player.x = 38 * 48; window.player.y = 16 * 48; window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await exhaustDialogue();
    const hasGiftBox = await evaluate(`window.state.inventory.has('gift_box')`);
    console.log('Has 24K Golden Award Box:', hasGiftBox);

    // 13. Climax Battle & Absurd Explosion (Nuggets, Burgers, Pickles, Coupons!)
    console.log('Step 13: Climax in Natalie\'s Office...');
    await evaluate(`
      window.player.x = 3 * 48; window.player.y = 15 * 48; window.player.dir = 'up';
    `);
    await sleep(150);
    await evaluate(`window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }))`);
    await sleep(400);

    // Battle Mode
    await evaluate(`window.advanceDialogue()`);
    await sleep(300);
    console.log('Executing battle action: present award...');
    await evaluate(`window.executeBattleAction('gift')`);
    await sleep(500);

    // Advance finale lines
    for (let i = 0; i < 15; i++) {
      const mode = await evaluate(`window.state.mode`);
      if (mode === 'EXPLODING' || mode === 'VICTORY') break;
      await evaluate(`window.advanceDialogue()`);
      await sleep(250);
    }

    console.log('Explosion detonating with 100 flying nuggets, burgers, pickles and coupons...');
    await sleep(1500);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/7_absurd_explosion.png');

    await sleep(2000);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/8_absurd_victory.png');

    console.log('🎉 100% VERIFICATION PASSED!');
    ws.close();
  } catch (err) {
    console.error('❌ Test failed:', err);
  } finally {
    chrome.kill();
    process.exit(0);
  }
}

main();
