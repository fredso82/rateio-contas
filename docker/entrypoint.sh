#!/bin/sh
set -eu

./node_modules/.bin/prisma migrate deploy --schema src/server/db/prisma/schema.prisma
exec node .next/standalone/server.js
