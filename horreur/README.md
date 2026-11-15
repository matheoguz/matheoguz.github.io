# Le Bestiaire — vidéos d'horreur en motion design

**Un monstre. Une histoire. Jamais deux fois.**

Identité (la nôtre, pas copiée) : ouverture sur un vieux livre qui se feuillette et s'arrête sur la page du monstre, couleurs encre bleu nuit / ambre de bougie / parchemin, carte « Fiche du monstre », fin « Page suivante ? ».

- `monstres.json` : la bible. Chaque monstre a sa personnalité, sa façon de chasser, sa faiblesse, et la liste des histoires déjà faites. **Avant d'écrire un épisode : vérifier `histoires_faites`, `lieux_deja_utilises`, `twists_deja_utilises`, puis les compléter.**
- `episodes/epXX-<monstre>.json` : le script, plan par plan (scène, personnages, expressions, texte, sons).
- `studio.html?ep=ep01-wendigo` : aperçu animé dans le navigateur.
- `node horreur/render.mjs ep01-wendigo` : rend `videos/ep01-wendigo.mp4` (1080x1920, 30 i/s, avec son). Ajouter `--images 3,12` pour de simples captures de contrôle. Si Playwright n'est pas trouvé : `PLAYWRIGHT_PATH=/opt/node-tools/node_modules/playwright/index.js`.
