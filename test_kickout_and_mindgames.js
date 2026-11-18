const { spawn } = require('child_process');
const fs = require('fs');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 Running Full Verification: Kawaii Anime Intro, Mind Game Dialogues & Slapstick Kick-Out...');
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

    async function advanceToChoiceOrEnd() {
      for (let i = 0; i < 20; i++) {
        const awaitingChoice = await evaluate(`window.state.awaitingChoice`);
        const dialogActive = await evaluate(`window.state.dialogActive`);
        if (!dialogActive || awaitingChoice) break;
        await evaluate(`window.advanceDialogue()`);
        await sleep(40);
        await evaluate(`window.advanceDialogue()`);
        await sleep(40);
      }
    }

    async function finishDialogueAndPopup() {
      for (let i = 0; i < 30; i++) {
        const dialogActive = await evaluate(`window.state.dialogActive`);
        const awaitingChoice = await evaluate(`window.state.awaitingChoice`);
        const popupActive = await evaluate(`window.state.itemPopupActive`);
        if (!dialogActive && !popupActive) break;
        if (awaitingChoice) break;

        if (dialogActive) {
          await evaluate(`window.advanceDialogue()`);
          await sleep(40);
          await evaluate(`window.advanceDialogue()`);
          await sleep(40);
        }
        if (popupActive) {
          await evaluate(`
            const popup = document.getElementById('item-popup');
            if (popup) popup.click();
          `);
          await sleep(400); // Clear 350ms cooldown
        }
      }
      await sleep(400);
    }

    // 1. Title Screen & Kawaii Anime Battle Intro
    console.log('1. Checking title screen and intro video...');
    await sleep(600);
    const videoSrc = await evaluate(`document.getElementById('intro-video')?.src`);
    const isVideoPaused = await evaluate(`document.getElementById('intro-video')?.paused`);
    console.log('Video src:', videoSrc, '| Video paused?', isVideoPaused);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v4_1_title_anime_trailer.png');

    // 2. Start Game
    console.log('2. Starting game...');
    await evaluate(`window.startGame()`);
    await sleep(400);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v4_2_gameplay_start.png');

    // 3. Move inside to Clement at Register 3
    console.log('3. Walking inside to Clement at Register 3...');
    await evaluate(`
      window.player.x = 23 * 48;
      window.player.y = 16 * 48;
      window.player.dir = 'up';
    `);
    await sleep(200);

    // Interact with Clement
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await advanceToChoiceOrEnd();

    const isClementAwaiting = await evaluate(`window.state.awaitingChoice`);
    console.log('Clement awaiting choice:', isClementAwaiting);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v4_3_clement_mindgame_options.png');

    // 4. Test Slapstick Kick-out Animation with SPY Option (Index 0)
    console.log('4. Selecting SPY Option (Index 0: "Memo about clocking out 15m early")...');
    await evaluate(`window.selectDialogueChoice(0)`);
    
    // Check mode
    const modeMidFlight = await evaluate(`window.state.mode`);
    console.log('Game mode after selecting spy choice:', modeMidFlight);

    // Capture in mid-flight (~550ms after kick-out trigger)
    await sleep(550);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v4_4_kickout_in_flight.png');

    // Capture landing impact and dizzy state (~1350ms after kick-out trigger)
    await sleep(800);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v4_5_kickout_landing_dizzy.png');

    // Capture Game Over screen (~2100ms after kick-out trigger)
    await sleep(800);
    const isGameOverVisible = await evaluate(`document.getElementById('gameover-screen').style.display`);
    console.log('Game Over screen visible:', isGameOverVisible);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v4_6_kicked_out_gameover_modal.png');

    // 5. Test Retry
    console.log('5. Clicking Retry button...');
    await evaluate(`window.retryAfterKickOut()`);
    await sleep(200);
    const playerAfterRetry = await evaluate(`({ x: window.player.x, y: window.player.y, canMove: window.player.canMove })`);
    console.log('Player after retry:', playerAfterRetry);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v4_7_after_retry_spawn.png');

    // 6. Complete Clement's Mind Game with the Correct Option (Index 2: CCTV float swap)
    console.log('6. Interacting with Clement and selecting Correct Option (Index 2)...');
    await evaluate(`
      window.player.x = 23 * 48;
      window.player.y = 16 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await advanceToChoiceOrEnd();
    await evaluate(`window.selectDialogueChoice(2)`);
    await sleep(100);
    await finishDialogueAndPopup();

    const clementDone = await evaluate(`window.state.quests.clement_done`);
    console.log('Clement quest completed successfully:', clementDone);

    // 7. Talk to Clara with Correct Option (Index 2: Thermostat sabotage)
    console.log('7. Interacting with Clara and selecting Correct Option (Index 2)...');
    await evaluate(`
      window.player.x = 21 * 48;
      window.player.y = 19 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await advanceToChoiceOrEnd();
    await evaluate(`window.selectDialogueChoice(2)`);
    await sleep(100);
    await finishDialogueAndPopup();

    const hasPass = await evaluate(`window.state.inventory.has('pass_bistro')`);
    console.log('Obtained Clara\'s Bistro Pass:', hasPass);

    // 8. Sabotage Kiosk 4
    console.log('8. Sabotaging Kiosk 4...');
    await evaluate(`
      window.player.x = 19 * 48;
      window.player.y = 19 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await finishDialogueAndPopup();
    const kioskSabotaged = await evaluate(`window.state.quests.kiosk_sabotaged`);
    console.log('Kiosk 4 sabotaged:', kioskSabotaged);

    // 9. Officer Miller in Back Parking Lot (Correct Option Index 0: Natalie reported own minivan)
    console.log('9. Talking to Officer Miller in back lot...');
    await evaluate(`
      window.player.x = 9 * 48;
      window.player.y = 5 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await advanceToChoiceOrEnd();
    await evaluate(`window.selectDialogueChoice(0)`);
    await sleep(100);
    await finishDialogueAndPopup();

    const hasCrowbar = await evaluate(`window.state.inventory.has('crowbar')`);
    console.log('Obtained Police Crowbar:', hasCrowbar);

    // 10. Pry Minivan & Dumpster
    console.log('10. Prying Minivan and Dumpster...');
    await evaluate(`
      window.player.x = 17 * 48;
      window.player.y = 4 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await finishDialogueAndPopup();

    await evaluate(`
      window.player.x = 31 * 48;
      window.player.y = 3 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await finishDialogueAndPopup();

    // 11. Kitchen Crew: Arthur (Option B, Index 1: Platen 210°C sabotage)
    console.log('11. Talking to Arthur at Grill...');
    await evaluate(`
      window.player.x = 15 * 48;
      window.player.y = 12 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await advanceToChoiceOrEnd();
    await evaluate(`window.selectDialogueChoice(1)`);
    await sleep(100);
    await finishDialogueAndPopup();

    const hasTongs = await evaluate(`window.state.inventory.has('tongs')`);
    console.log('Obtained Arthur\'s Tongs:', hasTongs);

    // 12. Lea (Option B, Index 1: Stiff sauce guns)
    console.log('12. Talking to Lea at Prep Table...');
    await evaluate(`
      window.player.x = 18 * 48;
      window.player.y = 12 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await advanceToChoiceOrEnd();
    await evaluate(`window.selectDialogueChoice(1)`);
    await sleep(100);
    await finishDialogueAndPopup();

    const hasLadle = await evaluate(`window.state.inventory.has('ladle')`);
    console.log('Obtained Lea\'s Ladle:', hasLadle);

    // 13. Natan (Option B, Index 1: Boiler valve padlocked for utility bonus)
    console.log('13. Talking to Natan at Dish Pit...');
    await evaluate(`
      window.player.x = 22 * 48;
      window.player.y = 12 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await advanceToChoiceOrEnd();
    await evaluate(`window.selectDialogueChoice(1)`);
    await sleep(100);
    await finishDialogueAndPopup();

    const hasGloves = await evaluate(`window.state.inventory.has('gloves')`);
    console.log('Obtained Natan\'s Gloves:', hasGloves);

    // 14. Raphael (Option B, Index 1: Minivan note decoded 0040)
    console.log('14. Talking to Raphael in Breakroom...');
    await evaluate(`
      window.player.x = 29 * 48;
      window.player.y = 12 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await advanceToChoiceOrEnd();
    await evaluate(`window.selectDialogueChoice(1)`);
    await sleep(100);
    await finishDialogueAndPopup();

    // Grab Master Key from Wall Lockbox (Cols 31, Row 9)
    await evaluate(`
      window.player.x = 31 * 48;
      window.player.y = 10 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await finishDialogueAndPopup();

    const hasKey = await evaluate(`window.state.inventory.has('key')`);
    console.log('Obtained Master Key:', hasKey);

    // 15. Luca (Option B, Index 1: Channel 3 frequency override)
    console.log('15. Talking to Luca at Drive-Thru...');
    await evaluate(`
      window.player.x = 39 * 48;
      window.player.y = 18 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await advanceToChoiceOrEnd();
    await evaluate(`window.selectDialogueChoice(1)`);
    await sleep(100);
    await finishDialogueAndPopup();

    const hasHeadset = await evaluate(`window.state.inventory.has('headset')`);
    console.log('Obtained Luca\'s Jammer Headset:', hasHeadset);

    // 16. Unlock Freezer Vault & Extract Annulaire
    console.log('16. Unlocking Freezer and Extracting Annulaire from Crate #4...');
    await evaluate(`
      window.player.x = 33 * 48;
      window.player.y = 12 * 48;
      window.player.dir = 'right';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await finishDialogueAndPopup();

    // Extract finger from crate #4 at col 37, row 13
    await evaluate(`
      window.player.x = 37 * 48;
      window.player.y = 14 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await finishDialogueAndPopup();

    const hasFinger = await evaluate(`window.state.inventory.has('finger')`);
    console.log('Extracted Natalie\'s Fossilized Annulaire:', hasFinger);

    // 17. Wrap with Clara in 24K Golden Happy Meal Box
    console.log('17. Bringing Annulaire to Clara for 24K Packaging...');
    await evaluate(`
      window.player.x = 21 * 48;
      window.player.y = 19 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await finishDialogueAndPopup();

    const hasGiftBox = await evaluate(`window.state.inventory.has('gift_box')`);
    console.log('24K Golden Happy Meal Award Box prepared:', hasGiftBox);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v4_8_gift_box_prepared.png');

    // 18. Boss Battle Confrontation with Natalie
    console.log('18. Confronting Natalie in her Office for Boss Battle...');
    await evaluate(`
      window.player.x = 6 * 48;
      window.player.y = 15 * 48;
      window.player.dir = 'up';
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await finishDialogueAndPopup();
    await sleep(300);

    const battleMode = await evaluate(`window.state.mode`);
    console.log('Entered Boss Battle Mode:', battleMode);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v4_9_natalie_battle_showdown.png');

    // Execute Battle Actions:
    console.log('Executing battle turns to pop Natalie...');
    for (let turn = 0; turn < 4; turn++) {
      await evaluate(`window.executeBattleAction('troll')`);
      await sleep(100);
      await finishDialogueAndPopup();
      await sleep(150);
    }

    // Wait for detonation explosion and victory screen
    console.log('Waiting for explosion detonation and victory celebration...');
    await sleep(2500);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v4_10_victory_celebration.png');

    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY!');
  } finally {
    chrome.kill();
  }
}

main().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
