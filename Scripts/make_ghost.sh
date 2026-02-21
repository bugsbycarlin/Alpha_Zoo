#!/usr/bin/env bash

# Usage: ./make_ghost.sh input.png [opacity] [fuzz]
# opacity: 0.0–1.0 (default 0.45)
# fuzz: tolerance for "almost black" (default 0%)

set -e

INPUT="$1"
OPACITY="${2:-0.45}"
FUZZ="${3:-0%}"

if [ -z "$INPUT" ]; then
  echo "Usage: $0 input.png [opacity] [fuzz]"
  exit 1
fi

# build output filename: name -> name_ghost.png
BASENAME="$(basename "$INPUT")"
NAME="${BASENAME%.*}"
OUTPUT="$(dirname "$INPUT")/${NAME}_ghost.png"

echo "Input:  $INPUT"
echo "Output: $OUTPUT"
echo "Opacity: $OPACITY"
echo "Fuzz: $FUZZ"

convert "$INPUT" \
  -alpha set \
  -channel rgba \
  -fuzz "$FUZZ" \
  -fill none +opaque black \
  -channel A -evaluate multiply "$OPACITY" \
  "$OUTPUT"

echo "Done ✔ -> $OUTPUT"
