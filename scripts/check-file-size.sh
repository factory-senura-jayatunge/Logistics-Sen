#!/usr/bin/env bash
# check-file-size.sh
#
# Detects overly large files in the repository and blocks them from being
# committed. This protects the codebase from:
#   - Accidentally checked-in binaries, videos, datasets, or build artifacts
#     (which bloat the git history and slow down clones / CI).
#   - Source files that have grown unwieldy and should be refactored into
#     smaller, more focused modules (which hurts readability, reviewability,
#     and agent comprehension).
#
# Thresholds (kept conservative so current files pass):
#   - MAX_FILE_BYTES      : 1 MiB - hard limit for any tracked file.
#   - MAX_BINARY_BYTES    : 512 KiB - soft limit for binaries (PNG/JPG/PDF...).
#   - MAX_SOURCE_LINES    : 1500 - line-count limit for hand-written source.
#
# Usage:
#   scripts/check-file-size.sh                    # scan staged files (pre-commit)
#   scripts/check-file-size.sh --all              # scan all tracked files (CI)
#   scripts/check-file-size.sh path1 path2 ...    # scan specific files
#
# Exits non-zero if any violation is found.

set -euo pipefail

MAX_FILE_BYTES=${MAX_FILE_BYTES:-1048576}        # 1 MiB
MAX_BINARY_BYTES=${MAX_BINARY_BYTES:-524288}     # 512 KiB
MAX_SOURCE_LINES=${MAX_SOURCE_LINES:-1500}

# Glob patterns that are allowed to be larger than the byte limits.
# These are almost always auto-generated and we have no choice but to commit
# them (or we already exclude them via .gitignore). Kept narrow on purpose.
declare -a BYTE_LIMIT_EXCEPTIONS=(
  "pnpm-lock.yaml"
  "frontend/pnpm-lock.yaml"
  "*/pnpm-lock.yaml"
  "package-lock.json"
  "yarn.lock"
)

# Glob patterns that are allowed to exceed the line-count limit.
# Large seed data, auto-generated OpenAPI types, lockfiles, etc.
declare -a LINE_LIMIT_EXCEPTIONS=(
  "pnpm-lock.yaml"
  "frontend/pnpm-lock.yaml"
  "*/pnpm-lock.yaml"
  "package-lock.json"
  "yarn.lock"
  "backend/seed.py"
)

# File extensions considered "source code" for the line-count check.
# Everything else (binaries, images, docs, data) is skipped for this check.
declare -a SOURCE_EXTENSIONS=(
  "ts" "tsx" "js" "jsx" "mjs" "cjs"
  "py" "rb" "go" "rs" "java" "kt" "scala"
  "c" "cc" "cpp" "h" "hpp"
  "css" "scss" "less"
  "sh" "bash" "zsh"
)

# File extensions considered "binary" - these get the tighter byte limit.
declare -a BINARY_EXTENSIONS=(
  "png" "jpg" "jpeg" "gif" "webp" "bmp" "tiff" "ico"
  "pdf" "zip" "tar" "gz" "bz2" "7z" "rar"
  "mp3" "mp4" "mov" "avi" "wmv" "flv" "webm" "mkv"
  "wav" "ogg" "flac"
  "ttf" "otf" "woff" "woff2" "eot"
  "psd" "ai" "sketch" "fig"
  "exe" "dll" "so" "dylib" "class" "jar"
)

# ---------- helpers ---------------------------------------------------------

matches_any() {
  local path="$1"
  shift
  local pattern
  for pattern in "$@"; do
    # shellcheck disable=SC2053
    if [[ $path == $pattern || $(basename "$path") == $pattern ]]; then
      return 0
    fi
  done
  return 1
}

extension_of() {
  local filename
  filename=$(basename "$1")
  if [[ $filename == *.* ]]; then
    printf '%s' "${filename##*.}" | tr '[:upper:]' '[:lower:]'
  else
    printf ''
  fi
}

in_list() {
  local needle="$1"
  shift
  local item
  for item in "$@"; do
    [[ $needle == "$item" ]] && return 0
  done
  return 1
}

file_bytes() {
  # Portable stat (Linux vs macOS).
  if stat -c %s "$1" >/dev/null 2>&1; then
    stat -c %s "$1"
  else
    stat -f %z "$1"
  fi
}

collect_targets() {
  if [[ ${1:-} == "--all" ]]; then
    git ls-files
  elif [[ $# -gt 0 ]]; then
    printf '%s\n' "$@"
  else
    # Default: files staged for commit (pre-commit hook use-case).
    git diff --cached --name-only --diff-filter=ACMR
  fi
}

# ---------- main ------------------------------------------------------------

violations=0
checked=0

while IFS= read -r file; do
  [[ -z $file ]] && continue
  [[ ! -f $file ]] && continue

  checked=$((checked + 1))
  ext=$(extension_of "$file")
  bytes=$(file_bytes "$file")

  # --- byte-size check -----------------------------------------------------
  if ! matches_any "$file" "${BYTE_LIMIT_EXCEPTIONS[@]}"; then
    if in_list "$ext" "${BINARY_EXTENSIONS[@]}"; then
      limit=$MAX_BINARY_BYTES
      kind="binary"
    else
      limit=$MAX_FILE_BYTES
      kind="file"
    fi

    if (( bytes > limit )); then
      printf 'error: %s is %s bytes, exceeds %s limit of %s bytes.\n' \
        "$file" "$bytes" "$kind" "$limit" >&2
      printf '       consider splitting, compressing, or tracking with git-lfs.\n' >&2
      violations=$((violations + 1))
    fi
  fi

  # --- line-count check (source files only) -------------------------------
  if in_list "$ext" "${SOURCE_EXTENSIONS[@]}" \
     && ! matches_any "$file" "${LINE_LIMIT_EXCEPTIONS[@]}"; then
    lines=$(wc -l < "$file" | tr -d '[:space:]')
    if (( lines > MAX_SOURCE_LINES )); then
      printf 'error: %s has %s lines, exceeds source-file limit of %s lines.\n' \
        "$file" "$lines" "$MAX_SOURCE_LINES" >&2
      printf '       please split this module into smaller, focused files.\n' >&2
      violations=$((violations + 1))
    fi
  fi
done < <(collect_targets "$@")

if (( violations > 0 )); then
  printf '\ncheck-file-size: %s violation(s) across %s checked file(s).\n' \
    "$violations" "$checked" >&2
  exit 1
fi

printf 'check-file-size: ok (%s file(s) inspected).\n' "$checked"
