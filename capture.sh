#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
: "${RUNTIME_DIR:=/home/runner/work/_temp/omgithub-runtime}"
export RUNTIME_DIR
/usr/bin/time -p test -n "${CAPTURE_URL:-}"
/usr/bin/time -p test -n "${CAPTURE_DIR:-}"
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"
set +e
/usr/bin/time -p node "$RUNTIME_DIR/scripts/default-capture.mjs"
capture_status=$?
set -e
if /usr/bin/time -p test "$capture_status" -ne 0; then
  exit "$capture_status"
fi
/usr/bin/time -p test -f "$CAPTURE_DIR/final-desktop.png"
/usr/bin/time -p test -f "$CAPTURE_DIR/final-mobile.png"
/usr/bin/time -p ls -l "$CAPTURE_DIR/final-desktop.png" "$CAPTURE_DIR/final-mobile.png"
