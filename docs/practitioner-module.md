# Practitioner Module — AK-HNCMS

This document describes the Practitioner module endpoints, offline sync, and key UI pieces.

## Overview
Practitioners can manage assigned visits, check in/out, record vitals, and report inventory usage. Offline support allows practitioners to record visits/vitals/inventory while offline and sync when network is available.

## API (Offline Sync)
All endpoints are under `POST /api/practitioner/sync/*` and require `auth:sanctum` and `role:practitioner`.

- `POST /api/practitioner/sync/vitals` — payload: { vitals: [ { visit_id?, temperature?, heart_rate?, blood_pressure_systolic?, blood_pressure_diastolic?, sugar_level?, notes?, recorded_at? } ] }

- `POST /api/practitioner/sync/inventory-usage` — payload: { usages: [ { inventory_item_id, quantity_used, used_at? } ] }

- `POST /api/practitioner/sync/visits` — payload: { visits: [ { booking_id, check_in_time?, check_out_time?, visit_notes? } ] }

## Client-side Offline Sync
A lightweight helper `resources/js/utils/offlineSync.ts` uses `localforage` to queue records and attempts to sync when the browser is back online. A `QueueStatus` component is available to view pending items and trigger sync manually.

## UI
- Practitioner dashboard / schedule components exist in `resources/js/Components/dashboard/*` and relevant Inertia pages under `resources/js/Pages/Practitioner/*`.
- Visit detail page with Check-in/Check-out at `resources/js/Pages/Visits/Show.tsx`.
- Vitals recording pages under `resources/js/Pages/Practitioner/Patients/RecordVitals.tsx`.

## Tests
Feature tests for API sync endpoints are located at `tests/Feature/Api/SyncTest.php`.

## Next steps
- Add E2E tests for offline sync (Playwright or Cypress)
- Mobile app integration (React Native) using same API endpoints
- Service worker / Background Sync for stronger offline reliability
