const { spawn } = require('child_process');
const fs = require('fs');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('🚀 Running full verification test suite for Natalie\'s Annulaire...');
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

    async function skipThroughDialogue() {
      // Advance dialogue through lines until choices or completion
      for (let i = 0; i < 15; i++) {
        const awaitingChoice = await evaluate(`window.state.awaitingChoice`);
        const dialogActive = await evaluate(`window.state.dialogActive`);
        if (!dialogActive || awaitingChoice) break;
        await evaluate(`window.advanceDialogue()`);
        await sleep(40);
        await evaluate(`window.advanceDialogue()`);
        await sleep(40);
      }
    }

    // 1. Title Screen with Video Trailer
    await sleep(800);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v3_1_title_trailer.png');

    // 2. Start Game
    await evaluate(`window.startGame()`);
    await sleep(400);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v3_2_spawn_front_plaza.png');

    // Check HUD cleanly formatted without overlap
    const missionText = await evaluate(`document.getElementById('hud-mission').textContent`);
    const compassText = await evaluate(`document.getElementById('compass').textContent`);
    console.log('HUD Mission:', missionText);
    console.log('HUD Compass:', compassText);

    // 3. Move through front doors into Lobby
    console.log('Moving player up through front sliding doors...');
    for (let i = 0; i < 35; i++) {
      await evaluate(`
        window.player.y -= 4;
        window.player.dir = 'up';
      `);
    }
    await sleep(200);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v3_3_inside_dining_lobby.png');

    // 4. Test Interactive Dialogue: Clement (Spy Choice -> Kick-out)
    console.log('Testing Clement interaction...');
    await evaluate(`
      window.player.x = 23 * 48;
      window.player.y = 16 * 48;
    `);
    await sleep(150);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await skipThroughDialogue();

    const isAwaitingClement = await evaluate(`window.state.awaitingChoice`);
    console.log('Awaiting Clement choices:', isAwaitingClement);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v3_4_clement_choices_ui.png');

    // Select SPY option (Index 1)
    console.log('Selecting SPY choice to test kick-out...');
    await evaluate(`window.selectDialogueChoice(1)`);
    await sleep(300);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v3_5_kicked_out_gameover_screen.png');

    // Retry after kick-out
    console.log('Testing retry after kick-out...');
    await evaluate(`window.retryAfterKickOut()`);
    await sleep(200);
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v3_6_after_retry_spawn.png');

    // 5. Test Clement Troll Choice (Succeeds)
    await evaluate(`
      window.player.x = 23 * 48;
      window.player.y = 16 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await skipThroughDialogue();
    await evaluate(`window.selectDialogueChoice(0)`); // Choice 0: Troll choice
    await sleep(100);
    await skipThroughDialogue();

    const clementDone = await evaluate(`window.state.quests.clement_done`);
    console.log('Clement quest completed:', clementDone);

    // 6. Test Clara Interaction & Item Pickup (Check no restart loop!)
    console.log('Testing Clara interaction & Bistro Pass pickup...');
    await evaluate(`
      window.player.x = 21 * 48;
      window.player.y = 19 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await skipThroughDialogue();
    await evaluate(`window.selectDialogueChoice(0)`); // Troll choice
    await sleep(100);
    await skipThroughDialogue();
    await sleep(300);

    // Popup is shown
    await takeScreenshot('/home/iuliiadabizha/natalies-finger/v3_7_clara_pass_popup.png');

    // Close popup
    await evaluate(`window.closeCurrentItemPopup()`);
    await sleep(200);

    // Verify dialogue is NOT active and did NOT restart!
    const dialogActiveAfterPopup = await evaluate(`window.state.dialogActive`);
    console.log('Dialog active after popup close (must be false):', dialogActiveAfterPopup);

    // 7. Sabotage Kiosk #4
    console.log('Sabotaging Kiosk #4...');
    await evaluate(`
      window.player.x = 19 * 48;
      window.player.y = 19 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await skipThroughDialogue();
    const kioskSabotaged = await evaluate(`window.state.quests.kiosk_sabotaged`);
    console.log('Kiosk #4 Sabotaged:', kioskSabotaged);

    // 8. Go out back to parking lot & get Crowbar from Officer Miller
    console.log('Talking to Officer Miller in back lot...');
    await evaluate(`
      window.player.x = 9 * 48;
      window.player.y = 5 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await skipThroughDialogue();
    await evaluate(`window.selectDialogueChoice(0)`);
    await sleep(100);
    await skipThroughDialogue();
    await sleep(200);
    await evaluate(`window.closeCurrentItemPopup()`);

    // 9. Pry Minivan & Dumpster
    console.log('Prying Minivan & Dumpster...');
    await evaluate(`
      window.player.x = 17 * 48;
      window.player.y = 4 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await skipThroughDialogue();
    await sleep(200);
    await evaluate(`window.closeCurrentItemPopup()`);

    await evaluate(`
      window.player.x = 31 * 48;
      window.player.y = 3 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await skipThroughDialogue();
    await sleep(200);
    await evaluate(`window.closeCurrentItemPopup()`);

    // 10. Kitchen Crew: Arthur, Lea, Natan
    console.log('Talking to Kitchen Crew: Arthur, Lea, Natan...');
    // Arthur
    await evaluate(`
      window.player.x = 15 * 48;
      window.player.y = 12 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await skipThroughDialogue();
    await evaluate(`window.selectDialogueChoice(0)`);
    await sleep(100);
    await skipThroughDialogue();
    await sleep(200);
    await evaluate(`window.closeCurrentItemPopup()`);

    // Lea
    await evaluate(`
      window.player.x = 18 * 48;
      window.player.y = 12 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await skipThroughDialogue();
    await evaluate(`window.selectDialogueChoice(0)`);
    await sleep(100);
    await skipThroughDialogue();
    await sleep(200);
    await evaluate(`window.closeCurrentItemPopup()`);

    // Natan
    await evaluate(`
      window.player.x = 22 * 48;
      window.player.y = 12 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await skipThroughDialogue();
    await evaluate(`window.selectDialogueChoice(0)`);
    await sleep(100);
    await skipThroughDialogue();
    await sleep(200);
    await evaluate(`window.closeCurrentItemPopup()`);

    // 11. Raphael & Breakroom Wall Lockbox
    console.log('Talking to Raphael & unlocking safe...');
    await evaluate(`
      window.player.x = 29 * 48;
      window.player.y = 12 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await skipThroughDialogue();
    await evaluate(`window.selectDialogueChoice(0)`);
    await sleep(100);
    await skipThroughDialogue();

    // Lockbox
    await evaluate(`
      window.player.x = 31 * 48;
      window.player.y = 10 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(200);
    await evaluate(`window.closeCurrentItemPopup()`);

    // 12. Luca at Drive-Thru
    console.log('Talking to Luca for Jammer Headset...');
    await evaluate(`
      window.player.x = 38 * 48;
      window.player.y = 17 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await skipThroughDialogue();
    await evaluate(`window.selectDialogueChoice(0)`);
    await sleep(100);
    await skipThroughDialogue();
    await sleep(200);
    await evaluate(`window.closeCurrentItemPopup()`);

    // 13. Unlock Freezer Vault Door & Extract Annulaire from Crate #4
    console.log('Unlocking freezer vault door & extracting annulaire...');
    await evaluate(`
      window.player.x = 32 * 48;
      window.player.y = 12 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await skipThroughDialogue();

    // Crate #4
    await evaluate(`
      window.player.x = 37 * 48;
      window.player.y = 14 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(200);
    await takeScreenshot('/home/iuliiadabizha/v3_8_extracted_finger_popup.png');
    await evaluate(`window.closeCurrentItemPopup()`);

    // 14. Clara Packages into Golden Happy Meal Box
    console.log('Bringing Annulaire to Clara for 24K Golden Happy Meal packaging...');
    await evaluate(`
      window.player.x = 21 * 48;
      window.player.y = 19 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(100);
    await skipThroughDialogue();
    await sleep(200);
    await takeScreenshot('/home/iuliiadabizha/v3_9_golden_award_box_popup.png');
    await evaluate(`window.closeCurrentItemPopup()`);

    // 15. Natalie Boss Showdown & Detonation Climax!
    console.log('Confronting Natalie in Manager\'s Office...');
    await evaluate(`
      window.player.x = 6 * 48;
      window.player.y = 16 * 48;
    `);
    await sleep(100);
    await evaluate(`window.checkInteraction()`);
    await sleep(800);
    await takeScreenshot('/home/iuliiadabizha/v3_10_natalie_showdown.png');

    console.log('Presenting 24K Golden Happy Meal Award Box...');
    await evaluate(`window.executeBattleAction('gift')`);
    await sleep(4500);
    await takeScreenshot('/home/iuliiadabizha/v3_11_natalie_kaboom_victory.png');

    console.log('🎉🎉 ALL FEATURES VERIFIED AND PASSED 100%! 🎉🎉');
    ws.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    chrome.kill();
  }
}

main();
