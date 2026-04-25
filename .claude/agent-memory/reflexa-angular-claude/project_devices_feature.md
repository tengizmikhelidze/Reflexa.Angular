---
name: Devices feature structure
description: Layout of data-access, components, pages, and routes after the full devices feature build (STEP 7)
type: project
---

The full Devices feature was built at `src/app/features/devices/` following the same pattern as organizations.

**Data-access layer** (`data-access/`):
- `devices.types.ts` — re-exports all device types from `core/models/device.models` plus `UUID`
- `devices.api.ts` — `DevicesApi` service wrapping `ApiClientService` (9 methods, all `/devices/kits` and `/devices/pods` endpoints)
- `devices.store.ts` — `DevicesStore` signal store; injects `DevicesApi` and `OrganizationsStore`; exposes `canManageDevices` delegating to `orgStore.canManageDevices()`

**Barrel** (`devices.store.ts` at feature root) re-exports from `./data-access/devices.store` — old device pages still import from this path.

**Components** (`components/`):
- `device-kit-form.component.ts` — `AppDeviceKitFormComponent` dialog, signal-based form, `model(visible)` pattern
- `hub-form.component.ts` — `AppHubFormComponent` dialog for register/replace hub
- `pod-registration-form.component.ts` — `AppPodRegistrationFormComponent` multi-row pod entry dialog
- `pod-table.component.ts` — dumb `PodTableComponent` with battery severity helper
- `kit-access-table.component.ts` — dumb `KitAccessTableComponent`

**Pages** (`pages/`):
- `device-kits.page.ts` — `DeviceKitsPage` (list + create)
- `device-kit-detail.page.ts` — `DeviceKitDetailPage` (hub, pods, access grants, reassign dialog)

**Routes** (`devices.routes.ts`) — `DEVICES_ROUTES` with `organizationSelectedGuard` on each child route.

**app.routes.ts** — replaced two flat device routes with a single `loadChildren` pointing at `DEVICES_ROUTES`.

**Why:** Old pages (`device-list`, `device-detail`) remain at their paths and still compile (they import `DevicesStore` via the barrel). They are orphaned from the router but not deleted.

**How to apply:** When adding new device sub-routes, add to `devices.routes.ts`. New store actions go in `data-access/devices.store.ts` and the API layer in `data-access/devices.api.ts`.
