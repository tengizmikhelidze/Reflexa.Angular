---
name: Organizations feature structure
description: Layout of the fully-built Organizations feature — data-access layer, components, pages, routes
type: project
---

The Organizations feature was refactored from a flat structure into a proper feature module:

```
src/app/features/organizations/
├── data-access/
│   ├── organizations.types.ts   — re-exports from core models + MembershipSummary
│   ├── organizations.api.ts     — OrganizationsApi (Injectable providedIn root)
│   └── organizations.store.ts  — OrganizationsStore (Injectable providedIn root)
├── components/
│   ├── permission-badges.component.ts   — dumb, renders role + permission tags
│   ├── member-role-editor.component.ts  — dialog for editing a member's roles
│   └── organization-switcher.component.ts — p-select for switching active org
├── pages/
│   ├── organizations.page.ts         — list + create dialog
│   ├── organization-members.page.ts  — member list + add + role editor
│   └── organization-access.page.ts   — current user's membership & permissions
├── organizations.routes.ts   — ORGANIZATIONS_ROUTES (lazy, used in app.routes.ts)
└── organizations.store.ts    — barrel: re-exports OrganizationsStore from data-access
```

**Why:** Guards and topbar import from `organizations.store.ts` (root-level barrel). Moving the real implementation to `data-access/` and keeping a re-export barrel keeps those imports stable.

**How to apply:** When adding new organizations sub-features, add them under `data-access/`, `components/`, or `pages/` and wire into `organizations.routes.ts`. Never move or rename the barrel file.
