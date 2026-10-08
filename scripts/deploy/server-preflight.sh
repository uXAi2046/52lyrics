#!/usr/bin/env bash
# Read-only checks to run on the Tencent host before enabling server-side builds.
set -u

repo_url=${1:-https://github.com/uXAi2046/52lyrics.git}
site_root=/srv/52lyrics

section() { printf '\n== %s ==\n' "$1"; }
version() {
  if command -v "$1" >/dev/null 2>&1; then
    "$1" --version 2>&1 | head -n 1
  else
    printf '%s: unavailable\n' "$1"
  fi
}

section 'Host'
date -u '+UTC %Y-%m-%d %H:%M:%S'
id -un
uname -sm

section 'Memory and release filesystem'
if command -v free >/dev/null 2>&1; then free -h; else printf 'free: unavailable\n'; fi
df -h "$site_root" 2>&1 || true
df -i "$site_root" 2>&1 || true

section 'Build tools'
version git
version node
version pnpm
version corepack
version npm
version npx
version flock
version docker

section 'Current site'
readlink -f "$site_root/current" 2>&1 || true
if command -v docker >/dev/null 2>&1; then
  docker inspect --format \
    'image={{.Image}} state={{.State.Status}}{{range .Mounts}} mount={{.Source}}:{{.Destination}} readwrite={{.RW}}{{end}}' \
    52lyrics-web 2>&1 || true
fi

section 'GitHub read access'
if command -v timeout >/dev/null 2>&1 && command -v git >/dev/null 2>&1; then
  GIT_TERMINAL_PROMPT=0 \
    GIT_SSH_COMMAND='ssh -o BatchMode=yes -o ConnectTimeout=8 -o StrictHostKeyChecking=yes' \
    timeout 20 git ls-remote "$repo_url" refs/heads/main 2>&1 || true
else
  printf 'timeout or git: unavailable\n'
fi
