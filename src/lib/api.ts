const API_BASE = "https://beta.mwmbl.org";

const TOKEN_STORAGE = {
  get access() { return typeof window !== "undefined" ? localStorage.getItem("mwmbl_access") : null; },
  get refresh() { return typeof window !== "undefined" ? localStorage.getItem("mwmbl_refresh") : null; },
  setAccess(t: string) { localStorage.setItem("mwmbl_access", t); },
  setRefresh(t: string) { localStorage.setItem("mwmbl_refresh", t); },
  clear() { localStorage.removeItem("mwmbl_access"); localStorage.removeItem("mwmbl_refresh"); },
};

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

function normalizeError(status: number, body: unknown): ApiError {
  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    if (Array.isArray(b.detail) && b.detail.length > 0) {
      const first = b.detail[0] as Record<string, unknown>;
      return new ApiError(status, String(first.msg ?? "Validation error"));
    }
    if (typeof b.detail === "string") return new ApiError(status, b.detail);
    if (typeof b.message === "string") return new ApiError(status, b.message);
  }
  return new ApiError(status, `Request failed (${status})`);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    ...options,
  });
  if (res.ok) {
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
  }
  let body: unknown;
  try { body = await res.json(); } catch { body = null; }
  throw normalizeError(res.status, body);
}

async function authedFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const access = TOKEN_STORAGE.access;
  const headers = { ...(options.headers ?? {}), Authorization: `Bearer ${access}` };
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...headers },
    ...options,
  });

  if (res.ok) {
    const text = await res.text();
    return text ? (JSON.parse(text) as T) : ({} as T);
  }

  if (res.status === 401) {
    const refresh = TOKEN_STORAGE.refresh;
    if (!refresh) {
      TOKEN_STORAGE.clear();
      throw new ApiError(401, "Session expired. Please sign in again.");
    }
    let newAccess: string;
    try {
      const data = await refreshToken(refresh);
      newAccess = data.access;
    } catch {
      TOKEN_STORAGE.clear();
      throw new ApiError(401, "Session expired. Please sign in again.");
    }
    TOKEN_STORAGE.setAccess(newAccess);

    const retry = await fetch(`${API_BASE}${path}`, {
      headers: { "Content-Type": "application/json", ...(options.headers ?? {}), Authorization: `Bearer ${newAccess}` },
      ...options,
    });
    if (retry.ok) {
      const text = await retry.text();
      return text ? (JSON.parse(text) as T) : ({} as T);
    }
    TOKEN_STORAGE.clear();
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  let body: unknown;
  try { body = await res.json(); } catch { body = null; }
  throw normalizeError(res.status, body);
}

// ── Unauthenticated ─────────────────────────────────────────────────────────

export async function register(email: string, password: string): Promise<void> {
  await request("/api/v1/platform/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function confirmEmail(email: string, key: string): Promise<void> {
  await request("/api/v1/platform/confirm-email", {
    method: "POST",
    body: JSON.stringify({ email, key }),
  });
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export async function obtainToken(email: string, password: string): Promise<TokenPair> {
  return request<TokenPair>("/api/v1/platform/token/pair", {
    method: "POST",
    body: JSON.stringify({ username: email, password }),
  });
}

export async function refreshToken(refresh: string): Promise<{ access: string }> {
  return request<{ access: string }>("/api/v1/platform/token/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
}

export async function forgotPassword(email: string): Promise<void> {
  await request("/api/v1/platform/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

// ── Authenticated ────────────────────────────────────────────────────────────

export interface UserProfile {
  username: string;
  email: string;
  plan: "anonymous" | "free" | "starter" | "pro" | "enterprise";
  email_confirmed: boolean;
}

export async function getMe(): Promise<UserProfile> {
  return authedFetch<UserProfile>("/api/v1/platform/user");
}

export interface Subscription {
  plan: string;
  status: string;
  monthly_limit: number;
  monthly_usage: number;
  current_period_end: string | null;
  polar_customer_id: string | null;
}

export async function getSubscription(): Promise<Subscription> {
  return authedFetch<Subscription>("/api/v1/platform/billing/subscription");
}

export interface ApiKey {
  id: string;
  name: string;
  created_on: string;
  scopes: string[];
  key?: string;
}

export async function listApiKeys(): Promise<ApiKey[]> {
  return authedFetch<ApiKey[]>("/api/v1/platform/api-keys/");
}

export async function createApiKey(name: string): Promise<ApiKey> {
  return authedFetch<ApiKey>("/api/v1/platform/api-keys/", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function deleteApiKey(keyId: string): Promise<void> {
  await authedFetch(`/api/v1/platform/api-keys/${keyId}`, { method: "DELETE" });
}

export async function createCheckout(plan: "starter" | "pro"): Promise<{ checkout_url: string }> {
  return authedFetch<{ checkout_url: string }>("/api/v1/platform/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ plan }),
  });
}

export { TOKEN_STORAGE };
