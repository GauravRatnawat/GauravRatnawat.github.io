#!/bin/sh
# Compile components/*.jsx into app.js. Rerun after editing any .jsx, then commit app.js.
# Order matters: top.jsx defines the shared hooks and helpers the rest use.
set -e
cd "$(dirname "$0")"
cat components/top.jsx components/work.jsx components/cases.jsx components/journal.jsx \
    components/terminal.jsx components/skills.jsx components/app.jsx \
  | npx -y esbuild@0.24.0 --loader=jsx --minify --target=es2019 > app.js
echo "built app.js ($(wc -c < app.js | tr -d ' ') bytes)"
