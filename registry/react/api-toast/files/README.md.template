# 🍞 API Toast Helper (`src/lib/api-toast`)

> **Automated user feedback toasts based on Sonner for React forms, mutations, and Server Actions.**

---

## 📖 How to Use

```typescript
import { apiToast, toasted } from "@/lib/api-toast";
import { updateUserProfile } from "@/actions/users";

const handleSubmit = async (values: ProfileFormValues) => {
  const res = await apiToast({
    action: () => updateUserProfile(values),
    loadingMessage: "Saving changes...",
    successMessage: (res) => `Profile updated for ${res.data?.name}!`,
    errorMessage: (err) => `Could not save profile: ${err.message}`,
    onSuccess: () => router.push("/profile"),
  });

  if (res.success) {
    // Operation succeeded
  }
};
```

---

## 📥 Inputs & Outputs

### Parameters: `ApiToastOptions<T>`
- **`action`** (`() => Promise<ActionResponse<T>>`, required): Function returning an `ActionResponse`.
- **`loadingMessage`** (`string`, optional): Message shown during execution (default: `"Procesando..."`).
- **`successMessage`** (`string | ((res: ActionResponse<T>) => string)`, optional): Custom success text.
- **`errorMessage`** (`string | ((error: Error) => string)`, optional): Custom error text.
- **`onSuccess`** (`(res: ActionResponse<T>) => void | Promise<void>`, optional): Success callback.
- **`onError`** (`(error: Error) => void | Promise<void>`, optional): Failure callback.

### Return Value: `Promise<ActionResponse<T>>`
Returns the original `ActionResponse<T>` directly to the caller.

---

## ⚠️ Possible Errors & Troubleshooting

| Issue / Error | Cause | Solution |
| :--- | :--- | :--- |
| **No toasts appearing on screen** | Sonner `<Toaster />` component not mounted in React root layout. | Add `<Toaster />` from `sonner` in your root layout (`app/layout.tsx` or `App.tsx`). |
| **Toast stays in loading state forever** | Action promise never resolves or rejects. | Ensure the wrapped async function completes and does not hang on unhandled network calls. |
| **Action fails but success toast appears** | The wrapped action returned `{ success: true }` despite a failure. | Ensure your backend/action sets `success: false` when an error occurs. |
