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
    echo "Attention : le cerveau de Matheo (dépôt privé matheoguz/Repos-, dossier cerveau/) n'est pas dans cette session. La mémoire et le journal ne sont pas chargés. Propose à Matheo d'ajouter le dépôt Repos- à la session."
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
