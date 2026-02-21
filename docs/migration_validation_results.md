# Migration Validation Report (Staging Execution)

**Date:** 2026-02-14
**Environment:** Staging (Simulated with Seed Data)
**Script Version:** `0.0.1-beta`

## 1. Total Counts Reconciliation
| Metric | Count | Status |
| :--- | :--- | :--- |
| **Total Legacy Attempts** | **1,000** | ✅ Matches Seed |
| **Successfully Migrated Orders** | **920** | ✅ Expected (Excludes intentional failures) |
| **Total Master Addresses** | **152** | ✅ High Deduplication achieved |
| **Pending / Failed** | **80** | ℹ️ Includes 50 Permanent Fails + 30 Heuristic Fails |

## 2. Partition Routing Check
| Partition | Count | Verification |
| :--- | :--- | :--- |
| `addresses_us` | 1 | ✅ 400 US Orders mapped to 1 Master US Address |
| `addresses_de` | 1 | ✅ 300 DE Orders mapped to 1 Master DE Address |
| `addresses_default` | 150 | ℹ️ Mixed content from random seed |

## 3. Deduplication Efficacy
-   **Total Orders Processed:** 920
-   **Unique Master Addresses:** 152
-   **Deduplication Ratio:** **83.4%**
    -   *Analysis:* The 400 identical US orders and 300 identical DE orders were successfully collapsed into single master records.

## 4. Referential Integrity
| Check | Count | Status |
| :--- | :--- | :--- |
| **Orphaned References** | **0** | ✅ CRITICAL PASS |
| **FK Violations** | **0** | ✅ CRITICAL PASS |

## 5. Performance Metrics
-   **Total Duration:** 24.5s
-   **Throughput:** ~40.8 records/sec
-   **Geocode Latency (Avg):** 22ms (Mocked)

## 6. Failure Analysis
-   **Category D (Invalid):** 50 records (100% Correctly Failed)
-   **Category E (Transient):** 10 records failed after 3 retries (Simulated network jitter)
-   **Category C (Ambiguous):** 20 records failed resolution

**Conclusion:**
The migration logic correctly handles deduplication and partition routing. The `83.4%` deduplication rate confirms the hash-based ID generation is working across transaction batches. Referential integrity is preserved with zero orphans.

**Recommendation:** Proceed to API v2 Implementation.
