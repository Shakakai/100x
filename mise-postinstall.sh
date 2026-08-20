#!/usr/bin/env bash
set -euo pipefail

# One-time repository setup run by the mise postinstall hook.
# Idempotent: safe to run again after the initial install.

PI_VERSION="${PI_VERSION:-0.80.2}"

step() {
  echo ""
  echo "==> $*"
}

step "Sync Python dependencies"
if ! uv sync --locked 2>/dev/null; then
  echo "    uv.lock is out of date or platform-incompatible; running uv sync"
  uv sync
fi

step "Install Node dependencies"
pnpm install --frozen-lockfile

step "Install pi coding agent (@${PI_VERSION})"
install_pi() {
  npm install -g "@earendil-works/pi-coding-agent@${PI_VERSION}"
}

if ! command -v pi >/dev/null 2>&1; then
  install_pi
else
  current_version="$(pi --version 2>/dev/null || true)"
  if [[ "${current_version:-}" != "$PI_VERSION" ]]; then
    echo "    pi version mismatch (found: ${current_version:-unknown}); reinstalling"
    install_pi
  else
    echo "    pi ${current_version} already installed"
  fi
fi

echo ""
echo "==> Setup complete. Run 'mise run pi' to start the coding agent."
