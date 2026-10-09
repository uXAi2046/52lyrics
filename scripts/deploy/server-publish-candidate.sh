#!/usr/bin/env bash
# Publish a verified server build and restore the previous container on failure.
set -Eeuo pipefail

site_root=${SITE_ROOT:-/srv/52lyrics}
commit=${1:?Usage: server-publish-candidate.sh <full Git commit>}
test "$commit" = "$(git -C "$site_root/source" rev-parse --verify "$commit^{commit}")"
candidate="$site_root/builds/git-${commit:0:12}"
release="$site_root/releases/git-${commit:0:12}"
backup="52lyrics-web-rollback-git-${commit:0:12}"
check_container="52lyrics-web-check-git-${commit:0:12}"
deploy_dir="$site_root/deploy"

mkdir -p "$deploy_dir" "$site_root/releases"
exec 9>"$deploy_dir/publish.lock"
flock -n 9 || { printf 'Another 52lyrics publish is running.\n' >&2; exit 1; }

test "$(git -C "$candidate" rev-parse HEAD)" = "$commit"
test -s "$candidate/build/client/index.html"
test -s "$candidate/build/client/sitemap.xml"
test -s "$candidate/build/client/__spa-fallback.html"
test -s "$candidate/build/client/guides/tom-lehrer-lyrics-source-guide/index.html"
test ! -e "$release"
! docker inspect "$backup" >/dev/null 2>&1
! docker inspect "$check_container" >/dev/null 2>&1

previous=$(readlink -f "$site_root/current")
case "$previous" in "$site_root"/releases/*) ;; *) printf 'Unexpected current release: %s\n' "$previous" >&2; exit 1;; esac
mounted=$(docker inspect --format '{{range .Mounts}}{{if eq .Destination "/srv/52lyrics/current"}}{{.Source}}{{end}}{{end}}' 52lyrics-web)
test "$mounted" = "$previous" || { printf 'Container mount and current symlink disagree.\n' >&2; exit 1; }
image=$(docker inspect --format '{{.Image}}' 52lyrics-web)
docker exec 52lyrics-web caddy validate --config /etc/caddy/Caddyfile

old_stopped=0
old_renamed=0
check_started=0
complete=0
finish() {
  code=$?
  trap - EXIT
  set +e
  if [ "$complete" != 1 ] && [ "$old_stopped" = 1 ]; then
    if [ "$old_renamed" = 1 ]; then
      docker rm -f 52lyrics-web >/dev/null 2>&1
      docker rename "$backup" 52lyrics-web
    fi
    docker start 52lyrics-web
    ln -sfn "$previous" "$site_root/current"
    printf 'PREVIOUS_VERSION_RESTORED=%s\n' "$previous"
  fi
  if [ "$check_started" = 1 ]; then docker rm -f "$check_container" >/dev/null 2>&1; fi
  exit "$code"
}
trap finish EXIT

mkdir "$release"
cp -a "$candidate/build/client/." "$release/"
# Already-open pages can still request script and CSS names from the old release.
for asset in "$previous"/assets/*; do
  if [ -f "$asset" ] && [ ! -e "$release/assets/$(basename "$asset")" ]; then
    cp -a "$asset" "$release/assets/"
  fi
done
cmp "$candidate/build/client/index.html" "$release/index.html"
test -s "$release/guides/tom-lehrer-lyrics-source-guide/index.html"

docker run -d --name "$check_container" --entrypoint caddy \
  -p 127.0.0.1:18080:80 \
  -v "$release:/srv/52lyrics/current:ro" \
  "$image" file-server --root /srv/52lyrics/current --listen :80
check_started=1
curl --retry 5 --retry-all-errors --retry-delay 1 --retry-connrefused \
  --connect-timeout 5 --max-time 15 -fsS http://127.0.0.1:18080/ \
  -o "$deploy_dir/candidate-home-${commit:0:12}.html"
cmp "$release/index.html" "$deploy_dir/candidate-home-${commit:0:12}.html"
curl --retry 5 --retry-all-errors --retry-delay 1 --retry-connrefused \
  --connect-timeout 5 --max-time 15 -fsS \
  http://127.0.0.1:18080/guides/tom-lehrer-lyrics-source-guide/ \
  -o "$deploy_dir/candidate-guide-${commit:0:12}.html"
cmp "$release/guides/tom-lehrer-lyrics-source-guide/index.html" "$deploy_dir/candidate-guide-${commit:0:12}.html"
docker rm -f "$check_container"
check_started=0
printf 'CANDIDATE_VERIFIED=%s\n' "$release"

docker stop 52lyrics-web
old_stopped=1
docker rename 52lyrics-web "$backup"
old_renamed=1
docker run -d --name 52lyrics-web --restart unless-stopped \
  -p 80:80 -p 443:443 \
  -v "$site_root/caddy/Caddyfile:/etc/caddy/Caddyfile:ro" \
  -v "$site_root/caddy/data:/data" \
  -v "$site_root/caddy/config:/config" \
  -v "$release:/srv/52lyrics/current:ro" \
  --log-opt max-file=3 --log-opt max-size=10m "$image"
curl --retry 5 --retry-all-errors --retry-delay 1 --retry-connrefused \
  --connect-timeout 5 --max-time 15 -fsS \
  --resolve www.52lyrics.com:443:127.0.0.1 https://www.52lyrics.com/ \
  -o "$deploy_dir/published-home-${commit:0:12}.html"
cmp "$release/index.html" "$deploy_dir/published-home-${commit:0:12}.html"
curl --retry 5 --retry-all-errors --retry-delay 1 --retry-connrefused \
  --connect-timeout 5 --max-time 15 -fsS \
  --resolve www.52lyrics.com:443:127.0.0.1 \
  https://www.52lyrics.com/guides/tom-lehrer-lyrics-source-guide/ \
  -o "$deploy_dir/published-guide-${commit:0:12}.html"
cmp "$release/guides/tom-lehrer-lyrics-source-guide/index.html" "$deploy_dir/published-guide-${commit:0:12}.html"
ln -sfn "$release" "$site_root/current"
complete=1
printf 'PUBLISHED_COMMIT=%s\nPREVIOUS_RELEASE=%s\nRELEASE=%s\nROLLBACK_CONTAINER=%s\n' \
  "$commit" "$previous" "$release" "$backup"
