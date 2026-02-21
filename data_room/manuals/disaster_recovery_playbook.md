# Disaster Recovery Playbook

## 1. Incident Response
**Objective:** Restore service within RTO (Recovery Time Objective) of 4 hours.

### Severity Levels
-   **SEV-1 (Critical):** Data Loss, Total Outage. Immediate DR activation.
-   **SEV-2 (High):** Performance Degradation, Partial Outage. Investigation required.
-   **SEV-3 (Medium):** Minor issues.

## 2. Backup Procedures
**Frequency:**
-   Automated Daily Backups (02:00 UTC).
-   WAL Archiving (Continuous for Point-in-Time Recovery).

**Manual Backup:**
Run the following script to create an immediate snapshot:
```bash
./scripts/dr_backup.sh ./backups
```
Artifacts are stored in `./backups/`.

## 3. Recovery Procedures

### Scenario A: Total Database Loss
1.  **Assess Damage:** Verify if disk failure or corruption. Provision new hardware/instance if needed.
2.  **Locate Latest Backup:** Check `./backups` or S3 bucket.
3.  **Execute Restore:**
    ```bash
    ./scripts/dr_restore.sh ./backups/latest_backup.sql
    ```
4.  **Verify Integrity:**
    -   Run `npm run test:e2e` (if available).
    -   Check `audit_logs` for last known transaction.
    -   Select count(*) from critical tables.

### Scenario B: Accidental Data Deletion (Tenant Specific)
1.  **Identify Timeline:** Determine exact time of deletion.
2.  **Restore to Staging:** Restore the backup to a separate `logistik_staging` database.
3.  **Extract Data:** Use `COPY` or custom script to extract missing rows for the specific Tenant.
4.  **Re-insert:** Insert data back into Production.

## 4. Post-Mortem
-   Document Root Cause.
-   Update Playbook if gaps found.
-   Notify Stakeholders.
