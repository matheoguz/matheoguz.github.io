// Copie le site dans mobile/www (copie de secours embarquée dans l'appli).
import { cpSync, rmSync, mkdirSync } from "node:fs";
const files = ["index.html", "config.js", "manifest.webmanifest", "sw.js", "assets", "legal"];
rmSync("www", { recursive: true, force: true });
mkdirSync("www");
for (const f of files) cpSync(`../${f}`, `www/${f}`, { recursive: true });
console.log("Site copié dans mobile/www");
