const { spawn } = require('child_process');
const fs = require('fs');

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const chrome = spawn('google-chrome', [
    '--headless=new',
    '--remote-debugging-port=9234',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=900,700',
    'file:///home/iuliiadabizha/natalies-finger/index.html'
  ]);

  await sleep(2500);

  try {
    const res = await fetch('http://127.0.0.1:9234/json');
    const targets = await res.json();
    const target = targets.find(t => t.type === 'page');
    const ws = new WebSocket(target.webSocketDebuggerUrl);
    let id = 1;
    const send = (m, p = {}) => new Promise(r => {
      const cur = id++;
      const handler = (e) => {
        const d = JSON.parse(e.data);
        if (d.id === cur) {
          ws.removeEventListener('message', handler);
          r(d.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: cur, method: m, params: p }));
    });

    await new Promise(r => ws.onopen = r);
    await send('Page.enable');
    await send('Runtime.enable');

    const evalJs = (expr) => send('Runtime.evaluate', { expression: expr, returnByValue: true }).then(r => r?.result?.value);

    // Skip intro / title screen
    await evalJs('window.startGame()');
    await sleep(400);

    // 1. Clement Mockery Dialogue Screenshot
    await evalJs('window.player.col = 23; window.player.row = 16; window.player.x = 23*48; window.player.y = 16*48; window.player.dir = "up";');
    await evalJs('window.checkInteraction()');
    await sleep(500);

    let shot = await send('Page.captureScreenshot');
    fs.writeFileSync('/home/iuliiadabizha/natalies-finger/v6_clement_mockery.png', Buffer.from(shot.data, 'base64'));
    console.log('✅ Saved v6_clement_mockery.png');

    // Close dialogue
    await evalJs('window.closeDialogue()');
    await sleep(300);

    // 2. Kitchen Fryer Timer Tile Screenshot
    await evalJs('window.player.col = 13; window.player.row = 11; window.player.x = 13*48; window.player.y = 11*48; window.player.dir = "up";');
    await sleep(500);

    shot = await send('Page.captureScreenshot');
    fs.writeFileSync('/home/iuliiadabizha/natalies-finger/v6_timer_tile_fixed.png', Buffer.from(shot.data, 'base64'));
    console.log('✅ Saved v6_timer_tile_fixed.png');

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

main();
