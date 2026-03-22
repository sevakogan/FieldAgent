# Lessons Learned

## 2026-03-21 — Pricing Model Rule (CRITICAL BUSINESS LOGIC)
**Rule:** Each address × service type combination has its OWN unique price. The price is NOT global per service type — it's per-property.
- Example: Pool cleaning at 123 Ocean Dr = $120, Pool cleaning at 456 Collins Ave = $180
- Example: STR Turnover at Beach House = $200, STR Turnover at Downtown Condo = $150
- The `address_services` table already supports this: it has `address_id`, `service_type_id`, and `price` columns
- The `service_types.default_price` is just a STARTING template — the actual price lives in `address_services.price`
- When creating a job, the price comes from `address_services.price` for that specific address+service combo
- NEVER assume flat pricing across all properties — every house is different

## Rules
- Each address has its own pricing per service type (stored in address_services table)
- service_types.default_price = template starting point only
- address_services.price = the REAL price for that specific property
- When adding a service to an address, pre-fill from default_price but allow override
- When creating a job, pull price from address_services, NOT from service_types
- Job form should show the address-specific price, not the default
- All times must use Pacific Time (America/Los_Angeles)
- NEVER deploy to production unless user explicitly says "deploy to prod"

## 2026-03-21 — Clients + Addresses Combined (UX RULE)
**Rule:** Clients and Addresses are ONE flow, not separate pages.
- An address CANNOT exist without a client (FK constraint: addresses.client_id)
- When creating a client, offer to add their first address inline (optional, can skip)
- If a client has NO addresses, show a red warning bar on their row in the list
- The client detail page shows their addresses directly — no need for a separate Addresses page
- The sidebar "Addresses" link can go to a filtered view or redirect to clients
- This reduces navigation and makes the workflow: Create Client → Add Address → Add Services → Schedule Job

## Rules (updated)
- Clients and addresses are a combined flow — never require separate navigation
- Client without address = red warning in list view
- Client creation form includes optional address step
