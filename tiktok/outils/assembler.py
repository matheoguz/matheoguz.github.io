"""Assemble l'épisode 3D : modèle + script/interface de l'épisode 2D + minutage de la voix."""
import sys, re, json
racine = '/home/user/matheoguz.github.io/tiktok/'
src = open(racine + 'ep1/index.html').read()
modele = open(racine + 'outils/modele-3d.html').read()
minutage = open(sys.argv[1]).read()
def entre(debut, fin, inclure_fin=True):
    a = src.index(debut); b = src.index(fin, a)
    return src[a:b + (len(fin) if inclure_fin else 0)]
script = entre('const SCRIPT = [', '];')
chunks = entre('/* Découpe des sous-titres', '})();')
outils = entre('const clamp', 'return SENT[i].t1; };')
ui = entre('function bulle(', 'function carteFin(', False)
for a, b in [('fin("calc1", 2.2)', 'finPhrase("calc1")'), ('fin("calc2", 2.6)', 'finPhrase("calc2")'), ('fin("calc3", 2.2)', 'finPhrase("calc3")')]:
    assert a in ui; ui = ui.replace(a, b)
out = modele.replace('/*@@SCRIPT@@*/', script).replace('/*@@MINUTAGE@@*/null', minutage).replace('/*@@CHUNKS@@*/', chunks).replace('/*@@OUTILS@@*/', outils).replace('/*@@UI@@*/', ui)
open(racine + 'ep1-3d/index.html', 'w').write(out)
print('ok', len(out))
