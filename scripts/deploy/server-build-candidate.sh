#!/usr/bin/env bash
# Fetch and verify a build on the server without touching the live release.
set -Eeuo pipefail

site_root=${SITE_ROOT:-/srv/52lyrics}
repo_url=${REPO_URL:-https://github.com/uXAi2046/52lyrics.git}
export GIT_TERMINAL_PROMPT=0
source_dir="$site_root/source"
builds_dir="$site_root/builds"
deploy_dir="$site_root/deploy"

mkdir -p "$builds_dir" "$deploy_dir"
exec 9>"$deploy_dir/build.lock"
flock -n 9 || { printf 'Another 52lyrics build is running.\n' >&2; exit 1; }

if [ ! -e "$source_dir" ]; then
  git clone --branch main --single-branch "$repo_url" "$source_dir"
fi
git -C "$source_dir" rev-parse --is-inside-work-tree | grep -qx true
git -C "$source_dir" fetch --prune origin main
main_commit=$(git -C "$source_dir" rev-parse FETCH_HEAD)
commit=${1:-$main_commit}
commit=$(git -C "$source_dir" rev-parse --verify "$commit^{commit}")
git -C "$source_dir" merge-base --is-ancestor "$commit" "$main_commit" || {
  printf 'Requested commit is not on the fetched main branch.\n' >&2
  exit 1
}

candidate="$builds_dir/git-${commit:0:12}"
if [ -e "$candidate" ]; then
  test "$(git -C "$candidate" rev-parse HEAD)" = "$commit" || {
    printf 'Existing candidate has a different commit: %s\n' "$candidate" >&2
    exit 1
  }
else
  git -C "$source_dir" worktree add --detach "$candidate" "$commit"
fi
cd "$candidate"

if command -v pnpm >/dev/null 2>&1; then
  pnpm_cmd=(pnpm)
elif command -v corepack >/dev/null 2>&1; then
  pnpm_cmd=(corepack pnpm)
else
  printf 'pnpm or corepack is required on the server.\n' >&2
  exit 1
fi

export SITE_URL=${SITE_URL:-https://www.52lyrics.com}
export BAIDU_TONGJI_ID=${BAIDU_TONGJI_ID:-7ba35cf48a0603715bafc08f9b760f86}
export PRERENDER_CONCURRENCY=${PRERENDER_CONCURRENCY:-1}
unset VERCEL

printf 'COMMIT=%s\nCANDIDATE=%s\n' "$commit" "$candidate"
printf 'NODE=%s\n' "$(node --version)"
test "$(node -p 'Number(process.versions.node.split(".")[0]) >= 22')" = true || {
  printf 'Node.js 22 or newer is required.\n' >&2
  exit 1
}
pnpm_version=$("${pnpm_cmd[@]}" --version)
test "$pnpm_version" = 10.30.3 || {
  printf 'Expected pnpm 10.30.3, found %s.\n' "$pnpm_version" >&2
  exit 1
}
printf 'PNPM=%s\n' "$pnpm_version"
"${pnpm_cmd[@]}" install --frozen-lockfile
nice -n 10 "${pnpm_cmd[@]}" check
nice -n 10 "${pnpm_cmd[@]}" lint
nice -n 10 "${pnpm_cmd[@]}" test

build_log="$deploy_dir/build-${commit:0:12}.log"
if ! nice -n 10 "${pnpm_cmd[@]}" build >"$build_log" 2>&1; then
  tail -n 100 "$build_log" >&2
  exit 1
fi
tail -n 3 "$build_log"
nice -n 10 "${pnpm_cmd[@]}" catalog:verify-build

test -s build/client/index.html
test -s build/client/sitemap.xml
test -s build/client/__spa-fallback.html
printf 'FILES=%s\n' "$(find build/client -type f | wc -l)"
du -sh build/client
sha256sum build/client/index.html
printf 'CANDIDATE_READY=%s/build/client\n' "$candidate"
