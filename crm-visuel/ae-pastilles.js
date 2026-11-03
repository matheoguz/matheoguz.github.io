// Pastilles d'alerte posées dans la maquette de l'auto-école (adapté de grande-surface/pastilles.js, copie indépendante) :
// un rond de couleur (urgent rouge, à surveiller orange, conseil bleu) avec l'icône de l'alerte, au-dessus du lieu concerné.
// Module ES sans import : THREE, la scène et les icônes SVG sont passés en paramètre.
//
//   const P = creerPastilles({ THREE, scene, icones, couleurs })
//   P.maj(alertes, positionDe, zoom, temps, calme)  // positionDe(lieu) -> [Vector3, hauteur] | null ; calme = prefers-reduced-motion
//   P.toucher(raycaster) -> l'alerte touchée (objet), ou null
//   P.sprites                                       // pour les tests

export function creerPastilles({ THREE, scene, icones, couleurs }) {
  const groupe = new THREE.Group(); groupe.name = 'pastilles'; groupe.userData.dyn = true; scene.add(groupe);
  const textures = new Map();
  function texture(niveau, icone) {
    const cle = niveau + ':' + icone;
    if (textures.has(cle)) return textures.get(cle);
    const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
    const coul = couleurs[niveau] || '#2563eb';
    const fond = () => {
      g.clearRect(0, 0, 128, 128);
      g.fillStyle = 'rgba(17,24,39,.20)'; g.beginPath(); g.arc(64, 70, 52, 0, 7); g.fill();
      g.fillStyle = '#ffffff'; g.beginPath(); g.arc(64, 62, 54, 0, 7); g.fill();
      g.fillStyle = coul; g.beginPath(); g.arc(64, 62, 45, 0, 7); g.fill();
    };
    fond();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const svg = (icones[icone] || icones.alerte).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/width="\d+" height="\d+"/, 'width="60" height="60"').replace('stroke="currentColor"', 'stroke="#ffffff"').replace('stroke-width="2"', 'stroke-width="2.4"');
    const img = new Image();
    img.onload = () => { fond(); g.drawImage(img, 34, 32, 60, 60); t.needsUpdate = true; };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    textures.set(cle, t); return t;
  }
  const pool = [];
  function sprite(k) {
    if (!pool[k]) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
      s.renderOrder = 20; s.center.set(0.5, 0.05); groupe.add(s); pool[k] = s;
    }
    return pool[k];
  }
  function maj(alertes, positionDe, zoom, temps = 0, calme = false) {
    const parLieu = new Map(); let k = 0;
    const taille = 1.75 / Math.pow(Math.max(0.5, zoom), 0.8);
    for (const a of alertes) {
      const p = positionDe(a.lieu); if (!p) continue;
      const rang = parLieu.get(a.lieu) || 0; parLieu.set(a.lieu, rang + 1);
      if (rang >= 3) continue; // trois pastilles au plus par lieu (les plus urgentes) : la liste a le reste
      const s = sprite(k++), t = texture(a.niveau, a.icone);
      if (s.material.map !== t) { s.material.map = t; s.material.needsUpdate = true; }
      const flotte = calme ? 0 : Math.sin(temps / 520 + k * 1.7) * 0.12;
      const pouls = !calme && a.niveau === 'urgent' ? 1 + Math.max(0, Math.sin(temps / 260)) * 0.07 : 1;
      s.position.set(p[0].x + (rang - 0) * taille * 1.02, (p[1] ?? 2.6) + flotte, p[0].z);
      s.scale.set(taille * pouls, taille * pouls, 1);
      s.userData.alerte = a; s.visible = true;
    }
    for (; k < pool.length; k++) pool[k].visible = false;
  }
  function toucher(ray) {
    const vis = pool.filter((s) => s.visible);
    if (!vis.length) return null;
    const hit = ray.intersectObjects(vis, false)[0];
    return hit ? hit.object.userData.alerte : null;
  }
  return { maj, toucher, get sprites() { return pool.filter((s) => s.visible); } };
}
