#!/usr/bin/env bash
# Lance les tests sur un PostgreSQL local vide : bash pack-artisan/supabase/tests/lancer.sh [port]
set -euo pipefail
cd "$(dirname "$0")"
PORT="${1:-5499}"; DB="pack_test_$$"
P="psql -h /tmp -p $PORT -U postgres -v ON_ERROR_STOP=1 -q"
$P -d postgres -c "create database $DB"
trap '$P -d postgres -c "drop database if exists $DB" >/dev/null' EXIT
$P -d $DB -f 00_supabase_simule.sql
$P -d $DB -f ../migrations/001_schema.sql
$P -d $DB -f 10_isolation.sql
