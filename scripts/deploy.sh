#!/usr/bin/env bash
set -euo pipefail
if [[ $# != 1 ]]; then
  echo 'Usage: bash scripts/deploy.sh teacher@raspberrypi.local' >&2
  exit 1
fi
remote="$1"
release="$(date -u +%Y%m%dT%H%M%SZ)"
root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
bundle="$(mktemp -d "${TMPDIR:-/tmp}/pixel-workshop-deploy.XXXXXX")"
trap 'rm -rf -- "$bundle"' EXIT
python3 "$root/scripts/build_site.py" --output "$bundle/site"
ssh "$remote" "mkdir -p ~/pixel-workshop/releases/$release/scripts ~/pixel-workshop/releases/$release/site"
scp -r "$bundle/site/." "$remote:pixel-workshop/releases/$release/site/"
scp "$root/scripts/serve.py" "$remote:pixel-workshop/releases/$release/scripts/"
ssh "$remote" "python3 -m py_compile ~/pixel-workshop/releases/$release/scripts/serve.py && ln -sfn releases/$release ~/pixel-workshop/current"
echo "Installed release $release. Restart the service if configured:"
echo "ssh $remote 'systemctl --user restart pixel-workshop'"
