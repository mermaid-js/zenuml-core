#!/usr/bin/env bash
# Model-check the TLA+ specs in docs/tla with TLC.
#
#   bun run tla        InteractionPolicy.cfg: properties that must hold
#   bun run tla gaps   InteractionPolicyGaps.cfg: ADR 0002 P4 known gaps,
#                      expected to report counterexamples until closed
#
# Needs Java and tla2tools.jar. The script does not download the tools; set
# TLA2TOOLS_JAR or place the jar at node_modules/.cache/tla/tla2tools.jar.
set -euo pipefail
cd "$(dirname "$0")/../.."

JAR="${TLA2TOOLS_JAR:-node_modules/.cache/tla/tla2tools.jar}"
if [ ! -f "$JAR" ]; then
  cat >&2 <<MSG
TLA+ tools not found at $JAR.
Download the pinned release once:
  mkdir -p node_modules/.cache/tla
  curl -fL -o node_modules/.cache/tla/tla2tools.jar \\
    https://github.com/tlaplus/tlaplus/releases/download/v1.8.0/tla2tools.jar
or point TLA2TOOLS_JAR at a copy you already have (TLA+ Toolbox, VS Code).
MSG
  exit 2
fi
JAR="$(cd "$(dirname "$JAR")" && pwd)/$(basename "$JAR")"

case "${1:-}" in
  "") CFG=InteractionPolicy.cfg ;;
  gaps) CFG=InteractionPolicyGaps.cfg ;;
  *) echo "usage: bun run tla [gaps]" >&2; exit 2 ;;
esac

META="$(mktemp -d)"
LOG="$META/tlc.log"
trap 'rm -rf "$META"' EXIT

set +e
(cd docs/tla && java -XX:+UseParallelGC -cp "$JAR" tlc2.TLC \
  -workers auto -metadir "$META/states" -config "$CFG" InteractionPolicy.tla) \
  | tee "$LOG"
status=${PIPESTATUS[0]}
set -e

if [ "$CFG" = InteractionPolicyGaps.cfg ]; then
  if grep -q "is violated" "$LOG"; then
    echo "Known gaps still open (expected). See docs/tla/README.md."
    exit 0
  fi
  if [ "$status" -eq 0 ]; then
    echo "No gap property is violated any more: move them into InteractionPolicy.cfg." >&2
  fi
  exit 1
fi
exit "$status"
