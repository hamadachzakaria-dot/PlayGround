#!/usr/bin/env bash
# Capture desktop + mobile screenshots of the exact CAPTURE_URL into CAPTURE_DIR.
# Delegates browser work to the runtime capture script (own browser, closed after).
# Exit 75 = temporary navigation/browser infra failure, exit 1 = script/defect.
# Leaves the running app alone; capture output stays outside the source tree.
set -euo pipefail
cd "$(dirname "$0")"
if [[ -z "${CAPTURE_URL:-}" || -z "${CAPTURE_DIR:-}" ]]; then
  echo "Set CAPTURE_URL and CAPTURE_DIR." >&2
  exit 1
fi
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"
rc=0
/usr/bin/time -p node "${RUNTIME_DIR:?}/scripts/default-capture.mjs" || rc=$?
/usr/bin/time -p test "$rc" -eq 0 || exit "$rc"
/usr/bin/time -p test -f "$CAPTURE_DIR/final-desktop.png"
/usr/bin/time -p test -f "$CAPTURE_DIR/final-mobile.png"
