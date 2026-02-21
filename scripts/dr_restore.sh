#!/bin/bash
# dr_restore.sh
# Description: Restores the Logistik database from a backup file.
# WARNING: This will overwrite existing data!
# Usage: ./dr_restore.sh <backup_file>

set -e

DB_NAME="logistik_db"
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Error: No backup file provided."
    echo "Usage: ./dr_restore.sh <backup_file>"
    exit 1
fi

echo "WARNING: This will DROP and RESTORE database '$DB_NAME'."
read -p "Are you sure? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Restore cancelled."
    exit 1
fi

echo "Restoring from $BACKUP_FILE..."

# psql options:
# -d postgres: Connect to default DB to drop/create target DB.
# -f: File to execute.

psql -d postgres -f "$BACKUP_FILE"

echo "Restore completed successfully."
