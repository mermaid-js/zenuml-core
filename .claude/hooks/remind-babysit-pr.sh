#!/usr/bin/env bash
# PostToolUse/Bash: after a real `git push`, inject a reminder to watch CI.
#
# A push starts a GitHub Actions run. Stopping at the PR URL leaves that run
# unwatched, so the reminder fires in the same turn as the push.
#
# Fires only when `git push` sits in command position — at the start of the
# command or after a separator (; && || | newline). Silent for pushes that
# start no CI run (--dry-run, branch/tag deletion) and for commands that merely
# mention the words, e.g. `echo ... git push ...`.
set -uo pipefail

command_text="$(jq -r '.tool_input.command // empty' 2>/dev/null)"
[ -n "$command_text" ] || exit 0

case "$command_text" in
  # No CI run to watch: a rehearsal, or a branch/tag deletion.
  *--dry-run*|*--delete*|*" -d "*|*" :refs/"*) exit 0 ;;
esac

# Split on shell separators so each fragment starts where a command would.
if ! printf '%s' "$command_text" \
  | sed -E 's/(\|\||&&|[;&|])/\n/g' \
  | grep -qE '^[[:space:]]*(sudo[[:space:]]+)?git[[:space:]]+(-[^[:space:]]+[[:space:]]+)*push([[:space:]]|$)'; then
  exit 0
fi

cat <<'JSON'
{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"A branch was just pushed. Invoke the babysit-pr skill now, in this same turn, without asking first — a push starts a CI run, and reporting the PR URL without watching it leaves that run unattended. Skip only if babysit-pr or ship-branch is already driving this push."}}
JSON
