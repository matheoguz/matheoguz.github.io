#!/usr/bin/env bash
# Branche le cerveau (coffre privé matheoguz/Repos- : cerveau/) sur Claude Code.
#   cerveau.sh journal  -> recopie la conversation dans cerveau/Journal (Stop, PreCompact, SessionEnd)
#   cerveau.sh rappel   -> redonne la mémoire à Claude (SessionStart, y compris après compression)
# Ne bloque jamais la session : sort toujours avec le code 0.
mode="$1"
for d in "$CERVEAU_DIR" "$CLAUDE_PROJECT_DIR/cerveau" "$CLAUDE_PROJECT_DIR/../Repos-/cerveau" "$HOME/Repos-/cerveau" "/home/user/Repos-/cerveau"; do
  if [ -n "$d" ] && [ -f "$d/.outils/journal.mjs" ]; then vault="$d"; break; fi
done
if [ -z "$vault" ]; then
  if [ "$mode" = "rappel" ]; then
    cat <<'TXT'
OBLIGATOIRE, avant de répondre à Matheo : son cerveau (dépôt privé matheoguz/Repos-, dossier cerveau/) n'est pas encore dans cette session.
1. Appelle l'outil add_repo (owner « matheoguz », repo « Repos- »), clone-le dans /home/user/Repos- comme il l'indique, puis register_repo_root.
2. Lance /debut (ou lis /home/user/Repos-/cerveau/MEMOIRE.md, puis les tâches et idées de la page https://claude.ai/artifact/UPP4jo5X6LqiWXkCpd3mme avec ArtifactData).
3. Si le dépôt ne peut pas être ajouté : lis quand même la mémoire dans la page (ArtifactData get, collection « notes », document « memoire »), dis-le à Matheo en une ligne, et note tout ce que tu fais pour le ranger dans le cerveau dès qu'il est là.
À la fin de chaque tâche : /fin.
TXT
  else
    cat >/dev/null
  fi
  exit 0
fi
case "$mode" in
  journal) node "$vault/.outils/journal.mjs" || true ;;
  rappel) node "$vault/.outils/rappel.mjs" || true ;;
esac
exit 0
