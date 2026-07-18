export class ApiError extends Error {}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  return response;
}

export async function login(email: string, password: string) {
  const response = await apiFetch("/api/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    throw new ApiError("Login failed");
  }
  return response.json() as Promise<{ id: number; email: string }>;
}

export async function logout() {
  await apiFetch("/api/logout", { method: "POST" });
}

export async function getCurrentUser() {
  const response = await apiFetch("/api/me");
  if (!response.ok) {
    return null;
  }
  return response.json() as Promise<{ id: number; email: string }>;
}
