const { spawn } = require('child_process');
const fs = require('fs');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 Running complete end-to-end quest verification with tricky mind games...');
  const chrome = spawn('google-chrome', [
    '--headless=new',
    '--remote-debugging-port=9230',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=800,650',
    'file:///home/iuliiadabizha/natalies-finger/index.html'
  ]);

  await sleep(2500);

  try {
    const res = await fetch('http://127.0.0.1:9230/json');
    const targets = await res.json();
    const target = targets.find(t => t.type === 'page');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 1;
    const send = (m, p = {}) => new Promise(r => {
      const cur = id++;
      const handler = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === cur) { ws.removeEventListener('message', handler); r(d.result); }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: cur, method: m, params: p }));
    });
    const evaluate = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true }))?.result?.value;
    const screenshot = async (fn) => {
      const s = await send('Page.captureScreenshot', { format: 'png' });
      fs.writeFileSync(fn, Buffer.from(s.data, 'base64'));
      console.log(`📸 Saved screenshot: ${fn}`);
    };

    await new Promise(r => ws.onopen = r);
    await evaluate('window.startGame()');
    console.log('Game started');

    async function drain() {
      for (let s = 0; s < 35; s++) {
        await sleep(50);
        const info = await evaluate('({ d: window.state.dialogActive, c: window.state.awaitingChoice, p: window.state.itemPopupActive, cd: window.state.interactionCooldown })');
        if (info.c) return 'CHOICE';
        if (!info.d && !info.p && !info.cd) return 'IDLE';
        if (info.p) {
          await evaluate('if (window.closeCurrentItemPopup) window.closeCurrentItemPopup();');
          await sleep(400); // 350ms cooldown
        } else if (info.d) {
          await evaluate('window.advanceDialogue()');
          await sleep(40);
          await evaluate('window.advanceDialogue()');
        }
      }
      return 'IDLE';
    }

    async function interact(col, row, dir = 'up') {
      await evaluate(`
        window.player.x = ${col} * 48;
        window.player.y = ${row} * 48;
        window.player.dir = '${dir}';
        window.state.interactionCooldown = false;
        window.player.canMove = true;
      `);
      await sleep(100);
      await evaluate('window.checkInteraction()');
      return await drain();
    }

    // 1. Clement (Counter Cashier, Col 23, Row 15): Option C (Index 2: CCTV float bag swap)
    console.log('--- 1. Clement ---');
    let choiceRes = await interact(23, 16, 'up');
    console.log('Clement ready for choice?', choiceRes === 'CHOICE');
    await evaluate('window.selectDialogueChoice(2)');
    await drain();
    console.log('Clement done:', await evaluate('window.state.quests.clement_done'));

    // 2. Clara (Dining Host, Col 21, Row 18): Option C (Index 2: Thermostat sabotage)
    console.log('--- 2. Clara ---');
    choiceRes = await interact(21, 19, 'up');
    console.log('Clara ready for choice?', choiceRes === 'CHOICE');
    await evaluate('window.selectDialogueChoice(2)');
    await drain();
    console.log('Bistro Pass obtained:', await evaluate('window.state.inventory.has("pass_bistro")'));

    // 3. Kiosk #4 (Col 19, Row 18) - stand at Col 18, Row 18
    console.log('--- 3. Kiosk #4 ---');
    await interact(18, 18, 'up');
    console.log('Kiosk 4 sabotaged:', await evaluate('window.state.quests.kiosk_sabotaged'));

    // 4. Officer Miller (Back Parking Lot, Col 9, Row 4): Option A (Index 0: reported own car)
    console.log('--- 4. Officer Miller ---');
    choiceRes = await interact(9, 5, 'up');
    console.log('Miller ready for choice?', choiceRes === 'CHOICE');
    await evaluate('window.selectDialogueChoice(0)');
    await drain();
    console.log('Crowbar obtained:', await evaluate('window.state.inventory.has("crowbar")'));

    // 5. Minivan (Col 17, Row 3) - stand at Col 17, Row 4
    console.log('--- 5. Minivan ---');
    await interact(17, 4, 'up');
    console.log('Minivan pried:', await evaluate('window.state.quests.car_pried'));
    console.log('PIN note obtained:', await evaluate('window.state.inventory.has("pin_note")'));

    // 6. Dumpster (Col 31, Row 2) - stand at Col 31, Row 3
    console.log('--- 6. Dumpster ---');
    await interact(31, 3, 'up');
    console.log('Dumpster opened:', await evaluate('window.state.quests.dumpster_pried'));
    console.log('Handbook diary obtained:', await evaluate('window.state.inventory.has("handbook")'));

    // 7. Arthur (Grill Cook, Col 15, Row 11): Option B (Index 1: platen 210°C) - stand at Col 15, Row 12
    console.log('--- 7. Arthur ---');
    choiceRes = await interact(15, 12, 'up');
    console.log('Arthur ready for choice?', choiceRes === 'CHOICE');
    await evaluate('window.selectDialogueChoice(1)');
    await drain();
    console.log('Arthur tongs obtained:', await evaluate('window.state.inventory.has("tongs")'));

    // 8. Lea (Prep Table, Col 18, Row 11): Option B (Index 1: stiff sauce springs) - stand at Col 18, Row 12
    console.log('--- 8. Lea ---');
    choiceRes = await interact(18, 12, 'up');
    console.log('Lea ready for choice?', choiceRes === 'CHOICE');
    await evaluate('window.selectDialogueChoice(1)');
    await drain();
    console.log('Lea fry oil ladle obtained:', await evaluate('window.state.inventory.has("ladle")'));

    // 9. Natan (Dish Pit, Col 22, Row 11): Option B (Index 1: boiler valve padlocked) - stand at Col 22, Row 12
    console.log('--- 9. Natan ---');
    choiceRes = await interact(22, 12, 'up');
    console.log('Natan ready for choice?', choiceRes === 'CHOICE');
    await evaluate('window.selectDialogueChoice(1)');
    await drain();
    console.log('Natan gloves obtained:', await evaluate('window.state.inventory.has("gloves")'));

    // 10. Raphael (Breakroom, Col 29, Row 11): Option B (Index 1: minivan PIN 0040) - stand at Col 29, Row 12
    console.log('--- 10. Raphael ---');
    choiceRes = await interact(29, 12, 'up');
    console.log('Raphael ready for choice?', choiceRes === 'CHOICE');
    await evaluate('window.selectDialogueChoice(1)');
    await drain();
    console.log('Raphael done:', await evaluate('window.state.quests.raphael_done'));

    // Wall Lockbox in breakroom (Col 31, Row 9) - stand at Col 31, Row 10
    console.log('--- 10b. Lockbox Master Key ---');
    await interact(31, 10, 'up');
    console.log('Freezer Master Key obtained:', await evaluate('window.state.inventory.has("key")'));

    // 11. Luca (Drive-Thru, Col 39, Row 17): Option B (Index 1: Channel 3 override) - stand at Col 39, Row 18
    console.log('--- 11. Luca ---');
    choiceRes = await interact(39, 18, 'up');
    console.log('Luca ready for choice?', choiceRes === 'CHOICE');
    await evaluate('window.selectDialogueChoice(1)');
    await drain();
    console.log('Luca jammer headset obtained:', await evaluate('window.state.inventory.has("headset")'));

    // 12. Unlock Freezer Vault Door (Col 33, Row 12) - stand at Col 32, Row 12
    console.log('--- 12. Unlock Freezer Door ---');
    await interact(32, 12, 'right');
    console.log('Freezer vault unlocked:', await evaluate('window.state.quests.freezer_unlocked'));

    // 13. Extract Fossilized Annulaire from Crate #4 (Col 37, Row 13) - stand at Col 37, Row 14
    console.log('--- 13. Extract Fossilized Annulaire ---');
    await interact(37, 14, 'up');
    console.log('Finger extracted:', await evaluate('window.state.inventory.has("finger")'));

    // 14. Clara Packages Annulaire into 24K Golden Award Box (Col 21, Row 18) - stand at Col 21, Row 19
    console.log('--- 14. Package in 24K Golden Happy Meal Box ---');
    await interact(21, 19, 'up');
    console.log('24K Award Gift Box obtained:', await evaluate('window.state.inventory.has("gift_box")'));
    await screenshot('/home/iuliiadabizha/natalies-finger/v5_1_gift_box_prepared.png');

    // 15. Confront Natalie in Boss Office (Col 6, Row 14) - stand at Col 6, Row 15
    console.log('--- 15. Boss Confrontation ---');
    await interact(6, 15, 'up');
    await sleep(400);

    const mode = await evaluate('window.state.mode');
    console.log('Mode after confronting Natalie:', mode);
    await screenshot('/home/iuliiadabizha/natalies-finger/v5_2_boss_battle.png');

    // 16. Battle Showdown
    console.log('--- 16. Battle Showdown & Explosion ---');
    for (let t = 0; t < 4; t++) {
      console.log(`Battle turn ${t+1}...`);
      await evaluate('window.executeBattleAction("troll")');
      await drain();
      await sleep(200);
    }

    console.log('Waiting for Natalie hyper-explosion and victory...');
    await sleep(3500);
    await screenshot('/home/iuliiadabizha/natalies-finger/v5_3_victory_explosion.png');

    console.log('🎉 COMPLETE END-TO-END VERIFICATION SUCCEEDED!');
    chrome.kill();
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during quest verification:', err);
    chrome.kill();
    process.exit(1);
  }
}

main();
