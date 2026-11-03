# ⚡ API Action Wrapper (`src/lib/api-action`)

> **Universal React action wrapper for Server Actions, React hooks, and mutations with strict error-only logging.**

---

## 📖 How to Use

```typescript
import { apiAction } from "@/lib/api-action";
import { api } from "@/lib/api-client";

// Wrapping a REST call
export async function getCustomersAction() {
  return apiAction<Customer[]>({
    actionName: "getCustomers",
    apiCall: () => api.get("/customers"),
    onSuccess: (customers) => {
      console.log(`Loaded ${customers.length} customers`);
    },
  });
}

// Handling in a React component
const res = await getCustomersAction();
if (res.success) {
  console.log("Data:", res.data);
} else {
  console.error("Error:", res.error);
}
```

---

## 📥 Inputs & Outputs

### Parameters: `ApiActionOptions<T>`
- **`actionName`** (`string`, required): Contextual identifier used for targeted error logging.
- **`apiCall`** (`() => Promise<ApiCallResult<T>>`, required): Async function returning a Fetch `Response`, Hono RPC response, or `ActionResponse<T>`.
- **`onSuccess`** (`(data: T) => void | Promise<void>`, optional): Callback executed exclusively on successful operations.
- **`logger`** (`ErrorLogger`, optional): Custom logger implementing `.error()`. Defaults to ANSI colored console error.

### Return Value: `Promise<ActionResponse<T>>`
```typescript
interface ActionResponse<T> {
  success: boolean;
  data?: T;
  message?: string | unknown;
  error?: string;
}
```

---

## ⚠️ Possible Errors & Troubleshooting

| Issue / Error | Cause | Solution |
| :--- | :--- | :--- |
| **`success: false` on HTTP 200** | Backend responded with a JSON body having `{ success: false }`. | `apiAction` automatically extracts business error messages from backend responses. |
| **No logs appearing in console on success** | By design: `apiAction` follows the **Error-Only Logging** rule. | Normal successful requests do not pollute client or server logs. Only HTTP != 2xx or crashes are logged. |
| **Type `T` not matching response payload** | Discrepancy between TypeScript generic and API JSON structure. | Verify your backend return type or inspect the raw response shape. |
