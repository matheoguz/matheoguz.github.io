// Pastilles d'alerte posées dans la maquette (démo « Hyper Modèle ») : un rond de couleur (urgent rouge,
// à surveiller orange, conseil bleu) avec l'icône de l'alerte, au-dessus de l'endroit concerné.
// Module ES sans import : THREE, la scène et les icônes SVG d'alertes.js sont passés en paramètre.
//
//   const P = creerPastilles({ THREE, scene, icones, couleurs })
//   P.maj(alertes, positionDe, zoom)  // alertes = sortie de calculerAlertes ; positionDe(cle) -> [Vector3, zoom] | null
//   P.toucher(raycaster) -> cle 'voir' de l'alerte touchée, ou null
//   P.sprites                          // pour les tests

export function creerPastilles({ THREE, scene, icones, couleurs }) {
  const groupe = new THREE.Group(); groupe.name = 'pastilles'; groupe.userData.dyn = true; scene.add(groupe);
  const textures = new Map();
  function texture(niveau, icone) {
    const cle = niveau + ':' + icone;
    if (textures.has(cle)) return textures.get(cle);
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const coul = couleurs[niveau] || '#2563eb';
    const dessinerFond = () => {
      g.clearRect(0, 0, 128, 128);
      g.fillStyle = 'rgba(17,24,39,.22)'; g.beginPath(); g.arc(64, 68, 54, 0, 7); g.fill();       // ombre douce
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(64, 62, 54, 0, 7); g.fill();                  // liseré blanc
      g.fillStyle = coul; g.beginPath(); g.arc(64, 62, 46, 0, 7); g.fill();
    };
    dessinerFond();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    // l'icône SVG (trait blanc) est dessinée par-dessus une fois chargée (données locales, rien de téléchargé)
    const svg = (icones[icone] || icones.alerte).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace('width="16" height="16"', 'width="64" height="64"').replace('stroke="currentColor"', 'stroke="#ffffff"').replace('stroke-width="2"', 'stroke-width="2.4"');
    const img = new Image();
    img.onload = () => { dessinerFond(); g.drawImage(img, 32, 30, 64, 64); t.needsUpdate = true; };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    textures.set(cle, t); return t;
  }
  const pool = [];
  function sprite(k) {
    if (!pool[k]) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
      s.renderOrder = 20; s.center.set(0.5, 0.1); groupe.add(s); pool[k] = s;
    }
    return pool[k];
  }
  const HAUT = (cle) => (/^c\d|caisses/.test(cle) ? 3.4 : /^r\d/.test(cle) ? 4.1 : /^etage/.test(cle) ? 5.2 : /^e\d/.test(cle) ? 2.3 : 3.6);
  function maj(alertes, positionDe, zoom) {
    const parLieu = new Map(); let k = 0;
    const taille = 2.6 / Math.pow(Math.max(0.5, zoom), 0.75);
    for (const a of alertes) {
      const p = positionDe(a.voir); if (!p) continue;
      const lieu = a.voir, rang = parLieu.get(lieu) || 0; parLieu.set(lieu, rang + 1);
      const s = sprite(k++);
      const t = texture(a.niveau, a.icone);
      if (s.material.map !== t) { s.material.map = t; s.material.needsUpdate = true; }
      s.position.set(p[0].x + rang * taille * 1.05, HAUT(a.voir), p[0].z);
      s.scale.set(taille, taille, 1);
      s.userData.voir = a.voir; s.visible = true;
    }
    for (; k < pool.length; k++) pool[k].visible = false;
  }
  function toucher(ray) {
    const vis = pool.filter((s) => s.visible);
    if (!vis.length) return null;
    const hit = ray.intersectObjects(vis, false)[0];
    return hit ? hit.object.userData.voir : null;
  }
  return { maj, toucher, get sprites() { return pool.filter((s) => s.visible); } };
}
