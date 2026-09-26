#!/usr/bin/env bash
# Capture desktop + mobile screenshots of CAPTURE_URL into CAPTURE_DIR.
# Uses the runtime Playwright capture (own browser, closed afterwards).
# Exit 75: temporary navigation/browser infrastructure failure.
# Exit 1: script usage error or rendering defect.
set -euo pipefail

time -p cd "$(dirname "$0")"
/usr/bin/time -p test -n "${CAPTURE_URL:-}" || { echo "CAPTURE_URL is not set." >&2; exit 1; }
/usr/bin/time -p test -n "${CAPTURE_DIR:-}" || { echo "CAPTURE_DIR is not set." >&2; exit 1; }
/usr/bin/time -p test -n "${RUNTIME_DIR:-}" || { echo "RUNTIME_DIR is not set." >&2; exit 1; }
/usr/bin/time -p mkdir -p "$CAPTURE_DIR"
/usr/bin/time -p node "${RUNTIME_DIR}/scripts/default-capture.mjs"
/usr/bin/time -p test -f "$CAPTURE_DIR/final-desktop.png" || { echo "final-desktop.png was not captured." >&2; exit 1; }
/usr/bin/time -p test -f "$CAPTURE_DIR/final-mobile.png" || { echo "final-mobile.png was not captured." >&2; exit 1; }
