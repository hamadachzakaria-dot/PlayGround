#!/usr/bin/env bash
# Capture desktop + mobile screenshots of the deployed preview.
# Requires CAPTURE_URL (exact page to open) and CAPTURE_DIR (output dir,
# kept outside the project source). Produces final-desktop.png and
# final-mobile.png, closes its own browser, and never touches the app server.
# Exit 75: temporary navigation / browser infrastructure failure.
# Exit 1: script misuse or rendering defect (page error, missing output).
set -euo pipefail
cd "$(dirname "$0")"

/usr/bin/time -p test -n "${CAPTURE_URL:?CAPTURE_URL must be set to the exact preview URL}"
/usr/bin/time -p test -n "${CAPTURE_DIR:?CAPTURE_DIR must be set to an output directory outside the project}"

RUNTIME="${RUNTIME_DIR:-/home/runner/work/_temp/omgithub-runtime}"
CAPTURE_SCRIPT="$RUNTIME/scripts/default-capture.mjs"
/usr/bin/time -p test -f "$CAPTURE_SCRIPT"
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"

set +e
/usr/bin/time -p node "$CAPTURE_SCRIPT"
status=$?
set -e

if /usr/bin/time -p test "$status" -ne 0; then
  echo "capture backend exited with status $status" >&2
  exit "$status"
fi
/usr/bin/time -p test -f "$CAPTURE_DIR/final-desktop.png"
/usr/bin/time -p test -f "$CAPTURE_DIR/final-mobile.png"
echo "captures ready in $CAPTURE_DIR"
