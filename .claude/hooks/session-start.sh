#!/bin/bash
# Cloud sessions start from a fresh clone: install deps so typecheck, tests
# and the mock pipeline can run. Local sessions are left alone.
set -euo pipefail
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi
cd "${CLAUDE_PROJECT_DIR:-.}"
echo "Maicro: installing dependencies (pnpm install)…"
pnpm install --frozen-lockfile >/dev/null
echo "Maicro: ready. 'pnpm -r typecheck && pnpm -r test && pnpm e2e:mock' is the gate."
