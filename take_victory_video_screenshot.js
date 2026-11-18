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
    '--autoplay-policy=no-user-gesture-required',
    '--window-size=900,750',
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

    // Trigger victory screen
    await send('Runtime.evaluate', {
      expression: `
        window.state.mode = 'VICTORY';
        window.state.natalieExploded = true;
        document.getElementById('title-screen').style.display = 'none';
        document.getElementById('hud').style.display = 'flex';
        document.getElementById('victory-screen').style.display = 'flex';
        const v = document.getElementById('victory-video');
        if (v) { v.currentTime = 2.0; v.play().catch(()=>{}); }
      `
    });

    await sleep(2000);

    const shot = await send('Page.captureScreenshot');
    fs.writeFileSync('/home/iuliiadabizha/natalies-finger/v6_victory_screen_dance.png', Buffer.from(shot.data, 'base64'));
    console.log('✅ Victory screen with anime dance video saved to /home/iuliiadabizha/natalies-finger/v6_victory_screen_dance.png');

    ws.close();
  } catch (err) {
    console.error('Error:', err);
  } finally {
    chrome.kill();
  }
}

main();
