#!/bin/sh

set -e

# List of required upstreams (service:port)
UPSTREAMS="supabase-auth:8081 supabase-postgrest:3000 supabase-realtime:4000 supabase-storage:8000"

for upstream in $UPSTREAMS; do
  host=$(echo $upstream | cut -d: -f1)
  port=$(echo $upstream | cut -d: -f2)
  echo "Waiting for $host:$port to be resolvable..."
  while ! getent hosts $host >/dev/null 2>&1; do
    echo "  $host not resolvable yet. Waiting..."
    sleep 2
  done
  echo "  $host resolved. Waiting for port $port to be open..."
  # Try to connect using a simple approach that works in nginx container
  while ! (echo > /dev/tcp/$host/$port) 2>/dev/null; do
    echo "  $host:$port not open yet. Waiting..."
    sleep 2
  done
  echo "  $host:$port is up!"
done

echo "All upstreams are up. Starting nginx..."
exec nginx -g 'daemon off;' 