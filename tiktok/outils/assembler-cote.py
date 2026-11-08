"""Fabrique un épisode « vue de côté » : python3 assembler-cote.py <dossier-episode>
Le dossier contient script.json et minutage.json ; sortie : <dossier>/index.html"""
import sys, os
racine = os.path.dirname(os.path.abspath(__file__))
ep = sys.argv[1]
modele = open(os.path.join(racine, 'modele-cote.html')).read()
m3d = open(os.path.join(racine, 'modele-3d.html')).read()
persos = m3d[m3d.index('let graine = 3;'):m3d.index('/* ---------- Décor du camping')]
out = (modele.replace('/*@@SCRIPT@@*/null', open(os.path.join(ep, 'script.json')).read())
       .replace('/*@@MINUTAGE@@*/null', open(os.path.join(ep, 'minutage.json')).read())
       .replace('/*@@PERSOS@@*/', persos))
open(os.path.join(ep, 'index.html'), 'w').write(out)
print('ok', len(out))
