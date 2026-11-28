import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
const dir = new URL('.', import.meta.url).pathname;
const mode = process.argv[2] || 'preview';
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 720, height: 1280 } });
page.on('console', m => console.log('page:', m.text()));
page.on('pageerror', e => console.log('ERR', e.message));
await page.setContent('<html><body style="margin:0;background:#000"><canvas id="out"></canvas></body></html>');
await page.evaluate(() => document.fonts.load('900 60px Inter'));
await page.addScriptTag({ path: dir + 'node_modules/three/build/three.min.js' });
await page.addScriptTag({ path: dir + (process.env.SCENE||'scene.js') });
const total = await page.evaluate(() => TOTAL), fps = await page.evaluate(() => FPS);
const N = Math.round(total * fps);
console.log('durée', total, 'images', N);
try { fs.writeFileSync(dir + 'timings.json', JSON.stringify(await page.evaluate(() => SHOTS.map(s => ({ t0: s.t0, d: s.d, intro: s.intro || null }))))); } catch (e) {}
const frame = async i => Buffer.from((await page.evaluate(i => renderFrame(i), i)).split(',')[1], 'base64');
if (mode === 'preview') {
  fs.mkdirSync(dir + (process.env.PREV||'prev'), { recursive: true });
  const times = process.argv.slice(3).map(Number);
  for (const t of times) { const t0 = Date.now(); fs.writeFileSync(`${dir}${process.env.PREV||'prev'}/${String(t).padStart(5, '0')}.jpg`, await frame(Math.round(t * fps))); console.log(t, Date.now() - t0, 'ms'); }
} else {
  const ff = spawn('ffmpeg', ['-y', '-f', 'image2pipe', '-framerate', String(fps), '-i', '-', '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
    '-shortest', '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-movflags', '+faststart', dir + (process.env.OUTF||'out.mp4')], { stdio: ['pipe', 'inherit', 'inherit'] });
  const t0 = Date.now();
  for (let i = 0; i < N; i++) { const b = await frame(i); if (!ff.stdin.write(b)) await new Promise(r => ff.stdin.once('drain', r)); if (i % 100 === 0) console.log(i, '/', N, ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
await browser.close();
