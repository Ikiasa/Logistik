# Frontend Readiness & QA Checklist

**Objective:** Verify Web & Mobile applications against Enterprise Hardening standards.

## 1. API Integration (v2)
- [ ] **Create Order:**
    - [ ] Payload uses Integer `amount` (e.g., 1000 not 10.00).
    - [ ] `Idempotency-Key` header is present.
    - [ ] Success response (201) parsed correctly.
- [ ] **Error Handling:**
    - [ ] Simulate Network Drop -> Retry Request (Same Key) -> Confirm data shown (Not duplicated).
    - [ ] Trigger 400 (Invalid Currency) -> Verify User Friendly Error Message.

## 2. Authentication & Isolation
- [ ] **SSO Login:**
    - [ ] Login screen supports "Enterprise SSO" toggle/button.
    - [ ] Verify `MockSSO` flow redirects correctly.
- [ ] **Tenant Isolation (UI):**
    - [ ] Login as **Tenant A**.
    - [ ] Verify Dashboard only shows Tenant A data.
    - [ ] **Negative Test:** Try to direct link to Tenant B Order ID (`/orders/B-123`). Expect 404/403 page.

## 3. Mobile (Flutter) Capabilities
- [ ] **Proof of Delivery (PoD):**
    - [ ] Camera launch & Image Compression (< 1MB).
    - [ ] Signature Pad works smoothly.
- [ ] **Offline Mode:**
    - [ ] Turn on Airplane Mode.
    - [ ] Complete Delivery (PoD).
    - [ ] Turn off Airplane Mode.
    - [ ] Verify Auto-Sync sends data to Backend.

## 4. UX & Accessibility
- [ ] **Performance:**
    - [ ] Dashboard Loads < 2s (P95).
    - [ ] Large Lists (Orders) implement Pagination/Infinite Scroll.
- [ ] **Accessibility:**
    - [ ] Contrast Ratio > 4.5:1 on text.
    - [ ] Screen Reader reads form labels correctly.

## 5. Deployment
- [ ] **Web Build:** `npm run build` passes without lint errors.
- [ ] **Mobile Build:** `flutter build apk/ipa` successful.
- [ ] **Env Config:** `REACT_APP_API_URL` / `API_BASE_URL` points to Production API.
