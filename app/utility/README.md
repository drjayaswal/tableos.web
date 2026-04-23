# Frontend Utility

Shared helper functions for API communication and payment link generation.

## `api.ts` — API Request Helper

Typed wrapper around `fetch` that points to the backend base URL and standardises the response shape.

```ts
const res = await apiRequest<MenuApiResponse>("/customer/menu/list", {
  method: "POST",
  body: { storeId },
});

if (res.status !== 200) throw new Error(res.message);
const items = res.data.items;
```

### Features
- Automatically sets `Content-Type: application/json`
- Includes credentials (cookies) for authenticated routes
- Returns a typed `{ status, message, data }` shape matching backend responses
- `body` is serialised to JSON automatically

## `upi.ts` — UPI Deep Link Generator

Generates a `upi://pay` intent URL for opening the customer's UPI app directly.

```ts
const link = generateUPILink({
  upiId: "merchant@upi",
  storeName: "Café Noir",
  amount: "245.00",
  orderId: "7c1d5d00-...",
});
// → "upi://pay?pa=merchant@upi&pn=Caf%C3%A9%20Noir&am=245.00&tr=7c1d5d00...&tn=Pay%20Caf%C3%A9%20Noir&cu=INR"
```

### Parameters (`upi://pay`)
| Param | Meaning |
|-------|---------|
| `pa`  | Payee UPI ID |
| `pn`  | Payee display name |
| `am`  | Amount (string, no commas) |
| `tr`  | Transaction reference (order ID) |
| `tn`  | Transaction note (visible in UPI history) |
| `cu`  | Currency — always `INR` |

> **Note:** The amount passed should already include the 5% tax surcharge (`parseFloat(total) * 1.05`). The base order `totalAmount` in the database stores pre-tax subtotal.
