#!/bin/bash
# dr_backup.sh
# Description: Performs a safe backup of the Logistik database.
# Preserves RLS policies and schema.
# Usage: ./dr_backup.sh [output_dir]

set -e

DB_NAME="logistik_db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
OUTPUT_DIR=${1:-"./backups"}
FILENAME="${OUTPUT_DIR}/logistik_backup_${TIMESTAMP}.sql"

mkdir -p "$OUTPUT_DIR"

echo "Starting Backup for $DB_NAME at $TIMESTAMP..."

# pg_dump options:
# --clean: Include commands to drop database objects before creating them.
# --if-exists: Use IF EXISTS when dropping objects.
# --create: Include command to create the database.
# --enable-row-security: Ensure RLS is not bypassed (wait, usually we want DDL to set it up, but data dump needs it?)
# Actually, for full DR, we want the Schema (DDL) + Data.
# DDL includes CREATE POLICY.
# Data is dumped. When restored, RLS Policy is reapplied.
# IMPORTANT: When dumping data as 'postgres' (superuser), we see all rows.
# When restoring, we insert as 'postgres'.
# The dump file contains COPY commands.
# Usage of --enable-row-security is for valid dump content if user is not superuser.
# As superuser, we see all.

pg_dump --format=plain \
        --no-owner \
        --no-acl \
        --clean \
        --if-exists \
        --create \
        "$DB_NAME" > "$FILENAME"

echo "Backup completed: $FILENAME"
