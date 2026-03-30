#!/bin/sh
echo "=== pwd ==="
pwd
echo "=== ls root ==="
ls -la
echo "=== ls packages ==="
ls -la packages/ 2>&1
echo "=== ls packages/frontend ==="
ls -la packages/frontend/ 2>&1
echo "=== building ==="
cd packages/frontend && npx vite build
