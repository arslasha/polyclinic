const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface TokenResponse {
  access: string;
  refresh: string;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Client-side token retrieval
  let token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as any)["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle Token Refresh
  if (response.status === 401 && typeof window !== "undefined") {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const { access } = await refreshResponse.json();
          localStorage.setItem("accessToken", access);
          
          // Retry original request with new token
          (headers as any)["Authorization"] = `Bearer ${access}`;
          response = await fetch(url, { ...options, headers });
        } else {
          // Refresh failed, clear tokens
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
        }
      } catch (e) {
        console.error("Token refresh failed", e);
      }
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || errorData.message || `API error: ${response.status}`);
  }

  return response.json();
}

export const authApi = {
  login: (credentials: any) => 
    apiFetch<TokenResponse>("/token/", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  refresh: (refresh: string) =>
    apiFetch<{ access: string }>("/token/refresh/", {
      method: "POST",
      body: JSON.stringify({ refresh }),
    }),
};

export const doctorsApi = {
  list: () => apiFetch<any[]>("/doctors/"),
  get: (id: number) => apiFetch<any>(`/doctors/${id}/`),
  me: () => apiFetch<any>("/doctors/me/"),
};

export const appointmentsApi = {
  list: () => apiFetch<any[]>("/appointments/"),
  create: (data: any) =>
    apiFetch<any>("/appointments/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const slotsApi = {
  list: (params?: { doctor?: number; date?: string }) => {
    const query = params ? `?${new URLSearchParams(params as any).toString()}` : "";
    return apiFetch<any[]>(`/slots/${query}`);
  },
};
export const patientsApi = {
  me: () => apiFetch<any>("/patients/me/"),
};
