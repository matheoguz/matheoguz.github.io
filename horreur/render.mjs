// Rend un épisode en MP4 vertical 1080x1920 avec son.
// Usage : node horreur/render.mjs ep01-wendigo [--fps 30] [--images 3,12.5,40]  (--images = captures de contrôle seulement)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright');

const ICI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const ep = args[0] || 'ep01-wendigo';
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const FPS = +opt('fps', 30);
const SORTIE = path.join(ICI, 'videos');
fs.mkdirSync(SORTIE, { recursive: true });

const types = { '.html': 'text/html', '.json': 'application/json', '.js': 'text/javascript' };
const serveur = http.createServer((q, r) => {
  const f = path.join(ICI, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(ICI) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
}).listen(0);
const port = serveur.address().port;

const nav = await chromium.launch();
const page = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(`http://localhost:${port}/studio.html?rendu&ep=${ep}`);
await page.waitForFunction(() => window.PRET, null, { timeout: 30000 });
const DUR = await page.evaluate(() => window.DUR);

const grab = t => page.evaluate(t => { renderAt(t); return document.getElementById('c').toDataURL('image/jpeg', .92).split(',')[1]; }, t);

if (opt('images')) {
  for (const t of opt('images').split(',').map(Number)) fs.writeFileSync(path.join(SORTIE, `${ep}-${t}.jpg`), Buffer.from(await grab(t), 'base64'));
  await nav.close(); serveur.close(); process.exit(0);
}

// --- son : nappe + vent + bruitages aux bons moments ---
const cues = await page.evaluate(() => cues());
const tmp = fs.mkdtempSync(path.join(SORTIE, '.son-'));
// Un vrai son (fichier) est utilisé s'il existe dans horreur/sons/<nom>.mp3 ou .wav (ex. généré avec ElevenLabs) ;
// sinon on prend une version synthétisée par ffmpeg (provisoire).
const SONS = {
  tic: d => 'anoisesrc=d=0.12:c=pink:a=0.5,highpass=f=1200,afade=t=out:st=0.02:d=0.1',
  choc: d => 'anoisesrc=d=1.6:c=brown:a=1,lowpass=f=180,afade=t=out:st=0.05:d=1.5,volume=6',
  woosh: d => 'anoisesrc=d=0.8:c=pink:a=0.6,highpass=f=600,afade=t=in:d=0.4,afade=t=out:st=0.4:d=0.4',
  gratte: d => 'anoisesrc=d=3:c=white:a=0.5,bandpass=f=2500:w=1500,apulsator=hz=6:amount=1,volume=1.4',
  cigales: d => `anoisesrc=d=${d}:c=white:a=0.5,bandpass=f=5200:w=1800,apulsator=hz=32:amount=0.9,tremolo=f=0.25:d=0.6,volume=0.35,afade=t=out:st=${d - 1.5}:d=1.5`,
  nuit: d => `sine=f=4300:d=${d},apulsator=hz=14:amount=1,tremolo=f=0.6:d=0.9,volume=0.05,afade=t=in:d=2,afade=t=out:st=${d - 2}:d=2`,
  voiture: d => `anoisesrc=d=${d}:c=brown:a=0.6,lowpass=f=260,volume=1.6,afade=t=in:d=1,afade=t=out:st=${d - 0.5}:d=0.5`,
  po: d => "aevalsrc='0.9*sin(2*PI*82*t+2*sin(2*PI*41*t))*exp(-7*mod(t,0.75))*lt(t,2.25)':d=2.4,lowpass=f=600,volume=2.2,aecho=0.8:0.6:120:0.4",
  toc: d => "aevalsrc='sin(2*PI*140*t)*exp(-35*mod(t,0.38))*lt(t,1.14)':d=1.3,lowpass=f=900,volume=3",
  voix_papi: d => "anoisesrc=d=2.8:c=pink:a=0.3,bandpass=f=900:w=500,tremolo=f=5:d=0.8,volume=1.2",
  'grésillement': d => 'anoisesrc=d=2.5:c=white:a=0.25,highpass=f=3000,tremolo=f=17:d=1,afade=t=in:d=1.5',
  cri: d => "aevalsrc='0.32*sin(2*PI*(680*t+620*t*t+18*sin(2*PI*8*t)))*exp(-0.45*t)+0.24*sin(2*PI*(1030*t+930*t*t+30*sin(2*PI*9*t)))*exp(-0.45*t)+0.16*sin(2*PI*(1520*t+1300*t*t))*exp(-0.6*t)+0.3*(random(0)-0.5)*exp(-0.9*t)':d=2.4,highpass=f=250,acrusher=bits=8:mix=0.35,aecho=0.6:0.4:35:0.3,volume=2.6",
  drone: d => `aevalsrc='0.22*sin(2*PI*48*t)+0.18*sin(2*PI*48.6*t)+0.08*sin(2*PI*97.3*t)+0.05*sin(2*PI*143*t)*sin(2*PI*0.07*t)':d=${d},lowpass=f=400,tremolo=f=0.12:d=0.5,afade=t=in:d=3,afade=t=out:st=${d - 3}:d=3`,
  moteur: d => `anoisesrc=d=${d}:c=brown:a=0.7,lowpass=f=170,volume=2,afade=t=out:st=${d - 1}:d=1`,
  stinger: d => "aevalsrc='0.9*sin(2*PI*42*t)*exp(-1.8*t)+0.28*sin(2*PI*(1900*t+300*sin(2*PI*31*t)))*exp(-2.5*t)+0.35*(random(0)-0.5)*exp(-5*t)':d=2.2,aecho=0.7:0.5:60:0.35,volume=2",
  vibre: d => "aevalsrc='0.5*sin(2*PI*170*t)*lt(mod(t,0.55),0.38)*lt(t,1.1)':d=1.2,lowpass=f=600,volume=1.5",
  coeur: d => `aevalsrc='sin(2*PI*52*t)*(exp(-22*mod(t,0.8))+0.6*exp(-22*mod(t+0.62,0.8)))':d=${d},lowpass=f=140,volume=3.5,afade=t=in:d=1`,
  courant: d => "aevalsrc='0.9*sin(2*PI*58*t)*exp(-7*t)+0.4*(random(0)-0.5)*exp(-14*t)+0.2*sin(2*PI*120*t)*exp(-3*t)':d=1.2,volume=2.5",
  voix: d => 'anoisesrc=d=3.2:c=pink:a=0.45,bandpass=f=1500:w=1300,tremolo=f=5.5:d=0.95,aecho=0.6:0.5:80:0.4,volume=2,afade=t=in:d=0.2,afade=t=out:st=2.6:d=0.6',
  feu: d => `anoisesrc=d=${d}:c=brown:a=0.4,lowpass=f=900,volume=0.8[a];aevalsrc='0.6*(random(0)-0.5)*gt(random(1),0.995)':d=${d},highpass=f=1500,volume=1.2[b];[a][b]amix=inputs=2,afade=t=out:st=${d - 1}:d=1`,
  os: d => "aevalsrc='(random(0)-0.5)*gt(random(1),0.985)*exp(-0.4*t)':d=2.5,bandpass=f=1800:w=2500,volume=6,aecho=0.5:0.4:20:0.3",
  pas: d => `aevalsrc='(random(0)-0.5)*exp(-30*mod(t,0.62))':d=${d || 3},lowpass=f=900,volume=2.2`,
  voix_loin: d => 'anoisesrc=d=3:c=pink:a=0.5,bandpass=f=1100:w=700,tremolo=f=4:d=0.9,aecho=0.8:0.7:300:0.5,volume=1.4,afade=t=in:d=0.3,afade=t=out:st=2.3:d=0.7',
  impact: d => "aevalsrc='0.95*sin(2*PI*34*t)*exp(-1.6*t)+0.5*sin(2*PI*58*t)*exp(-3*t)+0.45*(random(0)-0.5)*exp(-9*t)':d=2.6,lowpass=f=420,volume=3",
  souffle: d => 'anoisesrc=d=4:c=brown:a=0.6,lowpass=f=400,afade=t=in:d=2,afade=t=out:st=2:d=2,volume=1.5',
  baguettes: d => "aevalsrc='(sin(2*PI*2600*t)*exp(-70*t))+(sin(2*PI*2200*(t-0.12))*exp(-70*(t-0.12))*gte(t,0.12))':d=0.5,volume=1.5",
};
const DOSSIER_SONS = path.join(ICI, 'sons');
const ent = [], fil = [];
cues.forEach((c, i) => {
  const d = c.dur || 3, fichier = ['mp3', 'wav'].map(x => path.join(DOSSIER_SONS, `${c.son}.${x}`)).find(f => fs.existsSync(f));
  if (fichier) ent.push(...(c.dur ? ['-stream_loop', '-1'] : []), '-i', fichier);
  else ent.push('-f', 'lavfi', '-i', (SONS[c.son] || SONS.woosh)(d));
  const ms = Math.round(c.t * 1000), vol = c.vol ?? 1;
  fil.push(`[${i + 2}:a]${c.dur ? `atrim=0:${d},afade=t=out:st=${Math.max(0, d - 1)}:d=1,` : ''}volume=${vol},adelay=${ms}|${ms},aformat=channel_layouts=stereo[s${i}]`);
  if (fichier) console.log('vrai son :', path.basename(fichier));
});
const nappe = `sine=f=55:d=${DUR},volume=0.25`;
const vent = `anoisesrc=d=${DUR}:c=brown:a=0.2,lowpass=f=500,tremolo=f=0.15:d=0.7`;
const mix = `[0:a]aformat=channel_layouts=stereo[n];[1:a]aformat=channel_layouts=stereo[v];${fil.join(';')}${fil.length ? ';' : ''}[n][v]${cues.map((_, i) => `[s${i}]`).join('')}amix=inputs=${cues.length + 2}:normalize=0,alimiter=limit=0.95,afade=t=out:st=${DUR - 1}:d=1[a]`;
const wav = path.join(tmp, 'son.wav');
execFileSync('ffmpeg', ['-y', '-v', 'error', '-f', 'lavfi', '-i', nappe, '-f', 'lavfi', '-i', vent, ...ent, '-filter_complex', mix, '-map', '[a]', '-t', String(DUR), wav]);

// --- image par image ---
const mp4 = path.join(SORTIE, `${ep}.mp4`);
const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-i', wav,
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k', '-shortest', '-movflags', '+faststart', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
const N = Math.round(DUR * FPS);
for (let i = 0; i < N; i++) {
  const buf = Buffer.from(await grab(i / FPS), 'base64');
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % 150 === 0) process.stdout.write(`\r${Math.round(i / N * 100)} %`);
}
ff.stdin.end(); await new Promise(r => ff.on('close', r));
fs.rmSync(tmp, { recursive: true, force: true });
await nav.close(); serveur.close();
console.log(`\nOK → ${path.relative(process.cwd(), mp4)} (${DUR.toFixed(1)} s)`);
