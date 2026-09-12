#!/usr/bin/env bash
set -euo pipefail

# Exécuté par le service cron Railway. Génère le rapport SEO du jour et le
# pousse sur la branche seo-reports. Les 4 GSC_* et SEO_REPO_SLUG viennent
# des variables Railway. GIT_PUSH_TOKEN = PAT GitHub fine-grained,
# "Contents: Read and write" sur CE repo uniquement.

: "${SEO_REPO_SLUG:?SEO_REPO_SLUG manquant}"
: "${GIT_PUSH_TOKEN:?GIT_PUSH_TOKEN manquant}"
: "${GSC_OAUTH_CLIENT_ID:?GSC_OAUTH_CLIENT_ID manquant}"
: "${GSC_OAUTH_CLIENT_SECRET:?GSC_OAUTH_CLIENT_SECRET manquant}"
: "${GSC_OAUTH_REFRESH_TOKEN:?GSC_OAUTH_REFRESH_TOKEN manquant}"
: "${GSC_SITE_URL:?GSC_SITE_URL manquant}"

WORKDIR="$(mktemp -d)"
trap 'rm -rf "$WORKDIR"' EXIT

echo "==> Clone de seo-reports (${SEO_REPO_SLUG})"
git clone --branch seo-reports --depth 50 \
  "https://x-access-token:${GIT_PUSH_TOKEN}@github.com/${SEO_REPO_SLUG}.git" \
  "$WORKDIR/repo" --quiet
cd "$WORKDIR/repo"

git config user.name  "seo-report-bot"
git config user.email "seo-report-bot@users.noreply.github.com"

echo "==> Récupération du script à jour depuis main"
# Le clone initial ne suit que seo-reports (refspec limité par --branch),
# donc un simple "git fetch origin main" n'écrit que FETCH_HEAD et ne crée
# jamais refs/remotes/origin/main : "git merge origin/main" échouerait avec
# "not something we can merge". On fetch main dans une ref locale explicite.
git fetch origin main --depth 50 --quiet -- main:refs/remotes/origin/main
if ! git merge origin/main --no-edit -m "merge main (script)" --quiet; then
  echo "Conflit de merge inattendu — abandon" >&2
  git merge --abort
  exit 1
fi

if [ ! -f scripts/seo-report.mjs ]; then
  echo "scripts/seo-report.mjs introuvable après merge — abandon" >&2
  exit 1
fi

echo "==> Installation des dépendances"
npm ci --no-audit --no-fund --silent

echo "==> Génération du rapport"
node scripts/seo-report.mjs

TODAY="$(date -u +%F)"
git add docs/seo/
if git diff --cached --quiet; then
  echo "Rien de neuf à committer"
  exit 0
fi
git commit -m "seo: rapport ${TODAY}" --quiet
git push origin seo-reports --quiet
echo "==> Rapport ${TODAY} poussé sur seo-reports"
