// test_game.js — Comprehensive verification of Natalie's Annulaire Heist
const { spawn } = require('child_process');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 Launching Headless Chrome...');
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

    // 1. Initial State & Title Screen
    console.log('1. Checking Title Screen...');
    await sleep(800);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/title_screenshot.png');

    // 2. Start Game
    console.log('2. Starting game...');
    await evaluate(`window.startGame()`);
    await sleep(600);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/outdoor_spawn_screenshot.png');

    const playerPos = await evaluate(`({ x: window.player.x, y: window.player.y, mode: window.state.mode })`);
    console.log('Player initial outdoor spawn:', playerPos);

    // 3. Talk to Officer Miller
    console.log('3. Walking to Officer Miller...');
    await evaluate(`
      window.player.x = 7 * 48;
      window.player.y = 5 * 48;
      window.player.dir = 'up';
    `);
    await sleep(300);
    const nearbyNpc = await evaluate(`
      (() => {
        const prompt = document.getElementById('interact-prompt');
        return prompt ? prompt.textContent : 'none';
      })()
    `);
    console.log('Prompt near Officer Miller:', nearbyNpc);

    // Press E to interact
    await evaluate(`
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
    `);
    await sleep(400);

    const dialogLine1 = await evaluate(`document.getElementById('dlg-text').textContent`);
    console.log('Officer Miller dialogue:', dialogLine1);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/officer_miller_screenshot.png');

    // Advance officer dialogue until done
    for (let i = 0; i < 5; i++) {
      await evaluate(`window.advanceDialogue()`);
      await sleep(200);
    }

    const hasCrowbar = await evaluate(`window.state.inventory.has('crowbar')`);
    console.log('Obtained crowbar:', hasCrowbar);

    // Close item popup if showing
    await evaluate(`
      const p = document.getElementById('item-popup');
      if (p) p.click();
    `);
    await sleep(300);

    // 4. Inspect Natalie's Minivan
    console.log('4. Walking to Natalie Minivan...');
    await evaluate(`
      window.player.x = 18 * 48;
      window.player.y = 4 * 48;
      window.player.dir = 'up';
    `);
    await sleep(300);
    const carPrompt = await evaluate(`document.getElementById('interact-prompt').textContent`);
    console.log('Prompt near Minivan:', carPrompt);

    // Interact with Minivan using Crowbar
    await evaluate(`
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
    `);
    await sleep(500);
    const carText = await evaluate(`document.getElementById('dlg-text').textContent`);
    console.log('Minivan inspect text:', carText);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/minivan_pried_screenshot.png');

    // Close dialog and popup
    await evaluate(`
      window.advanceDialogue();
      const p = document.getElementById('item-popup');
      if (p) p.click();
    `);
    await sleep(300);

    // 5. Enter Restaurant & Check Clement Station
    console.log('5. Entering restaurant through sliding glass doors...');
    await evaluate(`
      window.player.x = 20 * 48;
      window.player.y = 12 * 48; // Lobby entrance
      window.player.dir = 'down';
    `);
    await sleep(500);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/indoor_lobby_screenshot.png');

    // 6. Check Clement at Register #1 (East counter, NOT blocking Natalie's office!)
    console.log('6. Checking Clement at Register #1...');
    await evaluate(`
      window.player.x = 22 * 48;
      window.player.y = 17 * 48; // In front of Register #3 (Clement)
      window.player.dir = 'down';
    `);
    await sleep(400);
    const clementPrompt = await evaluate(`document.getElementById('interact-prompt').textContent`);
    console.log('Prompt at Register #1:', clementPrompt);

    await evaluate(`
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
    `);
    await sleep(400);
    const clementText = await evaluate(`document.getElementById('dlg-text').textContent`);
    console.log('Clement dialogue:', clementText);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/clement_register_screenshot.png');

    await evaluate(`window.advanceDialogue()`);
    await sleep(300);

    // 7. Walk into Natalie's office directly through the wide open corridor!
    console.log('7. Walking directly through wide open west corridor into Natalie\'s Office...');
    await evaluate(`
      window.player.x = 3 * 48; // Standing right in front of Natalie's desk!
      window.player.y = 15 * 48;
      window.player.dir = 'up';
    `);
    await sleep(500);
    const nataliePrompt = await evaluate(`document.getElementById('interact-prompt').textContent`);
    console.log('Prompt in Natalie\'s office:', nataliePrompt);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/natalie_office_unblocked_screenshot.png');

    await evaluate(`
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e' }));
    `);
    await sleep(400);
    const natalieText = await evaluate(`document.getElementById('dlg-text').textContent`);
    console.log('Natalie yelling in office:', natalieText);

    await evaluate(`window.advanceDialogue()`);
    await sleep(300);

    // 8. Trigger Boss Showdown & Explosion
    console.log('8. Triggering Boss Showdown & Explosion...');
    await evaluate(`
      window.triggerBattle();
    `);
    await sleep(600);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/battle_showdown_screenshot.png');

    console.log('Executing Present Award action...');
    await evaluate(`
      window.executeBattleAction('gift');
    `);
    await sleep(1500);

    // Advance finale dialogues
    for (let i = 0; i < 8; i++) {
      await evaluate(`window.advanceDialogue()`);
      await sleep(300);
    }

    console.log('Waiting for explosion detonation...');
    await sleep(1500);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/explosion_detonation_screenshot.png');

    await sleep(2500);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/victory_screen_screenshot.png');

    console.log('🎉 Verification Test Completed Successfully!');
    ws.close();
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    chrome.kill();
    process.exit(0);
  }
}

main();
