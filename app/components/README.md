# Frontend Components

Reusable UI building blocks for the TableOS interface.

## Key Components

### `Notifcation.tsx` — Global Notification System
Context-based persistent notification stack. Wraps the entire app via `<NotificationProvider>` in `layout.tsx`.

```tsx
const notify = useNotify();
notify({ type: "success", title: "Order Placed!", message: "..." });
notify({ type: "error",   title: "Declined",      duration: 0 }); // 0 = persistent
```
**Types:** `success` (emerald) | `error` (rose) | `warning` (amber) | `info` (blue)  
Notifications stack at the top of the screen in a pill-shaped design and can be dismissed individually.

### `ProfessionalBill.tsx` — Session Bill Modal
Renders a full itemised bill for a table session including all orders, line items, tax calculation (5%), and a paid/balance-due summary. Opens as a bottom sheet on mobile, centered modal on desktop.

### `Navbar.tsx` — Top Navigation
Role-aware navigation bar. Shows dashboard links for authenticated owners/staff, and a scan CTA for customers.

### `QRScanner.tsx` — Camera QR Scanner
Uses `html5-qrcode` to scan table QR codes and parse `storeId` + `tableId` from the URL embedded in the QR.

### `QRFetcher.tsx` — Manual Table Entry
Fallback input for entering table details manually when camera scanning is unavailable.

## Sub-directories

### `ui/`
Base UI primitives (`Button`, `Input`, etc.) built on the standard HTML elements with consistent variant styling.

### `icons/svg.tsx`
Single file of all custom inline SVG icon components (`CheckIcon`, `Loading`, `MenuIcon`, `PlusIcon`, etc.).

## Conventions
- Components access global context via hooks (`useNotify`, `useSocket`, `useUser`)
- All animations use Framer Motion `motion.*` elements
- Mobile-first styles, `sm:` breakpoint for desktop overrides
